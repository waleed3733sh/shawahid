'use client';
import { useEffect, useState } from 'react';
import { api } from '@/lib/api';

export default function SummaryPage() {
  const [me, setMe] = useState<any>({});
  const [p, setP] = useState({ done: 0, total: 11, pct: 0 });
  const [indicators, setIndicators] = useState<any[]>([]);
  const [evidence, setEvidence] = useState<Record<number, any[]>>({});

  useEffect(() => {
    Promise.all([
      api.me(),
      api.progress(),
      api.indicators(),
      api.evidence(),
    ]).then(([m, pr, i, e]) => {
      setMe(m);
      setP(pr);
      setIndicators(i);
      setEvidence(e || {});
    });
  }, []);

  const totalImages = Object.values(evidence).reduce(
    (a, arr) => a + arr.length,
    0,
  );
  const pending = indicators.filter((i) => !(evidence[i.id] || []).length);

  const cards: [string, string | number][] = [
    ['نسبة الإنجاز', p.pct + '%'],
    ['بنود مكتملة', `${p.done}/${p.total}`],
    ['إجمالي الشواهد', totalImages],
    ['بنود متبقية', pending.length],
  ];

  return (
    <div className="max-w-4xl">
      <div className="bg-white border border-gray-100 rounded-2xl p-8 mb-6">
        <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-gray-100">
          <div>
            <div className="font-display text-2xl font-extrabold">
              {me.fullName}
            </div>
            <div className="text-gray-400 text-sm">
              {me.subject} · {me.school} · {me.stage}
            </div>
          </div>
          <div className="w-14 h-14 rounded-2xl bg-royal-800 text-gold-500 grid place-items-center font-display text-xl font-extrabold">
            ش
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
          {cards.map(([l, v]) => (
            <div key={l} className="bg-mist rounded-xl p-4 text-center">
              <div className="font-display text-2xl font-extrabold text-royal-800">
                {v}
              </div>
              <div className="text-xs text-gray-500 mt-1">{l}</div>
            </div>
          ))}
        </div>
      </div>
      {pending.length ? (
        <div className="bg-white border border-gray-100 rounded-2xl p-6">
          <h3 className="font-bold mb-3 text-red-600">مهام بانتظار الإنجاز</h3>
          <div className="flex flex-wrap gap-2">
            {pending.map((i) => (
              <span
                key={i.id}
                className="text-sm bg-red-50 text-red-600 px-3 py-1 rounded-full"
              >
                {i.id}. {i.titleAr}
              </span>
            ))}
          </div>
        </div>
      ) : (
        <div className="bg-white border border-gray-100 rounded-2xl p-6 text-center text-green-700 font-bold">
          🎉 اكتمل ملف الأداء بالكامل
        </div>
      )}
      <p className="text-sm text-gray-400 mt-6">
        استخدم زرّي PDF و Word في الأعلى لتصدير الملف كاملاً مع الصور.
      </p>
    </div>
  );
}
