import { useEffect, useState, useCallback } from 'react';
import { Plus, Pencil, Trash2, Search, X, Package, Star, Sparkles } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import type { Product, Category } from '@/types';
import { formatPrice } from '@/lib/utils';
import { ImageUploader } from '@/components/ImageUploader';
import { LoadingSpinner, EmptyState, ErrorState } from '@/components/States';

export default function AdminProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    const { data, error: err } = await supabase
      .from('products')
      .select('*, category:categories(*)')
      .order('sort_order');
    if (err) setError(err.message);
    else setProducts((data ?? []) as Product[]);
    setLoading(false);
  }, []);

  const fetchCategories = useCallback(async () => {
    const { data } = await supabase.from('categories').select('*').order('sort_order');
    setCategories((data ?? []) as Category[]);
  }, []);

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, [fetchProducts, fetchCategories]);

  const handleDelete = async (id: string) => {
    if (!confirm('هل أنت متأكد من حذف هذا المنتج؟')) return;
    const { error: err } = await supabase.from('products').delete().eq('id', id);
    if (err) {
      alert('فشل الحذف: ' + err.message);
    } else {
      setProducts((prev) => prev.filter((p) => p.id !== id));
    }
  };

  const filteredProducts = products.filter((p) =>
    p.name_ar.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display text-2xl font-bold text-secondary-900">إدارة المنتجات</h1>
        <button
          onClick={() => { setEditing(null); setShowModal(true); }}
          className="btn-primary"
        >
          <Plus className="w-4 h-4" /> منتج جديد
        </button>
      </div>

      {/* Search */}
      <div className="relative mb-4">
        <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-secondary-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="ابحث عن منتج..."
          className="input pr-10"
        />
      </div>

      {error && <ErrorState message={error} />}

      {loading ? (
        <LoadingSpinner message="جاري تحميل المنتجات..." />
      ) : filteredProducts.length === 0 ? (
        <EmptyState
          icon={<Package className="w-8 h-8" />}
          title="لا توجد منتجات"
          message="ابدأ بإضافة منتجاتك"
          action={<button onClick={() => { setEditing(null); setShowModal(true); }} className="btn-primary">إضافة منتج</button>}
        />
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-secondary-50 border-b border-secondary-100">
                <tr>
                  <th className="text-right p-3 font-medium text-secondary-600">المنتج</th>
                  <th className="text-right p-3 font-medium text-secondary-600 hidden sm:table-cell">التصنيف</th>
                  <th className="text-right p-3 font-medium text-secondary-600">السعر</th>
                  <th className="text-right p-3 font-medium text-secondary-600 hidden sm:table-cell">المخزون</th>
                  <th className="text-right p-3 font-medium text-secondary-600">الحالة</th>
                  <th className="text-right p-3 font-medium text-secondary-600">إجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-secondary-50">
                {filteredProducts.map((product) => (
                  <tr key={product.id} className="hover:bg-secondary-50/50">
                    <td className="p-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg overflow-hidden bg-secondary-100 shrink-0">
                          {product.image_url ? (
                            <img src={product.image_url} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-lg">🥖</div>
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium text-secondary-900 line-clamp-1 flex items-center gap-1">
                            {product.name_ar}
                            {product.is_bestseller && <Star className="w-3 h-3 text-accent-500 fill-accent-500 inline" />}
                            {product.is_new && <Sparkles className="w-3 h-3 text-success-500 inline" />}
                          </p>
                          <p className="text-xs text-secondary-500 line-clamp-1">{product.description_ar}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-3 text-secondary-600 hidden sm:table-cell">{product.category?.name_ar ?? '—'}</td>
                    <td className="p-3 font-bold text-primary-700">{formatPrice(product.price)}</td>
                    <td className="p-3 hidden sm:table-cell">
                      <span className={product.stock <= 5 ? 'text-error-600 font-medium' : 'text-secondary-600'}>
                        {product.stock}
                      </span>
                    </td>
                    <td className="p-3">
                      {product.is_available && product.stock > 0 ? (
                        <span className="badge bg-success-100 text-success-700">متوفر</span>
                      ) : (
                        <span className="badge bg-error-100 text-error-700">غير متوفر</span>
                      )}
                    </td>
                    <td className="p-3">
                      <div className="flex gap-1">
                        <button
                          onClick={() => { setEditing(product); setShowModal(true); }}
                          className="p-2 rounded-lg hover:bg-secondary-100 text-secondary-600"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(product.id)}
                          className="p-2 rounded-lg hover:bg-error-50 text-error-500"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {showModal && (
        <ProductModal
          product={editing}
          categories={categories}
          onClose={() => setShowModal(false)}
          onSaved={() => { setShowModal(false); fetchProducts(); }}
        />
      )}
    </div>
  );
}

function ProductModal({
  product,
  categories,
  onClose,
  onSaved,
}: {
  product: Product | null;
  categories: Category[];
  onClose: () => void;
  onSaved: () => void;
}) {
  const [form, setForm] = useState({
    name_ar: product?.name_ar ?? '',
    description_ar: product?.description_ar ?? '',
    price: product?.price ?? 0,
    category_id: product?.category_id ?? categories[0]?.id ?? '',
    stock: product?.stock ?? 0,
    image_url: product?.image_url ?? '',
    is_available: product?.is_available ?? true,
    is_bestseller: product?.is_bestseller ?? false,
    is_new: product?.is_new ?? false,
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSave = async () => {
    setSaving(true);
    setError(null);

    if (!form.name_ar.trim()) {
      setError('اسم المنتج مطلوب');
      setSaving(false);
      return;
    }

    const payload = {
      name_ar: form.name_ar,
      description_ar: form.description_ar || null,
      price: Number(form.price),
      category_id: form.category_id || null,
      stock: Number(form.stock),
      image_url: form.image_url || null,
      is_available: form.is_available,
      is_bestseller: form.is_bestseller,
      is_new: form.is_new,
    };

    let err;
    if (product) {
      ({ error: err } = await supabase.from('products').update(payload).eq('id', product.id));
    } else {
      ({ error: err } = await supabase.from('products').insert(payload));
    }

    if (err) setError(err.message);
    else onSaved();
    setSaving(false);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4 animate-fade-in" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between p-5 border-b border-secondary-100 sticky top-0 bg-white z-10">
          <h2 className="font-bold text-lg text-secondary-900">{product ? 'تعديل منتج' : 'منتج جديد'}</h2>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-secondary-100">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          <div>
            <label className="label">صورة المنتج</label>
            <ImageUploader url={form.image_url} onUpload={(url) => setForm({ ...form, image_url: url })} />
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="label">اسم المنتج *</label>
              <input type="text" value={form.name_ar} onChange={(e) => setForm({ ...form, name_ar: e.target.value })} className="input" />
            </div>
            <div>
              <label className="label">التصنيف</label>
              <select value={form.category_id} onChange={(e) => setForm({ ...form, category_id: e.target.value })} className="input">
                <option value="">بدون تصنيف</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name_ar}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="label">الوصف</label>
            <textarea value={form.description_ar} onChange={(e) => setForm({ ...form, description_ar: e.target.value })} className="input min-h-20 resize-y" />
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="label">السعر (ر.س) *</label>
              <input type="number" step="0.01" min="0" value={form.price} onChange={(e) => setForm({ ...form, price: parseFloat(e.target.value) || 0 })} className="input" dir="ltr" />
            </div>
            <div>
              <label className="label">الكمية المتاحة</label>
              <input type="number" min="0" value={form.stock} onChange={(e) => setForm({ ...form, stock: parseInt(e.target.value) || 0 })} className="input" dir="ltr" />
            </div>
          </div>

          <div className="flex flex-wrap gap-4">
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input type="checkbox" checked={form.is_available} onChange={(e) => setForm({ ...form, is_available: e.target.checked })} className="w-4 h-4 accent-primary-600" />
              متوفر للبيع
            </label>
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input type="checkbox" checked={form.is_bestseller} onChange={(e) => setForm({ ...form, is_bestseller: e.target.checked })} className="w-4 h-4 accent-primary-600" />
              الأكثر مبيعاً
            </label>
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input type="checkbox" checked={form.is_new} onChange={(e) => setForm({ ...form, is_new: e.target.checked })} className="w-4 h-4 accent-primary-600" />
              منتج جديد
            </label>
          </div>

          {error && <div className="bg-error-50 text-error-700 text-sm rounded-xl p-3">{error}</div>}
        </div>

        <div className="flex gap-3 p-5 border-t border-secondary-100 sticky bottom-0 bg-white">
          <button onClick={handleSave} disabled={saving} className="btn-primary flex-1">
            {saving ? 'جاري الحفظ...' : 'حفظ'}
          </button>
          <button onClick={onClose} className="btn-secondary">إلغاء</button>
        </div>
      </div>
    </div>
  );
}
