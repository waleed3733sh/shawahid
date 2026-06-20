# شواهد · منصة توثيق الأداء الوظيفي للمعلمين

منصة احترافية لإدارة وتوثيق **بنود الأداء الوظيفي الـ ١١** المعتمدة من وزارة التعليم السعودية.

---

## ⚠️ قبل الإطلاق

البنود الـ ١١ في ملف `backend/prisma/seed.ts` **تقديرية**. راجع الصياغة الرسمية الحديثة من نموذج تقويم الأداء الوظيفي بالوزارة وحدّثها هناك — تتغيّر بين الدورات.

---

## البنية

```
shawahed-app/
├── backend/          NestJS + Prisma + PostgreSQL
│   ├── prisma/
│   │   ├── schema.prisma     مخطط قاعدة البيانات
│   │   └── seed.ts           البنود الـ11 + معلمون تجريبيون
│   └── src/
│       ├── auth/             الدخول بالكود + JWT + حارس الأدوار
│       ├── teachers/         الملف الشخصي + قائمة الإدارة
│       ├── evidence/         رفع الشواهد (فرض حد 4 صور)
│       ├── indicators/       البنود
│       └── export/           تصدير Word + PDF
└── frontend/         Next.js 15 (App Router)
    └── src/
        ├── app/              الصفحات (دخول، لوحة معلم، إدارة)
        └── lib/api.ts        عميل الـ API
```

## التشغيل

### الخادم
```bash
cd backend
cp .env.example .env          # عبّئ DATABASE_URL و JWT_SECRET و BLOB_READ_WRITE_TOKEN
npm install
npx prisma migrate dev        # إنشاء الجداول
npx prisma db seed            # تهيئة البنود والمعلمين
npm run start:dev             # المنفذ 4000
```

### الواجهة
```bash
cd frontend
cp .env.local.example .env.local
npm install
npm run dev                   # المنفذ 3000
```

أكواد التجربة: معلم `T-1024` · إدارة `MOE-ADMIN-9000`

---

## كيف عُولجت المتطلبات الثلاثة

### 1. حد الـ 4 صور لكل بند (الخادم هو الفاصل)
يُفرض في `evidence.service.ts` داخل **معاملة** (`$transaction`): يُعدّ الموجود ثم يقارن بـ 4 قبل الإنشاء — يمنع التجاوز حتى مع الرفع المتزامن. الواجهة تخفي زر الإضافة عند الوصول للحد، لكنها **لا** تُعتمد للأمان. الفهرس `@@index([teacherId, indicatorId])` يسرّع العدّ.

### 2. عزل لوحة الإدارة (حماية فعلية لا إخفاء)
`auth.guard.ts` يتحقق من `role === 'ADMIN'` على الخادم لكل مسار يحمل `@AdminOnly()`. إخفاء الرابط ليس أماناً — الحارس هو ما يحمي فعلاً.

### 3. التصدير (Word + PDF)
- **Word:** `docx-export.service.ts` عبر `docx-js` مع `bidirectional: true` و `rightToLeft` لكل نص عربي — غلاف يُعبّأ من بيانات المعلم تلقائياً، ثم قسم لكل بند بصوره في شبكة 2×2.
- **PDF:** `pdf-export.service.ts` عبر Puppeteer على قالب HTML بخط Tajawal/Cairo — أفضل تشكيل عربي من pdfkit.
- **مهم:** جلب بايتات الصور يتم **خادمياً** عبر `storage.fetchBytes` لتجنّب قيود CORS التي تظهر في المتصفح.

---

## التخزين
الصور تُحوّل إلى webp + مصغّر عبر `sharp`، وتُخزَّن بالمسار:
`teachers/{teacherId}/indicators/{indicatorId}/{uuid}.webp`
الافتراضي Vercel Blob — يمكن استبداله بـ S3 في `storage.service.ts`.

## النشر
- الواجهة: Vercel (مباشرة).
- الخادم: Railway / Render / VPS (يحتاج Puppeteer مكتبات نظام Chrome). قاعدة البيانات: Neon أو Supabase Postgres.
