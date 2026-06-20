'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';

export default function HomePage() {
  const router = useRouter();
  const [me, setMe] = useState<any>(null);
  const [p, setP] = useState({ done: 0, total: 11, pct: 0 });
  const [evidence, setEvidence] = useState<Record<number, any[]>>({});

  useEffect(() => {
    Promise.all([api.me(), api.progress(), api.evidence()])
      .then(([m, pr, e]) => {
        setMe(m);
        setP(pr);
        setEvidence(e || {});
      })
      .catch(() => {});
  }, []);

  const totalImages = Object.values(evidence).reduce((a, arr) => a + arr.length, 0);
  const R = 64;
  const C = 2 * Math.PI * R;
  const greeting = new Date().getHours() < 12 ? 'صباح الخير' : 'مساء الخير';

  const quick: [string, string, string][] = [
    ['/dashboard/evidence', 'رفع الشواهد', '📎'],
    ['/dashboard/indicators', 'بنود الأداء', '📋'],
    ['/dashboard/summary', 'تصدير الملف', '📄'],
    ['/dashboard/profile', 'بياناتي', '👤'],
  ];

  return (
    <div className="space-y-6">
      {/* ترحيب */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-l from-royal-900 via-royal-800 to-royal-700 text-white p-8 shadow-glow">
        <div className="absolute -top-16 -left-16 w-64 h-64 rounded-full bg-gold-500/10 blur-2xl" />
        <div className="absolute bottom-0 right-1/4 w-40 h-40 rounded-full bg-royal-400/20 blur-2xl" />
        <div className="relative">
          <div className="text-gold-400 text-sm font-medium mb-1">{greeting}</div>
          <h1 className="font-display text-3xl font-extrabold mb-2">
            {me?.fullName || 'مرحباً بك'}
          </h1>
          <p className="text-white/70 max-w-lg leading-relaxed">
            هذه لوحتك لتوثيق شواهد الأداء الوظيفي. أكملت {p.done} من {p.total} بنود.
            {p.pct < 100 ? ' واصل رفع شواهدك لإكمال ملفك.' : ' ملفك مكتمل، أحسنت!'}
          </p>
        </div>
      </div>

      {/* بطاقات: حلقة التقدم + إحصاءات */}
      <div className="grid md:grid-cols-3 gap-5">
        <div className="bg-white rounded-3xl p-6 shadow-soft border border-cloud flex flex-col items-center justify-center">
          <div className="relative w-40 h-40">
            <svg viewBox="0 0 160 160" className="w-full h-full -rotate-90">
              <circle cx="80" cy="80" r={R} fill="none" stroke="#eaf1f8" strokeWidth="14" />
              <circle cx="80" cy="80" r={R} fill="none" stroke="url(#grad)" strokeWidth="14"
                strokeLinecap="round" strokeDasharray={C}
                strokeDashoffset={C * (1 - p.pct / 100)}
                style={{ transition: 'stroke-dashoffset 1s ease' }} />
              <defs>
                <linearGradient id="grad" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#2978c8" />
                  <stop offset="100%" stopColor="#d4a437" />
                </linearGradient>
              </defs>
            </svg>
            <div className="absolute inset-0 grid place-items-center">
              <div className="text-center">
                <div className="font-display text-4xl font-extrabold text-royal-800">{p.pct}%</div>
                <div className="text-xs text-gray-400">نسبة الإنجاز</div>
              </div>
            </div>
          </div>
        </div>

        <div className="md:col-span-2 grid grid-cols-2 gap-5">
          {[
            ['البنود المكتملة', `${p.done}/${p.total}`, '✓'],
            ['إجمالي الشواهد', totalImages, '📎'],
            ['بنود متبقية', p.total - p.done, '○'],
            ['الحالة', p.pct === 100 ? 'مكتمل' : 'قيد العمل', '◐'],
          ].map(([label, val, icon]) => (
            <div key={label} className="bg-white rounded-3xl p-6 shadow-soft border border-cloud flex flex-col justify-center">
              <div className="text-2xl mb-2 opacity-40">{icon}</div>
              <div className="font-display text-3xl font-extrabold text-royal-800">{val}</div>
              <div className="text-sm text-gray-400 mt-1">{label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* إجراءات سريعة */}
      <div>
        <h2 className="font-display font-bold text-lg text-royal-800 mb-3">إجراءات سريعة</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {quick.map(([href, label, icon]) => (
            <button
              key={href}
              onClick={() => router.push(href)}
              className="group bg-white rounded-2xl p-5 shadow-soft border border-cloud hover:border-royal-400 hover:shadow-glow transition text-right"
            >
              <div className="text-2xl mb-3">{icon}</div>
              <div className="font-bold text-royal-800 group-hover:text-royal-600">{label}</div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
