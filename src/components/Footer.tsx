import { Link } from 'react-router-dom';
import { ShoppingBag, Phone, MapPin, Clock, Instagram, Facebook, Twitter } from 'lucide-react';
import { useShop } from '@/contexts/ShopContext';

export default function Footer() {
  const { settings } = useShop();

  return (
    <footer className="bg-secondary-900 text-secondary-200 mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 rounded-xl bg-primary-600 flex items-center justify-center">
                <ShoppingBag className="w-5 h-5 text-white" />
              </div>
              <span className="font-display font-bold text-lg text-white">
                {settings?.shop_name ?? 'مخبوزات الذواقة'}
              </span>
            </div>
            <p className="text-sm leading-relaxed text-secondary-300">
              {settings?.about_ar ?? 'مخبوزات طازجة يومياً من الفرن إلى طاولتك'}
            </p>
          </div>

          {/* Quick links */}
          <div>
            <h3 className="font-bold text-white mb-4">روابط سريعة</h3>
            <ul className="space-y-2 text-sm">
              <li><Link to="/" className="hover:text-accent-400 transition-colors">الرئيسية</Link></li>
              <li><Link to="/products" className="hover:text-accent-400 transition-colors">المنتجات</Link></li>
              <li><Link to="/cart" className="hover:text-accent-400 transition-colors">سلة المشتريات</Link></li>
              <li><Link to="/orders" className="hover:text-accent-400 transition-colors">طلباتي</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-bold text-white mb-4">تواصل معنا</h3>
            <ul className="space-y-3 text-sm">
              {settings?.phone && (
                <li className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-accent-400 shrink-0" />
                  <span dir="ltr">{settings.phone}</span>
                </li>
              )}
              {settings?.address && (
                <li className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-accent-400 shrink-0" />
                  <span>{settings.address}</span>
                </li>
              )}
              <li className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-accent-400 shrink-0" />
                <span>{settings?.opening_time ?? '06:00'} - {settings?.closing_time ?? '22:00'}</span>
              </li>
            </ul>
          </div>

          {/* Social */}
          <div>
            <h3 className="font-bold text-white mb-4">تابعنا</h3>
            <div className="flex gap-3">
              <a href="#" className="w-10 h-10 rounded-lg bg-secondary-800 hover:bg-primary-600 flex items-center justify-center transition-colors">
                <Instagram className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 rounded-lg bg-secondary-800 hover:bg-primary-600 flex items-center justify-center transition-colors">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 rounded-lg bg-secondary-800 hover:bg-primary-600 flex items-center justify-center transition-colors">
                <Twitter className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-secondary-800 mt-10 pt-6 text-center text-sm text-secondary-400">
          © {new Date().getFullYear()} {settings?.shop_name ?? 'مخبوزات الذواقة'} — جميع الحقوق محفوظة
        </div>
      </div>
    </footer>
  );
}
