import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Package, Clock, CheckCircle2, Truck, ChefHat, XCircle, ArrowLeft } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import type { Order, OrderStatus } from '@/types';
import { ORDER_STATUS_LABELS, ORDER_STATUS_COLORS } from '@/types';
import { formatPrice, formatDate } from '@/lib/utils';
import { LoadingSpinner, EmptyState } from '@/components/States';

const STATUS_ICONS: Record<OrderStatus, React.ReactNode> = {
  new: <Clock className="w-5 h-5" />,
  preparing: <ChefHat className="w-5 h-5" />,
  ready: <CheckCircle2 className="w-5 h-5" />,
  delivering: <Truck className="w-5 h-5" />,
  completed: <CheckCircle2 className="w-5 h-5" />,
  cancelled: <XCircle className="w-5 h-5" />,
};

const STATUS_STEPS: OrderStatus[] = ['new', 'preparing', 'ready', 'delivering', 'completed'];

export default function OrdersPage() {
  const { session } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    if (!session?.user) return;
    supabase
      .from('orders')
      .select('*, order_items(*)')
      .eq('user_id', session.user.id)
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        setOrders((data ?? []) as Order[]);
        setLoading(false);
      });
  }, [session]);

  if (loading) return <LoadingSpinner message="جاري تحميل الطلبات..." />;

  if (orders.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <h1 className="section-title mb-6">طلباتي</h1>
        <EmptyState
          icon={<Package className="w-8 h-8" />}
          title="لا توجد طلبات"
          message="لم تقم بأي طلبات بعد. ابدأ التسوق الآن!"
          action={<Link to="/products" className="btn-primary">تصفح المنتجات <ArrowLeft className="w-4 h-4" /></Link>}
        />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 animate-fade-in">
      <h1 className="section-title mb-6">طلباتي ({orders.length})</h1>

      <div className="space-y-4">
        {orders.map((order) => {
          const isExpanded = expandedId === order.id;
          const isCancelled = order.status === 'cancelled';
          const currentStepIndex = STATUS_STEPS.indexOf(order.status);

          return (
            <div key={order.id} className="card overflow-hidden">
              {/* Header */}
              <button
                onClick={() => setExpandedId(isExpanded ? null : order.id)}
                className="w-full p-4 flex items-center justify-between text-right hover:bg-secondary-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${ORDER_STATUS_COLORS[order.status]}`}>
                    {STATUS_ICONS[order.status]}
                  </div>
                  <div>
                    <p className="font-bold text-secondary-900">{order.order_number}</p>
                    <p className="text-xs text-secondary-500">{formatDate(order.created_at)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-display font-bold text-primary-700">{formatPrice(order.total)}</span>
                  <span className={`badge ${ORDER_STATUS_COLORS[order.status]}`}>
                    {ORDER_STATUS_LABELS[order.status]}
                  </span>
                </div>
              </button>

              {/* Expanded details */}
              {isExpanded && (
                <div className="border-t border-secondary-100 p-4 animate-slide-down">
                  {/* Status tracker */}
                  {!isCancelled && (
                    <div className="mb-6">
                      <div className="flex items-center justify-between relative">
                        <div className="absolute top-5 right-5 left-5 h-0.5 bg-secondary-200" />
                        <div
                          className="absolute top-5 right-5 h-0.5 bg-primary-500 transition-all"
                          style={{ width: `${(currentStepIndex / (STATUS_STEPS.length - 1)) * 100}%` }}
                        />
                        {STATUS_STEPS.map((step, i) => (
                          <div key={step} className="relative flex flex-col items-center gap-1 z-10">
                            <div
                              className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                                i <= currentStepIndex
                                  ? 'bg-primary-500 text-white'
                                  : 'bg-secondary-200 text-secondary-400'
                              }`}
                            >
                              {STATUS_ICONS[step]}
                            </div>
                            <span className={`text-xs ${i <= currentStepIndex ? 'text-primary-700 font-medium' : 'text-secondary-400'}`}>
                              {ORDER_STATUS_LABELS[step]}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Items */}
                  <h3 className="font-bold text-secondary-900 mb-2">المنتجات:</h3>
                  <div className="space-y-2 mb-4">
                    {order.order_items?.map((item) => (
                      <div key={item.id} className="flex items-center gap-3 bg-secondary-50 rounded-xl p-2">
                        <div className="w-12 h-12 rounded-lg overflow-hidden bg-white shrink-0">
                          {item.product_image ? (
                            <img src={item.product_image} alt={item.product_name} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-xl">🥖</div>
                          )}
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-sm text-secondary-800">{item.product_name}</p>
                          <p className="text-xs text-secondary-500">{item.quantity} × {formatPrice(item.price)}</p>
                        </div>
                        <span className="font-bold text-sm">{formatPrice(item.price * item.quantity)}</span>
                      </div>
                    ))}
                  </div>

                  {/* Summary */}
                  <div className="grid sm:grid-cols-2 gap-4 text-sm">
                    <div className="space-y-1">
                      <p><span className="text-secondary-500">الاسم: </span><span className="font-medium">{order.customer_name}</span></p>
                      <p><span className="text-secondary-500">الهاتف: </span><span className="font-medium" dir="ltr">{order.customer_phone}</span></p>
                      <p><span className="text-secondary-500">العنوان: </span><span className="font-medium">{order.customer_address}</span></p>
                      {order.notes && <p><span className="text-secondary-500">ملاحظات: </span><span className="font-medium">{order.notes}</span></p>}
                    </div>
                    <div className="space-y-1">
                      <p className="flex justify-between"><span className="text-secondary-500">المجموع الفرعي:</span><span>{formatPrice(order.subtotal)}</span></p>
                      <p className="flex justify-between"><span className="text-secondary-500">التوصيل:</span><span>{formatPrice(order.delivery_fee)}</span></p>
                      <p className="flex justify-between font-bold pt-1 border-t border-secondary-100"><span>الإجمالي:</span><span className="text-primary-700">{formatPrice(order.total)}</span></p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
