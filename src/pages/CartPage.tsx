import { Link, useNavigate } from 'react-router-dom';
import { Plus, Minus, Trash2, ShoppingBag, ArrowLeft } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { useShop } from '@/contexts/ShopContext';
import { formatPrice } from '@/lib/utils';
import { EmptyState } from '@/components/States';

export default function CartPage() {
  const { items, updateQuantity, removeItem, subtotal, clearCart } = useCart();
  const { settings } = useShop();
  const navigate = useNavigate();

  const deliveryFee = items.length > 0 ? (settings?.delivery_fee ?? 15) : 0;
  const total = subtotal + deliveryFee;

  if (items.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 animate-fade-in">
        <h1 className="section-title mb-6">سلة المشتريات</h1>
        <EmptyState
          icon={<ShoppingBag className="w-8 h-8" />}
          title="السلة فارغة"
          message="لم تقم بإضافة أي منتجات إلى السلة بعد. تصفح منتجاتنا وأضف ما تريد."
          action={
            <Link to="/products" className="btn-primary">
              تصفح المنتجات <ArrowLeft className="w-4 h-4" />
            </Link>
          }
        />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <h1 className="section-title">سلة المشتريات ({items.length})</h1>
        <button onClick={clearCart} className="btn-ghost text-sm text-error-500">
          <Trash2 className="w-4 h-4" /> إفراغ السلة
        </button>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Items */}
        <div className="lg:col-span-2 space-y-3">
          {items.map((item) => (
            <div key={item.product.id} className="card p-4 flex gap-4 animate-slide-up">
              <Link to={`/products/${item.product.id}`} className="shrink-0">
                <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl overflow-hidden bg-secondary-100">
                  {item.product.image_url ? (
                    <img src={item.product.image_url} alt={item.product.name_ar} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-3xl">🥖</div>
                  )}
                </div>
              </Link>

              <div className="flex-1 min-w-0">
                <Link to={`/products/${item.product.id}`}>
                  <h3 className="font-bold text-secondary-900 mb-1 line-clamp-1">{item.product.name_ar}</h3>
                </Link>
                <p className="text-sm text-secondary-500 line-clamp-1 mb-2">{item.product.description_ar}</p>
                <p className="font-display font-bold text-primary-700">{formatPrice(item.product.price)}</p>
              </div>

              <div className="flex flex-col items-end justify-between shrink-0">
                <button
                  onClick={() => removeItem(item.product.id)}
                  className="p-1.5 text-error-400 hover:text-error-600 hover:bg-error-50 rounded-lg transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
                <div className="flex items-center gap-1 bg-secondary-50 rounded-lg">
                  <button
                    onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                    className="p-1.5 hover:bg-secondary-100 rounded-r-lg transition-colors"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="w-8 text-center font-bold text-sm">{item.quantity}</span>
                  <button
                    onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                    className="p-1.5 hover:bg-secondary-100 rounded-l-lg transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Summary */}
        <div className="lg:col-span-1">
          <div className="card p-6 sticky top-20">
            <h2 className="font-bold text-lg text-secondary-900 mb-4">ملخص الطلب</h2>
            <div className="space-y-3 mb-4">
              <div className="flex justify-between text-secondary-600">
                <span>المجموع الفرعي</span>
                <span className="font-medium">{formatPrice(subtotal)}</span>
              </div>
              <div className="flex justify-between text-secondary-600">
                <span>رسوم التوصيل</span>
                <span className="font-medium">{formatPrice(deliveryFee)}</span>
              </div>
              <div className="border-t border-secondary-100 pt-3 flex justify-between">
                <span className="font-bold text-secondary-900">الإجمالي</span>
                <span className="font-display font-bold text-primary-700 text-xl">{formatPrice(total)}</span>
              </div>
            </div>
            <button onClick={() => navigate('/checkout')} className="btn-primary w-full">
              إتمام الطلب <ArrowLeft className="w-4 h-4" />
            </button>
            <Link to="/products" className="btn-ghost w-full mt-2 text-sm">
              متابعة التسوق
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
