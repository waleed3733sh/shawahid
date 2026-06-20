'use client';
import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { downloadExport, api } from '@/lib/api';

// المسار والأيقونة لكل خانة — التسمية تأتي من إعدادات الموقع
const NAV: [string, string, string][] = [
  ['/dashboard', 'labelIndicators', '📋'],
  ['/dashboard/profile', 'labelProfile', '👤'],
  ['/dashboard/evidence', 'labelEvidence', '🖼️'],
  ['/dashboard/progress', 'labelProgress', '📊'],
  ['/dashboard/alerts', 'labelAlerts', '🔔'],
  ['/dashboard/summary', 'labelSummary', '📁'],
];

const DEFAULTS: Record<string, string> = {
  siteName: 'شواهد',
  labelIndicators: 'بنود الأداء الوظيفي',
  labelProfile: 'بيانات المعلم',
  labelEvidence: 'الشواهد',
  labelProgress: 'التقدم',
  labelAlerts: 'التنبيهات',
  labelSummary: 'ملخص العمل',
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const path = usePathname();
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [cfg, setCfg] = useState<Record<string, string>>(DEFAULTS);

  useEffect(() => {
    if (!localStorage.getItem('token')) router.push('/');
    else setReady(true);
    // قراءة إعدادات الموقع — تعكس تعديلات المدير
    api.settings().then((s) => setCfg({ ...DEFAULTS, ...s })).catch(() => {});
  }, [router]);

  if (!ready) return null;
  const onSummary = path.endsWith('/summary');
  const accent = cfg.colorAccent || '#caa84a';
  const primary = cfg.colorPrimary || '#0f3d2e';

  return (
    <div dir="rtl" className="flex min-h-screen font-sans bg-sand">
      <aside
        className="w-64 shrink-0 text-white flex-col py-6 px-3 hidden lg:flex sticky top-0 h-screen"
        style={{ background: primary }}
      >
        <div className="flex items-center gap-3 px-3 mb-8">
          {cfg.logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={cfg.logoUrl} alt="logo" className="w-10 h-10 rounded-xl object-cover" />
          ) : (
            <div
              className="w-10 h-10 rounded-xl grid place-items-center font-display font-extrabold text-xl"
              style={{ background: accent, color: primary }}
            >
              {(cfg.siteName || 'ش')[0]}
            </div>
          )}
          <div className="font-display font-extrabold">{cfg.siteName}</div>
        </div>
        <nav className="flex-1 space-y-1">
          {NAV.map(([href, labelKey, icon]) => {
            const active = path === href;
            return (
              <Link
                key={href}
                href={href}
                className="flex items-center gap-3 px-4 py-3 rounded-xl transition"
                style={
                  active
                    ? { background: accent, color: primary, fontWeight: 700 }
                    : { color: 'rgba(255,255,255,.9)' }
                }
              >
                <span>{icon}</span>
                <span>{cfg[labelKey]}</span>
              </Link>
            );
          })}
        </nav>
        <button
          onClick={() => {
            localStorage.clear();
            router.push('/');
          }}
          className="text-right px-4 py-3 rounded-xl hover:bg-white/10 text-white/70"
        >
          ↩ تسجيل الخروج
        </button>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 bg-white border-b border-gray-100 flex items-center justify-between px-5 lg:px-8 sticky top-0 z-20">
          <h2 className="font-display font-extrabold text-lg" style={{ color: primary }}>
            {cfg[NAV.find(([h]) => h === path)?.[1] || ''] || 'لوحة التحكم'}
          </h2>
          <div className="flex items-center gap-2">
            {onSummary && (
              <>
                <button
                  onClick={() => downloadExport('pdf')}
                  className="text-sm border border-gray-200 text-forest-700 px-3 py-2 rounded-xl"
                >
                  ⬇ PDF
                </button>
                <button
                  onClick={() => downloadExport('docx')}
                  className="text-sm border border-gray-200 text-forest-700 px-3 py-2 rounded-xl"
                >
                  ⬇ Word
                </button>
              </>
            )}
            <button
              className="font-bold px-5 py-2 rounded-xl"
              style={{ background: accent, color: primary }}
            >
              حفظ التعديلات
            </button>
          </div>
        </header>
        <main className="flex-1 p-5 lg:p-8 max-w-7xl w-full">{children}</main>
      </div>
    </div>
  );
}
