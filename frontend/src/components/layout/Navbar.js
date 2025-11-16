import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { 
  ShoppingCart, 
  Heart, 
  User, 
  Menu, 
  X, 
  Search,
  LogOut,
  Settings
} from 'lucide-react';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const { user, logout, loading } = useAuth();
  const navigate = useNavigate();

  // Debug logging
  console.log('Navbar - Loading:', loading, 'User:', user);

  const handleLogout = () => {
    logout();
    navigate('/');
    setIsUserMenuOpen(false);
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const toggleUserMenu = () => {
    setIsUserMenuOpen(!isUserMenuOpen);
  };

  return (
    <nav className="bg-white shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link to="/" className="flex items-center">
              <h1 className="text-2xl font-bold text-gradient">
                Harishma Sarees Zone
              </h1>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-4">
              <Link
                to="/"
                className="text-gray-700 hover:text-maroon-600 px-3 py-2 rounded-md text-sm font-medium transition duration-200"
              >
                Home
              </Link>
              <Link
                to="/products"
                className="text-gray-700 hover:text-maroon-600 px-3 py-2 rounded-md text-sm font-medium transition duration-200"
              >
                Products
              </Link>
              <Link
                to="/products?category=Silk Sarees"
                className="text-gray-700 hover:text-maroon-600 px-3 py-2 rounded-md text-sm font-medium transition duration-200"
              >
                Silk Sarees
              </Link>
              <Link
                to="/products?category=Designer Sarees"
                className="text-gray-700 hover:text-maroon-600 px-3 py-2 rounded-md text-sm font-medium transition duration-200"
              >
                Designer
              </Link>
              <Link
                to="/products?category=Cotton Sarees"
                className="text-gray-700 hover:text-maroon-600 px-3 py-2 rounded-md text-sm font-medium transition duration-200"
              >
                Cotton
              </Link>
            </div>
          </div>

          {/* Right side icons */}
          <div className="hidden md:flex items-center space-x-4">
            {/* Search */}
            <button className="text-gray-700 hover:text-maroon-600 transition duration-200">
              <Search className="h-6 w-6" />
            </button>

            {user ? (
              <>
                {/* Wishlist */}
                <Link
                  to="/wishlist"
                  className="text-gray-700 hover:text-maroon-600 transition duration-200"
                >
                  <Heart className="h-6 w-6" />
                </Link>

                {/* Cart */}
                <Link
                  to="/cart"
                  className="text-gray-700 hover:text-maroon-600 transition duration-200 relative"
                >
                  <ShoppingCart className="h-6 w-6" />
                </Link>

                {/* User Menu */}
                <div className="relative">
                  <button
                    onClick={toggleUserMenu}
                    className="text-gray-700 hover:text-maroon-600 transition duration-200 flex items-center space-x-1"
                  >
                    <User className="h-6 w-6" />
                    <span className="text-sm font-medium">{user?.name}</span>
                  </button>

                  {isUserMenuOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50">
                      <Link
                        to="/profile"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() => setIsUserMenuOpen(false)}
                      >
                        Profile
                      </Link>
                      <Link
                        to="/orders"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() => setIsUserMenuOpen(false)}
                      >
                        My Orders
                      </Link>
                      {user?.role === 'ADMIN' && (
                        <Link
                          to="/admin"
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          onClick={() => setIsUserMenuOpen(false)}
                        >
                          <div className="flex items-center space-x-2">
                            <Settings className="h-4 w-4" />
                            <span>Admin Panel</span>
                          </div>
                        </Link>
                      )}
                      <button
                        onClick={handleLogout}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        <div className="flex items-center space-x-2">
                          <LogOut className="h-4 w-4" />
                          <span>Logout</span>
                        </div>
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                {loading ? (
                  <div className="flex items-center space-x-2">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-maroon-600"></div>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2">
                    <Link
                      to="/login"
                      className="text-gray-700 hover:text-maroon-600 px-3 py-2 rounded-md text-sm font-medium transition duration-200"
                    >
                      Login
                    </Link>
                    <Link
                      to="/signup"
                      className="btn-primary text-sm"
                    >
                      Sign Up
                    </Link>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={toggleMenu}
              className="text-gray-700 hover:text-maroon-600 transition duration-200"
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white border-t">
              <Link
                to="/"
                className="text-gray-700 hover:text-maroon-600 block px-3 py-2 rounded-md text-base font-medium"
                onClick={() => setIsMenuOpen(false)}
              >
                Home
              </Link>
              <Link
                to="/products"
                className="text-gray-700 hover:text-maroon-600 block px-3 py-2 rounded-md text-base font-medium"
                onClick={() => setIsMenuOpen(false)}
              >
                Products
              </Link>
              
              {user ? (
                <>
                  <Link
                    to="/cart"
                    className="text-gray-700 hover:text-maroon-600 block px-3 py-2 rounded-md text-base font-medium flex items-center space-x-2"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <ShoppingCart className="h-5 w-5" />
                    <span>Cart</span>
                  </Link>
                  <Link
                    to="/wishlist"
                    className="text-gray-700 hover:text-maroon-600 block px-3 py-2 rounded-md text-base font-medium"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Wishlist
                  </Link>
                  <Link
                    to="/profile"
                    className="text-gray-700 hover:text-maroon-600 block px-3 py-2 rounded-md text-base font-medium"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Profile
                  </Link>
                  <Link
                    to="/orders"
                    className="text-gray-700 hover:text-maroon-600 block px-3 py-2 rounded-md text-base font-medium"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    My Orders
                  </Link>
                  {user?.role === 'ADMIN' && (
                    <Link
                      to="/admin"
                      className="text-gray-700 hover:text-maroon-600 block px-3 py-2 rounded-md text-base font-medium"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Admin Panel
                    </Link>
                  )}
                  <button
                    onClick={handleLogout}
                    className="text-gray-700 hover:text-maroon-600 block px-3 py-2 rounded-md text-base font-medium w-full text-left"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  {loading ? (
                    <div className="flex justify-center py-4">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-maroon-600"></div>
                    </div>
                  ) : (
                    <>
                      <Link
                        to="/login"
                        className="text-gray-700 hover:text-maroon-600 block px-3 py-2 rounded-md text-base font-medium"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        Login
                      </Link>
                      <Link
                        to="/signup"
                        className="text-gray-700 hover:text-maroon-600 block px-3 py-2 rounded-md text-base font-medium"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        Sign Up
                      </Link>
                    </>
                  )}
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
