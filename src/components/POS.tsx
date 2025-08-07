import React, { useState } from 'react';
import {
  Search,
  Plus,
  Minus,
  ShoppingCart,
  Scan,
  CreditCard,
  DollarSign,
  Smartphone,
  Gift,
  User,
  Calculator,
  Trash2,
  Percent
} from 'lucide-react';

const POS = () => {
  const [cart, setCart] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState(null);

  const products = [
    {
      id: 1,
      name: 'iPhone 15 Pro',
      price: 999.99,
      image: 'https://images.pexels.com/photos/788946/pexels-photo-788946.jpeg?auto=compress&cs=tinysrgb&w=150',
      stock: 45,
      category: 'Electronics'
    },
    {
      id: 2,
      name: 'Samsung Galaxy S24',
      price: 899.99,
      image: 'https://images.pexels.com/photos/1092644/pexels-photo-1092644.jpeg?auto=compress&cs=tinysrgb&w=150',
      stock: 23,
      category: 'Electronics'
    },
    {
      id: 3,
      name: 'MacBook Air M2',
      price: 1199.00,
      image: 'https://images.pexels.com/photos/18105/pexels-photo.jpg?auto=compress&cs=tinysrgb&w=150',
      stock: 12,
      category: 'Computers'
    },
    {
      id: 4,
      name: 'AirPods Pro',
      price: 249.99,
      image: 'https://images.pexels.com/photos/3394650/pexels-photo-3394650.jpeg?auto=compress&cs=tinysrgb&w=150',
      stock: 67,
      category: 'Audio'
    }
  ];

  const customers = [
    { id: 1, name: 'John Smith', email: 'john@example.com', phone: '(555) 123-4567', loyaltyPoints: 1250 },
    { id: 2, name: 'Sarah Johnson', email: 'sarah@example.com', phone: '(555) 987-6543', loyaltyPoints: 890 },
    { id: 3, name: 'Mike Wilson', email: 'mike@example.com', phone: '(555) 456-7890', loyaltyPoints: 2150 }
  ];

  const addToCart = (product) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(item => item.id === product.id);
      if (existingItem) {
        return prevCart.map(item =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      } else {
        return [...prevCart, { ...product, quantity: 1 }];
      }
    });
  };

  const removeFromCart = (productId) => {
    setCart(prevCart => prevCart.filter(item => item.id !== productId));
  };

  const updateQuantity = (productId, newQuantity) => {
    if (newQuantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setCart(prevCart =>
      prevCart.map(item =>
        item.id === productId
          ? { ...item, quantity: newQuantity }
          : item
      )
    );
  };

  const getSubtotal = () => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const getTax = () => {
    return getSubtotal() * 0.08; // 8% tax
  };

  const getTotal = () => {
    return getSubtotal() + getTax();
  };

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="h-screen flex bg-gray-50">
      {/* Left Panel - Products */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Point of Sale</h1>
          
          {/* Search and Scanner */}
          <div className="flex space-x-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search products or scan barcode..."
                className="pl-10 pr-4 py-3 w-full rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <button className="flex items-center px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
              <Scan className="w-5 h-5 mr-2" />
              Scan
            </button>
          </div>
        </div>

        {/* Products Grid */}
        <div className="flex-1 p-6 overflow-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredProducts.map((product) => (
              <div
                key={product.id}
                className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => addToCart(product)}
              >
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-32 object-cover rounded-lg mb-3"
                />
                <h3 className="font-medium text-gray-900 mb-1">{product.name}</h3>
                <p className="text-blue-600 font-bold text-lg">${product.price}</p>
                <p className="text-sm text-gray-500">Stock: {product.stock}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Panel - Cart and Checkout */}
      <div className="w-96 bg-white border-l border-gray-200 flex flex-col">
        {/* Customer Selection */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold text-gray-900">Customer</h2>
            <button className="text-blue-600 hover:text-blue-700">
              <User className="w-5 h-5" />
            </button>
          </div>
          {selectedCustomer ? (
            <div className="bg-gray-50 rounded-lg p-3">
              <div className="font-medium">{selectedCustomer.name}</div>
              <div className="text-sm text-gray-600">{selectedCustomer.phone}</div>
              <div className="text-sm text-blue-600">{selectedCustomer.loyaltyPoints} points</div>
            </div>
          ) : (
            <button className="w-full text-left p-3 border-2 border-dashed border-gray-300 rounded-lg hover:border-gray-400 transition-colors">
              <span className="text-gray-500">Select Customer (Optional)</span>
            </button>
          )}
        </div>

        {/* Cart Items */}
        <div className="flex-1 overflow-auto">
          <div className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-gray-900">Cart ({cart.length})</h2>
              <ShoppingCart className="w-5 h-5 text-gray-400" />
            </div>
            
            {cart.length === 0 ? (
              <div className="text-center py-8">
                <ShoppingCart className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">Cart is empty</p>
                <p className="text-sm text-gray-400">Add products to get started</p>
              </div>
            ) : (
              <div className="space-y-3">
                {cart.map((item) => (
                  <div key={item.id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-12 h-12 object-cover rounded"
                    />
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-gray-900 truncate">{item.name}</h3>
                      <p className="text-sm text-gray-600">${item.price}</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="p-1 rounded hover:bg-gray-200"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="w-8 text-center">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="p-1 rounded hover:bg-gray-200"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="p-1 rounded hover:bg-red-100 text-red-600"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Checkout Section */}
        {cart.length > 0 && (
          <div className="border-t border-gray-200">
            {/* Discount */}
            <div className="p-4 border-b border-gray-200">
              <button className="flex items-center w-full text-blue-600 hover:text-blue-700">
                <Percent className="w-4 h-4 mr-2" />
                Add Discount
              </button>
            </div>

            {/* Totals */}
            <div className="p-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span>Subtotal</span>
                <span>${getSubtotal().toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Tax (8%)</span>
                <span>${getTax().toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-bold text-lg pt-2 border-t border-gray-200">
                <span>Total</span>
                <span>${getTotal().toFixed(2)}</span>
              </div>
            </div>

            {/* Payment Buttons */}
            <div className="p-4 space-y-2">
              <button className="w-full flex items-center justify-center px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700">
                <DollarSign className="w-5 h-5 mr-2" />
                Cash Payment
              </button>
              <button className="w-full flex items-center justify-center px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                <CreditCard className="w-5 h-5 mr-2" />
                Card Payment
              </button>
              <button className="w-full flex items-center justify-center px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700">
                <Smartphone className="w-5 h-5 mr-2" />
                Digital Wallet
              </button>
              <button className="w-full flex items-center justify-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 text-sm">
                <Calculator className="w-4 h-4 mr-2" />
                Split Payment
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default POS;