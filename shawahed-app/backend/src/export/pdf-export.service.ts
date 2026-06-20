import { Injectable } from '@nestjs/common';
import puppeteer from 'puppeteer';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PdfExportService {
  constructor(private prisma: PrismaService) {}

  async build(teacherId: string): Promise<Buffer> {
    const teacher = await this.prisma.teacher.findUnique({
      where: { id: teacherId },
      include: {
        evidences: { include: { indicator: true }, orderBy: { createdAt: 'asc' } },
      },
    });
    const indicators = await this.prisma.indicator.findMany({
      orderBy: { orderIndex: 'asc' },
    });

    const byIndicator: Record<number, typeof teacher.evidences> = {};
    for (const e of teacher.evidences) (byIndicator[e.indicatorId] ||= []).push(e);

    const html = this.template(teacher, indicators, byIndicator);

    // Puppeteer يعطي أفضل تشكيل عربي مقارنة بـ pdfkit
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });
    try {
      const page = await browser.newPage();
      // الصور تُحمّل عبر روابطها — لا قيود CORS لأن التحميل يتم خادمياً
      await page.setContent(html, { waitUntil: 'networkidle0' });
      const pdf = await page.pdf({
        format: 'A4',
        printBackground: true,
        margin: { top: '20mm', bottom: '20mm', left: '15mm', right: '15mm' },
      });
      return Buffer.from(pdf);
    } finally {
      await browser.close();
    }
  }

  private template(teacher: any, indicators: any[], byInd: any): string {
    const sections = indicators
      .map((ind) => {
        const evs = byInd[ind.id] || [];
        const imgs = evs.length
          ? `<div class="grid">${evs
              .map((e: any) => `<img src="${e.imageUrl}" />`)
              .join('')}</div>`
          : `<p class="empty">لا توجد شواهد مرفقة لهذا البند.</p>`;
        return `<section>
            <h2><span class="num">${ind.id}</span> ${ind.titleAr}</h2>
            ${imgs}
          </section>`;
      })
      .join('');

    return `<!DOCTYPE html><html lang="ar" dir="rtl"><head><meta charset="utf-8">
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Tajawal:wght@400;700;800&family=Cairo:wght@700;800&display=swap');
        *{ box-sizing:border-box; margin:0; padding:0; }
        body{ font-family:'Tajawal',sans-serif; color:#0b2e22; }
        .cover{ text-align:center; padding:120px 0 60px; page-break-after:always; }
        .cover h1{ font-family:'Cairo'; font-size:42px; color:#0f3d2e; }
        .cover .name{ font-size:26px; color:#caa84a; font-weight:800; margin-top:12px; }
        .info{ margin:40px auto; width:60%; border-collapse:collapse; }
        .info td{ border:1px solid #ddd; padding:10px 14px; font-size:15px; }
        .info .label{ background:#eef1ee; font-weight:700; color:#0f3d2e; width:35%; }
        section{ margin-bottom:28px; page-break-inside:avoid; }
        h2{ font-family:'Cairo'; font-size:20px; color:#0f3d2e;
            border-bottom:3px solid #caa84a; padding-bottom:8px; margin-bottom:14px; }
        .num{ display:inline-grid; place-items:center; width:32px; height:32px;
              background:#0f3d2e; color:#caa84a; border-radius:8px; font-size:16px; margin-left:8px; }
        .grid{ display:grid; grid-template-columns:1fr 1fr; gap:12px; }
        .grid img{ width:100%; height:180px; object-fit:cover; border-radius:8px; border:1px solid #ddd; }
        .empty{ color:#999; font-style:italic; }
      </style></head><body>
        <div class="cover">
          <h1>ملف الأداء الوظيفي</h1>
          <div class="name">${teacher.fullName}</div>
          <table class="info">
            <tr><td class="label">المادة</td><td>${teacher.subject || '—'}</td></tr>
            <tr><td class="label">المدرسة</td><td>${teacher.school || '—'}</td></tr>
            <tr><td class="label">المرحلة</td><td>${teacher.stage || '—'}</td></tr>
            <tr><td class="label">الجوال</td><td>${teacher.mobile || '—'}</td></tr>
            <tr><td class="label">البريد</td><td>${teacher.email || '—'}</td></tr>
          </table>
        </div>
        ${sections}
      </body></html>`;
  }
}
