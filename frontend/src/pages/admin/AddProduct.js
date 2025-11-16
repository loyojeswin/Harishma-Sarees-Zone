import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext';
import {
  Package,
  Save,
  X,
  ArrowLeft,
  DollarSign,
  Upload,
  Star,
  Eye
} from 'lucide-react';
import { toast } from 'react-toastify';

const AddProduct = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [imageFiles, setImageFiles] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    description: '',
    price: '',
    stock: '',
    color: '',
    fabric: '',
    size: 'Free Size',
    isFeatured: false,
    isActive: true
  });

  const categories = [
    'Silk Sarees',
    'Cotton Sarees',
    'Designer Sarees',
    'Banarasi Sarees',
    'Chiffon Sarees',
    'Lehengas',
    'Jewelry',
    'Blouses'
  ];

  const colors = [
    'Red', 'Blue', 'Green', 'Yellow', 'Pink', 'Purple', 'Orange', 'Black', 
    'White', 'Golden', 'Silver', 'Maroon', 'Navy', 'Cream', 'Beige'
  ];

  const fabrics = [
    'Silk', 'Cotton', 'Chiffon', 'Georgette', 'Net', 'Satin', 'Crepe', 
    'Linen', 'Polyester', 'Velvet', 'Organza', 'Pearl'
  ];

  const sizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'Free Size', 'One Size'];

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) {
      // Limit to 5 images maximum
      const newFiles = files.slice(0, 5 - imageFiles.length);
      
      newFiles.forEach(file => {
        const reader = new FileReader();
        reader.onloadend = () => {
          setImageFiles(prev => [...prev, file]);
          setImagePreviews(prev => [...prev, reader.result]);
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const removeImage = (index) => {
    setImageFiles(prev => prev.filter((_, i) => i !== index));
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
  };

  const removeAllImages = () => {
    setImageFiles([]);
    setImagePreviews([]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      
      // Get token from localStorage
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Authentication required. Please login again.');
        navigate('/login');
        return;
      }

      const productData = {
        ...formData,
        price: parseFloat(formData.price),
        stock: parseInt(formData.stock),
        imagePaths: imagePreviews.length > 0 ? JSON.stringify(imagePreviews) : null
      };

      // Set authorization header
      const config = {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      };

      const response = await axios.post('/api/admin/products', productData, config);

      toast.success('Product added successfully!');
      navigate('/admin/products');
    } catch (error) {
      console.error('Error adding product:', error);
      if (error.response?.status === 401) {
        toast.error('Authentication failed. Please login again.');
        navigate('/login');
      } else if (error.response?.status === 403) {
        toast.error('Access denied. Admin privileges required.');
      } else {
        toast.error('Failed to add product. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate('/admin/products');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <button
                onClick={() => navigate('/admin/products')}
                className="mr-4 p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Add New Product</h1>
                <p className="mt-1 text-sm text-gray-500">
                  Create a new product for your catalog
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center bg-green-50 px-3 py-2 rounded-lg">
                <Package className="h-5 w-5 text-green-600 mr-2" />
                <span className="text-sm font-medium text-green-600">
                  New Product
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">Product Information</h2>
            <p className="mt-1 text-sm text-gray-500">
              Fill in the details below to create a new product
            </p>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Product Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  className="input-field"
                  placeholder="Enter product name"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category *
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  required
                  className="input-field"
                >
                  <option value="">Select category</option>
                  {categories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description *
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                required
                rows={4}
                className="input-field"
                placeholder="Enter detailed product description"
              />
            </div>

            {/* Product Image */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Product Images (Max 5)
              </label>
              
              {/* Image Previews */}
              {imagePreviews.length > 0 && (
                <div className="mb-4">
                  <div className="flex flex-wrap gap-3 mb-3">
                    {imagePreviews.map((preview, index) => (
                      <div key={index} className="relative">
                        <img
                          src={preview}
                          alt={`Product preview ${index + 1}`}
                          className="h-24 w-24 object-cover rounded-lg border-2 border-gray-200"
                          onError={(e) => {
                            console.warn('Add product preview image failed to load:', preview);
                            if (e.target) {
                              e.target.style.display = 'none';
                            }
                          }}
                          onLoad={(e) => {
                            if (e.target) {
                              e.target.style.display = 'block';
                            }
                          }}
                        />
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                  <button
                    type="button"
                    onClick={removeAllImages}
                    className="text-sm text-red-600 hover:text-red-800"
                  >
                    Remove All Images
                  </button>
                </div>
              )}
              
              {/* Upload Area */}
              {imagePreviews.length < 5 && (
                <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                  <div className="space-y-1 text-center">
                    <Upload className="mx-auto h-12 w-12 text-gray-400" />
                    <div className="flex text-sm text-gray-600">
                      <label
                        htmlFor="image-upload"
                        className="relative cursor-pointer bg-white rounded-md font-medium text-maroon-600 hover:text-maroon-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-maroon-500"
                      >
                        <span>Upload images</span>
                        <input
                          id="image-upload"
                          name="image-upload"
                          type="file"
                          className="sr-only"
                          accept="image/*"
                          multiple
                          onChange={handleImageChange}
                        />
                      </label>
                      <p className="pl-1">or drag and drop</p>
                    </div>
                    <p className="text-xs text-gray-500">
                      PNG, JPG, GIF up to 10MB each ({imagePreviews.length}/5 images)
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Pricing and Stock */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Price (₹) *
                </label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleInputChange}
                    required
                    min="0"
                    step="0.01"
                    className="input-field pl-10"
                    placeholder="0.00"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Stock Quantity *
                </label>
                <input
                  type="number"
                  name="stock"
                  value={formData.stock}
                  onChange={handleInputChange}
                  required
                  min="0"
                  className="input-field"
                  placeholder="Enter stock quantity"
                />
              </div>
            </div>

            {/* Product Attributes */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Color
                </label>
                <select
                  name="color"
                  value={formData.color}
                  onChange={handleInputChange}
                  className="input-field"
                >
                  <option value="">Select color</option>
                  {colors.map(color => (
                    <option key={color} value={color}>{color}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Fabric
                </label>
                <select
                  name="fabric"
                  value={formData.fabric}
                  onChange={handleInputChange}
                  className="input-field"
                >
                  <option value="">Select fabric</option>
                  {fabrics.map(fabric => (
                    <option key={fabric} value={fabric}>{fabric}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Size
                </label>
                <select
                  name="size"
                  value={formData.size}
                  onChange={handleInputChange}
                  className="input-field"
                >
                  {sizes.map(size => (
                    <option key={size} value={size}>{size}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Product Settings */}
            <div className="border-t border-gray-200 pt-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Product Settings</h3>
              <div className="space-y-4">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    name="isFeatured"
                    checked={formData.isFeatured}
                    onChange={handleInputChange}
                    className="h-4 w-4 text-maroon-600 focus:ring-maroon-500 border-gray-300 rounded"
                  />
                  <label className="ml-3 flex items-center">
                    <Star className="h-4 w-4 text-yellow-500 mr-1" />
                    <span className="text-sm text-gray-900">Featured Product</span>
                    <span className="ml-2 text-xs text-gray-500">
                      (Will be displayed prominently on homepage)
                    </span>
                  </label>
                </div>
                
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    name="isActive"
                    checked={formData.isActive}
                    onChange={handleInputChange}
                    className="h-4 w-4 text-maroon-600 focus:ring-maroon-500 border-gray-300 rounded"
                  />
                  <label className="ml-3 flex items-center">
                    <Eye className="h-4 w-4 text-green-500 mr-1" />
                    <span className="text-sm text-gray-900">Active Product</span>
                    <span className="ml-2 text-xs text-gray-500">
                      (Visible to customers)
                    </span>
                  </label>
                </div>
              </div>
            </div>

            {/* Form Actions */}
            <div className="border-t border-gray-200 pt-6">
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={handleCancel}
                  className="btn-secondary inline-flex items-center"
                  disabled={loading}
                >
                  <X className="h-4 w-4 mr-2" />
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary inline-flex items-center"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Adding...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Add Product
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>
        </div>

        {/* Help Section */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <Package className="h-5 w-5 text-blue-400" />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-blue-800">
                Product Creation Tips
              </h3>
              <div className="mt-2 text-sm text-blue-700">
                <ul className="list-disc list-inside space-y-1">
                  <li>Use clear, descriptive product names</li>
                  <li>Write detailed descriptions to help customers</li>
                  <li>Set competitive pricing based on market research</li>
                  <li>Keep accurate stock quantities to avoid overselling</li>
                  <li>Mark products as "Featured" to highlight them on homepage</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddProduct;
