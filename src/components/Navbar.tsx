import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import {
  ShoppingBag,
  Search,
  Menu,
  X,
  User,
  LogOut,
  LayoutDashboard,
  Package,
  ChevronDown,
} from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { useShop } from '@/contexts/ShopContext';

export default function Navbar() {
  const { totalItems } = useCart();
  const { profile, isAdmin, signOut } = useAuth();
  const { settings } = useShop();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?q=${encodeURIComponent(searchQuery.trim())}`);
      setMobileOpen(false);
    }
  };

  const navLinks = [
    { to: '/', label: 'الرئيسية' },
    { to: '/products', label: 'المنتجات' },
    { to: '/orders', label: 'طلباتي' },
  ];

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-secondary-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 shrink-0">
            <div className="w-10 h-10 rounded-xl bg-primary-600 flex items-center justify-center">
              <ShoppingBag className="w-5 h-5 text-white" />
            </div>
            <span className="font-display font-bold text-lg text-primary-700 hidden sm:block">
              {settings?.shop_name ?? 'مخبوزات الذواقة'}
            </span>
          </Link>

          {/* Search - desktop */}
          <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-md">
            <div className="relative w-full">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-secondary-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="ابحث عن منتج..."
                className="input pr-10 text-sm"
              />
            </div>
          </form>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className="px-3 py-2 rounded-lg text-secondary-700 hover:bg-secondary-100 hover:text-primary-700 transition-colors text-sm font-medium"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-2">
            {/* Cart */}
            <Link
              to="/cart"
              className="relative p-2 rounded-lg hover:bg-secondary-100 transition-colors"
              aria-label="السلة"
            >
              <ShoppingBag className="w-5 h-5 text-secondary-700" />
              {totalItems > 0 && (
                <span className="absolute -top-1 -left-1 bg-accent-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold animate-scale-in">
                  {totalItems}
                </span>
              )}
            </Link>

            {/* User menu */}
            {profile ? (
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-1.5 px-2 py-2 rounded-lg hover:bg-secondary-100 transition-colors"
                >
                  <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center">
                    <User className="w-4 h-4 text-primary-700" />
                  </div>
                  <ChevronDown className="w-4 h-4 text-secondary-500 hidden sm:block" />
                </button>
                {userMenuOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setUserMenuOpen(false)}
                    />
                    <div className="absolute left-0 mt-2 w-52 bg-white rounded-xl shadow-lg border border-secondary-100 py-2 z-50 animate-slide-down">
                      <div className="px-4 py-2 border-b border-secondary-100">
                        <p className="font-medium text-sm text-secondary-900">
                          {profile.full_name || 'المستخدم'}
                        </p>
                      </div>
                      <Link
                        to="/orders"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-2 px-4 py-2 text-sm text-secondary-700 hover:bg-secondary-50"
                      >
                        <Package className="w-4 h-4" /> طلباتي
                      </Link>
                      {isAdmin && (
                        <Link
                          to="/admin"
                          onClick={() => setUserMenuOpen(false)}
                          className="flex items-center gap-2 px-4 py-2 text-sm text-primary-700 hover:bg-primary-50 font-medium"
                        >
                          <LayoutDashboard className="w-4 h-4" /> لوحة التحكم
                        </Link>
                      )}
                      <button
                        onClick={() => {
                          signOut();
                          setUserMenuOpen(false);
                          navigate('/');
                        }}
                        className="flex items-center gap-2 px-4 py-2 text-sm text-error-600 hover:bg-error-50 w-full text-right"
                      >
                        <LogOut className="w-4 h-4" /> تسجيل الخروج
                      </button>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <Link to="/auth" className="btn-primary text-sm hidden sm:flex">
                تسجيل الدخول
              </Link>
            )}

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-secondary-100"
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="md:hidden pb-4 animate-slide-down">
            <form onSubmit={handleSearch} className="mb-3">
              <div className="relative">
                <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-secondary-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="ابحث عن منتج..."
                  className="input pr-10 text-sm"
                />
              </div>
            </form>
            <nav className="flex flex-col gap-1">
              {navLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  onClick={() => setMobileOpen(false)}
                  className="px-3 py-2.5 rounded-lg text-secondary-700 hover:bg-secondary-100 text-sm font-medium"
                >
                  {link.label}
                </Link>
              ))}
              {!profile && (
                <Link
                  to="/auth"
                  onClick={() => setMobileOpen(false)}
                  className="btn-primary text-sm mt-2"
                >
                  تسجيل الدخول
                </Link>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
