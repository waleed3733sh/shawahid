'use client';
import { useEffect, useState } from 'react';
import { api } from '@/lib/api';

export default function ProgressPage() {
  const [p, setP] = useState({ done: 0, total: 11, pct: 0 });
  const [indicators, setIndicators] = useState<any[]>([]);
  const [evidence, setEvidence] = useState<Record<number, any[]>>({});

  useEffect(() => {
    Promise.all([api.progress(), api.indicators(), api.evidence()]).then(
      ([pr, i, e]) => {
        setP(pr);
        setIndicators(i);
        setEvidence(e || {});
      },
    );
  }, []);

  const R = 52;
  const C = 2 * Math.PI * R;

  return (
    <div className="max-w-3xl space-y-6">
      <div className="bg-white border border-gray-100 rounded-2xl p-8 text-center">
        <div className="relative w-44 h-44 mx-auto mb-6">
          <svg viewBox="0 0 120 120" className="w-full h-full -rotate-90">
            <circle
              cx="60"
              cy="60"
              r={R}
              fill="none"
              stroke="#eef1ee"
              strokeWidth="12"
            />
            <circle
              cx="60"
              cy="60"
              r={R}
              fill="none"
              stroke="#caa84a"
              strokeWidth="12"
              strokeLinecap="round"
              strokeDasharray={C}
              strokeDashoffset={C * (1 - p.pct / 100)}
              style={{ transition: 'stroke-dashoffset .8s' }}
            />
          </svg>
          <div className="absolute inset-0 grid place-items-center">
            <div>
              <div className="font-display text-4xl font-extrabold text-forest-800">
                {p.pct}%
              </div>
              <div className="text-xs text-gray-400">نسبة الإنجاز</div>
            </div>
          </div>
        </div>
        <p className="text-gray-600">
          أكملت <b className="text-forest-700">{p.done}</b> من أصل{' '}
          <b>{p.total}</b> بنود
        </p>
      </div>
      <div className="bg-white border border-gray-100 rounded-2xl p-6">
        <h3 className="font-bold mb-4">تفصيل البنود</h3>
        <div className="space-y-2">
          {indicators.map((i) => {
            const c = (evidence[i.id] || []).length;
            return (
              <div key={i.id} className="flex items-center gap-3 text-sm">
                <span
                  className={`w-6 h-6 rounded-md grid place-items-center text-xs font-bold ${
                    c > 0
                      ? 'bg-green-100 text-green-700'
                      : 'bg-gray-100 text-gray-400'
                  }`}
                >
                  {c > 0 ? '✓' : i.id}
                </span>
                <span className={`flex-1 ${c > 0 ? '' : 'text-gray-400'}`}>
                  {i.titleAr}
                </span>
                <span className="text-gray-400">{c}/4</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
