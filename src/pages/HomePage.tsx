import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Star, Sparkles, Truck, Clock, Wheat } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import type { Product, Category } from '@/types';
import ProductCard from '@/components/ProductCard';
import { LoadingSpinner } from '@/components/States';
import { useShop } from '@/contexts/ShopContext';

export default function HomePage() {
  const { settings } = useShop();
  const [bestsellers, setBestsellers] = useState<Product[]>([]);
  const [newProducts, setNewProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      supabase
        .from('products')
        .select('*, category:categories(*)')
        .eq('is_available', true)
        .eq('is_bestseller', true)
        .order('sort_order')
        .limit(8),
      supabase
        .from('products')
        .select('*, category:categories(*)')
        .eq('is_available', true)
        .eq('is_new', true)
        .order('sort_order')
        .limit(8),
      supabase.from('categories').select('*').order('sort_order'),
    ]).then(([best, newProd, cats]) => {
      setBestsellers((best.data ?? []) as Product[]);
      setNewProducts((newProd.data ?? []) as Product[]);
      setCategories((cats.data ?? []) as Category[]);
      setLoading(false);
    });
  }, []);

  if (loading) return <LoadingSpinner message="جاري تحميل المنتجات..." />;

  return (
    <div className="animate-fade-in">
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-bl from-primary-100 via-secondary-50 to-accent-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16 sm:py-24">
          <div className="grid lg:grid-cols-2 gap-8 items-center">
            <div className="text-center lg:text-right">
              <span className="badge bg-accent-100 text-accent-700 mb-4">
                <Sparkles className="w-3 h-3" /> طازج يومياً
              </span>
              <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold text-secondary-900 mb-4 leading-tight">
                {settings?.shop_name ?? 'مخبوزات الذواقة'}
              </h1>
              <p className="text-lg text-secondary-600 mb-8 max-w-lg mx-auto lg:mx-0">
                {settings?.about_ar ?? 'مخبوزات طازجة يومياً من الفرن إلى طاولتك بأفضل المكونات الطبيعية'}
              </p>
              <div className="flex flex-wrap gap-3 justify-center lg:justify-start">
                <Link to="/products" className="btn-primary text-base">
                  تصفح المنتجات <ArrowLeft className="w-4 h-4" />
                </Link>
                <a href="#bestsellers" className="btn-outline text-base">
                  الأكثر مبيعاً
                </a>
              </div>
            </div>
            <div className="hidden lg:block">
              <div className="relative">
                <div className="absolute inset-0 bg-primary-200 rounded-full blur-3xl opacity-30" />
                <img
                  src="https://images.pexels.com/photos/29380155/pexels-photo-29380155.jpeg?auto=compress&cs=tinysrgb&h=650&w=940"
                  alt="مخبوزات"
                  className="relative rounded-3xl shadow-2xl w-full object-cover aspect-[4/3]"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {[
            { icon: <Wheat className="w-6 h-6" />, title: 'مكونات طبيعية', desc: 'أجود أنواع الدقيق والمكونات' },
            { icon: <Truck className="w-6 h-6" />, title: 'توصيل سريع', desc: 'خلال ساعة من الطلب' },
            { icon: <Clock className="w-6 h-6" />, title: 'طازج يومياً', desc: 'يخبز كل صباح' },
          ].map((f, i) => (
            <div key={i} className="card p-6 flex items-center gap-4 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-xl bg-primary-100 text-primary-600 flex items-center justify-center shrink-0">
                {f.icon}
              </div>
              <div>
                <h3 className="font-bold text-secondary-900">{f.title}</h3>
                <p className="text-sm text-secondary-500">{f.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Categories */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <h2 className="section-title mb-6">تصفح حسب التصنيف</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              to={`/products?category=${cat.slug}`}
              className="card p-6 text-center hover:shadow-md hover:border-primary-200 transition-all group"
            >
              <div className="w-14 h-14 rounded-2xl bg-primary-50 text-primary-600 flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform text-2xl">
                🥐
              </div>
              <p className="font-medium text-secondary-800 text-sm">{cat.name_ar}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* Bestsellers */}
      {bestsellers.length > 0 && (
        <section id="bestsellers" className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="section-title flex items-center gap-2">
              <Star className="w-6 h-6 text-accent-500 fill-accent-500" /> الأكثر مبيعاً
            </h2>
            <Link to="/products" className="text-primary-600 hover:text-primary-700 text-sm font-medium flex items-center gap-1">
              عرض الكل <ArrowLeft className="w-4 h-4" />
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {bestsellers.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}

      {/* New Products */}
      {newProducts.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="section-title flex items-center gap-2">
              <Sparkles className="w-6 h-6 text-success-500" /> منتجات جديدة
            </h2>
            <Link to="/products" className="text-primary-600 hover:text-primary-700 text-sm font-medium flex items-center gap-1">
              عرض الكل <ArrowLeft className="w-4 h-4" />
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {newProducts.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
