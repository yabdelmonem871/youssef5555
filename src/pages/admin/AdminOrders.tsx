import { useEffect, useState, useCallback } from 'react';
import { Search, ShoppingBag, X, Phone, MapPin, Clock } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import type { Order, OrderStatus, OrderItem } from '@/types';
import { ORDER_STATUS_LABELS, ORDER_STATUS_COLORS } from '@/types';
import { formatPrice, formatDate } from '@/lib/utils';
import { LoadingSpinner, EmptyState } from '@/components/States';

const STATUS_ORDER: OrderStatus[] = ['new', 'preparing', 'ready', 'delivering', 'completed', 'cancelled'];

export default function AdminOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<OrderStatus | 'all'>('all');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [updating, setUpdating] = useState(false);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false });
    setOrders((data ?? []) as Order[]);
    setLoading(false);
  }, []);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  const viewOrder = async (order: Order) => {
    setSelectedOrder(order);
    const { data } = await supabase
      .from('order_items')
      .select('*')
      .eq('order_id', order.id);
    setOrderItems((data ?? []) as OrderItem[]);
  };

  const updateStatus = async (orderId: string, status: OrderStatus) => {
    setUpdating(true);
    const { error } = await supabase
      .from('orders')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', orderId);
    if (!error) {
      setOrders((prev) => prev.map((o) => o.id === orderId ? { ...o, status } : o));
      if (selectedOrder?.id === orderId) setSelectedOrder({ ...selectedOrder, status });
    }
    setUpdating(false);
  };

  const filteredOrders = orders.filter((o) => {
    const matchSearch = o.order_number.toLowerCase().includes(search.toLowerCase()) ||
      o.customer_name.toLowerCase().includes(search.toLowerCase()) ||
      o.customer_phone.includes(search);
    const matchStatus = statusFilter === 'all' || o.status === statusFilter;
    return matchSearch && matchStatus;
  });

  return (
    <div className="animate-fade-in">
      <h1 className="font-display text-2xl font-bold text-secondary-900 mb-6">إدارة الطلبات</h1>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="relative flex-1">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-secondary-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="ابحث برقم الطلب أو اسم العميل..."
            className="input pr-10"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as OrderStatus | 'all')}
          className="input sm:w-44"
        >
          <option value="all">كل الحالات</option>
          {STATUS_ORDER.map((s) => (
            <option key={s} value={s}>{ORDER_STATUS_LABELS[s]}</option>
          ))}
        </select>
      </div>

      {loading ? (
        <LoadingSpinner message="جاري تحميل الطلبات..." />
      ) : filteredOrders.length === 0 ? (
        <EmptyState
          icon={<ShoppingBag className="w-8 h-8" />}
          title="لا توجد طلبات"
          message="لم يتم العثور على طلبات تطابق البحث"
        />
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-secondary-50 border-b border-secondary-100">
                <tr>
                  <th className="text-right p-3 font-medium text-secondary-600">رقم الطلب</th>
                  <th className="text-right p-3 font-medium text-secondary-600 hidden sm:table-cell">العميل</th>
                  <th className="text-right p-3 font-medium text-secondary-600 hidden md:table-cell">التاريخ</th>
                  <th className="text-right p-3 font-medium text-secondary-600">الإجمالي</th>
                  <th className="text-right p-3 font-medium text-secondary-600">الحالة</th>
                  <th className="text-right p-3 font-medium text-secondary-600">إجراء</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-secondary-50">
                {filteredOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-secondary-50/50">
                    <td className="p-3 font-medium text-secondary-900">{order.order_number}</td>
                    <td className="p-3 hidden sm:table-cell">
                      <p className="text-secondary-700">{order.customer_name}</p>
                      <p className="text-xs text-secondary-500" dir="ltr">{order.customer_phone}</p>
                    </td>
                    <td className="p-3 text-secondary-500 hidden md:table-cell text-xs">{formatDate(order.created_at)}</td>
                    <td className="p-3 font-bold text-primary-700">{formatPrice(Number(order.total))}</td>
                    <td className="p-3">
                      <select
                        value={order.status}
                        onChange={(e) => updateStatus(order.id, e.target.value as OrderStatus)}
                        disabled={updating}
                        className={`text-xs font-medium rounded-lg px-2 py-1 border-0 cursor-pointer ${ORDER_STATUS_COLORS[order.status]}`}
                      >
                        {STATUS_ORDER.map((s) => (
                          <option key={s} value={s}>{ORDER_STATUS_LABELS[s]}</option>
                        ))}
                      </select>
                    </td>
                    <td className="p-3">
                      <button onClick={() => viewOrder(order)} className="btn-ghost text-xs !px-2 !py-1">
                        تفاصيل
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Order detail modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4 animate-fade-in" onClick={() => setSelectedOrder(null)}>
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between p-5 border-b border-secondary-100 sticky top-0 bg-white">
              <div>
                <h2 className="font-bold text-lg text-secondary-900">{selectedOrder.order_number}</h2>
                <p className="text-xs text-secondary-500">{formatDate(selectedOrder.created_at)}</p>
              </div>
              <button onClick={() => setSelectedOrder(null)} className="p-2 rounded-lg hover:bg-secondary-100">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-4">
              {/* Status */}
              <div className="flex items-center gap-2">
                <span className="text-sm text-secondary-600">الحالة:</span>
                <span className={`badge ${ORDER_STATUS_COLORS[selectedOrder.status]}`}>
                  {ORDER_STATUS_LABELS[selectedOrder.status]}
                </span>
              </div>

              {/* Customer info */}
              <div className="card p-4 bg-secondary-50 space-y-2 text-sm">
                <div className="flex items-center gap-2 text-secondary-700">
                  <span className="font-medium">{selectedOrder.customer_name}</span>
                </div>
                <div className="flex items-center gap-2 text-secondary-600">
                  <Phone className="w-4 h-4" /> <span dir="ltr">{selectedOrder.customer_phone}</span>
                </div>
                <div className="flex items-center gap-2 text-secondary-600">
                  <MapPin className="w-4 h-4" /> {selectedOrder.customer_address}
                </div>
                <div className="flex items-center gap-2 text-secondary-600">
                  <Clock className="w-4 h-4" /> {formatDate(selectedOrder.created_at)}
                </div>
                {selectedOrder.notes && (
                  <p className="text-secondary-600 pt-2 border-t border-secondary-100">
                    ملاحظات: {selectedOrder.notes}
                  </p>
                )}
              </div>

              {/* Items */}
              <div>
                <h3 className="font-bold text-sm text-secondary-900 mb-2">المنتجات:</h3>
                <div className="space-y-2">
                  {orderItems.map((item) => (
                    <div key={item.id} className="flex items-center gap-3 bg-secondary-50 rounded-xl p-2">
                      <div className="w-12 h-12 rounded-lg overflow-hidden bg-white shrink-0">
                        {item.product_image ? (
                          <img src={item.product_image} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-xl">🥖</div>
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-sm">{item.product_name}</p>
                        <p className="text-xs text-secondary-500">{item.quantity} × {formatPrice(Number(item.price))}</p>
                      </div>
                      <span className="font-bold text-sm">{formatPrice(Number(item.price) * item.quantity)}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Totals */}
              <div className="border-t border-secondary-100 pt-3 space-y-1 text-sm">
                <div className="flex justify-between text-secondary-600">
                  <span>المجموع الفرعي</span><span>{formatPrice(Number(selectedOrder.subtotal))}</span>
                </div>
                <div className="flex justify-between text-secondary-600">
                  <span>التوصيل</span><span>{formatPrice(Number(selectedOrder.delivery_fee))}</span>
                </div>
                <div className="flex justify-between font-bold pt-1 border-t border-secondary-100">
                  <span>الإجمالي</span><span className="text-primary-700">{formatPrice(Number(selectedOrder.total))}</span>
                </div>
              </div>

              {/* Status update */}
              <div>
                <label className="label">تغيير الحالة:</label>
                <div className="flex flex-wrap gap-2">
                  {STATUS_ORDER.map((s) => (
                    <button
                      key={s}
                      onClick={() => updateStatus(selectedOrder.id, s)}
                      disabled={updating}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                        selectedOrder.status === s
                          ? ORDER_STATUS_COLORS[s] + ' ring-2 ring-offset-1 ring-primary-300'
                          : 'bg-secondary-100 text-secondary-600 hover:bg-secondary-200'
                      }`}
                    >
                      {ORDER_STATUS_LABELS[s]}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
