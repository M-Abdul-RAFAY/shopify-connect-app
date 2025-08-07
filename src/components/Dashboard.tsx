import React from 'react';
import {
  TrendingUp,
  TrendingDown,
  Package,
  ShoppingCart,
  Users,
  DollarSign,
  AlertTriangle,
  Clock,
  MapPin,
  Star
} from 'lucide-react';

const Dashboard = () => {
  const stats = [
    {
      name: 'Total Revenue',
      value: '$284,532',
      change: '+12.5%',
      trend: 'up',
      icon: DollarSign,
      color: 'text-green-600'
    },
    {
      name: 'Orders Today',
      value: '1,247',
      change: '+8.2%',
      trend: 'up',
      icon: ShoppingCart,
      color: 'text-blue-600'
    },
    {
      name: 'Active Customers',
      value: '34,892',
      change: '+5.1%',
      trend: 'up',
      icon: Users,
      color: 'text-purple-600'
    },
    {
      name: 'Inventory Items',
      value: '12,457',
      change: '-2.3%',
      trend: 'down',
      icon: Package,
      color: 'text-orange-600'
    }
  ];

  const recentOrders = [
    { id: '#ORD-2024-001', customer: 'Alice Johnson', amount: '$149.99', status: 'Processing', time: '2 mins ago' },
    { id: '#ORD-2024-002', customer: 'Bob Smith', amount: '$89.50', status: 'Shipped', time: '5 mins ago' },
    { id: '#ORD-2024-003', customer: 'Carol Davis', amount: '$234.75', status: 'Delivered', time: '12 mins ago' },
    { id: '#ORD-2024-004', customer: 'David Wilson', amount: '$67.25', status: 'Processing', time: '18 mins ago' },
    { id: '#ORD-2024-005', customer: 'Eva Brown', amount: '$156.80', status: 'Pending', time: '25 mins ago' }
  ];

  const lowStockItems = [
    { name: 'iPhone 15 Pro - 256GB', current: 3, minimum: 10, location: 'Main Store' },
    { name: 'Samsung Galaxy S24', current: 7, minimum: 15, location: 'Warehouse A' },
    { name: 'MacBook Air M2', current: 2, minimum: 8, location: 'Main Store' },
    { name: 'AirPods Pro', current: 12, minimum: 25, location: 'Warehouse B' }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Processing':
        return 'bg-yellow-100 text-yellow-800';
      case 'Shipped':
        return 'bg-blue-100 text-blue-800';
      case 'Delivered':
        return 'bg-green-100 text-green-800';
      case 'Pending':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-1">Welcome back! Here's what's happening with your store today.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          const TrendIcon = stat.trend === 'up' ? TrendingUp : TrendingDown;
          return (
            <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div className={`p-3 rounded-lg ${stat.color.replace('text', 'bg').replace('600', '100')}`}>
                  <Icon className={`w-6 h-6 ${stat.color}`} />
                </div>
                <div className={`flex items-center space-x-1 text-sm ${stat.trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                  <TrendIcon className="w-4 h-4" />
                  <span>{stat.change}</span>
                </div>
              </div>
              <div className="mt-4">
                <h3 className="text-2xl font-bold text-gray-900">{stat.value}</h3>
                <p className="text-gray-600 text-sm">{stat.name}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Charts and Tables Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Orders */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Recent Orders</h2>
              <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">View All</button>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {recentOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600">{order.id}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{order.customer}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">{order.amount}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(order.status)}`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 flex items-center">
                      <Clock className="w-4 h-4 mr-1" />
                      {order.time}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Low Stock Alert */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="w-5 h-5 text-orange-600" />
              <h2 className="text-lg font-semibold text-gray-900">Low Stock Alert</h2>
            </div>
          </div>
          <div className="p-6 space-y-4">
            {lowStockItems.map((item, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                <div className="flex-1">
                  <h3 className="text-sm font-medium text-gray-900">{item.name}</h3>
                  <div className="flex items-center mt-1 text-xs text-gray-500">
                    <MapPin className="w-3 h-3 mr-1" />
                    {item.location}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-bold text-orange-600">{item.current}</div>
                  <div className="text-xs text-gray-500">Min: {item.minimum}</div>
                </div>
              </div>
            ))}
            <button className="w-full mt-4 py-2 px-4 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors text-sm font-medium">
              Generate Purchase Orders
            </button>
          </div>
        </div>
      </div>

      {/* Performance Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">Store Performance</h3>
            <Star className="w-5 h-5 text-yellow-500" />
          </div>
          <div className="mt-4">
            <div className="text-3xl font-bold text-gray-900">4.8</div>
            <p className="text-gray-600">Average Rating</p>
            <div className="mt-2 flex items-center">
              <div className="flex-1 bg-gray-200 rounded-full h-2">
                <div className="bg-yellow-500 h-2 rounded-full" style={{ width: '96%' }}></div>
              </div>
              <span className="ml-2 text-sm text-gray-600">96%</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">Fulfillment Rate</h3>
            <Package className="w-5 h-5 text-green-500" />
          </div>
          <div className="mt-4">
            <div className="text-3xl font-bold text-gray-900">98.5%</div>
            <p className="text-gray-600">Orders Fulfilled</p>
            <div className="mt-2 flex items-center">
              <div className="flex-1 bg-gray-200 rounded-full h-2">
                <div className="bg-green-500 h-2 rounded-full" style={{ width: '98.5%' }}></div>
              </div>
              <span className="ml-2 text-sm text-gray-600">98.5%</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">Customer Retention</h3>
            <Users className="w-5 h-5 text-blue-500" />
          </div>
          <div className="mt-4">
            <div className="text-3xl font-bold text-gray-900">87%</div>
            <p className="text-gray-600">Returning Customers</p>
            <div className="mt-2 flex items-center">
              <div className="flex-1 bg-gray-200 rounded-full h-2">
                <div className="bg-blue-500 h-2 rounded-full" style={{ width: '87%' }}></div>
              </div>
              <span className="ml-2 text-sm text-gray-600">87%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;