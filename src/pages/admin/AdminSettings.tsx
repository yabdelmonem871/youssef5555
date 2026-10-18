import { useState, useEffect } from 'react';
import { Save, Store, Check } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useShop } from '@/contexts/ShopContext';
import type { ShopSettings } from '@/types';
import { LoadingSpinner } from '@/components/States';
import { ImageUploader } from '@/components/ImageUploader';

export default function AdminSettings() {
  const { settings, refresh } = useShop();
  const [form, setForm] = useState<ShopSettings | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (settings) setForm(settings);
  }, [settings]);

  if (!form) return <LoadingSpinner message="جاري تحميل الإعدادات..." />;

  const handleSave = async () => {
    setSaving(true);
    const { error } = await supabase
      .from('shop_settings')
      .update({
        shop_name: form.shop_name,
        shop_name_en: form.shop_name_en,
        logo_url: form.logo_url,
        phone: form.phone,
        address: form.address,
        delivery_fee: Number(form.delivery_fee),
        is_open: form.is_open,
        opening_time: form.opening_time,
        closing_time: form.closing_time,
        about_ar: form.about_ar,
        updated_at: new Date().toISOString(),
      })
      .eq('id', form.id);

    if (!error) {
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
      refresh();
    }
    setSaving(false);
  };

  return (
    <div className="animate-fade-in max-w-3xl">
      <h1 className="font-display text-2xl font-bold text-secondary-900 mb-6">إعدادات المحل</h1>

      <div className="space-y-6">
        {/* Shop info */}
        <div className="card p-6">
          <h2 className="font-bold text-lg text-secondary-900 mb-4 flex items-center gap-2">
            <Store className="w-5 h-5 text-primary-600" /> معلومات المحل
          </h2>

          <div className="space-y-4">
            <div>
              <label className="label">شعار المحل</label>
              <ImageUploader url={form.logo_url} onUpload={(url) => setForm({ ...form, logo_url: url })} />
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="label">اسم المحل (عربي)</label>
                <input type="text" value={form.shop_name} onChange={(e) => setForm({ ...form, shop_name: e.target.value })} className="input" />
              </div>
              <div>
                <label className="label">اسم المحل (إنجليزي)</label>
                <input type="text" value={form.shop_name_en ?? ''} onChange={(e) => setForm({ ...form, shop_name_en: e.target.value })} className="input" dir="ltr" />
              </div>
            </div>
            <div>
              <label className="label">نبذة عن المحل</label>
              <textarea value={form.about_ar ?? ''} onChange={(e) => setForm({ ...form, about_ar: e.target.value })} className="input min-h-24 resize-y" />
            </div>
          </div>
        </div>

        {/* Contact */}
        <div className="card p-6">
          <h2 className="font-bold text-lg text-secondary-900 mb-4">معلومات التواصل</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="label">رقم الهاتف</label>
              <input type="tel" value={form.phone ?? ''} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="input" dir="ltr" />
            </div>
            <div>
              <label className="label">العنوان</label>
              <input type="text" value={form.address ?? ''} onChange={(e) => setForm({ ...form, address: e.target.value })} className="input" />
            </div>
          </div>
        </div>

        {/* Operations */}
        <div className="card p-6">
          <h2 className="font-bold text-lg text-secondary-900 mb-4">إعدادات التشغيل</h2>
          <div className="space-y-4">
            <div className="grid sm:grid-cols-3 gap-4">
              <div>
                <label className="label">رسوم التوصيل (ر.س)</label>
                <input type="number" step="0.01" min="0" value={form.delivery_fee} onChange={(e) => setForm({ ...form, delivery_fee: parseFloat(e.target.value) || 0 })} className="input" dir="ltr" />
              </div>
              <div>
                <label className="label">وقت الافتتاح</label>
                <input type="time" value={form.opening_time} onChange={(e) => setForm({ ...form, opening_time: e.target.value })} className="input" dir="ltr" />
              </div>
              <div>
                <label className="label">وقت الإغلاق</label>
                <input type="time" value={form.closing_time} onChange={(e) => setForm({ ...form, closing_time: e.target.value })} className="input" dir="ltr" />
              </div>
            </div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={form.is_open}
                onChange={(e) => setForm({ ...form, is_open: e.target.checked })}
                className="w-5 h-5 accent-primary-600"
              />
              <span className="text-sm font-medium text-secondary-700">المحل مفتوح حالياً</span>
            </label>
          </div>
        </div>

        {/* Save button */}
        <div className="flex justify-end gap-3">
          {saved && (
            <span className="flex items-center gap-1 text-success-600 text-sm font-medium animate-fade-in">
              <Check className="w-4 h-4" /> تم الحفظ بنجاح
            </span>
          )}
          <button onClick={handleSave} disabled={saving} className="btn-primary">
            <Save className="w-4 h-4" /> {saving ? 'جاري الحفظ...' : 'حفظ التغييرات'}
          </button>
        </div>
      </div>
    </div>
  );
}
