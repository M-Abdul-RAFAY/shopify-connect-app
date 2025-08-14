import React, { useMemo } from "react";
import { Activity, MapPin, Users, DollarSign } from "lucide-react";

interface ShopifyStore {
  currency: string;
  money_format?: string;
  [key: string]: unknown;
}

interface Order {
  id: string | number;
  name?: string;
  order_number?: string | number;
  shipping_address?: {
    address1?: string;
    address2?: string;
    city?: string;
    province?: string;
    country?: string;
    zip?: string;
    latitude?: number;
    longitude?: number;
  };
  total_price?: string;
  created_at: string;
}

interface CityListProps {
  orders: Order[];
  height?: string;
  onCityClick?: (city: string) => void;
  shopData?: ShopifyStore | null;
  formatCurrency?: (
    amount: string | number,
    shopData?: ShopifyStore | null
  ) => string;
}

interface CityData {
  city: string;
  country: string;
  orderCount: number;
  totalRevenue: number;
  customers: string[];
}

// Simple city-based order list (no map, no toggle)
const CityList: React.FC<CityListProps> = ({
  orders,
  height = "400px",
  onCityClick,
  shopData,
  formatCurrency,
}) => {
  // Group orders by city
  const cityData = useMemo(() => {
    const cityMap: { [key: string]: CityData } = {};

    orders.forEach((order) => {
      if (order.shipping_address) {
        const city = order.shipping_address.city || "Unknown City";
        const country = order.shipping_address.country || "Unknown Country";
        const key = `${city}, ${country}`;
        const revenue = parseFloat(order.total_price || "0");
        const customer = order.name || "Unknown Customer";

        if (cityMap[key]) {
          const existing = cityMap[key];
          existing.orderCount += 1;
          existing.totalRevenue += revenue;
          if (!existing.customers.includes(customer)) {
            existing.customers.push(customer);
          }
        } else {
          cityMap[key] = {
            city,
            country,
            orderCount: 1,
            totalRevenue: revenue,
            customers: [customer],
          };
        }
      }
    });

    // Sort by order count (highest first)
    return Object.values(cityMap).sort(
      (a: CityData, b: CityData) => b.orderCount - a.orderCount
    );
  }, [orders]);

  if (cityData.length === 0) {
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

  return (
    <div
      className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700"
      style={{ height }}
    >
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
          <MapPin className="w-5 h-5 mr-2 text-blue-500" />
          Orders by City ({cityData.length} cities)
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Total orders distributed across cities
        </p>
      </div>

      {/* City List */}
      <div className="overflow-y-auto" style={{ height: "calc(100% - 80px)" }}>
        <div className="p-4 space-y-3">
          {cityData.map((city, index) => (
            <div
              key={`${city.city}-${city.country}`}
              className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 border border-gray-200 dark:border-gray-600 hover:border-blue-300 dark:hover:border-blue-500 transition-colors cursor-pointer"
              onClick={() => onCityClick && onCityClick(city.city)}
              title={`Click to view ${city.city} on map`}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
                        {index + 1}
                      </div>
                    </div>
                    <div className="ml-3">
                      <h4 className="text-base font-medium text-gray-900 dark:text-white">
                        {city.city}
                      </h4>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {city.country}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-6">
                  {/* Order Count */}
                  <div className="text-center">
                    <div className="flex items-center justify-center">
                      <Activity className="w-4 h-4 text-green-500 mr-1" />
                      <span className="text-lg font-bold text-gray-900 dark:text-white">
                        {city.orderCount}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Orders
                    </p>
                  </div>

                  {/* Customer Count */}
                  <div className="text-center">
                    <div className="flex items-center justify-center">
                      <Users className="w-4 h-4 text-purple-500 mr-1" />
                      <span className="text-lg font-bold text-gray-900 dark:text-white">
                        {city.customers.length}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Customers
                    </p>
                  </div>

                  {/* Revenue */}
                  <div className="text-center">
                    <div className="flex items-center justify-center">
                      <DollarSign className="w-4 h-4 text-green-600 mr-1" />
                      <span className="text-lg font-bold text-gray-900 dark:text-white">
                        {formatCurrency
                          ? formatCurrency(city.totalRevenue, shopData)
                          : `$${city.totalRevenue.toFixed(2)}`}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Revenue
                    </p>
                  </div>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="mt-3">
                <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 mb-1">
                  <span>Order Volume</span>
                  <span>
                    {((city.orderCount / cityData[0].orderCount) * 100).toFixed(
                      1
                    )}
                    %
                  </span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                  <div
                    className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                    style={{
                      width: `${
                        (city.orderCount / cityData[0].orderCount) * 100
                      }%`,
                    }}
                  ></div>
                </div>
              </div>

              {/* Customer Names (first few) */}
              <div className="mt-2">
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Customers: {city.customers.slice(0, 3).join(", ")}
                  {city.customers.length > 3 &&
                    ` +${city.customers.length - 3} more`}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CityList;
