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
  id: number;
  name?: string;
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
  focusCity?: string;
  shopData?: any; // eslint-disable-line @typescript-eslint/no-explicit-any
  formatCurrency?: (amount: string | number, shopData?: any) => string; // eslint-disable-line @typescript-eslint/no-explicit-any
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

// Function to normalize city names to handle duplicates
const normalizeCityName = (city: string): string => {
  if (!city) return "Unknown";

  // Convert to lowercase and trim whitespace
  let normalized = city.toLowerCase().trim();

  // Remove special characters and extra spaces
  normalized = normalized.replace(/[^\w\s]/g, "").replace(/\s+/g, " ");

  // Handle common variations
  const cityMappings: { [key: string]: string } = {
    lahore: "Lahore",
    karachi: "Karachi",
    khi: "Karachi",
    karach: "Karachi",
    karchi: "Karachi",
    islamabad: "Islamabad",
    isb: "Islamabad",
    islambad: "Islamabad",
    islamabqd: "Islamabad",
    islmabad: "Islamabad",
    rawalpindi: "Rawalpindi",
    rwp: "Rawalpindi",
    rawalpindy: "Rawalpindi",
    sialkot: "Sialkot",
    sailkot: "Sialkot",
    sialkoy: "Sialkot",
    silkot: "Sialkot",
    faisalabad: "Faisalabad",
    fsd: "Faisalabad",
    faislabad: "Faisalabad",
    hyderabad: "Hyderabad",
    hyd: "Hyderabad",
    hyderabaf: "Hyderabad",
    multan: "Multan",
    gujranwala: "Gujranwala",
    gujrawala: "Gujranwala",
    gujranwla: "Gujranwala",
    gujtanwala: "Gujranwala",
    peshawar: "Peshawar",
    peshwar: "Peshawar",
    peshwer: "Peshawar",
    peshawer: "Peshawar",
    quetta: "Quetta",
    sahiwal: "Sahiwal",
    sargodha: "Sargodha",
    sarrgofha: "Sargodha",
    mardan: "Mardan",
    abbottabad: "Abbottabad",
    abbottabd: "Abbottabad",
    bahawalpur: "Bahawalpur",
    bahwalpur: "Bahawalpur",
    bhawalpur: "Bahawalpur",
    bahawalnagar: "Bahawalnagar",
    bhawalnagar: "Bahawalnagar",
    "mirpur azad kashmir": "Mirpur Azad Kashmir",
    "mirpur ajk": "Mirpur Azad Kashmir",
    "mirpur azad kasmir": "Mirpur Azad Kashmir",
    "wah cantt": "Wah Cantonment",
    "wah cantonment": "Wah Cantonment",
    "wah cantt taxila": "Wah Cantonment",
    taxila: "Taxila",
    jhelum: "Jhelum",
    jehlum: "Jhelum",
    gujrat: "Gujrat",
    guirat: "Gujrat",
    jhang: "Jhang",
    okara: "Okara",
    kasur: "Kasur",
    chiniot: "Chiniot",
    chinyot: "Chiniot",
    daska: "Daska",
    hafizabad: "Hafizabad",
    khanewal: "Khanewal",
    mianwali: "Mianwali",
    muzaffargarh: "Muzaffargarh",
    "rahimyar khan": "Rahim Yar Khan",
    "rahim yar khan": "Rahim Yar Khan",
    rahimyarkhan: "Rahim Yar Khan",
    vehari: "Vehari",
    vihare: "Vehari",
    pakpattan: "Pakpattan",
    pakpatan: "Pakpattan",
    "pakpattan sharif": "Pakpattan",
    "toba tek singh": "Toba Tek Singh",
    kamalia: "Kamalia",
    jaranwala: "Jaranwala",
    mailsi: "Mailsi",
    sheikhupura: "Sheikhupura",
    lodhran: "Lodhran",
    khushab: "Khushab",
    attock: "Attock",
    chakwal: "Chakwal",
    "mandi bahauddin": "Mandi Bahauddin",
    "mandi bahoudin": "Mandi Bahauddin",
    "mandi bahuddin": "Mandi Bahauddin",
    mandibahauddin: "Mandi Bahauddin",
    narowal: "Narowal",
    narwoal: "Narowal",
    wazirabad: "Wazirabad",
    wazirbad: "Wazirabad",
    sukkur: "Sukkur",
    larkana: "Larkana",
    nawabshah: "Nawabshah",
    "mirpur khas": "Mirpur Khas",
    mirpurkhas: "Mirpur Khas",
    jacobabad: "Jacobabad",
    shikarpur: "Shikarpur",
    khairpur: "Khairpur",
    "khairpur mirs": "Khairpur",
    "khaipur mirs": "Khairpur",
    dadu: "Dadu",
    turbat: "Turbat",
    kohat: "Kohat",
    karak: "Karak",
    bannu: "Bannu",
    mingora: "Mingora",
    mingaora: "Mingora",
    swat: "Swat",
    mansehra: "Mansehra",
    nowshera: "Nowshera",
    charsadda: "Charsadda",
    "dera ismail khan": "Dera Ismail Khan",
    "d i khan": "Dera Ismail Khan",
    "di khan": "Dera Ismail Khan",
    "dera ghazi khan": "Dera Ghazi Khan",
    layyah: "Layyah",
    layyh: "Layyah",
    bhakkar: "Bhakkar",
    muzaffarabad: "Muzaffarabad",
    muzafrabad: "Muzaffarabad",
    muzffgaher: "Muzaffargarh",
    kotli: "Kotli",
    mirpur: "Mirpur",
    gilgit: "Gilgit",
    chitral: "Chitral",
    parachinar: "Parachinar",
  };

  // Return mapped city name or capitalize first letter of each word
  return (
    cityMappings[normalized] ||
    city
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(" ")
  );
};

const OrdersMap: React.FC<OrdersMapProps> = ({
  orders,
  focusCity,
  shopData,
  formatCurrency,
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<google.maps.Map | null>(null);
  const markersRef = useRef<{ [city: string]: google.maps.Marker }>({});
  const infoWindowsRef = useRef<{ [city: string]: google.maps.InfoWindow }>({});
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Group orders by city
  const cityData = useMemo(() => {
    const grouped = orders.reduce((acc, order) => {
      const rawCity = order.shipping_address?.city || "Unknown";
      const normalizedCity = normalizeCityName(rawCity);

      if (!acc[normalizedCity]) {
        acc[normalizedCity] = [];
      }
      acc[normalizedCity].push(order);
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

      // Clear previous markers and info windows
      markersRef.current = {};
      infoWindowsRef.current = {};

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

          // Store order count for later use
          marker.set("orderCount", count);

          // Store marker reference
          markersRef.current[city] = marker;

          // Create info window
          const totalRevenue = orders.reduce(
            (sum, order) => sum + parseFloat(order.total_price || "0"),
            0
          );

          const formattedRevenue = formatCurrency
            ? formatCurrency(totalRevenue, shopData)
            : `$${totalRevenue.toFixed(2)}`;

          const formattedAvgRevenue = formatCurrency
            ? formatCurrency(totalRevenue / count, shopData)
            : `$${(totalRevenue / count).toFixed(2)}`;

          const infoWindow = new window.google.maps.InfoWindow({
            content: `
              <div style="padding: 12px; min-width: 200px; font-family: system-ui, -apple-system, sans-serif; background-color: white;">
                <h3 style="font-weight: 600; font-size: 18px; margin-bottom: 8px; color: #1f2937;">${city}</h3>
                <div style="font-size: 14px; line-height: 1.5; color: #374151;">
                  <p style="margin: 4px 0; color: #374151;"><strong style="color: #1f2937;">Orders:</strong> ${count}</p>
                  <p style="margin: 4px 0; color: #374151;"><strong style="color: #1f2937;">Revenue:</strong> ${formattedRevenue}</p>
                  <p style="margin: 4px 0; color: #374151;"><strong style="color: #1f2937;">Avg per Order:</strong> ${formattedAvgRevenue}</p>
                </div>
              </div>
            `,
          });

          // Store info window reference
          infoWindowsRef.current[city] = infoWindow;

          marker.addListener("click", () => {
            // Close all other info windows
            Object.values(infoWindowsRef.current).forEach((iw) => iw.close());
            // Open this info window
            infoWindow.open(map, marker);
          });
        }
      });
    } catch (err) {
      console.error("Error initializing map:", err);
      setError("Failed to initialize map");
    }
  }, [isLoaded, cityData, formatCurrency, shopData]);

  // Handle focusing on a specific city
  useEffect(() => {
    if (!focusCity || !mapInstanceRef.current || !markersRef.current[focusCity])
      return;

    const marker = markersRef.current[focusCity];
    const infoWindow = infoWindowsRef.current[focusCity];
    const map = mapInstanceRef.current;

    // Close all info windows
    Object.values(infoWindowsRef.current).forEach((iw) => iw.close());

    // Reset all markers to normal style
    Object.values(markersRef.current).forEach((m) => {
      m.setIcon({
        path: window.google.maps.SymbolPath.CIRCLE,
        scale: Math.max(8, Math.min(20, m.get("orderCount") * 2)),
        fillColor: "#3B82F6",
        fillOpacity: 0.8,
        strokeColor: "#1E40AF",
        strokeWeight: 2,
      });
    });

    // Highlight the focused marker
    marker.setIcon({
      path: window.google.maps.SymbolPath.CIRCLE,
      scale: Math.max(12, Math.min(24, marker.get("orderCount") * 2)),
      fillColor: "#EF4444",
      fillOpacity: 0.9,
      strokeColor: "#DC2626",
      strokeWeight: 3,
    });

    // Focus on the city
    map.setCenter(marker.getPosition() as google.maps.LatLng);
    map.setZoom(10);

    // Open the info window
    if (infoWindow) {
      infoWindow.open(map, marker);
    }
  }, [focusCity]);

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
