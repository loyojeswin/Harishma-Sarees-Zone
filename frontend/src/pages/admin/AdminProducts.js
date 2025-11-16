import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import axios from 'axios';
import { toast } from 'react-toastify';
import {
  Package,
  Plus,
  Search,
  Filter,
  Edit,
  Trash2,
  Eye,
  Star,
  MoreVertical,
  X,
  Save,
  Upload,
  DollarSign,
  Tag,
  Palette,
  Shirt,
  ChevronLeft,
  ChevronRight,
  Ruler
} from 'lucide-react';

const AdminProducts = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('edit'); // 'edit', 'view'
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showActions, setShowActions] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState({});
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
    isActive: true,
    images: [] // Array to store image files/URLs
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

  useEffect(() => {
    if (user) {
      fetchProducts();
    }
  }, [user]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      
      console.log('AdminProducts - Current user:', user);
      console.log('AdminProducts - User role:', user?.role);
      console.log('AdminProducts - Axios default headers:', axios.defaults.headers.common);
      
      // Check if user is authenticated and is admin
      if (!user) {
        console.log('AdminProducts - No user found, redirecting to login');
        toast.error('Authentication required. Please login again.');
        navigate('/login');
        return;
      }

      if (user.role !== 'ADMIN') {
        console.log('AdminProducts - User is not admin, redirecting to home');
        toast.error('Admin access required.');
        navigate('/');
        return;
      }

      console.log('AdminProducts - Making API call to /api/admin/products');
      
      // Double-check token exists in localStorage as fallback
      const token = localStorage.getItem('token');
      console.log('AdminProducts - Token in localStorage:', token);
      
      if (!token) {
        console.log('AdminProducts - No token in localStorage');
        toast.error('No authentication token found. Please login again.');
        navigate('/login');
        return;
      }
      
      // Use axios with default headers set by AuthContext
      // Also manually set header as fallback
      const config = {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      };
      
      console.log('AdminProducts - Request config:', config);
      const response = await axios.get('/api/admin/products', config);
      setProducts(response.data);
    } catch (error) {
      console.error('Error fetching products:', error);
      
      if (error.response?.status === 401) {
        toast.error('Authentication failed. Please login again.');
        navigate('/login');
        return;
      }
      
      // Fallback to mock data
      setProducts([
        {
          id: 1,
          name: 'Elegant Silk Saree',
          category: 'Silk Sarees',
          description: 'Beautiful handwoven silk saree with intricate designs',
          price: 2500,
          stock: 15,
          color: 'Red',
          fabric: 'Silk',
          size: 'Free Size',
          isFeatured: true,
          isActive: true,
          imagePaths: null,
          createdAt: '2024-03-10T09:30:00'
        },
        {
          id: 2,
          name: 'Cotton Casual Saree',
          category: 'Cotton Sarees',
          description: 'Comfortable cotton saree perfect for daily wear',
          price: 800,
          stock: 25,
          color: 'Blue',
          fabric: 'Cotton',
          size: 'Free Size',
          isFeatured: false,
          isActive: true,
          imagePaths: null,
          createdAt: '2024-03-10T09:45:00'
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleAddProduct = () => {
    navigate('/admin/products/add');
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedProduct(null);
    setModalMode('view');
    // Reset form
    setFormData({
      name: '',
      category: '',
      description: '',
      price: '',
      stock: '',
      color: '',
      fabric: '',
      size: 'Free Size',
      isFeatured: false,
      isActive: true,
      images: []
    });
  };

  const handleEditProduct = (product) => {
    setModalMode('edit');
    setSelectedProduct(product);
    const existingImages = getImagePaths(product);
    
    console.log('Editing product:', product.name);
    console.log('Existing images:', existingImages);
    
    setFormData({
      name: product.name || '',
      category: product.category || '',
      description: product.description || '',
      price: product.price ? product.price.toString() : '',
      stock: product.stock ? product.stock.toString() : '',
      color: product.color || '',
      fabric: product.fabric || '',
      size: product.size || 'Free Size',
      isFeatured: product.isFeatured || false,
      isActive: product.isActive !== undefined ? product.isActive : true,
      images: existingImages.map((path, index) => ({ 
        url: path, 
        isExisting: true,
        id: `existing_${index}` // Add unique ID for tracking
      }))
    });
    setShowModal(true);
  };

  const handleViewProduct = (product) => {
    setModalMode('view');
    setSelectedProduct(product);
    setShowModal(true);
  };

  // Helper function to get image paths array from product
  const getImagePaths = (product) => {
    if (!product) return [];
    
    if (!product.imagePaths) {
      // Fallback for backward compatibility
      return product.imagePath ? [product.imagePath] : [];
    }
    
    try {
      const parsed = JSON.parse(product.imagePaths);
      // Ensure it's an array and filter out empty/null values
      if (Array.isArray(parsed)) {
        return parsed.filter(path => path && path.trim() !== '');
      }
      return [];
    } catch (error) {
      console.error('Error parsing imagePaths:', error);
      // Fallback for backward compatibility
      return product.imagePath ? [product.imagePath] : [];
    }
  };

  // Image navigation functions
  const nextImage = (productId, imagePaths) => {
    const currentIndex = currentImageIndex[productId] || 0;
    const nextIndex = (currentIndex + 1) % imagePaths.length;
    setCurrentImageIndex(prev => ({
      ...prev,
      [productId]: nextIndex
    }));
  };

  const prevImage = (productId, imagePaths) => {
    const currentIndex = currentImageIndex[productId] || 0;
    const prevIndex = currentIndex === 0 ? imagePaths.length - 1 : currentIndex - 1;
    setCurrentImageIndex(prev => ({
      ...prev,
      [productId]: prevIndex
    }));
  };

  // Image management functions for edit form
  const handleImageUpload = (event) => {
    const files = Array.from(event.target.files);
    
    if (files.length === 0) return;
    
    files.forEach(file => {
      if (file.type.startsWith('image/')) {
        // Check file size (limit to 5MB)
        if (file.size > 5 * 1024 * 1024) {
          toast.error(`File ${file.name} is too large. Maximum size is 5MB.`);
          return;
        }
        
        const reader = new FileReader();
        reader.onload = (e) => {
          setFormData(prev => ({
            ...prev,
            images: [...(prev.images || []), { 
              file: file, 
              url: e.target.result, 
              isExisting: false,
              name: file.name,
              id: `new_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
            }]
          }));
        };
        reader.onerror = (e) => {
          console.error('Error reading file:', e);
          toast.error(`Error reading file ${file.name}`);
        };
        reader.readAsDataURL(file);
      } else {
        toast.error(`File ${file.name} is not a valid image format.`);
      }
    });
    
    // Reset the input
    event.target.value = '';
  };

  const removeImage = (index) => {
    try {
      setFormData(prev => {
        if (!prev.images || prev.images.length === 0) {
          console.warn('No images to remove');
          return prev;
        }
        
        if (index < 0 || index >= prev.images.length) {
          console.warn('Invalid image index:', index);
          return prev;
        }
        
        const newImages = prev.images.filter((_, i) => i !== index);
        console.log(`Removed image at index ${index}. Remaining images:`, newImages.length);
        
        return {
          ...prev,
          images: newImages
        };
      });
    } catch (error) {
      console.error('Error removing image:', error);
      toast.error('Failed to remove image');
    }
  };

  const moveImage = (fromIndex, toIndex) => {
    try {
      setFormData(prev => {
        if (!prev.images || prev.images.length === 0) {
          console.warn('No images to move');
          return prev;
        }
        
        if (fromIndex < 0 || fromIndex >= prev.images.length || 
            toIndex < 0 || toIndex >= prev.images.length) {
          console.warn('Invalid move indices:', fromIndex, toIndex);
          return prev;
        }
        
        if (fromIndex === toIndex) {
          return prev; // No change needed
        }
        
        const newImages = [...prev.images];
        const [movedImage] = newImages.splice(fromIndex, 1);
        newImages.splice(toIndex, 0, movedImage);
        
        console.log(`Moved image from ${fromIndex} to ${toIndex}`);
        
        return {
          ...prev,
          images: newImages
        };
      });
    } catch (error) {
      console.error('Error moving image:', error);
      toast.error('Failed to move image');
    }
  };


  const handleDeleteProduct = async (productId) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        const token = localStorage.getItem('token');
        const config = {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        };
        
        await axios.delete(`/api/admin/products/${productId}`, config);
        setProducts(products.filter(product => product.id !== productId));
        toast.success('Product deleted successfully');
      } catch (error) {
        console.error('Error deleting product:', error);
        if (error.response?.status === 401) {
          toast.error('Authentication failed. Please login again.');
          navigate('/login');
        } else {
          toast.error('Failed to delete product');
        }
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const token = localStorage.getItem('token');
      const config = {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      };

      // Prepare image data - convert new images to base64
      let processedImages = [];
      
      if (formData.images && formData.images.length > 0) {
        const imagePromises = formData.images.map(async (image) => {
          if (image.isExisting) {
            // Keep existing images as they are (already base64 or URL)
            return image.url;
          } else {
            // Convert new images to base64
            return new Promise((resolve, reject) => {
              const reader = new FileReader();
              reader.onload = (e) => resolve(e.target.result);
              reader.onerror = (e) => reject(e);
              reader.readAsDataURL(image.file);
            });
          }
        });

        try {
          processedImages = await Promise.all(imagePromises);
        } catch (error) {
          console.error('Error processing images:', error);
          toast.error('Error processing images. Please try again.');
          return;
        }
      }

      const productData = {
        name: formData.name,
        category: formData.category,
        description: formData.description,
        price: parseFloat(formData.price),
        stock: parseInt(formData.stock),
        color: formData.color,
        fabric: formData.fabric,
        size: formData.size,
        isFeatured: formData.isFeatured,
        isActive: formData.isActive,
        imagePaths: JSON.stringify(processedImages)
      };

      if (modalMode === 'edit') {
        const response = await axios.put(`/api/admin/products/${selectedProduct.id}`, productData, config);
        setProducts(products.map(product => 
          product.id === selectedProduct.id 
            ? response.data
            : product
        ));
        toast.success('Product updated successfully');
      }
      
      closeModal();
      
    } catch (error) {
      console.error('Error saving product:', error);
      if (error.response?.status === 401) {
        toast.error('Authentication failed. Please login again.');
        navigate('/login');
      } else {
        toast.error(error.response?.data?.message || 'Failed to save product');
      }
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'all' || product.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(price);
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
              <h1 className="text-3xl font-bold text-gray-900">Product Management</h1>
              <p className="mt-1 text-sm text-gray-500">
                Manage your product catalog
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center bg-blue-50 px-3 py-2 rounded-lg">
                <Package className="h-5 w-5 text-blue-600 mr-2" />
                <span className="text-sm font-medium text-blue-600">
                  {filteredProducts.length} Products
                </span>
              </div>
              <button
                onClick={handleAddProduct}
                className="btn-primary inline-flex items-center"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Product
              </button>
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
                  placeholder="Search products by name or category..."
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
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  className="input-field pl-10 appearance-none"
                >
                  <option value="all">All Categories</option>
                  {categories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProducts.map((product) => (
            <div key={product.id} className="bg-white rounded-lg shadow hover:shadow-md transition-shadow duration-200">
              {/* Product Image Carousel */}
              <div className="h-48 bg-gray-200 rounded-t-lg overflow-hidden relative">
                {(() => {
                  const imagePaths = getImagePaths(product);
                  const currentIndex = currentImageIndex[product.id] || 0;
                  
                  if (imagePaths.length > 0) {
                    return (
                      <>
                        <img
                          src={imagePaths[currentIndex]}
                          alt={`${product.name} - Image ${currentIndex + 1}`}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            console.warn('Product image failed to load:', imagePaths[currentIndex]);
                            if (e.target) {
                              e.target.style.display = 'none';
                              const placeholder = e.target.nextSibling;
                              if (placeholder) {
                                placeholder.style.display = 'flex';
                              }
                            }
                          }}
                          onLoad={(e) => {
                            if (e.target) {
                              e.target.style.display = 'block';
                              const placeholder = e.target.nextSibling;
                              if (placeholder) {
                                placeholder.style.display = 'none';
                              }
                            }
                          }}
                        />
                        <div className="hidden w-full h-full bg-gray-200 items-center justify-center">
                          <span className="text-gray-500 text-sm">Image Not Available</span>
                        </div>
                        
                        {/* Navigation buttons - only show if multiple images */}
                        {imagePaths.length > 1 && (
                          <>
                            <button
                              onClick={() => prevImage(product.id, imagePaths)}
                              className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white rounded-full p-1 hover:bg-opacity-70 transition-opacity"
                            >
                              <ChevronLeft className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => nextImage(product.id, imagePaths)}
                              className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white rounded-full p-1 hover:bg-opacity-70 transition-opacity"
                            >
                              <ChevronRight className="h-4 w-4" />
                            </button>
                            
                            {/* Image indicators */}
                            <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex space-x-1">
                              {imagePaths.map((_, index) => (
                                <button
                                  key={index}
                                  onClick={() => setCurrentImageIndex(prev => ({
                                    ...prev,
                                    [product.id]: index
                                  }))}
                                  className={`w-2 h-2 rounded-full transition-colors ${
                                    index === currentIndex 
                                      ? 'bg-white' 
                                      : 'bg-white bg-opacity-50'
                                  }`}
                                />
                              ))}
                            </div>
                            
                            {/* Image counter */}
                            <div className="absolute top-2 right-2 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded">
                              {currentIndex + 1}/{imagePaths.length}
                            </div>
                          </>
                        )}
                      </>
                    );
                  } else {
                    return (
                      <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                        <span className="text-gray-500 text-sm">No Image</span>
                      </div>
                    );
                  }
                })()}
              </div>
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">{product.name}</h3>
                    <p className="text-sm text-gray-500 mb-2">{product.category}</p>
                    <p className="text-sm text-gray-600 line-clamp-2">{product.description}</p>
                  </div>
                  <div className="relative ml-2">
                    <button
                      onClick={() => setShowActions(showActions === product.id ? null : product.id)}
                      className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100"
                    >
                      <MoreVertical className="h-4 w-4" />
                    </button>
                    
                    {showActions === product.id && (
                      <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10 border">
                        <div className="py-1">
                          <button
                            onClick={() => {
                              handleViewProduct(product);
                              setShowActions(null);
                            }}
                            className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                          >
                            <Eye className="h-4 w-4 mr-2" />
                            View Details
                          </button>
                          <button
                            onClick={() => {
                              handleEditProduct(product);
                              setShowActions(null);
                            }}
                            className="flex items-center px-4 py-2 text-sm text-blue-700 hover:bg-gray-100 w-full text-left"
                          >
                            <Edit className="h-4 w-4 mr-2" />
                            Edit Product
                          </button>
                          <button
                            onClick={() => {
                              handleDeleteProduct(product.id);
                              setShowActions(null);
                            }}
                            className="flex items-center px-4 py-2 text-sm text-red-700 hover:bg-gray-100 w-full text-left"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete Product
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">Price:</span>
                    <span className="text-lg font-bold text-maroon-600">{formatPrice(product.price)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">Stock:</span>
                    <span className={`text-sm font-medium ${product.stock > 10 ? 'text-green-600' : 'text-red-600'}`}>
                      {product.stock} units
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">Color:</span>
                    <span className="text-sm text-gray-900">{product.color}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">Fabric:</span>
                    <span className="text-sm text-gray-900">{product.fabric}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    {product.isFeatured && (
                      <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-800 rounded-full">
                        <Star className="h-3 w-3 mr-1" />
                        Featured
                      </span>
                    )}
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      product.isActive 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {product.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredProducts.length === 0 && (
          <div className="text-center py-12">
            <Package className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No products found</h3>
            <p className="mt-1 text-sm text-gray-500">
              Try adjusting your search or filter criteria.
            </p>
          </div>
        )}
      </div>

      {/* Product Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-10 mx-auto p-5 border w-full max-w-2xl shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-medium text-gray-900">
                  {modalMode === 'edit' ? 'Edit Product' : 'Product Details'}
                </h3>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              {modalMode === 'view' ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Product Name</label>
                      <p className="mt-1 text-sm text-gray-900">{selectedProduct?.name}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Category</label>
                      <p className="mt-1 text-sm text-gray-900">{selectedProduct?.category}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Price</label>
                      <p className="mt-1 text-sm text-gray-900">{formatPrice(selectedProduct?.price)}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Stock</label>
                      <p className="mt-1 text-sm text-gray-900">{selectedProduct?.stock} units</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Color</label>
                      <p className="mt-1 text-sm text-gray-900">{selectedProduct?.color}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Fabric</label>
                      <p className="mt-1 text-sm text-gray-900">{selectedProduct?.fabric}</p>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Description</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedProduct?.description}</p>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Product Name *</label>
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
                      <label className="block text-sm font-medium text-gray-700">Category *</label>
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
                    <label className="block text-sm font-medium text-gray-700">Description *</label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      required
                      rows={3}
                      className="input-field"
                      placeholder="Enter product description"
                    />
                  </div>

                  {/* Image Management Section */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Product Images</label>
                    
                    {/* Image Upload */}
                    <div className="mb-4">
                      <input
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                        id="image-upload"
                      />
                      <label
                        htmlFor="image-upload"
                        className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 cursor-pointer"
                      >
                        <Upload className="h-4 w-4 mr-2" />
                        Add Images
                      </label>
                      <p className="text-xs text-gray-500 mt-1">
                        Select multiple images (JPG, PNG, GIF). First image will be the main product image.
                      </p>
                    </div>

                    {/* Image Preview Grid */}
                    {formData.images && formData.images.length > 0 && (
                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {formData.images.map((image, index) => (
                          <div key={image.id || `image_${index}`} className="relative group">
                            <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                              {image.url && image.url.trim() !== '' ? (
                                <img
                                  src={image.url}
                                  alt={`Product ${index + 1}`}
                                  className="w-full h-full object-cover"
                                  onError={(e) => {
                                    console.warn('Image failed to load:', image.url);
                                    // Set a placeholder or hide the image
                                    if (e.target) {
                                      e.target.style.display = 'none';
                                      const container = e.target.parentElement;
                                      if (container) {
                                        const placeholder = container.querySelector('.image-placeholder');
                                        if (placeholder) {
                                          placeholder.style.display = 'flex';
                                        }
                                      }
                                    }
                                  }}
                                  onLoad={(e) => {
                                    // Ensure image is visible when loaded successfully
                                    if (e.target) {
                                      e.target.style.display = 'block';
                                      const container = e.target.parentElement;
                                      if (container) {
                                        const placeholder = container.querySelector('.image-placeholder');
                                        if (placeholder) {
                                          placeholder.style.display = 'none';
                                        }
                                      }
                                    }
                                  }}
                                />
                              ) : null}
                              {/* Fallback placeholder */}
                              <div className="image-placeholder absolute inset-0 flex items-center justify-center text-gray-400 text-xs" style={{ display: image.url && image.url.trim() !== '' ? 'none' : 'flex' }}>
                                <Upload className="h-8 w-8" />
                              </div>
                            </div>
                            
                            {/* Image Controls */}
                            <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 rounded-lg flex items-center justify-center">
                              <div className="flex space-x-2">
                                {/* Move Left */}
                                {index > 0 && (
                                  <button
                                    type="button"
                                    onClick={() => moveImage(index, index - 1)}
                                    className="p-1 bg-white rounded-full text-gray-600 hover:text-gray-800"
                                    title="Move left"
                                  >
                                    <ChevronLeft className="h-4 w-4" />
                                  </button>
                                )}
                                
                                {/* Remove Image */}
                                <button
                                  type="button"
                                  onClick={() => removeImage(index)}
                                  className="p-1 bg-red-500 rounded-full text-white hover:bg-red-600"
                                  title="Remove image"
                                >
                                  <X className="h-4 w-4" />
                                </button>
                                
                                {/* Move Right */}
                                {index < formData.images.length - 1 && (
                                  <button
                                    type="button"
                                    onClick={() => moveImage(index, index + 1)}
                                    className="p-1 bg-white rounded-full text-gray-600 hover:text-gray-800"
                                    title="Move right"
                                  >
                                    <ChevronRight className="h-4 w-4" />
                                  </button>
                                )}
                              </div>
                            </div>
                            
                            {/* Main Image Badge */}
                            {index === 0 && (
                              <div className="absolute top-2 left-2 bg-green-500 text-white text-xs px-2 py-1 rounded">
                                Main
                              </div>
                            )}
                            
                            {/* Image Status */}
                            <div className="absolute bottom-2 right-2">
                              {image.isExisting ? (
                                <div className="bg-blue-500 text-white text-xs px-2 py-1 rounded">
                                  Existing
                                </div>
                              ) : (
                                <div className="bg-green-500 text-white text-xs px-2 py-1 rounded">
                                  New
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                    
                    {(!formData.images || formData.images.length === 0) && (
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                        <Upload className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                        <p className="text-gray-500">No images uploaded</p>
                        <p className="text-xs text-gray-400">Click "Add Images" to upload product photos</p>
                      </div>
                    )}
                    
                    {/* Debug Info - Remove in production */}
                    {process.env.NODE_ENV === 'development' && (
                      <div className="mt-4 p-3 bg-gray-100 rounded text-xs">
                        <strong>Debug Info:</strong><br/>
                        Images count: {formData.images ? formData.images.length : 0}<br/>
                        Images: {JSON.stringify(formData.images?.map(img => ({
                          isExisting: img.isExisting,
                          hasFile: !!img.file,
                          hasUrl: !!img.url,
                          id: img.id
                        })), null, 2)}
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Price (₹) *</label>
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
                      <label className="block text-sm font-medium text-gray-700">Stock Quantity *</label>
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

                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Color</label>
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
                      <label className="block text-sm font-medium text-gray-700">Fabric</label>
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
                      <label className="block text-sm font-medium text-gray-700">Size</label>
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

                  <div className="flex items-center space-x-6">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        name="isFeatured"
                        checked={formData.isFeatured}
                        onChange={handleInputChange}
                        className="h-4 w-4 text-maroon-600 focus:ring-maroon-500 border-gray-300 rounded"
                      />
                      <label className="ml-2 block text-sm text-gray-900">
                        Featured Product
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
                      <label className="ml-2 block text-sm text-gray-900">
                        Active Product
                      </label>
                    </div>
                  </div>

                  <div className="flex justify-end space-x-3 pt-6">
                    <button
                      type="button"
                      onClick={closeModal}
                      className="btn-secondary"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="btn-primary inline-flex items-center"
                    >
                      <Save className="h-4 w-4 mr-2" />
                      Update Product
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminProducts;
