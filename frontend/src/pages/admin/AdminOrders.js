import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  ShoppingBag,
  Search,
  Filter,
  Eye,
  Edit,
  MoreVertical,
  Package,
  Truck,
  CheckCircle,
  Clock,
  X,
  Save,
  User,
  MapPin,
  Phone,
  Mail,
  Calendar,
  DollarSign
} from 'lucide-react';
import { toast } from 'react-toastify';

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('view'); // 'view', 'edit'
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showActions, setShowActions] = useState(null);
  const [statusUpdate, setStatusUpdate] = useState('');

  const orderStatuses = [
    { value: 'PENDING', label: 'Pending', color: 'bg-yellow-100 text-yellow-800' },
    { value: 'CONFIRMED', label: 'Confirmed', color: 'bg-blue-100 text-blue-800' },
    { value: 'PROCESSING', label: 'Processing', color: 'bg-purple-100 text-purple-800' },
    { value: 'SHIPPED', label: 'Shipped', color: 'bg-indigo-100 text-indigo-800' },
    { value: 'DELIVERED', label: 'Delivered', color: 'bg-green-100 text-green-800' },
    { value: 'CANCELLED', label: 'Cancelled', color: 'bg-red-100 text-red-800' }
  ];

  const paymentStatuses = [
    { value: 'PENDING', label: 'Pending', color: 'bg-yellow-100 text-yellow-800' },
    { value: 'SUCCESS', label: 'Success', color: 'bg-green-100 text-green-800' },
    { value: 'FAILED', label: 'Failed', color: 'bg-red-100 text-red-800' }
  ];

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/admin/orders');
      setOrders(response.data);
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast.error('Failed to fetch orders');
      // Mock data for demonstration
      setOrders([
        {
          id: 1,
          orderNumber: 'HSZ-001',
          user: {
            id: 1,
            name: 'Priya Sharma',
            email: 'priya@example.com',
            phone: '9876543213'
          },
          orderDate: '2024-11-15T10:30:00',
          status: 'PROCESSING',
          paymentStatus: 'SUCCESS',
          totalPrice: 7500.00,
          shippingAddress: '789 Rose Garden, Mumbai, Maharashtra 400001',
          orderItems: [
            {
              id: 1,
              product: { name: 'Elegant Silk Saree', category: 'Silk Sarees' },
              quantity: 2,
              price: 2500.00
            },
            {
              id: 2,
              product: { name: 'Designer Party Saree', category: 'Designer Sarees' },
              quantity: 1,
              price: 2500.00
            }
          ]
        },
        {
          id: 2,
          orderNumber: 'HSZ-002',
          user: {
            id: 2,
            name: 'Jane Smith',
            email: 'jane@example.com',
            phone: '9876543212'
          },
          orderDate: '2024-11-14T14:15:00',
          status: 'SHIPPED',
          paymentStatus: 'SUCCESS',
          totalPrice: 4500.00,
          shippingAddress: '456 Oak Avenue, City, State 12346',
          orderItems: [
            {
              id: 3,
              product: { name: 'Designer Party Saree', category: 'Designer Sarees' },
              quantity: 1,
              price: 4500.00
            }
          ]
        },
        {
          id: 3,
          orderNumber: 'HSZ-003',
          user: {
            id: 3,
            name: 'John Doe',
            email: 'user@example.com',
            phone: '9876543211'
          },
          orderDate: '2024-11-13T09:45:00',
          status: 'DELIVERED',
          paymentStatus: 'SUCCESS',
          totalPrice: 1600.00,
          shippingAddress: '123 Main Street, City, State 12345',
          orderItems: [
            {
              id: 4,
              product: { name: 'Cotton Casual Saree', category: 'Cotton Sarees' },
              quantity: 2,
              price: 800.00
            }
          ]
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleViewOrder = (order) => {
    setModalMode('view');
    setSelectedOrder(order);
    setShowModal(true);
  };

  const handleEditOrder = (order) => {
    setModalMode('edit');
    setSelectedOrder(order);
    setStatusUpdate(order.status);
    setShowModal(true);
  };

  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    try {
      await axios.put(`/api/admin/orders/${orderId}/status`, { status: newStatus });
      setOrders(orders.map(order => 
        order.id === orderId ? { ...order, status: newStatus } : order
      ));
      toast.success('Order status updated successfully');
      setShowModal(false);
    } catch (error) {
      console.error('Error updating order status:', error);
      toast.error('Failed to update order status');
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'PENDING':
        return <Clock className="h-4 w-4" />;
      case 'CONFIRMED':
      case 'PROCESSING':
        return <Package className="h-4 w-4" />;
      case 'SHIPPED':
        return <Truck className="h-4 w-4" />;
      case 'DELIVERED':
        return <CheckCircle className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status) => {
    const statusObj = orderStatuses.find(s => s.value === status);
    return statusObj ? statusObj.color : 'bg-gray-100 text-gray-800';
  };

  const getPaymentStatusColor = (status) => {
    const statusObj = paymentStatuses.find(s => s.value === status);
    return statusObj ? statusObj.color : 'bg-gray-100 text-gray-800';
  };

  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || order.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(price);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Order Management</h1>
              <p className="mt-1 text-sm text-gray-500">
                Manage and track customer orders
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center bg-blue-50 px-3 py-2 rounded-lg">
                <ShoppingBag className="h-5 w-5 text-blue-600 mr-2" />
                <span className="text-sm font-medium text-blue-600">
                  {filteredOrders.length} Orders
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters */}
        <div className="bg-white rounded-lg shadow mb-6 p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type="text"
                  placeholder="Search by order number, customer name, or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="input-field pl-10"
                />
              </div>
            </div>
            <div className="sm:w-48">
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="input-field pl-10 appearance-none"
                >
                  <option value="all">All Statuses</option>
                  {orderStatuses.map(status => (
                    <option key={status.value} value={status.value}>{status.label}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Orders Table */}
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Order Details
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">#{order.orderNumber}</div>
                        <div className="text-sm text-gray-500">
                          {order.orderItems.length} item{order.orderItems.length !== 1 ? 's' : ''}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-8 w-8">
                          <div className="h-8 w-8 rounded-full bg-maroon-100 flex items-center justify-center">
                            <span className="text-xs font-medium text-maroon-600">
                              {order.user.name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                        </div>
                        <div className="ml-3">
                          <div className="text-sm font-medium text-gray-900">{order.user.name}</div>
                          <div className="text-sm text-gray-500">{order.user.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="space-y-1">
                        <span className={`inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(order.status)}`}>
                          {getStatusIcon(order.status)}
                          <span className="ml-1">{order.status}</span>
                        </span>
                        <div>
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPaymentStatusColor(order.paymentStatus)}`}>
                            {order.paymentStatus}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{formatPrice(order.totalPrice)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex items-center">
                        <Calendar className="h-3 w-3 mr-1" />
                        {formatDate(order.orderDate)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="relative">
                        <button
                          onClick={() => setShowActions(showActions === order.id ? null : order.id)}
                          className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100"
                        >
                          <MoreVertical className="h-4 w-4" />
                        </button>
                        
                        {showActions === order.id && (
                          <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10 border">
                            <div className="py-1">
                              <button
                                onClick={() => {
                                  handleViewOrder(order);
                                  setShowActions(null);
                                }}
                                className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                              >
                                <Eye className="h-4 w-4 mr-2" />
                                View Details
                              </button>
                              <button
                                onClick={() => {
                                  handleEditOrder(order);
                                  setShowActions(null);
                                }}
                                className="flex items-center px-4 py-2 text-sm text-blue-700 hover:bg-gray-100 w-full text-left"
                              >
                                <Edit className="h-4 w-4 mr-2" />
                                Update Status
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {filteredOrders.length === 0 && (
          <div className="text-center py-12">
            <ShoppingBag className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No orders found</h3>
            <p className="mt-1 text-sm text-gray-500">
              Try adjusting your search or filter criteria.
            </p>
          </div>
        )}
      </div>

      {/* Order Modal */}
      {showModal && selectedOrder && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-10 mx-auto p-5 border w-full max-w-4xl shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-medium text-gray-900">
                  {modalMode === 'view' ? 'Order Details' : 'Update Order Status'}
                </h3>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              {modalMode === 'view' ? (
                <div className="space-y-6">
                  {/* Order Info */}
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div>
                        <h4 className="text-sm font-medium text-gray-900 mb-2">Order Information</h4>
                        <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-500">Order Number:</span>
                            <span className="text-sm font-medium">#{selectedOrder.orderNumber}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-500">Date:</span>
                            <span className="text-sm">{formatDate(selectedOrder.orderDate)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-500">Status:</span>
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(selectedOrder.status)}`}>
                              {selectedOrder.status}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-500">Payment:</span>
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPaymentStatusColor(selectedOrder.paymentStatus)}`}>
                              {selectedOrder.paymentStatus}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <h4 className="text-sm font-medium text-gray-900 mb-2">Customer Information</h4>
                        <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                          <div className="flex items-center">
                            <User className="h-4 w-4 text-gray-400 mr-2" />
                            <span className="text-sm">{selectedOrder.user.name}</span>
                          </div>
                          <div className="flex items-center">
                            <Mail className="h-4 w-4 text-gray-400 mr-2" />
                            <span className="text-sm">{selectedOrder.user.email}</span>
                          </div>
                          <div className="flex items-center">
                            <Phone className="h-4 w-4 text-gray-400 mr-2" />
                            <span className="text-sm">{selectedOrder.user.phone}</span>
                          </div>
                          <div className="flex items-start">
                            <MapPin className="h-4 w-4 text-gray-400 mr-2 mt-0.5" />
                            <span className="text-sm">{selectedOrder.shippingAddress}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Order Items */}
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 mb-2">Order Items</h4>
                    <div className="border rounded-lg overflow-hidden">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Product</th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Quantity</th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Price</th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                          {selectedOrder.orderItems.map((item) => (
                            <tr key={item.id}>
                              <td className="px-4 py-2">
                                <div>
                                  <div className="text-sm font-medium text-gray-900">{item.product.name}</div>
                                  <div className="text-sm text-gray-500">{item.product.category}</div>
                                </div>
                              </td>
                              <td className="px-4 py-2 text-sm text-gray-900">{item.quantity}</td>
                              <td className="px-4 py-2 text-sm text-gray-900">{formatPrice(item.price)}</td>
                              <td className="px-4 py-2 text-sm font-medium text-gray-900">
                                {formatPrice(item.quantity * item.price)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                        <tfoot className="bg-gray-50">
                          <tr>
                            <td colSpan="3" className="px-4 py-2 text-sm font-medium text-gray-900 text-right">
                              Total Amount:
                            </td>
                            <td className="px-4 py-2 text-sm font-bold text-gray-900">
                              {formatPrice(selectedOrder.totalPrice)}
                            </td>
                          </tr>
                        </tfoot>
                      </table>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Update Order Status
                    </label>
                    <select
                      value={statusUpdate}
                      onChange={(e) => setStatusUpdate(e.target.value)}
                      className="input-field"
                    >
                      {orderStatuses.map(status => (
                        <option key={status.value} value={status.value}>{status.label}</option>
                      ))}
                    </select>
                  </div>

                  <div className="flex justify-end space-x-3">
                    <button
                      onClick={() => setShowModal(false)}
                      className="btn-secondary"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => handleUpdateOrderStatus(selectedOrder.id, statusUpdate)}
                      className="btn-primary inline-flex items-center"
                    >
                      <Save className="h-4 w-4 mr-2" />
                      Update Status
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminOrders;
