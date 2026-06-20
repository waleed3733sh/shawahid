'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';

export default function IndicatorsPage() {
  const [indicators, setIndicators] = useState<any[]>([]);
  const [evidence, setEvidence] = useState<Record<number, any[]>>({});

  useEffect(() => {
    Promise.all([api.indicators(), api.evidence()]).then(([i, e]) => {
      setIndicators(i);
      setEvidence(e || {});
    });
  }, []);

  return (
    <div>
      <p className="text-gray-500 mb-6">
        بنود تقويم الأداء الوظيفي المعتمدة. ارفع شاهداً واحداً على الأقل لكل بند.
      </p>
      <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
        {indicators.map((i) => {
          const n = (evidence[i.id] || []).length;
          const done = n > 0;
          return (
            <div
              key={i.id}
              className="bg-white border border-gray-100 rounded-2xl p-5 flex flex-col gap-3"
            >
              <div className="flex items-start justify-between">
                <div className="w-9 h-9 rounded-lg bg-forest-800 text-gold-500 grid place-items-center font-display font-extrabold">
                  {i.id}
                </div>
                <span
                  className={`text-xs px-2 py-1 rounded-full ${
                    done
                      ? 'bg-green-50 text-green-700'
                      : 'bg-gray-100 text-gray-400'
                  }`}
                >
                  {done ? 'مكتمل' : 'بانتظار شاهد'}
                </span>
              </div>
              <h3 className="font-bold leading-snug">{i.titleAr}</h3>
              <div className="mt-auto flex items-center justify-between text-sm text-gray-400">
                <span>{n}/4 شواهد</span>
                <Link
                  href="/dashboard/evidence"
                  className="text-gold-600 font-bold"
                >
                  إدارة الشواهد ←
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
