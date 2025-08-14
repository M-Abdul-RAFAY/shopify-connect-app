import React, { useEffect, useRef, useMemo } from "react";
import { Wrapper, Status } from "@googlemaps/react-wrapper";
import { MarkerClusterer, GridAlgorithm } from "@googlemaps/markerclusterer";
import { Activity } from "lucide-react";

// Get Google Maps API key from environment variables
const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || "";

interface Order {
  id: string | number;
  name?: string;
  order_number?: string | number;
  shipping_address?: {
    city?: string;
    country?: string;
    latitude?: number;
    longitude?: number;
  };
  total_price?: string;
  created_at: string;
}

interface OrdersMapProps {
  orders: Order[];
  height?: string;
}

interface MapComponentProps {
  center: google.maps.LatLngLiteral;
  zoom: number;
  orders: Order[];
  style: React.CSSProperties;
}

// Google Maps component
const MapComponent: React.FC<MapComponentProps> = ({
  center,
  zoom,
  orders,
  style,
}) => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (ref.current && window.google) {
      const map = new google.maps.Map(ref.current, {
        center,
        zoom,
        mapTypeId: google.maps.MapTypeId.ROADMAP,
        streetViewControl: false,
        mapTypeControl: true,
        zoomControl: true,
        fullscreenControl: true,
        styles: [
          {
            featureType: "poi",
            elementType: "labels",
            stylers: [{ visibility: "off" }],
          },
        ],
      });

      // Create markers for each individual order
      const markers: google.maps.Marker[] = [];

      orders.forEach((order) => {
        const lat = order.shipping_address?.latitude || 0;
        const lng = order.shipping_address?.longitude || 0;

        if (lat !== 0 || lng !== 0) {
          const marker = new google.maps.Marker({
            position: { lat, lng },
            map: null, // Don't add to map yet - MarkerClusterer will handle this
            title: `Order ${order.order_number || order.id}`,
            icon: {
              url:
                "data:image/svg+xml;charset=UTF-8," +
                encodeURIComponent(`
                <svg width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="12" cy="12" r="8" fill="#3b82f6" stroke="#ffffff" stroke-width="2"/>
                  <circle cx="12" cy="12" r="3" fill="#ffffff"/>
                </svg>
              `),
              scaledSize: new google.maps.Size(24, 24),
              anchor: new google.maps.Point(12, 12),
            },
          });

          // Create info window content for individual order
          const infoContent = `
            <div style="min-width: 250px; font-family: system-ui, sans-serif; padding: 12px;">
              <h3 style="margin: 0 0 8px 0; font-size: 16px; font-weight: 600; color: #1f2937;">
                Order #${order.order_number || order.id}
              </h3>
              <div style="margin-bottom: 8px; font-size: 14px; line-height: 1.4;">
                <p style="margin: 4px 0;"><strong>Customer:</strong> ${order.name || 'N/A'}</p>
                <p style="margin: 4px 0;"><strong>Location:</strong> ${order.shipping_address?.city || 'Unknown'}, ${order.shipping_address?.country || 'Unknown'}</p>
                <p style="margin: 4px 0;"><strong>Total:</strong> $${parseFloat(order.total_price || '0').toFixed(2)}</p>
                <p style="margin: 4px 0;"><strong>Date:</strong> ${new Date(order.created_at).toLocaleDateString()}</p>
              </div>
              <div style="background: #f3f4f6; padding: 8px; border-radius: 6px; font-size: 12px; color: #6b7280;">
                📍 Lat: ${lat.toFixed(4)}, Lng: ${lng.toFixed(4)}
              </div>
            </div>
          `;

          const infoWindow = new google.maps.InfoWindow({
            content: infoContent,
          });

          marker.addListener("click", () => {
            infoWindow.open(map, marker);
          });

          markers.push(marker);
        }
      });

      // Initialize MarkerClusterer
      const markerCluster = new MarkerClusterer({
        map,
        markers,
        algorithm: new GridAlgorithm({}),
        renderer: {
          render: ({ count, position }) => {
            // Custom cluster marker
            const color = count > 10 ? "#ef4444" : count > 5 ? "#f59e0b" : "#3b82f6";
            const size = count > 10 ? 50 : count > 5 ? 40 : 30;
            
            return new google.maps.Marker({
              position,
              icon: {
                url:
                  "data:image/svg+xml;charset=UTF-8," +
                  encodeURIComponent(`
                  <svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="${size/2}" cy="${size/2}" r="${size/2 - 2}" fill="${color}" stroke="#ffffff" stroke-width="3"/>
                    <text x="${size/2}" y="${size/2 + 4}" text-anchor="middle" fill="white" font-size="${Math.min(size/3, 14)}" font-family="Arial, sans-serif" font-weight="bold">
                      ${count}
                    </text>
                  </svg>
                `),
                scaledSize: new google.maps.Size(size, size),
                anchor: new google.maps.Point(size/2, size/2),
              },
              title: `${count} orders in this area`,
            });
          },
        },
      });

      // Cleanup function
      return () => {
        markerCluster.clearMarkers();
      };
    }
  }, [center, zoom, orders]);

  return <div ref={ref} style={style} />;
};

// Loading component
const LoadingComponent = (status: Status) => {
  return (
    <div className="bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center h-full">
      <div className="text-center">
        <Activity className="w-12 h-12 text-blue-500 dark:text-blue-400 mx-auto mb-2 animate-spin" />
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Loading Google Maps...
        </p>
        <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
          Status: {status}
        </p>
      </div>
    </div>
  );
};

// Main Google Maps component
const OrdersMap: React.FC<OrdersMapProps> = ({ orders, height = "400px" }) => {
  // Filter orders that have valid location data
  const ordersWithLocation = useMemo(() => {
    return orders.filter((order) => {
      if (order.shipping_address) {
        const { latitude, longitude, country } = order.shipping_address;
        
        // If we have exact coordinates, use them
        if (latitude && longitude) {
          return true;
        }
        
        // If we have a country, we can use approximate coordinates
        if (country) {
          return true;
        }
      }
      return false;
    }).map((order) => {
      const { country, latitude, longitude } = order.shipping_address!;
      
      // Use exact coordinates if available
      if (latitude && longitude) {
        return {
          ...order,
          shipping_address: {
            ...order.shipping_address,
            latitude,
            longitude,
          }
        };
      }
      
      // Otherwise use approximate country coordinates
      const countryCoords: { [key: string]: [number, number] } = {
        "United States": [39.8283, -98.5795],
        USA: [39.8283, -98.5795],
        Canada: [56.1304, -106.3468],
        "United Kingdom": [55.3781, -3.436],
        UK: [55.3781, -3.436],
        Germany: [51.1657, 10.4515],
        France: [46.2276, 2.2137],
        Italy: [41.8719, 12.5674],
        Spain: [40.4637, -3.7492],
        Australia: [-25.2744, 133.7751],
        Japan: [36.2048, 138.2529],
        China: [35.8617, 104.1954],
        India: [20.5937, 78.9629],
        Brazil: [-14.235, -51.9253],
        Mexico: [23.6345, -102.5528],
        Pakistan: [30.3753, 69.3451],
        Turkey: [38.9637, 35.2433],
        "South Africa": [-30.5595, 22.9375],
        Russia: [61.524, 105.3188],
        Egypt: [26.0975, 30.0444],
        Nigeria: [9.082, 8.6753],
        Argentina: [-38.4161, -63.6167],
        Chile: [-35.6751, -71.543],
        "New Zealand": [-40.9006, 174.886],
        Indonesia: [-0.7893, 113.9213],
        Thailand: [15.87, 100.9925],
        Philippines: [12.8797, 121.774],
        Vietnam: [14.0583, 108.2772],
        "South Korea": [35.9078, 127.7669],
        Malaysia: [4.2105, 101.9758],
        Singapore: [1.3521, 103.8198],
        Netherlands: [52.1326, 5.2913],
        Belgium: [50.5039, 4.4699],
        Switzerland: [46.8182, 8.2275],
        Austria: [47.5162, 14.5501],
        Sweden: [60.1282, 18.6435],
        Norway: [60.472, 8.4689],
        Denmark: [56.2639, 9.5018],
        Finland: [61.9241, 25.7482],
        Poland: [51.9194, 19.1451],
        "Czech Republic": [49.8175, 15.473],
        Hungary: [47.1625, 19.5033],
        Romania: [45.9432, 24.9668],
        Bulgaria: [42.7339, 25.4858],
        Greece: [39.0742, 21.8243],
        Portugal: [39.3999, -8.2245],
        Ireland: [53.4129, -8.2439],
        Israel: [31.0461, 34.8516],
        UAE: [23.4241, 53.8478],
        "Saudi Arabia": [23.8859, 45.0792],
      };
      
      const coords = countryCoords[country || ""] || [0, 0];
      return {
        ...order,
        shipping_address: {
          ...order.shipping_address,
          latitude: coords[0],
          longitude: coords[1],
        }
      };
    });
  }, [orders]);

  if (ordersWithLocation.length === 0) {
    return (
      <div
        className="bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center"
        style={{ height }}
      >
        <div className="text-center">
          <Activity className="w-12 h-12 text-gray-400 dark:text-gray-500 mx-auto mb-2" />
          <p className="text-sm text-gray-500 dark:text-gray-400">
            No location data available
          </p>
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
            Orders with shipping addresses will appear here
          </p>
        </div>
      </div>
    );
  }

  // Calculate center point for map based on orders
  const centerLat = ordersWithLocation.reduce((sum, order) => 
    sum + (order.shipping_address?.latitude || 0), 0) / ordersWithLocation.length;
  const centerLng = ordersWithLocation.reduce((sum, order) => 
    sum + (order.shipping_address?.longitude || 0), 0) / ordersWithLocation.length;

  const mapStyle: React.CSSProperties = {
    height,
    width: "100%",
    borderRadius: "8px",
    overflow: "hidden",
    border: "1px solid #e5e7eb",
  };

  return (
    <div
      style={{ height, width: "100%" }}
      className="rounded-lg overflow-hidden"
    >
      <Wrapper apiKey={apiKey} render={LoadingComponent}>
        <MapComponent
          center={{ lat: centerLat || 20, lng: centerLng || 0 }}
          zoom={2}
          orders={ordersWithLocation}
          style={mapStyle}
        />
      </Wrapper>
    </div>
  );
};

export default OrdersMap;
