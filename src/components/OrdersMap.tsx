import React, { useMemo, useEffect, useRef, useState } from "react";
import { Activity } from "lucide-react";

// Extend Window interface for Google Maps
declare global {
  interface Window {
    google: typeof google;
    initMap: () => void;
  }
}

interface ShopifyOrder {
  id: string;
  name: string;
  total_price: string;
  shipping_address?: {
    city?: string;
    province?: string;
    country?: string;
  };
  created_at: string;
}

interface OrdersMapProps {
  orders: ShopifyOrder[];
}

// City coordinates mapping
const cityCoordinates: { [key: string]: { lat: number; lng: number } } = {
  Karachi: { lat: 24.8607, lng: 67.0011 },
  Lahore: { lat: 31.5204, lng: 74.3587 },
  Islamabad: { lat: 33.6844, lng: 73.0479 },
  Rawalpindi: { lat: 33.5651, lng: 73.0169 },
  Faisalabad: { lat: 31.4504, lng: 73.135 },
  Multan: { lat: 30.1575, lng: 71.5249 },
  Hyderabad: { lat: 25.396, lng: 68.3578 },
  Gujranwala: { lat: 32.1877, lng: 74.1945 },
  Peshawar: { lat: 34.0151, lng: 71.5249 },
  Quetta: { lat: 30.1798, lng: 66.975 },
  Sialkot: { lat: 32.4945, lng: 74.5229 },
  Bahawalpur: { lat: 29.4, lng: 71.6833 },
  Sargodha: { lat: 32.0836, lng: 72.6711 },
  Sukkur: { lat: 27.7056, lng: 68.8574 },
  Larkana: { lat: 27.559, lng: 68.2123 },
  Jhang: { lat: 31.2781, lng: 72.3317 },
  Sahiwal: { lat: 30.6682, lng: 73.1114 },
  Okara: { lat: 30.8081, lng: 73.4534 },
  "Wah Cantonment": { lat: 33.7973, lng: 72.7327 },
  "Dera Ghazi Khan": { lat: 30.0561, lng: 70.6403 },
  "Mirpur Khas": { lat: 25.5266, lng: 69.0147 },
  Nawabshah: { lat: 26.2442, lng: 68.41 },
  Mingora: { lat: 34.7797, lng: 72.3625 },
  Chiniot: { lat: 31.72, lng: 72.9789 },
  Kamoke: { lat: 31.9744, lng: 74.2231 },
  "Mandi Bahauddin": { lat: 32.5861, lng: 73.4917 },
  Jhelum: { lat: 32.9425, lng: 73.7257 },
  Sadiqabad: { lat: 28.3092, lng: 70.1292 },
  Jacobabad: { lat: 28.2811, lng: 68.4375 },
  Shikarpur: { lat: 27.9581, lng: 68.6394 },
  Khanewal: { lat: 30.3017, lng: 71.9328 },
  Hafizabad: { lat: 32.0703, lng: 73.6928 },
  Kohat: { lat: 33.5869, lng: 71.4431 },
  Muzaffargarh: { lat: 30.0703, lng: 71.1928 },
  Khanpur: { lat: 28.6489, lng: 70.6556 },
  Gojra: { lat: 31.1489, lng: 72.6856 },
  Bahawalnagar: { lat: 30.0, lng: 73.25 },
  Muridke: { lat: 31.8, lng: 74.2667 },
  "Pak Pattan": { lat: 30.3444, lng: 73.3917 },
  Abottabad: { lat: 34.1463, lng: 73.2111 },
  "Tando Adam": { lat: 25.7647, lng: 68.6678 },
  Jaranwala: { lat: 31.3333, lng: 73.4167 },
  Khairpur: { lat: 27.5297, lng: 68.7592 },
  Chishtian: { lat: 29.7961, lng: 72.8644 },
  Daska: { lat: 32.3289, lng: 74.3472 },
  Dadu: { lat: 26.735, lng: 67.7814 },
  Mianwali: { lat: 32.5858, lng: 71.5492 },
  Layyah: { lat: 30.9691, lng: 70.9428 },
  Vehari: { lat: 30.0453, lng: 72.3489 },
  "Tando Allahyar": { lat: 25.4603, lng: 68.7197 },
  "Toba Tek Singh": { lat: 31.1667, lng: 72.4833 },
  Kamalia: { lat: 30.7264, lng: 72.6464 },
  Wazirabad: { lat: 32.4428, lng: 74.1231 },
};

const OrdersMap: React.FC<OrdersMapProps> = ({ orders }) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<google.maps.Map | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Group orders by city
  const cityData = useMemo(() => {
    const grouped = orders.reduce((acc, order) => {
      const city = order.shipping_address?.city || "Unknown";
      if (!acc[city]) {
        acc[city] = [];
      }
      acc[city].push(order);
      return acc;
    }, {} as { [key: string]: ShopifyOrder[] });

    return Object.entries(grouped)
      .map(([city, cityOrders]) => ({
        city,
        orders: cityOrders,
        count: cityOrders.length,
        coordinates: cityCoordinates[city] || null,
      }))
      .filter((item) => item.coordinates);
  }, [orders]);

  // Load Google Maps script
  useEffect(() => {
    const loadGoogleMaps = () => {
      if (window.google) {
        setIsLoaded(true);
        return;
      }

      const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
      if (!apiKey) {
        setError("Google Maps API key not found");
        return;
      }

      const script = document.createElement("script");
      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=geometry`;
      script.async = true;
      script.defer = true;
      script.onload = () => setIsLoaded(true);
      script.onerror = () => setError("Failed to load Google Maps");
      document.head.appendChild(script);
    };

    loadGoogleMaps();
  }, []);

  // Initialize map
  useEffect(() => {
    if (!isLoaded || !mapRef.current || !window.google || cityData.length === 0)
      return;

    try {
      const map = new window.google.maps.Map(mapRef.current, {
        zoom: 6,
        center: { lat: 30.3753, lng: 69.3451 }, // Pakistan center
        mapTypeId: "roadmap",
        styles: [
          {
            featureType: "poi",
            elementType: "labels",
            stylers: [{ visibility: "off" }],
          },
        ],
      });

      mapInstanceRef.current = map;

      // Add markers for each city
      cityData.forEach(({ city, count, coordinates, orders }) => {
        if (coordinates) {
          const marker = new window.google.maps.Marker({
            position: coordinates,
            map: map,
            title: `${city}: ${count} orders`,
            icon: {
              path: window.google.maps.SymbolPath.CIRCLE,
              scale: Math.max(8, Math.min(20, count * 2)),
              fillColor: "#3B82F6",
              fillOpacity: 0.8,
              strokeColor: "#1E40AF",
              strokeWeight: 2,
            },
          });

          // Create info window
          const totalRevenue = orders.reduce(
            (sum, order) => sum + parseFloat(order.total_price || "0"),
            0
          );
          const infoWindow = new window.google.maps.InfoWindow({
            content: `
              <div class="p-3 min-w-[200px]">
                <h3 class="font-semibold text-lg mb-2">${city}</h3>
                <div class="space-y-1 text-sm">
                  <p><strong>Orders:</strong> ${count}</p>
                  <p><strong>Revenue:</strong> $${totalRevenue.toFixed(2)}</p>
                </div>
              </div>
            `,
          });

          marker.addListener("click", () => {
            infoWindow.open(map, marker);
          });
        }
      });
    } catch (err) {
      console.error("Error initializing map:", err);
      setError("Failed to initialize map");
    }
  }, [isLoaded, cityData]);

  if (error) {
    return (
      <div className="flex items-center justify-center h-96 bg-gray-50 rounded-lg">
        <div className="text-center">
          <Activity className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Map Error</h3>
          <p className="text-gray-500">{error}</p>
        </div>
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center h-96 bg-gray-50 rounded-lg">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-500">Loading map...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-96 w-full rounded-lg overflow-hidden border border-gray-200">
      <div ref={mapRef} className="w-full h-full" />
    </div>
  );
};

export default OrdersMap;
