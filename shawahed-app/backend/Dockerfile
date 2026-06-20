# شواهد · صورة الخادم — NestJS + Prisma + Puppeteer (Chromium)
FROM node:20-slim

# مكتبات النظام التي يحتاجها Chromium لتشغيل Puppeteer + خط عربي
RUN apt-get update && apt-get install -y \
    chromium \
    fonts-liberation \
    fonts-noto \
    fonts-noto-cjk \
    libnss3 \
    libatk1.0-0 \
    libatk-bridge2.0-0 \
    libcups2 \
    libdrm2 \
    libxkbcommon0 \
    libxcomposite1 \
    libxdamage1 \
    libxrandr2 \
    libgbm1 \
    libasound2 \
    && rm -rf /var/lib/apt/lists/*

# إخبار Puppeteer باستخدام Chromium المثبّت بدل تنزيل نسخته
ENV PUPPETEER_SKIP_DOWNLOAD=true
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium

WORKDIR /app

# تثبيت الحزم
COPY package*.json ./
RUN npm install

# نسخ بقية الملفات
COPY . .

# توليد عميل Prisma وبناء المشروع
RUN npx prisma generate
RUN npm run build

EXPOSE 4000

# عند الإقلاع: إنشاء الجداول من المخطّط مباشرةً (db push) + البذرة ثم تشغيل الخادم
# db push ينشئ الجداول دون الحاجة لملفات ترحيل مسبقة — مناسب للإطلاق الأول
# "|| true" بعد البذرة يمنع توقّف الإقلاع لو كانت البيانات مزروعة مسبقاً
CMD npx prisma db push --skip-generate && (npx prisma db seed || true) && npm run start:prod
