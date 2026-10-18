export interface Category {
  id: string;
  name_ar: string;
  name_en: string | null;
  slug: string;
  icon: string | null;
  sort_order: number;
  created_at: string;
}

export interface Product {
  id: string;
  category_id: string | null;
  name_ar: string;
  description_ar: string | null;
  price: number;
  image_url: string | null;
  stock: number;
  is_available: boolean;
  is_bestseller: boolean;
  is_new: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
  category?: Category | null;
}

export interface Profile {
  id: string;
  full_name: string | null;
  phone: string | null;
  role: 'admin' | 'customer';
  created_at: string;
}

export type OrderStatus = 'new' | 'preparing' | 'ready' | 'delivering' | 'completed' | 'cancelled';

export interface Order {
  id: string;
  order_number: string;
  user_id: string | null;
  customer_name: string;
  customer_phone: string;
  customer_address: string;
  notes: string | null;
  status: OrderStatus;
  subtotal: number;
  delivery_fee: number;
  total: number;
  created_at: string;
  updated_at: string;
  order_items?: OrderItem[];
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string | null;
  product_name: string;
  product_image: string | null;
  price: number;
  quantity: number;
  created_at: string;
}

export interface ShopSettings {
  id: string;
  shop_name: string;
  shop_name_en: string | null;
  logo_url: string | null;
  phone: string | null;
  address: string | null;
  delivery_fee: number;
  is_open: boolean;
  opening_time: string;
  closing_time: string;
  about_ar: string | null;
  updated_at: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  new: 'جديد',
  preparing: 'قيد التجهيز',
  ready: 'جاهز',
  delivering: 'خرج للتوصيل',
  completed: 'مكتمل',
  cancelled: 'ملغي',
};

export const ORDER_STATUS_COLORS: Record<OrderStatus, string> = {
  new: 'bg-blue-100 text-blue-700',
  preparing: 'bg-accent-100 text-accent-700',
  ready: 'bg-success-100 text-success-700',
  delivering: 'bg-primary-100 text-primary-700',
  completed: 'bg-secondary-200 text-secondary-800',
  cancelled: 'bg-error-100 text-error-700',
};
