import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ShoppingBag, User, Mail, Phone, Lock, ArrowLeft } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

export default function AuthPage() {
  const { signIn, signUp } = useAuth();
  const navigate = useNavigate();
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [form, setForm] = useState({
    email: '',
    password: '',
    full_name: '',
    phone: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    if (mode === 'login') {
      const { error: err } = await signIn(form.email, form.password);
      if (err) {
        setError(err);
        setLoading(false);
      } else {
        navigate('/');
      }
    } else {
      const { error: err } = await signUp(form.email, form.password, form.full_name, form.phone);
      if (err) {
        setError(err);
        setLoading(false);
      } else {
        navigate('/');
      }
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-12 animate-fade-in bg-gradient-to-bl from-primary-50 to-secondary-50">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-primary-600 flex items-center justify-center mx-auto mb-4">
            <ShoppingBag className="w-8 h-8 text-white" />
          </div>
          <h1 className="font-display text-2xl font-bold text-secondary-900">
            {mode === 'login' ? 'تسجيل الدخول' : 'إنشاء حساب جديد'}
          </h1>
          <p className="text-secondary-500 text-sm mt-1">
            {mode === 'login' ? 'أدخل بياناتك للوصول إلى حسابك' : 'أنشئ حساباً للطلب ومتابعة طلباتك'}
          </p>
        </div>

        <div className="card p-6">
          {/* Tab buttons */}
          <div className="flex gap-1 bg-secondary-100 rounded-xl p-1 mb-6">
            <button
              onClick={() => setMode('login')}
              className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
                mode === 'login' ? 'bg-white text-primary-700 shadow-sm' : 'text-secondary-500'
              }`}
            >
              دخول
            </button>
            <button
              onClick={() => setMode('signup')}
              className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
                mode === 'signup' ? 'bg-white text-primary-700 shadow-sm' : 'text-secondary-500'
              }`}
            >
              حساب جديد
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'signup' && (
              <>
                <div>
                  <label className="label">الاسم الكامل</label>
                  <div className="relative">
                    <User className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-secondary-400" />
                    <input
                      type="text"
                      required
                      value={form.full_name}
                      onChange={(e) => setForm({ ...form, full_name: e.target.value })}
                      className="input pr-10"
                      placeholder="أدخل اسمك"
                    />
                  </div>
                </div>
                <div>
                  <label className="label">رقم الهاتف</label>
                  <div className="relative">
                    <Phone className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-secondary-400" />
                    <input
                      type="tel"
                      value={form.phone}
                      onChange={(e) => setForm({ ...form, phone: e.target.value })}
                      className="input pr-10"
                      placeholder="05xxxxxxxx"
                      dir="ltr"
                    />
                  </div>
                </div>
              </>
            )}
            <div>
              <label className="label">البريد الإلكتروني</label>
              <div className="relative">
                <Mail className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-secondary-400" />
                <input
                  type="email"
                  required
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="input pr-10"
                  placeholder="example@email.com"
                  dir="ltr"
                />
              </div>
            </div>
            <div>
              <label className="label">كلمة المرور</label>
              <div className="relative">
                <Lock className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-secondary-400" />
                <input
                  type="password"
                  required
                  minLength={6}
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  className="input pr-10"
                  placeholder="••••••••"
                  dir="ltr"
                />
              </div>
            </div>

            {error && (
              <div className="bg-error-50 border border-error-200 text-error-700 text-sm rounded-xl p-3">
                {error}
              </div>
            )}

            <button type="submit" disabled={loading} className="btn-primary w-full">
              {loading ? 'جاري...' : mode === 'login' ? 'دخول' : 'إنشاء الحساب'}
            </button>
          </form>

          {mode === 'login' && (
            <div className="mt-4 pt-4 border-t border-secondary-100 text-center text-sm text-secondary-500">
              <p>حساب المدير التجريبي:</p>
              <p dir="ltr" className="font-medium text-secondary-700 mt-1">admin@bakery.com / admin123456</p>
            </div>
          )}
        </div>

        <Link to="/" className="flex items-center justify-center gap-1 mt-4 text-sm text-secondary-500 hover:text-primary-600">
          <ArrowLeft className="w-4 h-4" /> العودة للرئيسية
        </Link>
      </div>
    </div>
  );
}
