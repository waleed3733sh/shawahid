'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';

export default function LoginPage() {
  const [code, setCode] = useState('');
  const [err, setErr] = useState('');
  const router = useRouter();

  async function submit() {
    setErr('');
    try {
      const { token, profile } = await api.login(code);
      localStorage.setItem('token', token);
      localStorage.setItem('role', profile.role);
      // التوجيه حسب الدور — لوحة الإدارة معزولة بدور ADMIN على الخادم
      router.push(profile.role === 'ADMIN' ? '/admin' : '/dashboard');
    } catch (e: any) {
      setErr(e.message || 'الكود غير صحيح');
    }
  }

  return (
    <div dir="rtl" className="min-h-screen flex font-sans">
      <div className="hidden md:flex md:w-1/2 bg-forest-800 text-white flex-col justify-center p-12">
        <h1 className="font-display text-4xl font-extrabold mb-4">
          وثّق شواهد أدائك في مكان واحد
        </h1>
        <p className="text-white/70 leading-relaxed max-w-md">
          منصة احترافية لإدارة بنود الأداء الوظيفي الـ ١١، رفع الشواهد، متابعة
          نسبة الإنجاز، وتصدير ملف أداء كامل بصيغة Word و PDF.
        </p>
      </div>
      <div className="w-full md:w-1/2 flex items-center justify-center p-8 bg-cream">
        <div className="w-full max-w-sm">
          <h2 className="font-display text-3xl font-extrabold mb-1">
            تسجيل الدخول
          </h2>
          <p className="text-gray-500 mb-8">أدخل الكود الخاص بك</p>
          <input
            value={code}
            onChange={(e) => setCode(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && submit()}
            placeholder="مثال: T-1024"
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-center tracking-widest font-bold outline-none focus:border-gold-500"
          />
          {err && <p className="text-red-600 text-sm mt-2">{err}</p>}
          <button
            onClick={submit}
            className="w-full bg-forest-800 hover:bg-forest-700 text-white font-bold py-3 rounded-xl mt-4"
          >
            الدخول إلى لوحة التحكم
          </button>
        </div>
      </div>
    </div>
  );
}
