import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { CheckCircle2, ArrowLeft, ShoppingBag } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { useShop } from '@/contexts/ShopContext';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { formatPrice } from '@/lib/utils';
import type { Order } from '@/types';
import { EmptyState } from '@/components/States';

export default function CheckoutPage() {
  const { items, subtotal, clearCart } = useCart();
  const { settings } = useShop();
  const { profile, session } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    customer_name: profile?.full_name ?? '',
    customer_phone: profile?.phone ?? '',
    customer_address: '',
    notes: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<Order | null>(null);

  const deliveryFee = settings?.delivery_fee ?? 15;
  const total = subtotal + deliveryFee;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!form.customer_name.trim() || !form.customer_phone.trim() || !form.customer_address.trim()) {
      setError('يرجى تعبئة جميع الحقول المطلوبة');
      return;
    }

    if (!session?.user) {
      setError('يجب تسجيل الدخول لإتمام الطلب');
      return;
    }

    setLoading(true);
    try {
      const { data: orderNumberData } = await supabase.rpc('generate_order_number');
      const orderNumber = orderNumberData as string;

      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .insert({
          order_number: orderNumber,
          user_id: session.user.id,
          customer_name: form.customer_name,
          customer_phone: form.customer_phone,
          customer_address: form.customer_address,
          notes: form.notes || null,
          subtotal,
          delivery_fee: deliveryFee,
          total,
          status: 'new',
        })
        .select()
        .single();

      if (orderError) throw orderError;

      const order = orderData as Order;

      const orderItems = items.map((item) => ({
        order_id: order.id,
        product_id: item.product.id,
        product_name: item.product.name_ar,
        product_image: item.product.image_url,
        price: item.product.price,
        quantity: item.quantity,
      }));

      const { error: itemsError } = await supabase.from('order_items').insert(orderItems);
      if (itemsError) throw itemsError;

      setSuccess(order);
      clearCart();
    } catch (err) {
      setError('فشل إنشاء الطلب: ' + (err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-16 text-center animate-fade-in">
        <div className="w-20 h-20 rounded-full bg-success-100 flex items-center justify-center mx-auto mb-6">
          <CheckCircle2 className="w-10 h-10 text-success-600" />
        </div>
        <h1 className="font-display text-3xl font-bold text-secondary-900 mb-3">تم تسجيل طلبك بنجاح!</h1>
        <p className="text-secondary-600 mb-2">رقم طلبك هو:</p>
        <p className="font-display text-2xl font-bold text-primary-700 mb-6">{success.order_number}</p>
        <div className="card p-6 mb-6 text-right">
          <div className="flex justify-between mb-2">
            <span className="text-secondary-600">الإجمالي:</span>
            <span className="font-bold">{formatPrice(success.total)}</span>
          </div>
          <div className="flex justify-between mb-2">
            <span className="text-secondary-600">الحالة:</span>
            <span className="badge bg-blue-100 text-blue-700">جديد</span>
          </div>
          <div className="flex justify-between">
            <span className="text-secondary-600">عنوان التوصيل:</span>
            <span className="font-medium">{success.customer_address}</span>
          </div>
        </div>
        <div className="flex gap-3 justify-center">
          <Link to="/orders" className="btn-primary">تتبع الطلب</Link>
          <Link to="/products" className="btn-outline">متابعة التسوق</Link>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <EmptyState
          icon={<ShoppingBag className="w-8 h-8" />}
          title="السلة فارغة"
          message="أضف منتجات إلى السلة أولاً قبل إتمام الطلب."
          action={<Link to="/products" className="btn-primary">تصفح المنتجات</Link>}
        />
      </div>
    );
  }

  if (!session) {
    return (
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-16 text-center">
        <h1 className="font-display text-2xl font-bold text-secondary-900 mb-3">يجب تسجيل الدخول</h1>
        <p className="text-secondary-600 mb-6">سجل دخولك لإتمام الطلب</p>
        <Link to="/auth" className="btn-primary">تسجيل الدخول <ArrowLeft className="w-4 h-4" /></Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 animate-fade-in">
      <h1 className="section-title mb-6">إتمام الطلب</h1>

      <form onSubmit={handleSubmit} className="grid lg:grid-cols-3 gap-6">
        {/* Form */}
        <div className="lg:col-span-2 space-y-4">
          <div className="card p-6">
            <h2 className="font-bold text-lg text-secondary-900 mb-4">بيانات التوصيل</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="label">الاسم الكامل *</label>
                <input
                  type="text"
                  required
                  value={form.customer_name}
                  onChange={(e) => setForm({ ...form, customer_name: e.target.value })}
                  className="input"
                  placeholder="أدخل اسمك"
                />
              </div>
              <div>
                <label className="label">رقم الهاتف *</label>
                <input
                  type="tel"
                  required
                  value={form.customer_phone}
                  onChange={(e) => setForm({ ...form, customer_phone: e.target.value })}
                  className="input"
                  placeholder="05xxxxxxxx"
                  dir="ltr"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="label">عنوان التوصيل *</label>
                <textarea
                  required
                  value={form.customer_address}
                  onChange={(e) => setForm({ ...form, customer_address: e.target.value })}
                  className="input min-h-20 resize-y"
                  placeholder="الحي، الشارع، رقم المنزل، أقرب معلم"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="label">ملاحظات الطلب (اختياري)</label>
                <textarea
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  className="input min-h-20 resize-y"
                  placeholder="أي ملاحظات إضافية للتوصيل أو الطلب"
                />
              </div>
            </div>
          </div>

          {error && (
            <div className="card p-4 bg-error-50 border-error-200 text-error-700 text-sm">
              {error}
            </div>
          )}
        </div>

        {/* Summary */}
        <div className="lg:col-span-1">
          <div className="card p-6 sticky top-20">
            <h2 className="font-bold text-lg text-secondary-900 mb-4">ملخص الطلب</h2>
            <div className="space-y-2 mb-4 max-h-48 overflow-y-auto">
              {items.map((item) => (
                <div key={item.product.id} className="flex justify-between text-sm">
                  <span className="text-secondary-600 line-clamp-1">
                    {item.product.name_ar} × {item.quantity}
                  </span>
                  <span className="font-medium shrink-0">{formatPrice(item.product.price * item.quantity)}</span>
                </div>
              ))}
            </div>
            <div className="border-t border-secondary-100 pt-3 space-y-2">
              <div className="flex justify-between text-secondary-600 text-sm">
                <span>المجموع الفرعي</span>
                <span>{formatPrice(subtotal)}</span>
              </div>
              <div className="flex justify-between text-secondary-600 text-sm">
                <span>التوصيل</span>
                <span>{formatPrice(deliveryFee)}</span>
              </div>
              <div className="flex justify-between font-bold pt-2 border-t border-secondary-100">
                <span>الإجمالي</span>
                <span className="text-primary-700 text-lg">{formatPrice(total)}</span>
              </div>
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full mt-4">
              {loading ? 'جاري التأكيد...' : 'تأكيد الطلب'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
