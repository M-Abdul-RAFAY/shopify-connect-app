import React, { useEffect, useRef, useMemo } from "react";
import { Wrapper, Status } from "@googlemaps/react-wrapper";
import { Activity } from "lucide-react";

// Get Google Maps API key from environment variables
const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || "";

interface Order {
  id: string | number;
  name?: string;
  order_number?: string;
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
  locations: Array<{
    lat: number;
    lng: number;
    city: string;
    country: string;
    orderCount: number;
    revenue: number;
    orders: Order[];
  }>;
  style: React.CSSProperties;
}

// Google Maps component
const MapComponent: React.FC<MapComponentProps> = ({
  center,
  zoom,
  locations,
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

      // Add markers for each location
      locations.forEach((location) => {
        const marker = new google.maps.Marker({
          position: { lat: location.lat, lng: location.lng },
          map,
          title: `${location.city}, ${location.country}`,
          icon: {
            url:
              "data:image/svg+xml;charset=UTF-8," +
              encodeURIComponent(`
              <svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
                <circle cx="16" cy="16" r="12" fill="#ef4444" stroke="#ffffff" stroke-width="2"/>
                <text x="16" y="20" text-anchor="middle" fill="white" font-size="10" font-family="Arial, sans-serif" font-weight="bold">
                  ${location.orderCount}
                </text>
              </svg>
            `),
            scaledSize: new google.maps.Size(32, 32),
            anchor: new google.maps.Point(16, 16),
          },
        });

        // Create info window content
        const infoContent = `
          <div style="min-width: 200px; font-family: system-ui, sans-serif; padding: 8px;">
            <h3 style="margin: 0 0 8px 0; font-size: 16px; font-weight: 600; color: #1f2937;">
              ${location.city}, ${location.country}
            </h3>
            <div style="margin-bottom: 8px; font-size: 14px; line-height: 1.4;">
              <p style="margin: 2px 0;"><strong>Orders:</strong> ${
                location.orderCount
              }</p>
              <p style="margin: 2px 0;"><strong>Total Revenue:</strong> $${location.revenue.toFixed(
                2
              )}</p>
              <p style="margin: 2px 0;"><strong>Avg. Order Value:</strong> $${(
                location.revenue / location.orderCount
              ).toFixed(2)}</p>
            </div>
            <div style="border-top: 1px solid #e5e7eb; padding-top: 8px;">
              <p style="margin: 0 0 4px 0; font-size: 12px; color: #6b7280;">Recent Orders:</p>
              ${location.orders
                .slice(0, 3)
                .map(
                  (order) =>
                    `<div style="font-size: 11px; color: #6b7280; margin: 1px 0;">
                  #${order.name || order.order_number || String(order.id)} - $${
                      order.total_price
                    }
                </div>`
                )
                .join("")}
              ${
                location.orders.length > 3
                  ? `<p style="font-size: 11px; color: #9ca3af; margin: 4px 0 0 0;">
                  +${location.orders.length - 3} more orders
                </p>`
                  : ""
              }
            </div>
          </div>
        `;

        const infoWindow = new google.maps.InfoWindow({
          content: infoContent,
          maxWidth: 300,
        });

        marker.addListener("click", () => {
          infoWindow.open(map, marker);
        });
      });
    }
  }, [center, zoom, locations]);

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
  // Process orders to get location data with coordinates
  const locationData = useMemo(() => {
    const locationMap = new Map<
      string,
      {
        lat: number;
        lng: number;
        city: string;
        country: string;
        orderCount: number;
        revenue: number;
        orders: Order[];
      }
    >();

    orders.forEach((order) => {
      if (order.shipping_address) {
        const { city, country, latitude, longitude } = order.shipping_address;

        // Use coordinates if available, otherwise use approximate coordinates for countries
        let lat: number, lng: number;

        if (latitude && longitude) {
          lat = latitude;
          lng = longitude;
        } else {
          // Approximate coordinates for major countries/regions
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
          lat = coords[0];
          lng = coords[1];
        }

        if (lat !== 0 || lng !== 0) {
          const key = `${city || "Unknown"}, ${country || "Unknown"}`;
          const revenue = parseFloat(order.total_price || "0");

          if (locationMap.has(key)) {
            const existing = locationMap.get(key)!;
            existing.orderCount += 1;
            existing.revenue += revenue;
            existing.orders.push(order);
          } else {
            locationMap.set(key, {
              lat,
              lng,
              city: city || "Unknown",
              country: country || "Unknown",
              orderCount: 1,
              revenue,
              orders: [order],
            });
          }
        }
      }
    });

    return Array.from(locationMap.values());
  }, [orders]);

  if (locationData.length === 0) {
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

  // Calculate center point for map
  const centerLat =
    locationData.reduce((sum, loc) => sum + loc.lat, 0) / locationData.length;
  const centerLng =
    locationData.reduce((sum, loc) => sum + loc.lng, 0) / locationData.length;

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
          locations={locationData}
          style={mapStyle}
        />
      </Wrapper>
    </div>
  );
};

export default OrdersMap;
