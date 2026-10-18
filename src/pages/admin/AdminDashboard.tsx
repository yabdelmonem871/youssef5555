import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ShoppingBag,
  Package,
  TrendingUp,
  Clock,
  ArrowLeft,
  Users,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { formatPrice, formatDate } from '@/lib/utils';
import { ORDER_STATUS_LABELS, ORDER_STATUS_COLORS } from '@/types';
import type { Order, Product } from '@/types';
import { LoadingSpinner } from '@/components/States';

interface Stats {
  totalOrders: number;
  totalRevenue: number;
  totalProducts: number;
  newOrders: number;
  totalCustomers: number;
}

interface TopProduct {
  product_name: string;
  total_quantity: number;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats>({
    totalOrders: 0,
    totalRevenue: 0,
    totalProducts: 0,
    newOrders: 0,
    totalCustomers: 0,
  });
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [topProducts, setTopProducts] = useState<TopProduct[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      supabase.from('orders').select('*'),
      supabase.from('products').select('*', { count: 'exact', head: true }),
      supabase.from('profiles').select('*', { count: 'exact', head: true }),
      supabase.from('orders').select('*').order('created_at', { ascending: false }).limit(5),
    ]).then(([ordersRes, productsRes, customersRes, recentRes]) => {
      const orders = (ordersRes.data ?? []) as Order[];
      const revenue = orders
        .filter((o) => o.status !== 'cancelled')
        .reduce((sum, o) => sum + Number(o.total), 0);

      setStats({
        totalOrders: orders.length,
        totalRevenue: revenue,
        totalProducts: productsRes.count ?? 0,
        newOrders: orders.filter((o) => o.status === 'new').length,
        totalCustomers: customersRes.count ?? 0,
      });
      setRecentOrders((recentRes.data ?? []) as Order[]);

      // Calculate top products from order items
      supabase
        .from('order_items')
        .select('product_name, quantity')
        .then(({ data: items }) => {
          const productMap = new Map<string, number>();
          (items ?? []).forEach((item) => {
            const current = productMap.get(item.product_name) ?? 0;
            productMap.set(item.product_name, current + item.quantity);
          });
          const top = Array.from(productMap.entries())
            .map(([name, qty]) => ({ product_name: name, total_quantity: qty }))
            .sort((a, b) => b.total_quantity - a.total_quantity)
            .slice(0, 5);
          setTopProducts(top);
        });

      setLoading(false);
    });
  }, []);

  if (loading) return <LoadingSpinner message="جاري تحميل البيانات..." />;

  const statCards = [
    { label: 'إجمالي الطلبات', value: stats.totalOrders.toString(), icon: ShoppingBag, color: 'bg-blue-500' },
    { label: 'إجمالي المبيعات', value: formatPrice(stats.totalRevenue), icon: TrendingUp, color: 'bg-success-500' },
    { label: 'المنتجات', value: stats.totalProducts.toString(), icon: Package, color: 'bg-primary-500' },
    { label: 'طلبات جديدة', value: stats.newOrders.toString(), icon: Clock, color: 'bg-accent-500' },
    { label: 'العملاء', value: stats.totalCustomers.toString(), icon: Users, color: 'bg-secondary-500' },
  ];

  return (
    <div className="animate-fade-in">
      <h1 className="font-display text-2xl font-bold text-secondary-900 mb-6">لوحة المعلومات</h1>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        {statCards.map((card, i) => (
          <div key={i} className="card p-4">
            <div className={`w-10 h-10 rounded-xl ${card.color} text-white flex items-center justify-center mb-3`}>
              <card.icon className="w-5 h-5" />
            </div>
            <p className="text-secondary-500 text-sm">{card.label}</p>
            <p className="font-display font-bold text-xl text-secondary-900 mt-1">{card.value}</p>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Recent orders */}
        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-lg text-secondary-900">أحدث الطلبات</h2>
            <Link to="/admin/orders" className="text-primary-600 text-sm flex items-center gap-1 hover:text-primary-700">
              عرض الكل <ArrowLeft className="w-4 h-4" />
            </Link>
          </div>
          {recentOrders.length === 0 ? (
            <p className="text-secondary-400 text-sm text-center py-8">لا توجد طلبات بعد</p>
          ) : (
            <div className="space-y-2">
              {recentOrders.map((order) => (
                <div key={order.id} className="flex items-center justify-between p-3 rounded-xl hover:bg-secondary-50 transition-colors">
                  <div>
                    <p className="font-medium text-sm text-secondary-900">{order.order_number}</p>
                    <p className="text-xs text-secondary-500">{order.customer_name} • {formatDate(order.created_at)}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm">{formatPrice(Number(order.total))}</span>
                    <span className={`badge ${ORDER_STATUS_COLORS[order.status]} text-xs`}>
                      {ORDER_STATUS_LABELS[order.status]}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Top products */}
        <div className="card p-5">
          <h2 className="font-bold text-lg text-secondary-900 mb-4">المنتجات الأكثر مبيعاً</h2>
          {topProducts.length === 0 ? (
            <p className="text-secondary-400 text-sm text-center py-8">لا توجد مبيعات بعد</p>
          ) : (
            <div className="space-y-3">
              {topProducts.map((product, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-primary-100 text-primary-700 flex items-center justify-center text-sm font-bold shrink-0">
                    {i + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm text-secondary-900 truncate">{product.product_name}</p>
                    <div className="w-full bg-secondary-100 rounded-full h-2 mt-1">
                      <div
                        className="bg-primary-500 h-2 rounded-full"
                        style={{ width: `${(product.total_quantity / topProducts[0].total_quantity) * 100}%` }}
                      />
                    </div>
                  </div>
                  <span className="text-sm font-bold text-secondary-700 shrink-0">{product.total_quantity} قطعة</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
