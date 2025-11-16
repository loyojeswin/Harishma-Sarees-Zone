import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import {
  Search,
  Filter,
  Grid,
  List,
  ChevronDown,
  Star,
  Heart,
  ShoppingCart,
  ChevronLeft,
  ChevronRight,
  X,
  SlidersHorizontal
} from 'lucide-react';
import { toast } from 'react-toastify';

const Products = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  
  // State management
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState({});
  
  // Filter states
  const [filters, setFilters] = useState({
    category: searchParams.get('category') || '',
    minPrice: searchParams.get('minPrice') || '',
    maxPrice: searchParams.get('maxPrice') || '',
    color: searchParams.get('color') || '',
    fabric: searchParams.get('fabric') || '',
    search: searchParams.get('search') || ''
  });
  
  // Pagination and sorting
  const [pagination, setPagination] = useState({
    page: parseInt(searchParams.get('page')) || 0,
    size: 12,
    totalPages: 0,
    totalElements: 0
  });
  
  const [sortBy, setSortBy] = useState(searchParams.get('sortBy') || 'id');
  const [sortDir, setSortDir] = useState(searchParams.get('sortDir') || 'desc');
  
  // Filter options
  const [filterOptions, setFilterOptions] = useState({
    categories: [],
    colors: [],
    fabrics: []
  });

  // Fetch filter options
  useEffect(() => {
    const fetchFilterOptions = async () => {
      try {
        const [categoriesRes, colorsRes, fabricsRes] = await Promise.all([
          axios.get('/api/products/categories'),
          axios.get('/api/products/colors'),
          axios.get('/api/products/fabrics')
        ]);
        
        setFilterOptions({
          categories: categoriesRes.data,
          colors: colorsRes.data,
          fabrics: fabricsRes.data
        });
      } catch (error) {
        console.error('Error fetching filter options:', error);
      }
    };
    
    fetchFilterOptions();
  }, []);

  // Fetch products
  useEffect(() => {
    fetchProducts();
  }, [pagination.page, sortBy, sortDir, filters]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        size: pagination.size.toString(),
        sortBy,
        sortDir
      });
      
      // Add filters to params
      Object.entries(filters).forEach(([key, value]) => {
        if (value && key !== 'search') {
          params.append(key, value);
        }
      });
      
      let url = '/api/products';
      if (filters.search) {
        url = '/api/products/search';
        params.append('keyword', filters.search);
      }
      
      const response = await axios.get(`${url}?${params}`);
      setProducts(response.data.content);
      setPagination(prev => ({
        ...prev,
        totalPages: response.data.totalPages,
        totalElements: response.data.totalElements
      }));
      
      // Update URL params
      setSearchParams(params);
      
    } catch (error) {
      console.error('Error fetching products:', error);
      toast.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  // Helper function to get image paths
  const getImagePaths = (product) => {
    if (!product.imagePaths) return [];
    try {
      return JSON.parse(product.imagePaths);
    } catch (error) {
      return product.imagePath ? [product.imagePath] : [];
    }
  };

  // Image navigation
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

  // Filter handlers
  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPagination(prev => ({ ...prev, page: 0 }));
  };

  const clearFilters = () => {
    setFilters({
      category: '',
      minPrice: '',
      maxPrice: '',
      color: '',
      fabric: '',
      search: ''
    });
    setPagination(prev => ({ ...prev, page: 0 }));
  };

  // Pagination handlers
  const handlePageChange = (newPage) => {
    setPagination(prev => ({ ...prev, page: newPage }));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Sort handler
  const handleSortChange = (newSortBy, newSortDir) => {
    setSortBy(newSortBy);
    setSortDir(newSortDir);
    setPagination(prev => ({ ...prev, page: 0 }));
  };

  // Product actions
  const handleProductClick = (productId) => {
    navigate(`/products/${productId}`);
  };

  const handleAddToCart = async (product, e) => {
    e.stopPropagation();
    
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Please login to add items to cart');
        navigate('/login');
        return;
      }
      
      const config = {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      };
      
      await axios.post(`/api/cart/add?productId=${product.id}&quantity=1`, {}, config);
      toast.success(`${product.name} added to cart!`);
    } catch (error) {
      console.error('Error adding to cart:', error);
      if (error.response?.status === 401) {
        toast.error('Please login to add items to cart');
        navigate('/login');
      } else if (error.response?.status === 400) {
        toast.error(error.response.data.message || 'Failed to add to cart');
      } else {
        toast.error('Failed to add to cart');
      }
    }
  };

  const handleAddToWishlist = (product, e) => {
    e.stopPropagation();
    // TODO: Implement wishlist functionality
    toast.success(`${product.name} added to wishlist!`);
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(price);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-maroon-600"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Products</h1>
              <p className="mt-1 text-sm text-gray-500">
                {pagination.totalElements} products found
              </p>
            </div>
            
            {/* Search Bar */}
            <div className="mt-4 md:mt-0 md:w-96">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type="text"
                  placeholder="Search products..."
                  value={filters.search}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && fetchProducts()}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-maroon-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filters Sidebar */}
          <div className="lg:w-64">
            {/* Mobile Filter Toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="lg:hidden w-full flex items-center justify-center px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-700 hover:bg-gray-50 mb-4"
            >
              <SlidersHorizontal className="h-5 w-5 mr-2" />
              Filters
              <ChevronDown className={`h-5 w-5 ml-2 transform transition-transform ${showFilters ? 'rotate-180' : ''}`} />
            </button>

            {/* Filter Panel */}
            <div className={`bg-white rounded-lg shadow-sm p-6 space-y-6 ${showFilters || 'hidden lg:block'}`}>
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Filters</h3>
                <button
                  onClick={clearFilters}
                  className="text-sm text-maroon-600 hover:text-maroon-800"
                >
                  Clear All
                </button>
              </div>

              {/* Category Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                <select
                  value={filters.category}
                  onChange={(e) => handleFilterChange('category', e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-maroon-500 focus:border-transparent"
                >
                  <option value="">All Categories</option>
                  {filterOptions.categories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>

              {/* Price Range */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Price Range</label>
                <div className="flex space-x-2">
                  <input
                    type="number"
                    placeholder="Min"
                    value={filters.minPrice}
                    onChange={(e) => handleFilterChange('minPrice', e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-maroon-500 focus:border-transparent"
                  />
                  <input
                    type="number"
                    placeholder="Max"
                    value={filters.maxPrice}
                    onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-maroon-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Color Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Color</label>
                <select
                  value={filters.color}
                  onChange={(e) => handleFilterChange('color', e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-maroon-500 focus:border-transparent"
                >
                  <option value="">All Colors</option>
                  {filterOptions.colors.map(color => (
                    <option key={color} value={color}>{color}</option>
                  ))}
                </select>
              </div>

              {/* Fabric Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Fabric</label>
                <select
                  value={filters.fabric}
                  onChange={(e) => handleFilterChange('fabric', e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-maroon-500 focus:border-transparent"
                >
                  <option value="">All Fabrics</option>
                  {filterOptions.fabrics.map(fabric => (
                    <option key={fabric} value={fabric}>{fabric}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Products Area */}
          <div className="flex-1">
            {/* Toolbar */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
              <div className="flex items-center space-x-4">
                {/* View Mode Toggle */}
                <div className="flex border border-gray-300 rounded-lg overflow-hidden">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-2 ${viewMode === 'grid' ? 'bg-maroon-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
                  >
                    <Grid className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-2 ${viewMode === 'list' ? 'bg-maroon-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
                  >
                    <List className="h-5 w-5" />
                  </button>
                </div>
              </div>

              {/* Sort Options */}
              <div className="mt-4 sm:mt-0">
                <select
                  value={`${sortBy}-${sortDir}`}
                  onChange={(e) => {
                    const [newSortBy, newSortDir] = e.target.value.split('-');
                    handleSortChange(newSortBy, newSortDir);
                  }}
                  className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-maroon-500 focus:border-transparent"
                >
                  <option value="id-desc">Newest First</option>
                  <option value="id-asc">Oldest First</option>
                  <option value="price-asc">Price: Low to High</option>
                  <option value="price-desc">Price: High to Low</option>
                  <option value="name-asc">Name: A to Z</option>
                  <option value="name-desc">Name: Z to A</option>
                </select>
              </div>
            </div>

            {/* Products Grid/List */}
            {products.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-gray-400 mb-4">
                  <Search className="h-12 w-12 mx-auto" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No products found</h3>
                <p className="text-gray-500">Try adjusting your search or filter criteria</p>
              </div>
            ) : (
              <>
                <div className={viewMode === 'grid' 
                  ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6' 
                  : 'space-y-6'
                }>
                  {products.map((product) => {
                    const imagePaths = getImagePaths(product);
                    const currentIndex = currentImageIndex[product.id] || 0;
                    
                    return viewMode === 'grid' ? (
                      // Grid View
                      <div
                        key={product.id}
                        onClick={() => handleProductClick(product.id)}
                        className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 cursor-pointer group"
                      >
                        {/* Product Image */}
                        <div className="relative h-64 bg-gray-200 rounded-t-lg overflow-hidden">
                          {imagePaths.length > 0 ? (
                            <>
                              <img
                                src={imagePaths[currentIndex]}
                                alt={`${product.name} - Image ${currentIndex + 1}`}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
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
                              
                              {/* Image Navigation */}
                              {imagePaths.length > 1 && (
                                <>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      prevImage(product.id, imagePaths);
                                    }}
                                    className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                  >
                                    <ChevronLeft className="h-4 w-4" />
                                  </button>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      nextImage(product.id, imagePaths);
                                    }}
                                    className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                  >
                                    <ChevronRight className="h-4 w-4" />
                                  </button>
                                  
                                  {/* Image Indicators */}
                                  <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex space-x-1">
                                    {imagePaths.map((_, index) => (
                                      <div
                                        key={index}
                                        className={`w-1.5 h-1.5 rounded-full ${
                                          index === currentIndex ? 'bg-white' : 'bg-white bg-opacity-50'
                                        }`}
                                      />
                                    ))}
                                  </div>
                                </>
                              )}
                            </>
                          ) : (
                            <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                              <span className="text-gray-500 text-sm">No Image</span>
                            </div>
                          )}
                          
                          {/* Action Buttons */}
                          <div className="absolute top-2 right-2 flex flex-col space-y-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={(e) => handleAddToWishlist(product, e)}
                              className="bg-white rounded-full p-2 shadow-md hover:bg-gray-50"
                            >
                              <Heart className="h-4 w-4 text-gray-600" />
                            </button>
                          </div>
                          
                          {/* Featured Badge */}
                          {product.isFeatured && (
                            <div className="absolute top-2 left-2 bg-maroon-600 text-white px-2 py-1 rounded text-xs font-medium">
                              Featured
                            </div>
                          )}
                        </div>
                        
                        {/* Product Info */}
                        <div className="p-4">
                          <h3 className="text-lg font-semibold text-gray-900 mb-1 line-clamp-1">{product.name}</h3>
                          <p className="text-sm text-gray-500 mb-2">{product.category}</p>
                          <p className="text-sm text-gray-600 mb-3 line-clamp-2">{product.description}</p>
                          
                          <div className="flex items-center justify-between">
                            <div>
                              <span className="text-xl font-bold text-maroon-600">{formatPrice(product.price)}</span>
                              {product.stock < 10 && (
                                <p className="text-xs text-red-500 mt-1">Only {product.stock} left!</p>
                              )}
                            </div>
                            
                            <button
                              onClick={(e) => handleAddToCart(product, e)}
                              className="bg-maroon-600 text-white px-4 py-2 rounded-lg hover:bg-maroon-700 transition-colors flex items-center space-x-1"
                            >
                              <ShoppingCart className="h-4 w-4" />
                              <span>Add</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    ) : (
                      // List View
                      <div
                        key={product.id}
                        onClick={() => handleProductClick(product.id)}
                        className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 cursor-pointer"
                      >
                        <div className="flex">
                          {/* Product Image */}
                          <div className="relative w-48 h-48 bg-gray-200 rounded-l-lg overflow-hidden flex-shrink-0">
                            {imagePaths.length > 0 ? (
                              <>
                                <img
                                  src={imagePaths[currentIndex]}
                                  alt={product.name}
                                  className="w-full h-full object-cover"
                                  onError={(e) => {
                                    console.warn('Product list image failed to load:', imagePaths[currentIndex]);
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
                                {imagePaths.length > 1 && (
                                  <div className="absolute bottom-2 right-2 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded">
                                    {currentIndex + 1}/{imagePaths.length}
                                  </div>
                                )}
                              </>
                            ) : (
                              <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                                <span className="text-gray-500 text-sm">No Image</span>
                              </div>
                            )}
                            
                            {product.isFeatured && (
                              <div className="absolute top-2 left-2 bg-maroon-600 text-white px-2 py-1 rounded text-xs font-medium">
                                Featured
                              </div>
                            )}
                          </div>
                          
                          {/* Product Info */}
                          <div className="flex-1 p-6">
                            <div className="flex justify-between items-start">
                              <div className="flex-1">
                                <h3 className="text-xl font-semibold text-gray-900 mb-2">{product.name}</h3>
                                <p className="text-sm text-gray-500 mb-2">{product.category}</p>
                                <p className="text-gray-600 mb-4 line-clamp-3">{product.description}</p>
                                
                                <div className="flex items-center space-x-4 text-sm text-gray-500">
                                  {product.color && <span>Color: {product.color}</span>}
                                  {product.fabric && <span>Fabric: {product.fabric}</span>}
                                  {product.size && <span>Size: {product.size}</span>}
                                </div>
                              </div>
                              
                              <div className="ml-6 text-right">
                                <div className="text-2xl font-bold text-maroon-600 mb-2">{formatPrice(product.price)}</div>
                                {product.stock < 10 && (
                                  <p className="text-sm text-red-500 mb-3">Only {product.stock} left!</p>
                                )}
                                
                                <div className="flex space-x-2">
                                  <button
                                    onClick={(e) => handleAddToWishlist(product, e)}
                                    className="bg-gray-100 text-gray-600 px-3 py-2 rounded-lg hover:bg-gray-200 transition-colors"
                                  >
                                    <Heart className="h-4 w-4" />
                                  </button>
                                  <button
                                    onClick={(e) => handleAddToCart(product, e)}
                                    className="bg-maroon-600 text-white px-6 py-2 rounded-lg hover:bg-maroon-700 transition-colors flex items-center space-x-2"
                                  >
                                    <ShoppingCart className="h-4 w-4" />
                                    <span>Add to Cart</span>
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Pagination */}
                {pagination.totalPages > 1 && (
                  <div className="mt-12 flex justify-center">
                    <nav className="flex items-center space-x-2">
                      <button
                        onClick={() => handlePageChange(pagination.page - 1)}
                        disabled={pagination.page === 0}
                        className="px-3 py-2 rounded-lg border border-gray-300 text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <ChevronLeft className="h-5 w-5" />
                      </button>
                      
                      {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                        const pageNum = Math.max(0, Math.min(pagination.totalPages - 5, pagination.page - 2)) + i;
                        return (
                          <button
                            key={pageNum}
                            onClick={() => handlePageChange(pageNum)}
                            className={`px-4 py-2 rounded-lg ${
                              pageNum === pagination.page
                                ? 'bg-maroon-600 text-white'
                                : 'border border-gray-300 text-gray-700 hover:bg-gray-50'
                            }`}
                          >
                            {pageNum + 1}
                          </button>
                        );
                      })}
                      
                      <button
                        onClick={() => handlePageChange(pagination.page + 1)}
                        disabled={pagination.page >= pagination.totalPages - 1}
                        className="px-3 py-2 rounded-lg border border-gray-300 text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <ChevronRight className="h-5 w-5" />
                      </button>
                    </nav>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Products;
