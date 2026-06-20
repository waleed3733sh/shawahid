'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';

const FREQ: [string, string][] = [
  ['daily', 'يومي'],
  ['weekly', 'أسبوعي'],
  ['monthly', 'شهري'],
];

export default function AlertsPage() {
  const [indicators, setIndicators] = useState<any[]>([]);
  const [evidence, setEvidence] = useState<Record<number, any[]>>({});
  const [me, setMe] = useState<any>(null);
  const [start, setStart] = useState('');
  const [freq, setFreq] = useState('weekly');
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    Promise.all([api.indicators(), api.evidence(), api.me()]).then(
      ([i, e, m]) => {
        setIndicators(i);
        setEvidence(e || {});
        setMe(m);
        if (m?.semesterStart) setStart(m.semesterStart.slice(0, 10));
        if (m?.alertFrequency) setFreq(m.alertFrequency);
      },
    );
  }, []);

  async function save() {
    await api.updateMe({ semesterStart: start || null, alertFrequency: freq });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  // حساب الأسبوع الحالي من تاريخ بدء الفصل
  const currentWeek = (() => {
    if (!start) return null;
    const diff = Date.now() - new Date(start).getTime();
    const w = Math.floor(diff / (7 * 24 * 60 * 60 * 1000)) + 1;
    return w >= 1 && w <= 20 ? w : null;
  })();

  const thisWeekInd = currentWeek
    ? indicators.find((i) => i.weekNumber === currentWeek)
    : null;

  const freqLabel = FREQ.find(([v]) => v === freq)?.[1] || 'أسبوعي';

  return (
    <div className="max-w-3xl space-y-5">
      {/* إعدادات التنبيه */}
      <div className="bg-white rounded-2xl p-6 shadow-soft border border-cloud">
        <h3 className="font-bold text-royal-800 mb-4">إعدادات التنبيهات</h3>
        <div className="grid sm:grid-cols-2 gap-5">
          <div>
            <label className="block text-sm font-bold mb-2">
              تاريخ بدء الفصل الدراسي
            </label>
            <input
              type="date"
              value={start}
              onChange={(e) => setStart(e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 outline-none focus:border-royal-500"
            />
          </div>
          <div>
            <label className="block text-sm font-bold mb-2">تكرار التنبيه</label>
            <div className="flex gap-2">
              {FREQ.map(([val, label]) => (
                <button
                  key={val}
                  onClick={() => setFreq(val)}
                  className={`flex-1 py-2.5 rounded-xl text-sm font-bold border transition ${
                    freq === val
                      ? 'bg-royal-700 text-white border-royal-700'
                      : 'bg-white text-gray-500 border-gray-200 hover:border-royal-400'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>
        <button
          onClick={save}
          className="mt-5 bg-royal-800 hover:bg-royal-700 text-white font-bold px-6 py-2.5 rounded-xl"
        >
          {saved ? 'تم الحفظ ✓' : 'حفظ الإعدادات'}
        </button>
      </div>

      {/* تنبيه الأسبوع الحالي */}
      {!start ? (
        <div className="bg-cloud rounded-2xl p-6 text-center text-royal-700">
          حدّد تاريخ بدء الفصل الدراسي أعلاه لتفعيل التنبيهات.
        </div>
      ) : thisWeekInd ? (
        <div className="rounded-2xl p-6 bg-gradient-to-l from-royal-900 to-royal-700 text-white shadow-glow">
          <div className="flex items-center gap-2 text-gold-400 text-sm mb-2">
            🔔 تنبيه {freqLabel} · الأسبوع {currentWeek}
          </div>
          <h3 className="font-display text-xl font-extrabold mb-2">
            مهمة هذا الأسبوع: {thisWeekInd.titleAr}
          </h3>
          <p className="text-white/70 text-sm mb-4">
            ارفع شواهد البند رقم {thisWeekInd.id} للبقاء على المسار.
          </p>
          <Link
            href="/dashboard/evidence"
            className="inline-block bg-gold-500 text-royal-900 font-bold px-4 py-2 rounded-xl text-sm"
          >
            رفع شاهد البند ←
          </Link>
        </div>
      ) : (
        <div className="bg-cloud rounded-2xl p-6 text-center text-royal-700">
          لا توجد مهمة محدّدة لهذا الأسبوع — راجع جدول البنود أدناه.
        </div>
      )}

      {/* جدول البنود على الأسابيع */}
      <div className="bg-white rounded-2xl p-6 shadow-soft border border-cloud">
        <h3 className="font-bold text-royal-800 mb-4">جدول البنود على أسابيع الفصل</h3>
        <div className="space-y-2">
          {indicators.map((i) => {
            const c = (evidence[i.id] || []).length;
            let status: string;
            if (c > 0) status = 'done';
            else if (currentWeek && i.weekNumber < currentWeek) status = 'late';
            else if (currentWeek && i.weekNumber === currentWeek) status = 'now';
            else status = 'soon';
            const badge: Record<string, [string, string]> = {
              done: ['مكتمل', 'bg-green-100 text-green-700'],
              late: ['متأخر', 'bg-red-100 text-red-600'],
              now: ['هذا الأسبوع', 'bg-gold-400/30 text-gold-600'],
              soon: ['قادم', 'bg-gray-100 text-gray-400'],
            };
            return (
              <div key={i.id} className="flex items-center gap-3 text-sm py-1">
                <span className="w-16 text-gray-400">أسبوع {i.weekNumber}</span>
                <span className="flex-1 font-medium">{i.titleAr}</span>
                <span className={`text-xs px-2 py-1 rounded-full ${badge[status][1]}`}>
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
