'use client';
import { useEffect, useState } from 'react';
import { api } from '@/lib/api';

const DAYS = ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس'];
const PERIODS = ['الأولى', 'الثانية', 'الثالثة', 'الرابعة', 'الخامسة', 'السادسة', 'السابعة'];

type Row = { day: string; period: string; subject: string; className: string };

export default function SchedulePage() {
  const [rows, setRows] = useState<Row[]>([]);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    api.me().then((m) => {
      if (Array.isArray(m?.schedule)) setRows(m.schedule);
    });
  }, []);

  const addRow = () =>
    setRows((r) => [...r, { day: DAYS[0], period: PERIODS[0], subject: '', className: '' }]);
  const update = (i: number, key: keyof Row, val: string) =>
    setRows((r) => r.map((row, idx) => (idx === i ? { ...row, [key]: val } : row)));
  const remove = (i: number) => setRows((r) => r.filter((_, idx) => idx !== i));

  async function save() {
    await api.updateMe({ schedule: rows });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <div className="max-w-4xl space-y-5">
      <div className="bg-white rounded-2xl p-6 shadow-soft border border-cloud">
        <div className="flex items-center justify-between mb-1">
          <h3 className="font-bold text-royal-800">الجدول الدراسي</h3>
          <button
            onClick={addRow}
            className="text-sm bg-royal-700 text-white px-4 py-2 rounded-xl hover:bg-royal-800"
          >
            + إضافة حصة
          </button>
        </div>
        <p className="text-sm text-gray-500 mb-5">
          أضف حصصك وموادك العلمية. ستُضاف لاحقاً في ملف التصدير النهائي.
        </p>

        {rows.length === 0 ? (
          <div className="text-center text-gray-400 py-10 border-2 border-dashed border-cloud rounded-xl">
            لا توجد حصص بعد. اضغط «إضافة حصة» لتبدأ.
          </div>
        ) : (
          <div className="space-y-3">
            {rows.map((row, i) => (
              <div key={i} className="flex flex-wrap items-center gap-2 bg-mist rounded-xl p-3">
                <select
                  value={row.day}
                  onChange={(e) => update(i, 'day', e.target.value)}
                  className="border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white outline-none focus:border-royal-500"
                >
                  {DAYS.map((d) => <option key={d}>{d}</option>)}
                </select>
                <select
                  value={row.period}
                  onChange={(e) => update(i, 'period', e.target.value)}
                  className="border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white outline-none focus:border-royal-500"
                >
                  {PERIODS.map((p) => <option key={p}>الحصة {p}</option>)}
                </select>
                <input
                  value={row.subject}
                  onChange={(e) => update(i, 'subject', e.target.value)}
                  placeholder="المادة العلمية"
                  className="flex-1 min-w-[140px] border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-royal-500"
                />
                <input
                  value={row.className}
                  onChange={(e) => update(i, 'className', e.target.value)}
                  placeholder="الصف/الفصل"
                  className="w-28 border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-royal-500"
                />
                <button
                  onClick={() => remove(i)}
                  className="text-red-500 text-sm px-2"
                >
                  حذف
                </button>
              </div>
            ))}
          </div>
        )}

        <button
          onClick={save}
          className="mt-5 bg-royal-800 hover:bg-royal-700 text-white font-bold px-6 py-2.5 rounded-xl"
        >
          {saved ? 'تم الحفظ ✓' : 'حفظ الجدول'}
        </button>
      </div>
    </div>
  );
}
