'use client';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

function token() {
  return typeof window !== 'undefined' ? localStorage.getItem('token') : null;
}

async function req(path: string, opts: RequestInit = {}) {
  const res = await fetch(`${API}${path}`, {
    ...opts,
    headers: {
      ...(opts.body && !(opts.body instanceof FormData)
        ? { 'Content-Type': 'application/json' }
        : {}),
      ...(token() ? { Authorization: `Bearer ${token()}` } : {}),
      ...(opts.headers || {}),
    },
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || 'حدث خطأ');
  }
  return res.status === 204 ? null : res.json();
}

export const api = {
  login: (accessCode: string) =>
    req('/auth/login', { method: 'POST', body: JSON.stringify({ accessCode }) }),
  me: () => req('/me'),
  updateMe: (data: any) =>
    req('/me', { method: 'PATCH', body: JSON.stringify(data) }),
  indicators: () => req('/indicators'),
  evidence: () => req('/evidence'),
  progress: () => req('/evidence/progress'),
  uploadEvidence: (indicatorId: number, file: File) => {
    const fd = new FormData();
    fd.append('file', file);
    return req(`/evidence/${indicatorId}`, { method: 'POST', body: fd });
  },
  deleteEvidence: (id: string) => req(`/evidence/${id}`, { method: 'DELETE' })
  // إعدادات الموقع
  settings: () => req('/settings'),
  updateSettings: (data: any) =>
    req('/settings', { method: 'PUT', body: JSON.stringify(data) }),
  updateIndicators: (items: any[]) =>
    req('/settings/indicators', {
      method: 'PUT',
      body: JSON.stringify({ items }),
    }),
  uploadLogo: (file: File) => {
    const fd = new FormData();
    fd.append('file', file);
    return req('/settings/logo', { method: 'POST', body: fd });
  createTeacher: (data: { fullName: string; mobile?: string }) =>
    req('/admin/teachers', { method: 'POST', body: JSON.stringify(data) }),
  listTeachers: () => req('/admin/teachers'),
  deleteTeacher: (id: string) =>
    req(`/admin/teachers/${id}`, { method: 'DELETE' }),
  },
  exportUrl: (format: 'docx' | 'pdf') => `${API}/export/${format}`,
};

export function downloadExport(format: 'docx' | 'pdf') {
  // التصدير يحتاج التوكن في الترويسة — نجلبه ثم ننزّله
  fetch(api.exportUrl(format), {
    headers: { Authorization: `Bearer ${token()}` },
  })
    .then((r) => r.blob())
    .then((blob) => {
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `ملف-الاداء.${format}`;
      a.click();
      URL.revokeObjectURL(url);
    });
}
