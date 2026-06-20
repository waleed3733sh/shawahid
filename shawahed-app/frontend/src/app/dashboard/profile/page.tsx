'use client';
import { useEffect, useState } from 'react';
import { api } from '@/lib/api';

const FIELDS: [string, string][] = [
  ['fullName', 'الاسم الكامل'],
  ['subject', 'المادة'],
  ['school', 'المدرسة'],
  ['stage', 'المرحلة'],
  ['mobile', 'رقم الجوال'],
  ['email', 'البريد الإلكتروني'],
];

export default function ProfilePage() {
  const [form, setForm] = useState<any>({});
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    api.me().then(setForm);
  }, []);

  async function save() {
    await api.updateMe(form);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <div className="max-w-3xl">
      <div className="bg-white border border-gray-100 rounded-2xl p-6 lg:p-8">
        <div className="flex items-center gap-4 mb-8 pb-6 border-b border-gray-100">
          <div className="w-16 h-16 rounded-2xl bg-royal-800 text-gold-500 grid place-items-center font-display text-2xl font-extrabold">
            ش
          </div>
          <div>
            <div className="font-display font-extrabold text-xl">
              {form.fullName}
            </div>
            <div className="text-gray-400 text-sm">
              كود المعلم: {form.accessCode}
            </div>
          </div>
        </div>
        <p className="text-sm text-gray-500 mb-6">
          تُعبّأ هذه البيانات تلقائياً في التقارير المُصدّرة.
        </p>
        <div className="grid sm:grid-cols-2 gap-5">
          {FIELDS.map(([key, label]) => (
            <div key={key}>
              <label className="block text-sm font-bold mb-2">{label}</label>
              <input
                value={form[key] || ''}
                onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-gold-500"
              />
            </div>
          ))}
        </div>
        <button
          onClick={save}
          className="mt-8 bg-royal-800 hover:bg-royal-700 text-white font-bold px-6 py-3 rounded-xl"
        >
          {saved ? 'تم الحفظ ✓' : 'حفظ بيانات المعلم'}
        </button>
      </div>
    </div>
  );
}
