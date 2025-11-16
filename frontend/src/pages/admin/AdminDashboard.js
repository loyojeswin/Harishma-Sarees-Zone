import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import {
  Users,
  Package,
  ShoppingCart,
  DollarSign,
  TrendingUp,
  Eye,
  Plus,
  Calendar,
  Star,
  AlertCircle,
  CheckCircle,
  Clock,
  BarChart3
} from 'lucide-react';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalProducts: 0,
    totalOrders: 0,
    totalRevenue: 0,
    recentOrders: [],
    topProducts: [],
    monthlyRevenue: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch basic stats
      const [usersRes, productsRes] = await Promise.all([
        axios.get('/api/admin/users/count'),
        axios.get('/api/products')
      ]);

      // Mock data for demonstration (replace with real API calls)
      setStats({
        totalUsers: usersRes.data || 156,
        totalProducts: productsRes.data?.length || 48,
        totalOrders: 234,
        totalRevenue: 125000,
        recentOrders: [
          { id: 1, customer: 'Priya Sharma', amount: 2500, status: 'completed', date: '2024-11-16' },
          { id: 2, customer: 'Anita Patel', amount: 1800, status: 'pending', date: '2024-11-16' },
          { id: 3, customer: 'Meera Gupta', amount: 4500, status: 'processing', date: '2024-11-15' },
          { id: 4, customer: 'Jane Smith', amount: 800, status: 'completed', date: '2024-11-15' },
          { id: 5, customer: 'John Doe', amount: 6000, status: 'shipped', date: '2024-11-14' }
        ],
        topProducts: [
          { name: 'Elegant Silk Saree', sales: 45, revenue: 112500 },
          { name: 'Designer Party Saree', sales: 32, revenue: 144000 },
          { name: 'Traditional Banarasi', sales: 28, revenue: 168000 },
          { name: 'Cotton Casual Saree', sales: 67, revenue: 53600 }
        ],
        monthlyRevenue: [
          { month: 'Jan', revenue: 45000 },
          { month: 'Feb', revenue: 52000 },
          { month: 'Mar', revenue: 48000 },
          { month: 'Apr', revenue: 61000 },
          { month: 'May', revenue: 55000 },
          { month: 'Jun', revenue: 67000 }
        ]
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      // Set mock data on error
      setStats({
        totalUsers: 156,
        totalProducts: 48,
        totalOrders: 234,
        totalRevenue: 125000,
        recentOrders: [
          { id: 1, customer: 'Priya Sharma', amount: 2500, status: 'completed', date: '2024-11-16' },
          { id: 2, customer: 'Anita Patel', amount: 1800, status: 'pending', date: '2024-11-16' },
          { id: 3, customer: 'Meera Gupta', amount: 4500, status: 'processing', date: '2024-11-15' }
        ],
        topProducts: [
          { name: 'Elegant Silk Saree', sales: 45, revenue: 112500 },
          { name: 'Designer Party Saree', sales: 32, revenue: 144000 }
        ],
        monthlyRevenue: []
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'processing':
        return <AlertCircle className="h-4 w-4 text-blue-500" />;
      case 'shipped':
        return <TrendingUp className="h-4 w-4 text-purple-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'processing':
        return 'bg-blue-100 text-blue-800';
      case 'shipped':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
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
              <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
              <p className="mt-1 text-sm text-gray-500">
                Welcome back! Here's what's happening with your store today.
              </p>
            </div>
            <div className="flex space-x-3">
              <Link
                to="/admin/products/new"
                className="btn-primary inline-flex items-center"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Product
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Users className="h-8 w-8 text-blue-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Total Users</dt>
                  <dd className="text-lg font-medium text-gray-900">{stats.totalUsers}</dd>
                </dl>
              </div>
            </div>
            <div className="mt-4">
              <div className="flex items-center text-sm text-green-600">
                <TrendingUp className="h-4 w-4 mr-1" />
                +12% from last month
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Package className="h-8 w-8 text-green-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Total Products</dt>
                  <dd className="text-lg font-medium text-gray-900">{stats.totalProducts}</dd>
                </dl>
              </div>
            </div>
            <div className="mt-4">
              <div className="flex items-center text-sm text-green-600">
                <TrendingUp className="h-4 w-4 mr-1" />
                +8% from last month
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <ShoppingCart className="h-8 w-8 text-yellow-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Total Orders</dt>
                  <dd className="text-lg font-medium text-gray-900">{stats.totalOrders}</dd>
                </dl>
              </div>
            </div>
            <div className="mt-4">
              <div className="flex items-center text-sm text-green-600">
                <TrendingUp className="h-4 w-4 mr-1" />
                +23% from last month
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <DollarSign className="h-8 w-8 text-maroon-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Total Revenue</dt>
                  <dd className="text-lg font-medium text-gray-900">₹{stats.totalRevenue.toLocaleString()}</dd>
                </dl>
              </div>
            </div>
            <div className="mt-4">
              <div className="flex items-center text-sm text-green-600">
                <TrendingUp className="h-4 w-4 mr-1" />
                +18% from last month
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent Orders */}
          <div className="lg:col-span-2">
            <div className="bg-white shadow rounded-lg">
              <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium text-gray-900">Recent Orders</h3>
                  <Link
                    to="/admin/orders"
                    className="text-sm text-maroon-600 hover:text-maroon-500 font-medium"
                  >
                    View all
                  </Link>
                </div>
              </div>
              <div className="overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Customer
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Amount
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {stats.recentOrders.map((order) => (
                      <tr key={order.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{order.customer}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">₹{order.amount.toLocaleString()}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                            {getStatusIcon(order.status)}
                            <span className="ml-1 capitalize">{order.status}</span>
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(order.date).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Top Products */}
          <div>
            <div className="bg-white shadow rounded-lg">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">Top Products</h3>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  {stats.topProducts.map((product, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {product.name}
                        </p>
                        <p className="text-sm text-gray-500">
                          {product.sales} sales
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-gray-900">
                          ₹{product.revenue.toLocaleString()}
                        </p>
                        <div className="flex items-center text-sm text-yellow-500">
                          <Star className="h-3 w-3 mr-1" />
                          4.8
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-8">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <Link
              to="/admin/products/add"
              className="bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow duration-200 border-l-4 border-green-500"
            >
              <div className="flex items-center">
                <Plus className="h-8 w-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-900">Add Product</p>
                  <p className="text-sm text-gray-500">Create new product</p>
                </div>
              </div>
            </Link>

            <Link
              to="/admin/products"
              className="bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow duration-200 border-l-4 border-blue-500"
            >
              <div className="flex items-center">
                <Package className="h-8 w-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-900">All Products</p>
                  <p className="text-sm text-gray-500">View & manage products</p>
                </div>
              </div>
            </Link>

            <Link
              to="/admin/orders"
              className="bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow duration-200"
            >
              <div className="flex items-center">
                <ShoppingCart className="h-8 w-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-900">Manage Orders</p>
                  <p className="text-sm text-gray-500">Process and track orders</p>
                </div>
              </div>
            </Link>

            <Link
              to="/admin/users"
              className="bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow duration-200"
            >
              <div className="flex items-center">
                <Users className="h-8 w-8 text-purple-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-900">Manage Users</p>
                  <p className="text-sm text-gray-500">View and manage customers</p>
                </div>
              </div>
            </Link>

            <Link
              to="/admin/banners"
              className="bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow duration-200"
            >
              <div className="flex items-center">
                <Eye className="h-8 w-8 text-maroon-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-900">Manage Banners</p>
                  <p className="text-sm text-gray-500">Update homepage banners</p>
                </div>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
