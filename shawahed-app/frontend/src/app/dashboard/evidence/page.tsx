'use client';
import { useEffect, useState, useRef } from 'react';
import { api } from '@/lib/api';

const MAX = 4;

export default function EvidencePage() {
  const [indicators, setIndicators] = useState<any[]>([]);
  const [evidence, setEvidence] = useState<Record<number, any[]>>({});
  const [busy, setBusy] = useState<number | null>(null);
  const [msg, setMsg] = useState('');
  const inputs = useRef<Record<number, HTMLInputElement | null>>({});

  async function load() {
    const [inds, ev] = await Promise.all([api.indicators(), api.evidence()]);
    setIndicators(inds);
    setEvidence(ev || {});
  }
  useEffect(() => {
    load();
  }, []);

  async function onFile(indId: number, file?: File) {
    if (!file) return;
    setBusy(indId);
    setMsg('');
    try {
      await api.uploadEvidence(indId, file); // الخادم يرفض ما يتجاوز 4
      await load();
    } catch (e: any) {
      setMsg(e.message); // مثال: "الحد الأقصى 4 صور لكل بند"
    } finally {
      setBusy(null);
    }
  }

  async function del(id: string) {
    await api.deleteEvidence(id);
    load();
  }

  return (
    <div>
      <p className="text-gray-500 mb-6">
        ارفع حتى ٤ صور لكل بند من الجوال أو الحاسب.
      </p>
      {msg && (
        <div className="mb-4 bg-red-50 text-red-600 px-4 py-2 rounded-xl text-sm">
          {msg}
        </div>
      )}
      <div className="space-y-4">
        {indicators.map((ind) => {
          const arr = evidence[ind.id] || [];
          const full = arr.length >= MAX;
          return (
            <div
              key={ind.id}
              className="bg-white border border-gray-100 rounded-2xl p-5"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-forest-800 text-gold-500 grid place-items-center font-bold text-sm">
                    {ind.id}
                  </div>
                  <h3 className="font-bold">{ind.titleAr}</h3>
                </div>
                <span
                  className={`text-sm ${full ? 'text-red-500' : 'text-gray-400'}`}
                >
                  {arr.length}/{MAX}
                </span>
              </div>
              <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-3">
                {arr.map((img) => (
                  <div key={img.id} className="relative group aspect-square">
                    <img
                      src={img.thumbUrl || img.imageUrl}
                      className="w-full h-full object-cover rounded-lg"
                    />
                    <button
                      onClick={() => del(img.id)}
                      className="absolute top-1 left-1 bg-red-600 text-white w-6 h-6 rounded-full opacity-0 group-hover:opacity-100"
                    >
                      ×
                    </button>
                  </div>
                ))}
                {!full && (
                  <>
                    <input
                      ref={(el) => {
  inputs.current[ind.id] = el;
}}
                      type="file"
                      accept="image/*"
                      capture="environment"
                      className="hidden"
                      onChange={(e) => onFile(ind.id, e.target.files?.[0])}
                    />
                    <button
                      disabled={busy === ind.id}
                      onClick={() => inputs.current[ind.id]?.click()}
                      className="aspect-square border-2 border-dashed border-gold-500/40 rounded-lg grid place-items-center text-gold-600 hover:bg-gold-500/5 text-sm disabled:opacity-50"
                    >
                      {busy === ind.id ? '...' : '+ إضافة'}
                    </button>
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
