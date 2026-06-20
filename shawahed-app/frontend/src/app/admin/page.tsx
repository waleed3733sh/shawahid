'use client';
import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';

// حقول النصوص العامة
const TEXT_FIELDS: [string, string][] = [
  ['siteName', 'اسم الموقع'],
  ['tagline', 'الوصف المختصر'],
  ['logoUrl', 'رابط الشعار (Logo)'],
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
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const [savedAt, setSavedAt] = useState<string>('');

  useEffect(() => {
    if (localStorage.getItem('role') !== 'ADMIN') {
      router.push('/');
      return;
    }
    api.settings().then(setForm).catch(() => router.push('/'));
  }, [router]);

  const set = (k: string, v: string) => {
    setForm((f: any) => ({ ...f, [k]: v }));
    setDirty(true);
  };

  const save = useCallback(async () => {
    if (!form) return false;
    setSaving(true);
    try {
      await api.updateSettings(form);
      setDirty(false);
      setSavedAt(new Date().toLocaleTimeString('ar-SA'));
      return true;
    } finally {
      setSaving(false);
    }
  }, [form]);

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
          {form.logoUrl && (
            <div className="mt-4 flex items-center gap-3">
              <span className="text-sm text-gray-400">معاينة الشعار:</span>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={form.logoUrl}
                alt="logo"
                className="h-12 rounded-lg border border-gray-100"
              />
            </div>
          )}
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
