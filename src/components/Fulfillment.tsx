import React, { useState } from 'react';
import {
  Search,
  Filter,
  Truck,
  Package,
  MapPin,
  Clock,
  CheckCircle,
  AlertTriangle,
  Navigation,
  Phone,
  Calendar,
  Eye,
  MoreHorizontal
} from 'lucide-react';

const Fulfillment = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterOpen, setFilterOpen] = useState(false);

  const shipments = [
    {
      id: 'SHP-2024-001',
      orderId: '#ORD-2024-001',
      customer: 'Alice Johnson',
      origin: 'Main Warehouse',
      destination: '123 Main St, New York, NY 10001',
      carrier: 'FedEx',
      trackingNumber: '1Z999AA1012345675',
      status: 'In Transit',
      estimatedDelivery: '2024-01-20',
      actualDelivery: null,
      items: 3,
      weight: '2.5 lbs',
      cost: 12.99
    },
    {
      id: 'SHP-2024-002',
      orderId: '#ORD-2024-002',
      customer: 'Bob Smith',
      origin: 'West Coast Hub',
      destination: '456 Oak Ave, Los Angeles, CA 90210',
      carrier: 'UPS',
      trackingNumber: '1Z999AA1087654321',
      status: 'Delivered',
      estimatedDelivery: '2024-01-18',
      actualDelivery: '2024-01-17',
      items: 1,
      weight: '1.2 lbs',
      cost: 8.99
    },
    {
      id: 'SHP-2024-003',
      orderId: '#ORD-2024-003',
      customer: 'Carol Davis',
      origin: 'Chicago Store',
      destination: '789 Pine St, Chicago, IL 60601',
      carrier: 'DHL',
      trackingNumber: '4321567890123456',
      status: 'Processing',
      estimatedDelivery: '2024-01-21',
      actualDelivery: null,
      items: 2,
      weight: '3.1 lbs',
      cost: 15.50
    },
    {
      id: 'SHP-2024-004',
      orderId: '#ORD-2024-004',
      customer: 'David Wilson',
      origin: 'Southeast Hub',
      destination: '321 Elm Dr, Miami, FL 33101',
      carrier: 'USPS',
      trackingNumber: '9405511899562389474747',
      status: 'Exception',
      estimatedDelivery: '2024-01-22',
      actualDelivery: null,
      items: 4,
      weight: '5.8 lbs',
      cost: 22.75
    },
    {
      id: 'SHP-2024-005',
      orderId: '#ORD-2024-005',
      customer: 'Eva Brown',
      origin: 'Northwest Hub',
      destination: '654 Maple Ln, Seattle, WA 98101',
      carrier: 'FedEx',
      trackingNumber: '1Z999AA1098765432',
      status: 'Ready to Ship',
      estimatedDelivery: '2024-01-24',
      actualDelivery: null,
      items: 1,
      weight: '4.2 lbs',
      cost: 18.99
    }
  ];

  const fulfillmentCenters = [
    {
      name: 'Main Warehouse',
      location: 'New York, NY',
      activeOrders: 45,
      capacity: '85%',
      status: 'Operational'
    },
    {
      name: 'West Coast Hub',
      location: 'Los Angeles, CA',
      activeOrders: 32,
      capacity: '72%',
      status: 'Operational'
    },
    {
      name: 'Chicago Store',
      location: 'Chicago, IL',
      activeOrders: 18,
      capacity: '45%',
      status: 'Operational'
    },
    {
      name: 'Southeast Hub',
      location: 'Miami, FL',
      activeOrders: 28,
      capacity: '68%',
      status: 'Maintenance'
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Processing':
        return 'bg-blue-100 text-blue-800';
      case 'Ready to Ship':
        return 'bg-yellow-100 text-yellow-800';
      case 'In Transit':
        return 'bg-purple-100 text-purple-800';
      case 'Delivered':
        return 'bg-green-100 text-green-800';
      case 'Exception':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Processing':
        return <Clock className="w-4 h-4" />;
      case 'Ready to Ship':
        return <Package className="w-4 h-4" />;
      case 'In Transit':
        return <Truck className="w-4 h-4" />;
      case 'Delivered':
        return <CheckCircle className="w-4 h-4" />;
      case 'Exception':
        return <AlertTriangle className="w-4 h-4" />;
      default:
        return <Package className="w-4 h-4" />;
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric'
    });
  };

  const filteredShipments = shipments.filter(shipment =>
    shipment.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    shipment.orderId.toLowerCase().includes(searchTerm.toLowerCase()) ||
    shipment.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
    shipment.trackingNumber.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Logistics & Fulfillment</h1>
          <p className="text-gray-600 mt-1">Manage shipments and fulfillment centers</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-blue-100">
              <Package className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <h3 className="text-2xl font-bold text-gray-900">123</h3>
              <p className="text-gray-600 text-sm">Active Shipments</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-purple-100">
              <Truck className="w-6 h-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <h3 className="text-2xl font-bold text-gray-900">67</h3>
              <p className="text-gray-600 text-sm">In Transit</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-green-100">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <h3 className="text-2xl font-bold text-gray-900">98.5%</h3>
              <p className="text-gray-600 text-sm">On-Time Delivery</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-orange-100">
              <AlertTriangle className="w-6 h-6 text-orange-600" />
            </div>
            <div className="ml-4">
              <h3 className="text-2xl font-bold text-gray-900">3</h3>
              <p className="text-gray-600 text-sm">Exceptions</p>
            </div>
          </div>
        </div>
      </div>

      {/* Fulfillment Centers */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Fulfillment Centers</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {fulfillmentCenters.map((center, index) => (
            <div key={index} className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-medium text-gray-900">{center.name}</h3>
                <span className={`px-2 py-1 text-xs rounded-full ${center.status === 'Operational' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                  {center.status}
                </span>
              </div>
              <div className="space-y-1 text-sm text-gray-600">
                <div className="flex items-center">
                  <MapPin className="w-4 h-4 mr-1" />
                  {center.location}
                </div>
                <div>Active Orders: <span className="font-medium">{center.activeOrders}</span></div>
                <div>Capacity: <span className="font-medium">{center.capacity}</span></div>
              </div>
            </div>
          ))}
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
                placeholder="Search shipments, orders, tracking numbers..."
                className="pl-10 pr-4 py-3 w-full rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
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
              <select className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option>All Status</option>
                <option>Processing</option>
                <option>Ready to Ship</option>
                <option>In Transit</option>
                <option>Delivered</option>
                <option>Exception</option>
              </select>
              <select className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option>All Carriers</option>
                <option>FedEx</option>
                <option>UPS</option>
                <option>DHL</option>
                <option>USPS</option>
              </select>
              <select className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option>All Origins</option>
                <option>Main Warehouse</option>
                <option>West Coast Hub</option>
                <option>Chicago Store</option>
                <option>Southeast Hub</option>
              </select>
              <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium">
                Apply Filters
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Shipments Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Shipment</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Route</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Carrier</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Delivery</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cost</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredShipments.map((shipment) => (
                <tr key={shipment.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-blue-600">{shipment.id}</div>
                      <div className="text-sm text-gray-500">{shipment.orderId}</div>
                      <div className="text-xs text-gray-400 font-mono">{shipment.trackingNumber}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{shipment.customer}</div>
                    <div className="text-sm text-gray-500">{shipment.items} items</div>
                    <div className="text-xs text-gray-400">{shipment.weight}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      <div className="flex items-center mb-1">
                        <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
                        {shipment.origin}
                      </div>
                      <div className="flex items-center text-xs text-gray-500">
                        <Navigation className="w-3 h-3 mr-1" />
                        {shipment.destination.split(',')[0]}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {shipment.carrier}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(shipment.status)}`}>
                      {getStatusIcon(shipment.status)}
                      <span className="ml-1">{shipment.status}</span>
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      <div className="flex items-center">
                        <Calendar className="w-4 h-4 mr-1 text-gray-400" />
                        {formatDate(shipment.estimatedDelivery)}
                      </div>
                      {shipment.actualDelivery && (
                        <div className="text-xs text-green-600">
                          Delivered: {formatDate(shipment.actualDelivery)}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    ${shipment.cost.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div className="flex items-center space-x-2">
                      <button className="text-blue-600 hover:text-blue-800">
                        <Eye className="w-4 h-4" />
                      </button>
                      <button className="text-gray-400 hover:text-gray-600">
                        <MoreHorizontal className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {/* Pagination */}
        <div className="bg-white px-6 py-4 border-t border-gray-200 flex items-center justify-between">
          <div className="text-sm text-gray-700">
            Showing <span className="font-medium">1</span> to <span className="font-medium">5</span> of{' '}
            <span className="font-medium">123</span> results
          </div>
          <div className="flex space-x-2">
            <button className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50">
              Previous
            </button>
            <button className="px-3 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700">
              1
            </button>
            <button className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50">
              2
            </button>
            <button className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50">
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Fulfillment;