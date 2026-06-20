// بذرة البيانات الأولية
// تشغيل: npx prisma db seed

import { PrismaClient, Role } from '@prisma/client';

const prisma = new PrismaClient();

// ⚠️ تحقّق من الصياغة الرسمية الحديثة لبنود تقويم الأداء من نموذج الوزارة قبل الإطلاق
const INDICATORS = [
  { id: 1, titleAr: 'أداء الواجبات الوظيفية', weekNumber: 1 },
  { id: 2, titleAr: 'التفاعل مع المجتمع المهني', weekNumber: 2 },
  { id: 3, titleAr: 'التفاعل مع أولياء الأمور', weekNumber: 3 },
  { id: 4, titleAr: 'تنويع استراتيجيات التدريس', weekNumber: 4 },
  { id: 5, titleAr: 'تحسين نواتج التعلم', weekNumber: 5 },
  { id: 6, titleAr: 'إعداد وتنفيذ خطة التعلم', weekNumber: 6 },
  { id: 7, titleAr: 'توظيف التقنية في التعليم', weekNumber: 7 },
  { id: 8, titleAr: 'تهيئة البيئة التعليمية', weekNumber: 8 },
  { id: 9, titleAr: 'الإدارة الصفية', weekNumber: 9 },
  { id: 10, titleAr: 'تحليل نتائج المتعلمين وتشخيصها', weekNumber: 10 },
  { id: 11, titleAr: 'تنويع أساليب التقويم', weekNumber: 11 },
];

async function main() {
  for (const [i, ind] of INDICATORS.entries()) {
    await prisma.indicator.upsert({
      where: { id: ind.id },
      update: { titleAr: ind.titleAr, weekNumber: ind.weekNumber, orderIndex: i },
      create: { ...ind, orderIndex: i },
    });
  }

  await prisma.teacher.upsert({
    where: { accessCode: 'T-1024' },
    update: {},
    create: {
      accessCode: 'T-1024',
      fullName: 'أ. وليد الزهراني',
      email: 'waleed@school.edu.sa',
      subject: 'الحاسب وتقنية المعلومات',
      school: 'ثانوية الملك فهد',
      stage: 'الثانوية',
      mobile: '0555000111',
      role: Role.TEACHER,
    },
  });

  // حساب الإدارة — يُدخَل بكوده الخاص المخفي
  await prisma.teacher.upsert({
    where: { accessCode: 'MOE-ADMIN-9000' },
    update: {},
    create: {
      accessCode: 'MOE-ADMIN-9000',
      fullName: 'مدير النظام',
      email: 'admin@shawahed.edu.sa',
      role: Role.ADMIN,
    },
  });

  // إعدادات الموقع الافتراضية (صفّ واحد)
  await prisma.siteSettings.upsert({
    where: { id: 1 },
    update: {},
    create: { id: 1 },
  });

  console.log('تمت تهيئة البيانات الأولية بنجاح');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
