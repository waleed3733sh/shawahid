'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';

// الأسبوع الحالي يُحسب من تقويم الفصل — هنا قيمة افتراضية للعرض
const CURRENT_WEEK = 4;

export default function AlertsPage() {
  const [indicators, setIndicators] = useState<any[]>([]);
  const [evidence, setEvidence] = useState<Record<number, any[]>>({});
  const [pct, setPct] = useState(0);

  useEffect(() => {
    Promise.all([api.indicators(), api.evidence(), api.progress()]).then(
      ([i, e, p]) => {
        setIndicators(i);
        setEvidence(e || {});
        setPct(p.pct);
      },
    );
  }, []);

  const thisWeek = indicators.find((i) => i.weekNumber === CURRENT_WEEK);

  return (
    <div className="max-w-3xl space-y-4">
      {thisWeek && (
        <div className="rounded-2xl p-6 bg-gradient-to-l from-navy-800 to-navy-700 text-white">
          <div className="flex items-center gap-2 text-gold-400 text-sm mb-2">
            🔔 تنبيه الأسبوع {CURRENT_WEEK}
          </div>
          <h3 className="font-display text-xl font-extrabold mb-2">
            مهمة هذا الأسبوع: {thisWeek.titleAr}
          </h3>
          <p className="text-white/70 text-sm">
            نسبة إنجازك الحالية {pct}%. ارفع شواهد البند رقم {thisWeek.id} هذا
            الأسبوع للبقاء على المسار.
          </p>
          <Link
            href="/dashboard/evidence"
            className="inline-block mt-4 bg-gold-500 text-navy-900 font-bold px-4 py-2 rounded-xl text-sm"
          >
            رفع شاهد البند ←
          </Link>
        </div>
      )}
      <div className="bg-white border border-slate-100 rounded-2xl p-6">
        <h3 className="font-bold mb-4">جدول البنود على أسابيع الفصل</h3>
        <div className="space-y-2">
          {indicators.map((i) => {
            const c = (evidence[i.id] || []).length;
            const status =
              c > 0
                ? 'done'
                : i.weekNumber < CURRENT_WEEK
                  ? 'late'
                  : i.weekNumber === CURRENT_WEEK
                    ? 'now'
                    : 'soon';
            const badge: Record<string, [string, string]> = {
              done: ['مكتمل', 'bg-green-100 text-green-700'],
              late: ['متأخر', 'bg-red-100 text-red-600'],
              now: ['هذا الأسبوع', 'bg-gold-500/20 text-gold-600'],
              soon: ['قادم', 'bg-gray-100 text-slate-400'],
            };
            return (
              <div key={i.id} className="flex items-center gap-3 text-sm py-1">
                <span className="w-16 text-slate-400">أسبوع {i.weekNumber}</span>
                <span className="flex-1 font-medium">{i.titleAr}</span>
                <span
                  className={`text-xs px-2 py-1 rounded-full ${badge[status][1]}`}
                >
                  {badge[status][0]}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
