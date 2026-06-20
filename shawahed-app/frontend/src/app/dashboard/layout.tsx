'use client';
import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { downloadExport, api } from '@/lib/api';

// المسار والأيقونة ومفتاح التسمية
const NAV: [string, string, string][] = [
  ['/dashboard', 'الصفحة الرئيسية', '🏠'],
  ['/dashboard/indicators', 'labelIndicators', '📋'],
  ['/dashboard/profile', 'labelProfile', '👤'],
  ['/dashboard/evidence', 'labelEvidence', '📎'],
  ['/dashboard/progress', 'labelProgress', '📊'],
  ['/dashboard/alerts', 'labelAlerts', '🔔'],
  ['/dashboard/summary', 'labelSummary', '📄'],
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

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const path = usePathname();
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [cfg, setCfg] = useState<Record<string, string>>(DEFAULTS);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!localStorage.getItem('token')) router.push('/');
    else setReady(true);
    api.settings().then((s) => setCfg({ ...DEFAULTS, ...s })).catch(() => {});
  }, [router]);

  if (!ready) return null;
  const onSummary = path.endsWith('/summary');
  const label = (key: string) => (key.startsWith('/') || key.includes(' ') ? key : cfg[key]);
  const title = NAV.find(([h]) => h === path)?.[1] || '';

  const SidebarContent = (
    <>
      <div className="flex items-center gap-3 px-3 mb-8">
        {cfg.logoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={cfg.logoUrl} alt="" className="w-11 h-11 rounded-xl object-contain bg-white/10 p-1" />
        ) : (
          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-gold-400 to-gold-600 grid place-items-center text-royal-900 font-display font-extrabold text-xl">
            {(cfg.siteName || 'ش')[0]}
          </div>
        )}
        <div>
          <div className="font-display font-extrabold text-white">{cfg.siteName}</div>
          <div className="text-[10px] text-gold-400">ملف الأداء الوظيفي</div>
        </div>
      </div>
      <nav className="flex-1 space-y-1">
        {NAV.map(([href, key, icon]) => {
          const active = path === href;
          return (
            <Link key={href} href={href} onClick={() => setOpen(false)}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition ${
                active ? 'bg-white/15 text-white font-bold border-r-2 border-gold-400'
                       : 'text-white/70 hover:bg-white/10 hover:text-white'}`}>
              <span className="text-lg">{icon}</span>
              <span>{label(key)}</span>
            </Link>
          );
        })}
      </nav>
      <button onClick={() => { localStorage.clear(); router.push('/'); }}
        className="flex items-center gap-3 px-4 py-3 rounded-xl text-white/60 hover:bg-white/10">
        <span>↩</span><span>تسجيل الخروج</span>
      </button>
    </>
  );

  return (
    <div dir="rtl" className="flex min-h-screen font-sans bg-mist">
      {/* شريط جانبي ثابت — سطح المكتب */}
      <aside className="w-64 shrink-0 bg-gradient-to-b from-royal-900 to-royal-800 flex-col py-6 px-3 hidden lg:flex sticky top-0 h-screen">
        {SidebarContent}
      </aside>

      {/* شريط جانبي منزلق — الجوال */}
      {open && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="w-64 bg-gradient-to-b from-royal-900 to-royal-800 flex flex-col py-6 px-3">{SidebarContent}</div>
          <div className="flex-1 bg-black/40" onClick={() => setOpen(false)} />
        </div>
      )}

      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 bg-white/80 backdrop-blur border-b border-cloud flex items-center justify-between px-4 lg:px-8 sticky top-0 z-20">
          <div className="flex items-center gap-3">
            <button onClick={() => setOpen(true)} className="lg:hidden text-royal-800 text-xl">☰</button>
            <h2 className="font-display font-extrabold text-lg text-royal-800">{label(title)}</h2>
          </div>
          <div className="flex items-center gap-2">
            {onSummary && (
              <>
                <button onClick={() => downloadExport('pdf')}
                  className="text-sm border border-royal-700/20 text-royal-700 px-3 py-2 rounded-xl hover:bg-cloud">PDF</button>
                <button onClick={() => downloadExport('docx')}
                  className="text-sm border border-royal-700/20 text-royal-700 px-3 py-2 rounded-xl hover:bg-cloud">Word</button>
              </>
            )}
          </div>
        </header>
        <main className="flex-1 p-4 lg:p-8 max-w-7xl w-full">{children}</main>
      </div>
    </div>
  );
}
