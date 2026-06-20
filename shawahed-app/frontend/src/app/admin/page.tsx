'use client';
import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';

// حقول النصوص العامة
const TEXT_FIELDS: [string, string][] = [
  ['siteName', 'اسم الموقع'],
  ['tagline', 'الوصف المختصر'],
  ['footerText', 'نص التذييل'],
];

// تسميات الخانات الست
const LABEL_FIELDS: [string, string][] = [
  ['labelIndicators', 'الخانة 1 · بنود الأداء'],
  ['labelProfile', 'الخانة 2 · بيانات المعلم'],
  ['labelEvidence', 'الخانة 3 · الشواهد'],
  ['labelProgress', 'الخانة 4 · التقدم'],
  ['labelAlerts', 'الخانة 5 · التنبيهات'],
  ['labelSummary', 'الخانة 6 · ملخص العمل'],
];

export default function AdminPage() {
  const router = useRouter();
  const [form, setForm] = useState<any>(null);
  const [indicators, setIndicators] = useState<any[]>([]);
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [savedAt, setSavedAt] = useState<string>('');

  useEffect(() => {
    if (localStorage.getItem('role') !== 'ADMIN') {
      router.push('/');
      return;
    }
    Promise.all([api.settings(), api.indicators()])
      .then(([s, inds]) => {
        setForm(s);
        setIndicators(inds);
      })
      .catch(() => router.push('/'));
  }, [router]);

  const set = (k: string, v: string) => {
    setForm((f: any) => ({ ...f, [k]: v }));
    setDirty(true);
  };

  const setIndicator = (id: number, key: string, v: any) => {
    setIndicators((arr) =>
      arr.map((i) => (i.id === id ? { ...i, [key]: v } : i)),
    );
    setDirty(true);
  };

  // رفع ملف الشعار مباشرةً
  const onLogoFile = async (file?: File) => {
    if (!file) return;
    setUploadingLogo(true);
    try {
      const { url } = await api.uploadLogo(file);
      set('logoUrl', url);
    } finally {
      setUploadingLogo(false);
    }
  };

  const save = useCallback(async () => {
    if (!form) return false;
    setSaving(true);
    try {
      await Promise.all([
        api.updateSettings(form),
        api.updateIndicators(
          indicators.map((i) => ({
            id: i.id,
            titleAr: i.titleAr,
            weekNumber: i.weekNumber,
          })),
        ),
      ]);
      setDirty(false);
      setSavedAt(new Date().toLocaleTimeString('ar-SA'));
      return true;
    } finally {
      setSaving(false);
    }
  }, [form, indicators]);

  // الحفظ الكامل عند الخروج
  const exitWithSave = async () => {
    if (dirty) await save();
    localStorage.clear();
    router.push('/');
  };

  // تنبيه المتصفح إن حاول المدير المغادرة وهناك تعديلات غير محفوظة
  useEffect(() => {
    const handler = (e: BeforeUnloadEvent) => {
      if (dirty) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [dirty]);

  if (!form)
    return (
      <div dir="rtl" className="min-h-screen grid place-items-center text-gray-400">
        جارٍ التحميل…
      </div>
    );

  return (
    <div dir="rtl" className="min-h-screen bg-sand font-sans pb-28">
      {/* الشريط العلوي */}
      <header className="h-16 bg-forest-900 text-white flex items-center justify-between px-5 lg:px-8 sticky top-0 z-30">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gold-500 grid place-items-center text-forest-900 font-extrabold">
            ⚙
          </div>
          <div>
            <div className="font-display font-extrabold leading-tight">
              إدارة الموقع
            </div>
            <div className="text-[10px] text-gold-400">
              التحكم بهوية الموقع وبياناته
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {/* زر الصفحة الرئيسية */}
          <button
            onClick={() => router.push('/dashboard')}
            className="text-sm bg-white/10 hover:bg-white/20 px-3 py-2 rounded-xl"
          >
            ⌂ الصفحة الرئيسية
          </button>
          {/* زر الخروج مع الحفظ الكامل */}
          <button
            onClick={exitWithSave}
            className="text-sm bg-white/10 hover:bg-white/20 px-3 py-2 rounded-xl"
          >
            ↩ خروج وحفظ
          </button>
        </div>
      </header>

      <main className="p-5 lg:p-8 max-w-4xl mx-auto space-y-6">
        {/* هوية الموقع */}
        <section className="bg-white border border-gray-100 rounded-2xl p-6">
          <h2 className="font-display font-extrabold text-lg text-forest-800 mb-1">
            هوية الموقع
          </h2>
          <p className="text-sm text-gray-500 mb-6">
            الاسم والوصف والشعار التي تظهر في كل صفحات الموقع.
          </p>
          <div className="grid sm:grid-cols-2 gap-5">
            {TEXT_FIELDS.map(([key, label]) => (
              <div key={key} className={key === 'tagline' ? 'sm:col-span-2' : ''}>
                <label className="block text-sm font-bold mb-2">{label}</label>
                <input
                  value={form[key] || ''}
                  onChange={(e) => set(key, e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-gold-500"
                />
              </div>
            ))}
          </div>
          {/* رفع ملف الشعار مباشرةً */}
          <div className="mt-5">
            <label className="block text-sm font-bold mb-2">شعار الموقع</label>
            <div className="flex items-center gap-4">
              {form.logoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={form.logoUrl}
                  alt="logo"
                  className="h-14 rounded-lg border border-gray-100 bg-sand p-1"
                />
              ) : (
                <div className="h-14 w-14 rounded-lg border border-dashed border-gray-300 grid place-items-center text-gray-300 text-xs">
                  لا شعار
                </div>
              )}
              <label className="cursor-pointer text-sm border border-forest-700/20 text-forest-700 px-4 py-2 rounded-xl hover:bg-sand">
                {uploadingLogo ? 'جارٍ الرفع…' : 'اختر صورة الشعار'}
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => onLogoFile(e.target.files?.[0])}
                />
              </label>
              {form.logoUrl && (
                <button
                  onClick={() => set('logoUrl', '')}
                  className="text-sm text-red-500"
                >
                  إزالة
                </button>
              )}
            </div>
          </div>
        </section>

        {/* الألوان */}
        <section className="bg-white border border-gray-100 rounded-2xl p-6">
          <h2 className="font-display font-extrabold text-lg text-forest-800 mb-1">
            ألوان الموقع
          </h2>
          <p className="text-sm text-gray-500 mb-6">
            اللون الأساسي واللون المميِّز المستخدمان في الواجهة.
          </p>
          <div className="flex flex-wrap gap-6">
            {[
              ['colorPrimary', 'اللون الأساسي'],
              ['colorAccent', 'اللون المميِّز'],
            ].map(([key, label]) => (
              <div key={key} className="flex items-center gap-3">
                <input
                  type="color"
                  value={form[key]}
                  onChange={(e) => set(key, e.target.value)}
                  className="w-12 h-12 rounded-lg border border-gray-200 cursor-pointer"
                />
                <div>
                  <div className="text-sm font-bold">{label}</div>
                  <div className="text-xs text-gray-400 font-mono">
                    {form[key]}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* تسميات الخانات الست */}
        <section className="bg-white border border-gray-100 rounded-2xl p-6">
          <h2 className="font-display font-extrabold text-lg text-forest-800 mb-1">
            عناوين الخانات الست
          </h2>
          <p className="text-sm text-gray-500 mb-6">
            النصوص التي تظهر في قائمة لوحة المعلم.
          </p>
          <div className="grid sm:grid-cols-2 gap-5">
            {LABEL_FIELDS.map(([key, label]) => (
              <div key={key}>
                <label className="block text-sm font-bold mb-2 text-gray-500">
                  {label}
                </label>
                <input
                  value={form[key] || ''}
                  onChange={(e) => set(key, e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-gold-500"
                />
              </div>
            ))}
          </div>
        </section>

        {/* تعديل البنود الـ11 */}
        <section className="bg-white border border-gray-100 rounded-2xl p-6">
          <h2 className="font-display font-extrabold text-lg text-forest-800 mb-1">
            بنود الأداء الـ ١١
          </h2>
          <p className="text-sm text-gray-500 mb-6">
            عدّل نص كل بند والأسبوع المرتبط به. تظهر مباشرةً للمعلمين.
          </p>
          <div className="space-y-3">
            {indicators.map((ind) => (
              <div key={ind.id} className="flex items-center gap-3">
                <span className="w-8 h-8 shrink-0 rounded-lg bg-forest-800 text-gold-500 grid place-items-center font-bold text-sm">
                  {ind.id}
                </span>
                <input
                  value={ind.titleAr}
                  onChange={(e) =>
                    setIndicator(ind.id, 'titleAr', e.target.value)
                  }
                  className="flex-1 border border-gray-200 rounded-xl px-4 py-2 outline-none focus:border-gold-500"
                />
                <div className="flex items-center gap-1 shrink-0">
                  <span className="text-xs text-gray-400">أسبوع</span>
                  <input
                    type="number"
                    min={1}
                    max={20}
                    value={ind.weekNumber ?? ''}
                    onChange={(e) =>
                      setIndicator(
                        ind.id,
                        'weekNumber',
                        Number(e.target.value),
                      )
                    }
                    className="w-16 border border-gray-200 rounded-xl px-2 py-2 text-center outline-none focus:border-gold-500"
                  />
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>

      {/* شريط الحفظ السفلي الثابت */}
      <div className="fixed bottom-0 inset-x-0 bg-white border-t border-gray-100 px-5 lg:px-8 py-4 flex items-center justify-between z-30">
        <span className="text-sm text-gray-400">
          {dirty
            ? 'لديك تعديلات غير محفوظة'
            : savedAt
              ? `آخر حفظ: ${savedAt}`
              : 'لا توجد تعديلات'}
        </span>
        <button
          onClick={save}
          disabled={saving || !dirty}
          className="bg-gold-500 hover:bg-gold-600 text-forest-900 font-bold px-6 py-2 rounded-xl disabled:opacity-40"
        >
          {saving ? 'جارٍ الحفظ…' : 'حفظ التعديلات'}
        </button>
      </div>
    </div>
  );
}
