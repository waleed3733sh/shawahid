import { Injectable } from '@nestjs/common';
import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  ImageRun,
  AlignmentType,
  HeadingLevel,
  Table,
  TableRow,
  TableCell,
  WidthType,
  BorderStyle,
  ShadingType,
} from 'docx';
import { PrismaService } from '../prisma/prisma.service';
import { StorageService } from '../evidence/storage.service';

// لون النصوص والعناوين
const FOREST = '0F3D2E';
const GOLD = 'CAA84A';

@Injectable()
export class DocxExportService {
  constructor(
    private prisma: PrismaService,
    private storage: StorageService,
  ) {}

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

    // تجميع الشواهد حسب البند
    const byIndicator: Record<number, typeof teacher.evidences> = {};
    for (const e of teacher.evidences) (byIndicator[e.indicatorId] ||= []).push(e);

    // فقرة عربية RTL — bidi=true يضبط اتجاه الفقرة
    const rtl = (children: TextRun[], opts: any = {}) =>
      new Paragraph({
        bidirectional: true,
        alignment: AlignmentType.RIGHT,
        ...opts,
        children,
      });

    const children: any[] = [];

    // صفحة الغلاف — تُعبّأ من بيانات المعلم تلقائياً
    children.push(
      rtl([new TextRun({ text: 'ملف الأداء الوظيفي', bold: true, size: 56, color: FOREST, rightToLeft: true })],
        { alignment: AlignmentType.CENTER, spacing: { before: 2000, after: 200 } }),
      rtl([new TextRun({ text: teacher.fullName, bold: true, size: 36, color: GOLD, rightToLeft: true })],
        { alignment: AlignmentType.CENTER, spacing: { after: 600 } }),
    );

    // جدول بيانات المعلم
    const infoRow = (label: string, val?: string | null) =>
      new TableRow({
        children: [
          new TableCell({
            width: { size: 3120, type: WidthType.DXA },
            shading: { fill: 'F6F8F5', type: ShadingType.CLEAR },
            margins: { top: 80, bottom: 80, left: 120, right: 120 },
            children: [rtl([new TextRun({ text: val || '—', size: 24, rightToLeft: true })])],
          }),
          new TableCell({
            width: { size: 3120, type: WidthType.DXA },
            shading: { fill: 'EEF1EE', type: ShadingType.CLEAR },
            margins: { top: 80, bottom: 80, left: 120, right: 120 },
            children: [rtl([new TextRun({ text: label, bold: true, size: 24, color: FOREST, rightToLeft: true })])],
          }),
        ],
      });

    children.push(
      new Table({
        width: { size: 6240, type: WidthType.DXA },
        columnWidths: [3120, 3120],
        alignment: AlignmentType.CENTER,
        rows: [
          infoRow('المادة', teacher.subject),
          infoRow('المدرسة', teacher.school),
          infoRow('المرحلة', teacher.stage),
          infoRow('الجوال', teacher.mobile),
          infoRow('البريد', teacher.email),
        ],
      }),
      new Paragraph({ children: [], pageBreakBefore: false, spacing: { after: 400 } }),
    );

    // قسم لكل بند مع صوره
    for (const ind of indicators) {
      const evs = byIndicator[ind.id] || [];
      children.push(
        rtl(
          [new TextRun({ text: `البند ${ind.id}: ${ind.titleAr}`, bold: true, size: 30, color: FOREST, rightToLeft: true })],
          { heading: HeadingLevel.HEADING_1, spacing: { before: 300, after: 150 },
            border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: GOLD, space: 1 } } },
        ),
      );

      if (evs.length === 0) {
        children.push(rtl([new TextRun({ text: 'لا توجد شواهد مرفقة لهذا البند.', italics: true, size: 22, color: '999999', rightToLeft: true })]));
        continue;
      }

      // الصور في صفوف من اثنتين — تُجلب خادمياً (تجنّب CORS)
      for (let i = 0; i < evs.length; i += 2) {
        const pair = evs.slice(i, i + 2);
        const cells = await Promise.all(
          pair.map(async (ev) => {
            const buf = await this.storage.fetchBytes(ev.imageUrl);
            return new TableCell({
              width: { size: 4680, type: WidthType.DXA },
              borders: {
                top: { style: BorderStyle.SINGLE, size: 1, color: 'DDDDDD' },
                bottom: { style: BorderStyle.SINGLE, size: 1, color: 'DDDDDD' },
                left: { style: BorderStyle.SINGLE, size: 1, color: 'DDDDDD' },
                right: { style: BorderStyle.SINGLE, size: 1, color: 'DDDDDD' },
              },
              margins: { top: 60, bottom: 60, left: 60, right: 60 },
              children: [
                new Paragraph({
                  alignment: AlignmentType.CENTER,
                  children: [
                    new ImageRun({
                      type: 'png',
                      data: buf,
                      transformation: { width: 200, height: 150 },
                    }),
                  ],
                }),
              ],
            });
          }),
        );
        children.push(
          new Table({
            width: { size: 9360, type: WidthType.DXA },
            columnWidths: pair.length === 2 ? [4680, 4680] : [9360],
            rows: [new TableRow({ children: cells })],
          }),
          new Paragraph({ children: [], spacing: { after: 200 } }),
        );
      }
    }

    const doc = new Document({
      styles: { default: { document: { run: { font: 'Arial', size: 24 } } } },
      sections: [
        {
          properties: {
            page: {
              size: { width: 12240, height: 15840 },
              margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 },
            },
          },
          children,
        },
      ],
    });

    return Packer.toBuffer(doc);
  }
}
