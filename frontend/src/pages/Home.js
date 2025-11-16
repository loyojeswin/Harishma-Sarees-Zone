import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { ArrowRight, Star, ShoppingBag, ChevronLeft, ChevronRight } from 'lucide-react';

const Home = () => {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState({});

  useEffect(() => {
    fetchFeaturedProducts();
    fetchBanners();
  }, []);

  const fetchFeaturedProducts = async () => {
    try {
      const response = await axios.get('/api/products/featured');
      setFeaturedProducts(response.data);
    } catch (error) {
      console.error('Error fetching featured products:', error);
    }
  };

  const fetchBanners = async () => {
    try {
      const response = await axios.get('/api/banners');
      setBanners(response.data);
    } catch (error) {
      console.error('Error fetching banners:', error);
    } finally {
      setLoading(false);
    }
  };

  // Helper function to get image paths
  const getImagePaths = (product) => {
    if (!product?.imagePaths) return [];
    try {
      return JSON.parse(product.imagePaths);
    } catch (error) {
      return product.imagePath ? [product.imagePath] : [];
    }
  };

  // Image navigation functions
  const nextImage = (productId, totalImages, e) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentImageIndex(prev => ({
      ...prev,
      [productId]: ((prev[productId] || 0) + 1) % totalImages
    }));
  };

  const prevImage = (productId, totalImages, e) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentImageIndex(prev => ({
      ...prev,
      [productId]: ((prev[productId] || 0) - 1 + totalImages) % totalImages
    }));
  };

  const setImageIndex = (productId, index, e) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentImageIndex(prev => ({
      ...prev,
      [productId]: index
    }));
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-primary text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Welcome to Harishma Sarees Zone
            </h1>
            <p className="text-xl md:text-2xl mb-8 opacity-90">
              Discover the finest collection of traditional and designer sarees
            </p>
            <Link
              to="/products"
              className="inline-flex items-center bg-white text-maroon-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition duration-200"
            >
              Shop Now
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Shop by Category
            </h2>
            <p className="text-lg text-gray-600">
              Explore our diverse collection of beautiful sarees
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { name: 'Silk Sarees', image: '/api/placeholder/300/400', color: 'bg-red-100' },
              { name: 'Designer Sarees', image: '/api/placeholder/300/400', color: 'bg-pink-100' },
              { name: 'Cotton Sarees', image: '/api/placeholder/300/400', color: 'bg-blue-100' },
              { name: 'Banarasi Sarees', image: '/api/placeholder/300/400', color: 'bg-yellow-100' }
            ].map((category, index) => (
              <Link
                key={index}
                to={`/products?category=${encodeURIComponent(category.name)}`}
                className="group"
              >
                <div className={`${category.color} rounded-lg p-8 text-center hover:shadow-lg transition duration-300 transform hover:-translate-y-2`}>
                  <div className="w-20 h-20 mx-auto mb-4 bg-white rounded-full flex items-center justify-center">
                    <ShoppingBag className="h-10 w-10 text-maroon-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 group-hover:text-maroon-600 transition duration-200">
                    {category.name}
                  </h3>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Featured Products
            </h2>
            <p className="text-lg text-gray-600">
              Handpicked sarees just for you
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {featuredProducts.slice(0, 8).map((product) => {
              const imagePaths = getImagePaths(product);
              const currentIndex = currentImageIndex[product.id] || 0;
              const hasMultipleImages = imagePaths.length > 1;
              
              return (
                <Link
                  key={product.id}
                  to={`/products/${product.id}`}
                  className="card card-hover group"
                >
                  <div className="relative aspect-w-3 aspect-h-4 bg-gray-200 rounded-lg overflow-hidden">
                    {imagePaths.length > 0 ? (
                      <>
                        <img
                          src={imagePaths[currentIndex]}
                          alt={product.name}
                          className="w-full h-64 object-cover group-hover:scale-105 transition duration-300"
                          onError={(e) => {
                            console.warn('Home page product image failed to load:', imagePaths[currentIndex]);
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
                        
                        {/* Navigation arrows - only show if multiple images */}
                        {hasMultipleImages && (
                          <>
                            <button
                              onClick={(e) => prevImage(product.id, imagePaths.length, e)}
                              className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-opacity-70 z-10"
                            >
                              <ChevronLeft className="h-4 w-4" />
                            </button>
                            <button
                              onClick={(e) => nextImage(product.id, imagePaths.length, e)}
                              className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-opacity-70 z-10"
                            >
                              <ChevronRight className="h-4 w-4" />
                            </button>
                          </>
                        )}
                        
                        {/* Image indicators - only show if multiple images */}
                        {hasMultipleImages && (
                          <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                            {imagePaths.map((_, index) => (
                              <button
                                key={index}
                                onClick={(e) => setImageIndex(product.id, index, e)}
                                className={`w-2 h-2 rounded-full transition-colors duration-200 ${
                                  index === currentIndex 
                                    ? 'bg-white' 
                                    : 'bg-white bg-opacity-50'
                                }`}
                              />
                            ))}
                          </div>
                        )}
                        
                        {/* Image counter - only show if multiple images */}
                        {hasMultipleImages && (
                          <div className="absolute top-2 right-2 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                            {currentIndex + 1}/{imagePaths.length}
                          </div>
                        )}
                      </>
                    ) : (
                      <div className="w-full h-64 bg-gray-200 flex items-center justify-center">
                        <span className="text-gray-500 text-sm">No Image</span>
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-maroon-600 transition duration-200">
                      {product.name}
                    </h3>
                    <p className="text-sm text-gray-600 mb-2">{product.category}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-xl font-bold text-maroon-600">
                        ₹{product.price.toLocaleString()}
                      </span>
                      <div className="flex items-center">
                        <Star className="h-4 w-4 text-yellow-400 fill-current" />
                        <span className="text-sm text-gray-600 ml-1">4.5</span>
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>

          <div className="text-center mt-12">
            <Link
              to="/products"
              className="btn-primary inline-flex items-center"
            >
              View All Products
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Why Choose Us?
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                title: 'Premium Quality',
                description: 'Handpicked sarees with finest fabrics and craftsmanship',
                icon: '✨'
              },
              {
                title: 'Fast Delivery',
                description: 'Quick and secure delivery to your doorstep',
                icon: '🚚'
              },
              {
                title: 'Easy Returns',
                description: '7-day hassle-free return and exchange policy',
                icon: '🔄'
              }
            ].map((feature, index) => (
              <div key={index} className="text-center p-6">
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="py-16 bg-maroon-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Stay Updated
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Subscribe to get special offers, free giveaways, and updates
          </p>
          <div className="max-w-md mx-auto flex">
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 px-4 py-3 rounded-l-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-white"
            />
            <button className="bg-white text-maroon-600 px-6 py-3 rounded-r-lg font-semibold hover:bg-gray-100 transition duration-200">
              Subscribe
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
