import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowRight, Plus, Minus, ShoppingBag, Star, Sparkles, Check } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import type { Product } from '@/types';
import { useCart } from '@/contexts/CartContext';
import { formatPrice } from '@/lib/utils';
import { LoadingSpinner, ErrorState } from '@/components/States';
import ProductCard from '@/components/ProductCard';

export default function ProductDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addItem } = useCart();
  const [product, setProduct] = useState<Product | null>(null);
  const [related, setRelated] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    supabase
      .from('products')
      .select('*, category:categories(*)')
      .eq('id', id)
      .maybeSingle()
      .then(({ data }) => {
        setProduct(data as Product | null);
        setLoading(false);
        if (data?.category_id) {
          supabase
            .from('products')
            .select('*, category:categories(*)')
            .eq('category_id', data.category_id)
            .neq('id', id)
            .eq('is_available', true)
            .limit(4)
            .then(({ data: rel }) => setRelated((rel ?? []) as Product[]));
        }
      });
  }, [id]);

  if (loading) return <LoadingSpinner message="جاري تحميل المنتج..." />;
  if (!product) return <ErrorState message="المنتج غير موجود" />;

  const handleAddToCart = () => {
    addItem(product, quantity);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  const handleBuyNow = () => {
    addItem(product, quantity);
    navigate('/cart');
  };

  const available = product.is_available && product.stock > 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 animate-fade-in">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-secondary-500 mb-6">
        <Link to="/" className="hover:text-primary-600">الرئيسية</Link>
        <span>/</span>
        <Link to="/products" className="hover:text-primary-600">المنتجات</Link>
        {product.category && (
          <>
            <span>/</span>
            <Link to={`/products?category=${product.category.slug}`} className="hover:text-primary-600">
              {product.category.name_ar}
            </Link>
          </>
        )}
      </nav>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Image */}
        <div className="card overflow-hidden relative">
          <div className="aspect-square bg-secondary-100">
            {product.image_url ? (
              <img src={product.image_url} alt={product.name_ar} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-6xl">🥖</div>
            )}
          </div>
          <div className="absolute top-4 right-4 flex flex-col gap-2">
            {product.is_bestseller && (
              <span className="badge bg-accent-500 text-white shadow-md">
                <Star className="w-3 h-3 fill-current" /> الأكثر مبيعاً
              </span>
            )}
            {product.is_new && (
              <span className="badge bg-success-500 text-white shadow-md">
                <Sparkles className="w-3 h-3" /> جديد
              </span>
            )}
          </div>
        </div>

        {/* Info */}
        <div className="flex flex-col">
          {product.category && (
            <Link
              to={`/products?category=${product.category.slug}`}
              className="text-primary-600 text-sm font-medium mb-2"
            >
              {product.category.name_ar}
            </Link>
          )}
          <h1 className="font-display text-3xl font-bold text-secondary-900 mb-3">{product.name_ar}</h1>
          <p className="text-secondary-600 leading-relaxed mb-6">{product.description_ar}</p>

          <div className="flex items-center gap-3 mb-6">
            <span className="font-display text-3xl font-bold text-primary-700">
              {formatPrice(product.price)}
            </span>
            {available ? (
              <span className="badge bg-success-100 text-success-700">
                <Check className="w-3 h-3" /> متوفر ({product.stock} قطعة)
              </span>
            ) : (
              <span className="badge bg-error-100 text-error-700">غير متوفر حالياً</span>
            )}
          </div>

          {/* Quantity selector */}
          {available && (
            <div className="flex items-center gap-4 mb-6">
              <span className="label !mb-0">الكمية:</span>
              <div className="flex items-center gap-1 bg-white border border-secondary-200 rounded-xl">
                <button
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="p-2.5 hover:bg-secondary-50 rounded-r-xl transition-colors"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="w-12 text-center font-bold">{quantity}</span>
                <button
                  onClick={() => setQuantity((q) => Math.min(product.stock, q + 1))}
                  className="p-2.5 hover:bg-secondary-50 rounded-l-xl transition-colors"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* Actions */}
          {available && (
            <div className="flex flex-col sm:flex-row gap-3 mb-6">
              <button onClick={handleAddToCart} className={added ? 'btn bg-success-500 text-white hover:bg-success-600 flex-1' : 'btn-outline flex-1'}>
                {added ? (
                  <><Check className="w-4 h-4" /> تمت الإضافة</>
                ) : (
                  <><ShoppingBag className="w-4 h-4" /> أضف إلى السلة</>
                )}
              </button>
              <button onClick={handleBuyNow} className="btn-primary flex-1">
                اشترِ الآن <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Features */}
          <div className="card p-4 mt-auto">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="flex items-center gap-2">
                <span className="text-2xl">🌾</span>
                <span className="text-secondary-600">مكونات طبيعية 100%</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-2xl">🚚</span>
                <span className="text-secondary-600">توصيل سريع</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-2xl">☀️</span>
                <span className="text-secondary-600">يخبز يومياً</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-2xl">❄️</span>
                <span className="text-secondary-600">يحفظ مبرداً</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Related products */}
      {related.length > 0 && (
        <section className="mt-16">
          <h2 className="section-title mb-6">منتجات مشابهة</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {related.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
