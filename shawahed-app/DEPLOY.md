# دليل نشر شواهد على الإنترنت — للمبتدئين

انشر بهذا الترتيب بالضبط. كل مرحلة تحتاج ناتج التي قبلها.

> ملاحظة مهمة: بعد إضافة ملف `Dockerfile` و `railway.json`، صار Railway يتولّى
> تلقائياً تثبيت الحزم وتوليد Prisma وتطبيق الترحيلات والبذرة وتشغيل الخادم.
> لا تحتاج كتابة أوامر بناء يدوية في Railway.

---

## ما ستحتاج جمعه في ملف نصّي مؤقت
بينما تتنقّل بين المنصات، انسخ هذه القيم واحتفظ بها:
- `DATABASE_URL`           ← من Neon
- `BLOB_READ_WRITE_TOKEN`  ← من Vercel Blob
- `JWT_SECRET`             ← اخترعه (نص عشوائي طويل ٤٠ حرفاً)
- رابط الخادم (Railway)     ← يظهر في المرحلة ٤
- رابط الموقع (Vercel)      ← يظهر في المرحلة ٥

---

## المرحلة ١ — GitHub
```bash
cd shawahed-app
git init
git add .
git commit -m "النسخة الأولى"
git remote add origin https://github.com/اسمك/shawahed.git
git branch -M main
git push -u origin main
```
تأكّد أن `.env` لم يُرفع (محمي بـ `.gitignore`).

## المرحلة ٢ — قاعدة البيانات (Neon)
1. neon.tech ← سجّل بـ GitHub.
2. New Project ← اسم `shawahed` ← منطقة قريبة.
3. انسخ **Connection String** (يبدأ بـ `postgresql://`) = `DATABASE_URL`.

## المرحلة ٣ — تخزين الصور (Vercel Blob)
1. vercel.com ← Storage ← Create Database ← **Blob**.
2. اسم `shawahed-images` ← Create.
3. انسخ `BLOB_READ_WRITE_TOKEN`.

## المرحلة ٤ — الخادم (Railway)
1. railway.app ← New Project ← Deploy from GitHub repo ← اختر `shawahed`.
2. اضغط الخدمة ← **Settings**:
   - **Root Directory** = `backend`
   - (البناء يتم عبر Dockerfile تلقائياً — لا أوامر يدوية)
3. تبويب **Variables** — أضف:
   ```
   DATABASE_URL          = (رابط Neon)
   JWT_SECRET            = (نص عشوائي طويل)
   BLOB_READ_WRITE_TOKEN = (توكن Vercel Blob)
   FRONTEND_URL          = (اتركه فارغاً مؤقتاً)
   PORT                  = 4000
   ```
4. انتظر اكتمال البناء (قد يأخذ دقائق — Chromium كبير).
5. **Settings ← Networking ← Generate Domain**.
6. رابط الـ API = الرابط الظاهر + `/api`
   مثال: `https://shawahed-production.up.railway.app/api`

## المرحلة ٥ — الواجهة (Vercel)
1. vercel.com ← Add New ← Project ← اختر `shawahed`.
2. **Root Directory** = `frontend`.
3. **Environment Variables**:
   ```
   NEXT_PUBLIC_API_URL = https://رابط-railway/api
   ```
4. Deploy ← انتظر ← انسخ رابط الموقع (مثل `shawahed.vercel.app`).

## المرحلة ٦ — الربط العكسي (لا تنسها!)
ارجع إلى **Railway ← Variables ← FRONTEND_URL** وضع رابط Vercel.
بدون هذه الخطوة يفشل تسجيل الدخول (خطأ CORS).

---

## التجربة
افتح رابط Vercel:
- معلم: `T-1024`
- إدارة: `MOE-ADMIN-9000`

## إن واجهت مشكلة
- **فشل تسجيل الدخول / CORS** ← تأكّد أن `FRONTEND_URL` في Railway = رابط Vercel بالضبط (بدون `/` في النهاية).
- **فشل تصدير PDF** ← تأكّد أن البناء استخدم Dockerfile (تظهر سطور تثبيت chromium في سجلّ البناء).
- **خطأ قاعدة بيانات** ← تأكّد أن `DATABASE_URL` صحيح وأن مشروع Neon فعّال.
- **الصور لا تُرفع** ← تأكّد من `BLOB_READ_WRITE_TOKEN`.

## التكلفة
الطبقات المجانية تكفي للتجربة والإطلاق الأولي. Railway يعطي رصيداً شهرياً محدوداً؛
راقب الاستهلاك إن زاد عدد المستخدمين.
