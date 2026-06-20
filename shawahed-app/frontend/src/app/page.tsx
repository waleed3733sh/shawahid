'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';

export default function LoginPage() {
  const [code, setCode] = useState('');
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(false);
  const [cfg, setCfg] = useState<any>({ siteName: 'شواهد', tagline: 'منصة توثيق الأداء الوظيفي للمعلمين' });
  const router = useRouter();

  useEffect(() => {
    api.settings().then((s) => setCfg((c: any) => ({ ...c, ...s }))).catch(() => {});
  }, []);

  async function submit() {
    if (!code.trim()) return;
    setErr('');
    setLoading(true);
    try {
      const { token, profile } = await api.login(code.trim());
      localStorage.setItem('token', token);
      localStorage.setItem('role', profile.role);
      router.push(profile.role === 'ADMIN' ? '/admin' : '/dashboard');
    } catch (e: any) {
      setErr(e.message || 'الكود غير صحيح');
      setLoading(false);
    }
  }

  return (
    <div dir="rtl" className="min-h-screen flex font-sans">
      {/* اللوحة البصرية */}
      <div className="hidden md:flex md:w-1/2 bg-gradient-to-br from-royal-900 via-royal-800 to-royal-700 text-white flex-col justify-between p-12 relative overflow-hidden">
        <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-gold-500/10 blur-3xl" />
        <div className="absolute bottom-0 left-0 w-80 h-80 rounded-full bg-royal-400/20 blur-3xl" />
        <div className="relative flex items-center gap-3">
          {cfg.logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={cfg.logoUrl} alt="" className="w-12 h-12 rounded-2xl object-contain bg-white/10 p-1" />
          ) : (
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-gold-400 to-gold-600 grid place-items-center text-royal-900 font-display font-extrabold text-2xl">
              {(cfg.siteName || 'ش')[0]}
            </div>
          )}
          <span className="font-display text-2xl font-extrabold">{cfg.siteName}</span>
        </div>

        <div className="relative">
          <div className="text-gold-400 text-sm font-medium mb-3">منصة احترافية لتوثيق الأداء</div>
          <h1 className="font-display text-5xl font-extrabold leading-tight mb-5">
            وثّق تميّزك<br />المهني بإتقان
          </h1>
          <p className="text-white/70 leading-relaxed max-w-md">
            {cfg.tagline} — أدر بنود الأداء الـ١١، ارفع شواهدك، تابع نسبة إنجازك،
            وصدّر ملف أداء كامل بصيغة Word و PDF.
          </p>
          <div className="flex gap-8 mt-10">
            {[['١١', 'بنداً وظيفياً'], ['٤', 'شواهد لكل بند'], ['PDF', 'تصدير احترافي']].map(([n, l]) => (
              <div key={l}>
                <div className="font-display text-3xl font-extrabold text-gold-400">{n}</div>
                <div className="text-xs text-white/60 mt-1">{l}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="relative text-xs text-white/40">{cfg.footerText || 'وزارة التعليم · المملكة العربية السعودية'}</div>
      </div>

      {/* نموذج الدخول */}
      <div className="w-full md:w-1/2 flex items-center justify-center p-8 bg-mist">
        <div className="w-full max-w-sm">
          <div className="md:hidden flex items-center gap-3 mb-10 justify-center">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-royal-700 to-royal-900 grid place-items-center text-gold-400 font-display font-extrabold text-2xl">
              {(cfg.siteName || 'ش')[0]}
            </div>
            <span className="font-display text-2xl font-extrabold text-royal-800">{cfg.siteName}</span>
          </div>

          <h2 className="font-display text-3xl font-extrabold text-royal-900 mb-2">تسجيل الدخول</h2>
          <p className="text-gray-500 mb-8">أدخل الكود الخاص بك للوصول إلى ملف أدائك</p>

          <label className="block text-sm font-bold mb-2 text-royal-800">الكود الخاص</label>
          <input
            value={code}
            onChange={(e) => setCode(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && submit()}
            placeholder="مثال: T-1024"
            className="w-full border-2 border-cloud rounded-2xl px-4 py-3.5 text-center tracking-widest font-bold outline-none focus:border-royal-500 transition bg-white"
          />
          {err && <p className="text-red-600 text-sm mt-2">{err}</p>}

          <button
            onClick={submit}
            disabled={loading}
            className="w-full bg-gradient-to-l from-royal-800 to-royal-600 hover:from-royal-900 hover:to-royal-700 text-white font-bold py-3.5 rounded-2xl mt-5 shadow-glow transition disabled:opacity-60"
          >
            {loading ? 'جارٍ الدخول…' : 'الدخول إلى المنصة'}
          </button>
        </div>
      </div>
    </div>
  );
}
