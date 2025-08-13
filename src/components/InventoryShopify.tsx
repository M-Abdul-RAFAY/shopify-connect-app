import { useState } from "react";
import {
  Package,
  Search,
  Filter,
  TrendingUp,
  TrendingDown,
} from "lucide-react";
import { useShopifyProducts, useShopifyData } from "../hooks/useShopifyData";
import { formatCurrencyWithShop } from "../utils/currency";
import { usePagination } from "../hooks/usePagination";
import { PaginationControls } from "../utils/pagination.tsx";

const Inventory = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterOpen, setFilterOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");
  const [selectedVendor, setSelectedVendor] = useState("");
  const { products, loading, error } = useShopifyProducts();
  const { data: shopData } = useShopifyData();

  // Get shop data for currency formatting
  const currentShop = shopData?.shop;

  // Filter products
  const filteredItems = products.filter((product) => {
    // Search filter
    const matchesSearch =
      product.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.id.toString().includes(searchTerm) ||
      product.product_type.toLowerCase().includes(searchTerm.toLowerCase());

    // Category filter
    const matchesCategory =
      !selectedCategory || product.product_type === selectedCategory;

    // Vendor filter
    const matchesVendor = !selectedVendor || product.vendor === selectedVendor;

    // Status filter
    const matchesStatus =
      !selectedStatus ||
      (() => {
        const totalStock = product.variants.reduce(
          (sum, v) => sum + v.inventory_quantity,
          0
        );
        switch (selectedStatus) {
          case "in-stock":
            return totalStock > 10;
          case "low-stock":
            return totalStock > 0 && totalStock <= 10;
          case "out-of-stock":
            return totalStock === 0;
          default:
            return true;
        }
      })();

    return matchesSearch && matchesCategory && matchesVendor && matchesStatus;
  });

  // Use pagination for filtered items
  const {
    items: paginatedProducts,
    pagination,
    setCurrentPage,
    setPageSize,
  } = usePagination(filteredItems, 25);

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Inventory Management
          </h1>
          <p className="text-gray-600 mt-1">Loading your products...</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 animate-pulse"
            >
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-8 bg-gray-200 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Inventory Management
          </h1>
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  const getStatusColor = (stock: number) => {
    if (stock === 0) return "bg-red-100 text-red-800";
    if (stock <= 10) return "bg-yellow-100 text-yellow-800";
    return "bg-green-100 text-green-800";
  };

  const getStatusText = (stock: number) => {
    if (stock === 0) return "Out of Stock";
    if (stock <= 10) return "Low Stock";
    return "In Stock";
  };

  const getStockTrend = (stock: number, minStock: number = 10) => {
    if (stock === 0) return { icon: TrendingDown, color: "text-red-500" };
    if (stock <= minStock)
      return { icon: TrendingDown, color: "text-yellow-500" };
    return { icon: TrendingUp, color: "text-green-500" };
  };

  const totalProducts = products.length;
  const inStockProducts = products.filter((p) =>
    p.variants.some((v) => v.inventory_quantity > 0)
  ).length;
  const lowStockProducts = products.filter((p) =>
    p.variants.some(
      (v) => v.inventory_quantity > 0 && v.inventory_quantity <= 10
    )
  ).length;
  const outOfStockProducts = products.filter((p) =>
    p.variants.every((v) => v.inventory_quantity === 0)
  ).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Inventory Management
          </h1>
          <p className="text-gray-600 dark:text-gray-300 mt-1">
            Manage your products across all locations
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 animate-slide-up">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 lg:p-6 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 group">
          <div className="flex items-center">
            <div className="p-2 lg:p-3 rounded-xl bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900/30 dark:to-blue-800/30 group-hover:scale-110 transition-transform duration-200">
              <Package className="w-5 lg:w-6 h-5 lg:h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="ml-4">
              <p className="text-xl lg:text-2xl font-bold text-gray-900 dark:text-white">
                {totalProducts}
              </p>
              <p className="text-gray-600 dark:text-gray-300 text-sm">Total Products</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 lg:p-6 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 group">
          <div className="flex items-center">
            <div className="p-2 lg:p-3 rounded-xl bg-gradient-to-br from-green-100 to-green-200 dark:from-green-900/30 dark:to-green-800/30 group-hover:scale-110 transition-transform duration-200">
              <TrendingUp className="w-5 lg:w-6 h-5 lg:h-6 text-green-600 dark:text-green-400" />
            </div>
            <div className="ml-4">
              <p className="text-xl lg:text-2xl font-bold text-gray-900 dark:text-white">
                {inStockProducts}
              </p>
              <p className="text-gray-600 dark:text-gray-300 text-sm">In Stock</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 lg:p-6 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 group">
          <div className="flex items-center">
            <div className="p-2 lg:p-3 rounded-xl bg-gradient-to-br from-yellow-100 to-yellow-200 dark:from-yellow-900/30 dark:to-yellow-800/30 group-hover:scale-110 transition-transform duration-200">
              <TrendingDown className="w-5 lg:w-6 h-5 lg:h-6 text-yellow-600 dark:text-yellow-400" />
            </div>
            <div className="ml-4">
              <p className="text-xl lg:text-2xl font-bold text-gray-900 dark:text-white">
                {lowStockProducts}
              </p>
              <p className="text-gray-600 dark:text-gray-300 text-sm">Low Stock</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 lg:p-6 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 group">
          <div className="flex items-center">
            <div className="p-2 lg:p-3 rounded-xl bg-gradient-to-br from-red-100 to-red-200 dark:from-red-900/30 dark:to-red-800/30 group-hover:scale-110 transition-transform duration-200">
              <Package className="w-5 lg:w-6 h-5 lg:h-6 text-red-600 dark:text-red-400" />
            </div>
            <div className="ml-4">
              <p className="text-xl lg:text-2xl font-bold text-gray-900 dark:text-white">
                {outOfStockProducts}
              </p>
              <p className="text-gray-600 dark:text-gray-300 text-sm">Out of Stock</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 lg:p-6 animate-slide-up">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
          <div className="flex-1 max-w-lg">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 w-5 h-5" />
              <input
                type="text"
                placeholder="Search products, SKUs, or categories..."
                className="pl-10 pr-4 py-3 w-full rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={() => setFilterOpen(!filterOpen)}
              className="flex items-center px-4 py-3 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600 transition-all duration-200 hover:shadow-sm"
            >
              <Filter className="w-4 h-4 mr-2" />
              Filter
            </button>
          </div>
        </div>

        {filterOpen && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category
                </label>
                <select
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all duration-200"
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                >
                  <option value="">All Categories</option>
                  {[...new Set(products.map((p) => p.product_type))].map(
                    (type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    )
                  )}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status
                </label>
                <select
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all duration-200"
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                >
                  <option value="">All Status</option>
                  <option value="in-stock">In Stock</option>
                  <option value="low-stock">Low Stock</option>
                  <option value="out-of-stock">Out of Stock</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Vendor
                </label>
                <select
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all duration-200"
                  value={selectedVendor}
                  onChange={(e) => setSelectedVendor(e.target.value)}
                >
                  <option value="">All Vendors</option>
                  {[...new Set(products.map((p) => p.vendor))].map((vendor) => (
                    <option key={vendor} value={vendor}>
                      {vendor}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex items-end space-x-2 sm:col-span-2 lg:col-span-1">
                <button
                  onClick={() => {
                    setSelectedCategory("");
                    setSelectedStatus("");
                    setSelectedVendor("");
                  }}
                  className="flex-1 px-4 py-2 bg-gray-100 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-500 transition-all duration-200"
                >
                  Clear Filters
                </button>
                <button className="flex-1 px-4 py-2 bg-gradient-to-r from-primary-600 to-purple-600 dark:from-primary-500 dark:to-purple-500 text-white rounded-xl hover:from-primary-700 hover:to-purple-700 dark:hover:from-primary-600 dark:hover:to-purple-600 transition-all duration-200 shadow-lg hover:shadow-xl">
                  Apply Filters
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Inventory Table */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-lg transition-shadow duration-300 animate-slide-up">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Product
                </th>
                <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  SKU
                </th>
                <th className="hidden sm:table-cell px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Stock
                </th>
                <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Price
                </th>
                <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {paginatedProducts.map((product) => {
                const mainVariant = product.variants[0];
                const totalStock = product.variants.reduce(
                  (sum, v) => sum + v.inventory_quantity,
                  0
                );
                const TrendIcon = getStockTrend(totalStock).icon;

                return (
                  <tr key={product.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200">
                    <td className="px-4 lg:px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          {product.images && product.images.length > 0 ? (
                            <img
                              className="h-10 w-10 rounded-xl object-cover shadow-sm"
                              src={product.images[0].src}
                              alt={product.title}
                            />
                          ) : (
                            <div className="h-10 w-10 rounded-xl bg-gray-200 dark:bg-gray-600 flex items-center justify-center">
                              <Package className="w-5 h-5 text-gray-400 dark:text-gray-500" />
                            </div>
                          )}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900 dark:text-white truncate max-w-32 sm:max-w-xs">
                            {product.title}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {product.vendor}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 lg:px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                      {mainVariant.sku || "N/A"}
                    </td>
                    <td className="hidden sm:table-cell px-4 lg:px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                      {product.product_type || "Uncategorized"}
                    </td>
                    <td className="px-4 lg:px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <TrendIcon
                          className={`w-4 h-4 mr-2 ${
                            getStockTrend(totalStock).color
                          }`}
                        />
                        <span className="text-sm text-gray-900 dark:text-gray-100">
                          {totalStock}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 lg:px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                      {formatCurrencyWithShop(
                        mainVariant.price || "0",
                        currentShop
                      )}
                    </td>
                    <td className="px-4 lg:px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-3 py-1 text-xs font-medium rounded-full ${getStatusColor(
                          totalStock
                        )}`}
                      >
                        {getStatusText(totalStock)}
                      </span>
                    </td>
                  </tr>
                );
              })}
              {paginatedProducts.length === 0 && (
                <tr key="no-products">
                  <td
                    colSpan={6}
                    className="px-4 lg:px-6 py-8 text-center text-gray-500 dark:text-gray-400"
                  >
                    <div className="flex flex-col items-center">
                      <Package className="w-12 h-12 text-gray-400 dark:text-gray-500 mb-4" />
                      <p className="text-lg font-medium mb-2">No products found</p>
                      <p className="text-sm">Try adjusting your search or filters</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <PaginationControls
          pagination={pagination}
          onPageChange={setCurrentPage}
          onPageSizeChange={setPageSize}
          className="border-t border-gray-200 dark:border-gray-700"
        />
      </div>
    </div>
  );
};

export default Inventory;
