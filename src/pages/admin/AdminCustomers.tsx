import { useEffect, useState } from 'react';
import { Users, Phone, Mail, Calendar, ShoppingBag } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import type { Profile, Order } from '@/types';
import { formatPrice, formatDate } from '@/lib/utils';
import { LoadingSpinner, EmptyState } from '@/components/States';

interface CustomerWithStats extends Profile {
  order_count: number;
  total_spent: number;
}

export default function AdminCustomers() {
  const [customers, setCustomers] = useState<CustomerWithStats[]>([]);
  const [orders, setOrders] = useState<Record<string, Order[]>>({});
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([
      supabase.from('profiles').select('*').order('created_at', { ascending: false }),
      supabase.from('orders').select('*').order('created_at', { ascending: false }),
    ]).then(([profilesRes, ordersRes]) => {
      const profiles = (profilesRes.data ?? []) as Profile[];
      const allOrders = (ordersRes.data ?? []) as Order[];

      const customersWithStats: CustomerWithStats[] = profiles.map((p) => {
        const userOrders = allOrders.filter((o) => o.user_id === p.id);
        return {
          ...p,
          order_count: userOrders.length,
          total_spent: userOrders
            .filter((o) => o.status !== 'cancelled')
            .reduce((sum, o) => sum + Number(o.total), 0),
        };
      });

      setCustomers(customersWithStats);

      const ordersMap: Record<string, Order[]> = {};
      allOrders.forEach((o) => {
        if (o.user_id) {
          if (!ordersMap[o.user_id]) ordersMap[o.user_id] = [];
          ordersMap[o.user_id].push(o);
        }
      });
      setOrders(ordersMap);
      setLoading(false);
    });
  }, []);

  if (loading) return <LoadingSpinner message="جاري تحميل العملاء..." />;

  return (
    <div className="animate-fade-in">
      <h1 className="font-display text-2xl font-bold text-secondary-900 mb-6">إدارة العملاء</h1>

      {customers.length === 0 ? (
        <EmptyState
          icon={<Users className="w-8 h-8" />}
          title="لا يوجد عملاء"
          message="لم يسجل أي عملاء بعد"
        />
      ) : (
        <div className="space-y-3">
          {customers.map((customer) => (
            <div key={customer.id} className="card overflow-hidden">
              <button
                onClick={() => setExpandedId(expandedId === customer.id ? null : customer.id)}
                className="w-full p-4 flex items-center justify-between text-right hover:bg-secondary-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center font-bold">
                    {customer.full_name?.charAt(0) ?? '؟'}
                  </div>
                  <div>
                    <p className="font-medium text-secondary-900">{customer.full_name || 'بدون اسم'}</p>
                    <div className="flex items-center gap-3 text-xs text-secondary-500 mt-0.5">
                      <span className="badge bg-secondary-100 text-secondary-600">{customer.role === 'admin' ? 'مدير' : 'عميل'}</span>
                      <span>{customer.order_count} طلب</span>
                      <span className="font-medium text-primary-700">{formatPrice(customer.total_spent)}</span>
                    </div>
                  </div>
                </div>
                {customer.order_count > 0 && (
                  <span className="text-xs text-primary-600">عرض الطلبات</span>
                )}
              </button>

              {expandedId === customer.id && orders[customer.id] && (
                <div className="border-t border-secondary-100 p-4 animate-slide-down">
                  <div className="grid sm:grid-cols-2 gap-3 mb-4 text-sm">
                    {customer.phone && (
                      <div className="flex items-center gap-2 text-secondary-600">
                        <Phone className="w-4 h-4" /> <span dir="ltr">{customer.phone}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2 text-secondary-600">
                      <Calendar className="w-4 h-4" /> {formatDate(customer.created_at)}
                    </div>
                  </div>

                  <h3 className="font-bold text-sm text-secondary-900 mb-2">سجل الطلبات:</h3>
                  <div className="space-y-2">
                    {orders[customer.id].map((order) => (
                      <div key={order.id} className="flex items-center justify-between bg-secondary-50 rounded-xl p-3 text-sm">
                        <div>
                          <p className="font-medium text-secondary-900">{order.order_number}</p>
                          <p className="text-xs text-secondary-500">{formatDate(order.created_at)}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-primary-700">{formatPrice(Number(order.total))}</span>
                          <span className="text-xs text-secondary-500">{order.status}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
