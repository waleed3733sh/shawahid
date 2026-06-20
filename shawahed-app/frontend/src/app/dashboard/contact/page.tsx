'use client';
import { useEffect, useState } from 'react';
import { api } from '@/lib/api';

export default function ContactPage() {
  const [cfg, setCfg] = useState<any>(null);

  useEffect(() => {
    api.settings().then(setCfg).catch(() => {});
  }, []);

  if (!cfg) return null;

  // تنظيف رقم الجوال لرابط الاتصال
  const tel = (cfg.contactMobile || '').replace(/[^\d+]/g, '');

  const channels: {
    show: boolean;
    href: string;
    label: string;
    value: string;
    icon: string;
    bg: string;
  }[] = [
    {
      show: !!cfg.contactMobile,
      href: `tel:${tel}`,
      label: 'اتصال هاتفي',
      value: cfg.contactMobile,
      icon: '📞',
      bg: 'from-green-600 to-green-700',
    },
    {
      show: !!cfg.contactMobile,
      href: `https://wa.me/${tel.replace(/^0/, '966').replace(/^\+/, '')}`,
      label: 'واتساب',
      value: cfg.contactMobile,
      icon: '💬',
      bg: 'from-emerald-500 to-emerald-600',
    },
    {
      show: !!cfg.contactTwitter,
      href: cfg.contactTwitter,
      label: 'حساب X (تويتر)',
      value: 'زيارة الحساب',
      icon: '𝕏',
      bg: 'from-gray-800 to-black',
    },
    {
      show: !!cfg.contactTelegram,
      href: cfg.contactTelegram,
      label: 'تيليجرام',
      value: 'فتح المحادثة',
      icon: '✈️',
      bg: 'from-royal-500 to-royal-600',
    },
  ];

  const visible = channels.filter((c) => c.show);

  return (
    <div className="max-w-2xl space-y-5">
      <div className="bg-gradient-to-l from-royal-900 to-royal-700 text-white rounded-3xl p-8 shadow-glow">
        <h1 className="font-display text-2xl font-extrabold mb-2">تواصل معنا</h1>
        <p className="text-white/70">
          نحن هنا لمساعدتك. اختر وسيلة التواصل المناسبة.
        </p>
      </div>

      {visible.length === 0 ? (
        <div className="bg-cloud rounded-2xl p-8 text-center text-royal-700">
          لم تُضف بيانات تواصل بعد.
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 gap-4">
          {visible.map((c, i) => (
            <a
              key={i}
              href={c.href}
              target={c.href.startsWith('http') ? '_blank' : undefined}
              rel="noopener noreferrer"
              className={`bg-gradient-to-br ${c.bg} text-white rounded-2xl p-5 flex items-center gap-4 hover:scale-[1.02] transition shadow-soft`}
            >
              <span className="text-3xl">{c.icon}</span>
              <div>
                <div className="font-bold">{c.label}</div>
                <div className="text-white/80 text-sm" dir="ltr">
                  {c.value}
                </div>
              </div>
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
