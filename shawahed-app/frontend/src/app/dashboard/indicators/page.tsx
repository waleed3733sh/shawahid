'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';

export default function HomePage() {
  const router = useRouter();
  const [me, setMe] = useState<any>({});
  const [p, setP] = useState({ done: 0, total: 11, pct: 0 });
  const [evidence, setEvidence] = useState<Record<number, any[]>>({});

  useEffect(() => {
    Promise.all([api.me(), api.progress(), api.evidence()]).then(
      ([m, pr, e]) => {
        setMe(m);
        setP(pr);
        setEvidence(e || {});
      },
    );
  }, []);

  const totalImages = Object.values(evidence).reduce((a, arr) => a + arr.length, 0);
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'صباح الخير' : hour < 17 ? 'مساء الخير' : 'مساء الخير';

  const quick: [string, string, string, string][] = [
    ['البنود الـ١١', 'استعرض بنود الأداء', '/dashboard/indicators', '📋'],
    ['رفع الشواهد', 'أضف صور الإنجازات', '/dashboard/evidence', '📎'],
    ['ملخص العمل', 'صدّر ملفك الكامل', '/dashboard/summary', '📁'],
  ];

  return (
    <div className="space-y-6">
      {/* بطاقة الترحيب */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-navy-900 via-navy-800 to-navy-700 p-8 text-white shadow-card">
        <div className="absolute top-[-30%] left-[-10%] w-72 h-72 rounded-full bg-gold-500/10 blur-3xl" />
        <div className="absolute bottom-[-40%] right-[-5%] w-80 h-80 rounded-full bg-navy-500/20 blur-3xl" />
        <div className="relative">
          <p className="text-gold-300 text-sm font-bold mb-1">{greeting} 👋</p>
          <h1 className="font-display text-3xl font-extrabold mb-2">{me.fullName || 'مرحباً بك'}</h1>
          <p className="text-white/60 max-w-lg">
            {me.subject ? `${me.subject} · ${me.school || ''}` : 'أكمل ملف أدائك الوظيفي وتابع تقدّمك خطوة بخطوة'}
          </p>

          {/* شريط التقدم */}
          <div className="mt-6 max-w-md">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-white/70">نسبة اكتمال الملف</span>
              <span className="font-bold text-gold-300">{p.pct}%</span>
            </div>
            <div className="h-3 bg-white/10 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-l from-gold-400 to-gold-500 rounded-full transition-all duration-700"
                style={{ width: `${p.pct}%` }}
              />
            </div>
            <p className="text-xs text-white/50 mt-2">أكملت {p.done} من {p.total} بنود</p>
          </div>
        </div>
      </div>

      {/* إحصاءات سريعة */}
      <div className="grid grid-cols-3 gap-4">
        {[
          [p.pct + '%', 'نسبة الإنجاز', 'from-navy-600 to-navy-800'],
          [`${p.done}/${p.total}`, 'بنود مكتملة', 'from-navy-600 to-navy-800'],
          [totalImages, 'إجمالي الشواهد', 'from-gold-500 to-gold-600'],
        ].map(([v, l, grad]) => (
          <div key={l as string} className="bg-white rounded-2xl p-5 shadow-card border border-slate-50">
            <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${grad} mb-3`} />
            <div className="font-display text-2xl font-extrabold text-navy-900">{v}</div>
            <div className="text-xs text-slate-400 mt-1">{l}</div>
          </div>
        ))}
      </div>

      {/* روابط سريعة */}
      <div>
        <h2 className="font-display font-extrabold text-navy-900 mb-3">إجراءات سريعة</h2>
        <div className="grid sm:grid-cols-3 gap-4">
          {quick.map(([title, desc, href, icon]) => (
            <button
              key={href}
              onClick={() => router.push(href)}
              className="group text-right bg-white rounded-2xl p-5 shadow-card border border-slate-50 hover:border-navy-200 hover:shadow-glow transition-all"
            >
              <div className="text-2xl mb-3">{icon}</div>
              <div className="font-bold text-navy-900 group-hover:text-navy-700">{title}</div>
              <div className="text-sm text-slate-400 mt-1">{desc}</div>
              <div className="text-navy-500 text-sm font-bold mt-3 opacity-0 group-hover:opacity-100 transition">
                انتقل ←
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
