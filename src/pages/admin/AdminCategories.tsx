import { useEffect, useState, useCallback } from 'react';
import { Plus, Pencil, Trash2, Tags, X } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import type { Category } from '@/types';
import { LoadingSpinner, EmptyState } from '@/components/States';

export default function AdminCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [productCounts, setProductCounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);

  const fetchCategories = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase.from('categories').select('*').order('sort_order');
    const cats = (data ?? []) as Category[];
    setCategories(cats);

    // Count products per category
    const counts: Record<string, number> = {};
    await Promise.all(cats.map(async (cat) => {
      const { count } = await supabase
        .from('products')
        .select('*', { count: 'exact', head: true })
        .eq('category_id', cat.id);
      counts[cat.id] = count ?? 0;
    }));
    setProductCounts(counts);
    setLoading(false);
  }, []);

  useEffect(() => { fetchCategories(); }, [fetchCategories]);

  const handleDelete = async (id: string) => {
    if (!confirm('هل أنت متأكد من حذف هذا التصنيف؟')) return;
    const { error } = await supabase.from('categories').delete().eq('id', id);
    if (error) alert('فشل الحذف: ' + error.message);
    else fetchCategories();
  };

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display text-2xl font-bold text-secondary-900">إدارة التصنيفات</h1>
        <button onClick={() => { setEditing(null); setShowModal(true); }} className="btn-primary">
          <Plus className="w-4 h-4" /> تصنيف جديد
        </button>
      </div>

      {loading ? (
        <LoadingSpinner message="جاري تحميل التصنيفات..." />
      ) : categories.length === 0 ? (
        <EmptyState
          icon={<Tags className="w-8 h-8" />}
          title="لا توجد تصنيفات"
          message="ابدأ بإضافة تصنيفات لمنتجاتك"
          action={<button onClick={() => { setEditing(null); setShowModal(true); }} className="btn-primary">إضافة تصنيف</button>}
        />
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories.map((cat) => (
            <div key={cat.id} className="card p-5 flex items-center justify-between hover:shadow-md transition-shadow">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-2xl">🥐</span>
                  <h3 className="font-bold text-secondary-900">{cat.name_ar}</h3>
                </div>
                <p className="text-xs text-secondary-500">{productCounts[cat.id] ?? 0} منتج</p>
              </div>
              <div className="flex gap-1">
                <button onClick={() => { setEditing(cat); setShowModal(true); }} className="p-2 rounded-lg hover:bg-secondary-100 text-secondary-600">
                  <Pencil className="w-4 h-4" />
                </button>
                <button onClick={() => handleDelete(cat.id)} className="p-2 rounded-lg hover:bg-error-50 text-error-500">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <CategoryModal
          category={editing}
          onClose={() => setShowModal(false)}
          onSaved={() => { setShowModal(false); fetchCategories(); }}
        />
      )}
    </div>
  );
}

function CategoryModal({ category, onClose, onSaved }: { category: Category | null; onClose: () => void; onSaved: () => void }) {
  const [form, setForm] = useState({
    name_ar: category?.name_ar ?? '',
    name_en: category?.name_en ?? '',
    slug: category?.slug ?? '',
    sort_order: category?.sort_order ?? 0,
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSave = async () => {
    setSaving(true);
    setError(null);

    if (!form.name_ar.trim() || !form.slug.trim()) {
      setError('الاسم و الـ slug مطلوبان');
      setSaving(false);
      return;
    }

    const payload = {
      name_ar: form.name_ar,
      name_en: form.name_en || null,
      slug: form.slug,
      sort_order: Number(form.sort_order),
    };

    let err;
    if (category) {
      ({ error: err } = await supabase.from('categories').update(payload).eq('id', category.id));
    } else {
      ({ error: err } = await supabase.from('categories').insert(payload));
    }

    if (err) setError(err.message);
    else onSaved();
    setSaving(false);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4 animate-fade-in" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between p-5 border-b border-secondary-100">
          <h2 className="font-bold text-lg text-secondary-900">{category ? 'تعديل تصنيف' : 'تصنيف جديد'}</h2>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-secondary-100"><X className="w-5 h-5" /></button>
        </div>
        <div className="p-5 space-y-4">
          <div>
            <label className="label">الاسم (عربي) *</label>
            <input type="text" value={form.name_ar} onChange={(e) => setForm({ ...form, name_ar: e.target.value })} className="input" />
          </div>
          <div>
            <label className="label">الاسم (إنجليزي)</label>
            <input type="text" value={form.name_en} onChange={(e) => setForm({ ...form, name_en: e.target.value })} className="input" dir="ltr" />
          </div>
          <div>
            <label className="label">المعرف (slug) *</label>
            <input type="text" value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} className="input" dir="ltr" placeholder="bread, cake, etc." />
          </div>
          <div>
            <label className="label">ترتيب العرض</label>
            <input type="number" value={form.sort_order} onChange={(e) => setForm({ ...form, sort_order: parseInt(e.target.value) || 0 })} className="input" dir="ltr" />
          </div>
          {error && <div className="bg-error-50 text-error-700 text-sm rounded-xl p-3">{error}</div>}
        </div>
        <div className="flex gap-3 p-5 border-t border-secondary-100">
          <button onClick={handleSave} disabled={saving} className="btn-primary flex-1">{saving ? 'جاري الحفظ...' : 'حفظ'}</button>
          <button onClick={onClose} className="btn-secondary">إلغاء</button>
        </div>
      </div>
    </div>
  );
}
