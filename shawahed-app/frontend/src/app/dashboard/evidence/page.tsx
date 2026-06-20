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
  useEffect(() => { load(); }, []);

  async function onFile(indId: number, file?: File) {
    if (!file) return;
    setBusy(indId);
    setMsg('');
    try {
      await api.uploadEvidence(indId, file);
      await load();
    } catch (e: any) {
      setMsg(e.message);
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
        ارفع حتى ٤ صور لكل بند. يمكنك الاختيار من معرض الصور أو التقاط صورة جديدة.
      </p>
      {msg && (
        <div className="mb-4 bg-red-50 text-red-600 px-4 py-3 rounded-2xl text-sm flex items-center gap-2">
          <span>⚠</span>{msg}
        </div>
      )}
      <div className="space-y-4">
        {indicators.map((ind) => {
          const arr = evidence[ind.id] || [];
          const full = arr.length >= MAX;
          return (
            <div key={ind.id} className="bg-white border border-gray-50 rounded-3xl p-6 shadow-card">
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-royal-700 to-royal-900 text-gold-400 grid place-items-center font-bold text-sm">
                    {ind.id}
                  </div>
                  <h3 className="font-bold text-royal-900">{ind.titleAr}</h3>
                </div>
                <span className={`text-xs px-2.5 py-1 rounded-full font-bold ${full ? 'bg-gold-500/15 text-gold-600' : 'bg-gray-100 text-gray-400'}`}>
                  {arr.length}/{MAX}
                </span>
              </div>
              <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-3">
                {arr.map((img) => (
                  <div key={img.id} className="relative group aspect-square">
                    <img src={img.thumbUrl || img.imageUrl} className="w-full h-full object-cover rounded-2xl ring-1 ring-gray-100" />
                    <button
                      onClick={() => del(img.id)}
                      className="absolute top-1.5 left-1.5 bg-red-500 text-white w-6 h-6 rounded-full opacity-0 group-hover:opacity-100 transition shadow-lg"
                    >×</button>
                  </div>
                ))}
                {!full && (
                  <>
                    <input
                      ref={(el) => { inputs.current[ind.id] = el; }}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => onFile(ind.id, e.target.files?.[0])}
                    />
                    <button
                      disabled={busy === ind.id}
                      onClick={() => inputs.current[ind.id]?.click()}
                      className="aspect-square border-2 border-dashed border-royal-400 rounded-2xl grid place-items-center text-royal-400 hover:border-royal-400 hover:bg-royal-50/50 hover:text-royal-600 text-xs font-bold transition disabled:opacity-50"
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
