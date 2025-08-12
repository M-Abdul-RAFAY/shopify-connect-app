import { useState } from "react";
import {
  Search,
  Filter,
  Plus,
  Mail,
  Phone,
  Star,
  ShoppingBag,
  Calendar,
  Gift,
  TrendingUp,
  Users,
  DollarSign,
} from "lucide-react";
import { usePagination } from "../hooks/usePagination";
import { PaginationControls } from "../utils/pagination.tsx";

const Customers = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterOpen, setFilterOpen] = useState(false);
  const [selectedTier, setSelectedTier] = useState("");
  const [selectedLocation, setSelectedLocation] = useState("");
  const [selectedPurchaseDate, setSelectedPurchaseDate] = useState("");
  const [sortBy, setSortBy] = useState("name");

  const customers = [
    {
      id: 1,
      name: "Alice Johnson",
      email: "alice.johnson@email.com",
      phone: "+1 (555) 123-4567",
      address: "123 Main St, New York, NY 10001",
      joinDate: "2023-06-15",
      lastPurchase: "2024-01-10",
      totalOrders: 24,
      totalSpent: 3456.78,
      loyaltyPoints: 1250,
      tier: "Gold",
      avatar:
        "https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=150",
    },
    {
      id: 2,
      name: "Bob Smith",
      email: "bob.smith@email.com",
      phone: "+1 (555) 987-6543",
      address: "456 Oak Ave, Los Angeles, CA 90210",
      joinDate: "2023-03-22",
      lastPurchase: "2024-01-08",
      totalOrders: 18,
      totalSpent: 2234.5,
      loyaltyPoints: 890,
      tier: "Silver",
      avatar:
        "https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=150",
    },
    {
      id: 3,
      name: "Carol Davis",
      email: "carol.davis@email.com",
      phone: "+1 (555) 456-7890",
      address: "789 Pine St, Chicago, IL 60601",
      joinDate: "2022-11-08",
      lastPurchase: "2024-01-12",
      totalOrders: 45,
      totalSpent: 7890.25,
      loyaltyPoints: 2150,
      tier: "Platinum",
      avatar:
        "https://images.pexels.com/photos/712513/pexels-photo-712513.jpeg?auto=compress&cs=tinysrgb&w=150",
    },
    {
      id: 4,
      name: "David Wilson",
      email: "david.wilson@email.com",
      phone: "+1 (555) 321-0987",
      address: "321 Elm Dr, Miami, FL 33101",
      joinDate: "2024-01-05",
      lastPurchase: "2024-01-05",
      totalOrders: 1,
      totalSpent: 156.99,
      loyaltyPoints: 50,
      tier: "Bronze",
      avatar:
        "https://images.pexels.com/photos/1040880/pexels-photo-1040880.jpeg?auto=compress&cs=tinysrgb&w=150",
    },
    {
      id: 5,
      name: "Eva Brown",
      email: "eva.brown@email.com",
      phone: "+1 (555) 654-3210",
      address: "654 Maple Ln, Seattle, WA 98101",
      joinDate: "2023-09-14",
      lastPurchase: "2024-01-14",
      totalOrders: 32,
      totalSpent: 4567.8,
      loyaltyPoints: 1680,
      tier: "Gold",
      avatar:
        "https://images.pexels.com/photos/1130626/pexels-photo-1130626.jpeg?auto=compress&cs=tinysrgb&w=150",
    },
  ];

  const getTierColor = (tier: string) => {
    switch (tier) {
      case "Platinum":
        return "bg-gray-100 text-gray-800 border-gray-300";
      case "Gold":
        return "bg-yellow-100 text-yellow-800 border-yellow-300";
      case "Silver":
        return "bg-gray-100 text-gray-700 border-gray-300";
      case "Bronze":
        return "bg-orange-100 text-orange-800 border-orange-300";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const filteredCustomers = customers.filter((customer) => {
    // Search filter
    const matchesSearch =
      customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.phone.includes(searchTerm);

    // Tier filter
    const matchesTier = !selectedTier || customer.tier === selectedTier;

    // Location filter (extract city from address)
    const customerCity = customer.address.split(",")[1]?.trim(); // Get the city part and trim whitespace
    const matchesLocation =
      !selectedLocation || customerCity === selectedLocation;

    // Purchase date filter
    let matchesPurchaseDate = true;
    if (selectedPurchaseDate) {
      const lastPurchaseDate = new Date(customer.lastPurchase);
      const now = new Date();
      const daysDiff = Math.floor(
        (now.getTime() - lastPurchaseDate.getTime()) / (1000 * 3600 * 24)
      );

      if (selectedPurchaseDate === "Last 30 days") {
        matchesPurchaseDate = daysDiff <= 30;
      } else if (selectedPurchaseDate === "Last 90 days") {
        matchesPurchaseDate = daysDiff <= 90;
      } else if (selectedPurchaseDate === "Last year") {
        matchesPurchaseDate = daysDiff <= 365;
      }
    }

    // Debug log to help verify filtering
    if (selectedTier || selectedLocation || selectedPurchaseDate) {
      console.log(
        `Customer: ${customer.name}, City: "${customerCity}", Tier: ${
          customer.tier
        }, Matches: ${
          matchesSearch && matchesTier && matchesLocation && matchesPurchaseDate
        }`
      );
    }

    return (
      matchesSearch && matchesTier && matchesLocation && matchesPurchaseDate
    );
  });

  // Apply sorting to filtered customers
  const sortedCustomers = [...filteredCustomers].sort((a, b) => {
    switch (sortBy) {
      case "name":
        return a.name.localeCompare(b.name);
      case "tier": {
        const tierOrder: { [key: string]: number } = {
          Platinum: 4,
          Gold: 3,
          Silver: 2,
          Bronze: 1,
        };
        return tierOrder[b.tier] - tierOrder[a.tier];
      }
      case "totalSpent":
        return b.totalSpent - a.totalSpent;
      case "totalOrders":
        return b.totalOrders - a.totalOrders;
      case "joinDate":
        return new Date(b.joinDate).getTime() - new Date(a.joinDate).getTime();
      default:
        return 0;
    }
  });

  // Add pagination
  const paginationData = usePagination(sortedCustomers, 10);
  const paginatedCustomers = paginationData.items;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Customer Management
          </h1>
          <p className="text-gray-600 mt-1">
            Manage customer relationships and loyalty programs •{" "}
            {sortedCustomers.length} customers{" "}
            {sortedCustomers.length !== customers.length
              ? `(filtered from ${customers.length})`
              : ""}
          </p>
        </div>
        <div className="mt-4 sm:mt-0 flex space-x-3">
          <button className="flex items-center px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 text-sm font-medium">
            <Mail className="w-4 h-4 mr-2" />
            Send Campaign
          </button>
          <button className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium">
            <Plus className="w-4 h-4 mr-2" />
            Add Customer
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-blue-100">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <h3 className="text-2xl font-bold text-gray-900">34,892</h3>
              <p className="text-gray-600 text-sm">Total Customers</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-green-100">
              <TrendingUp className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <h3 className="text-2xl font-bold text-gray-900">
                {customers.length > 0
                  ? `${Math.round(85 + (customers.length % 15))}%`
                  : "N/A"}
              </h3>
              <p className="text-gray-600 text-sm">Estimated Retention</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-purple-100">
              <DollarSign className="w-6 h-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <h3 className="text-2xl font-bold text-gray-900">
                $
                {Math.round(
                  customers.reduce(
                    (sum, customer) => sum + customer.totalSpent,
                    0
                  ) / customers.length
                )}
              </h3>
              <p className="text-gray-600 text-sm">Avg. Order Value</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-yellow-100">
              <Gift className="w-6 h-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <h3 className="text-2xl font-bold text-gray-900">15,642</h3>
              <p className="text-gray-600 text-sm">Loyalty Members</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
          <div className="flex-1 max-w-lg">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search customers by name, email, or phone..."
                className="pl-10 pr-4 py-3 w-full rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="name">Name A-Z</option>
              <option value="tier">Tier (Highest)</option>
              <option value="totalSpent">Highest Spent</option>
              <option value="totalOrders">Most Orders</option>
              <option value="joinDate">Newest First</option>
            </select>
            <button
              onClick={() => setFilterOpen(!filterOpen)}
              className="flex items-center px-4 py-3 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 text-sm font-medium"
            >
              <Filter className="w-4 h-4 mr-2" />
              Filters
            </button>
          </div>
        </div>

        {filterOpen && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <select
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={selectedTier}
                onChange={(e) => setSelectedTier(e.target.value)}
              >
                <option value="">All Tiers</option>
                <option value="Platinum">Platinum</option>
                <option value="Gold">Gold</option>
                <option value="Silver">Silver</option>
                <option value="Bronze">Bronze</option>
              </select>
              <select
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={selectedLocation}
                onChange={(e) => setSelectedLocation(e.target.value)}
              >
                <option value="">All Locations</option>
                <option value="New York">New York</option>
                <option value="Los Angeles">Los Angeles</option>
                <option value="Chicago">Chicago</option>
                <option value="Miami">Miami</option>
                <option value="Seattle">Seattle</option>
              </select>
              <select
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={selectedPurchaseDate}
                onChange={(e) => setSelectedPurchaseDate(e.target.value)}
              >
                <option value="">Last Purchase</option>
                <option value="Last 30 days">Last 30 days</option>
                <option value="Last 90 days">Last 90 days</option>
                <option value="Last year">Last year</option>
              </select>
              <div className="flex space-x-2">
                <button
                  onClick={() => {
                    setSelectedTier("");
                    setSelectedLocation("");
                    setSelectedPurchaseDate("");
                  }}
                  className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium"
                >
                  Clear
                </button>
                <button className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium">
                  Apply Filters
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Customers Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Customer
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Contact
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Orders
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total Spent
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Loyalty
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Last Purchase
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {paginatedCustomers.map((customer) => (
                <tr key={customer.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <img
                        className="h-12 w-12 rounded-full object-cover"
                        src={customer.avatar}
                        alt={customer.name}
                      />
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {customer.name}
                        </div>
                        <div className="text-sm text-gray-500 flex items-center">
                          <Calendar className="w-3 h-3 mr-1" />
                          Joined {formatDate(customer.joinDate)}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 flex items-center mb-1">
                      <Mail className="w-4 h-4 mr-2 text-gray-400" />
                      {customer.email}
                    </div>
                    <div className="text-sm text-gray-500 flex items-center">
                      <Phone className="w-4 h-4 mr-2 text-gray-400" />
                      {customer.phone}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <ShoppingBag className="w-4 h-4 mr-2 text-gray-400" />
                      <span className="text-sm font-medium text-gray-900">
                        {customer.totalOrders}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      ${customer.totalSpent.toFixed(2)}
                    </div>
                    <div className="text-sm text-gray-500">
                      Avg: $
                      {(customer.totalSpent / customer.totalOrders).toFixed(2)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div
                      className={`inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full border ${getTierColor(
                        customer.tier
                      )}`}
                    >
                      <Star className="w-3 h-3 mr-1" />
                      {customer.tier}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {customer.loyaltyPoints} points
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatDate(customer.lastPurchase)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <PaginationControls
          pagination={paginationData.pagination}
          onPageChange={paginationData.setCurrentPage}
          onPageSizeChange={paginationData.setPageSize}
        />
      </div>
    </div>
  );
};

export default Customers;
