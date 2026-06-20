import {
  Injectable,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { StorageService } from './storage.service';

const MAX_IMAGES_PER_INDICATOR = 4;

@Injectable()
export class EvidenceService {
  constructor(
    private prisma: PrismaService,
    private storage: StorageService,
  ) {}

  // رفع شاهد — الحد الأقصى يُفرض هنا على الخادم ولا يُعتمد على الواجهة إطلاقاً
  async upload(
    teacherId: string,
    indicatorId: number,
    file: Express.Multer.File,
  ) {
    if (!file?.mimetype?.startsWith('image/')) {
      throw new BadRequestException('الملف يجب أن يكون صورة');
    }

    // العدّ ضمن معاملة لمنع تجاوز الحد عند الرفع المتزامن
    return this.prisma.$transaction(async (tx) => {
      const count = await tx.evidence.count({
        where: { teacherId, indicatorId },
      });
      if (count >= MAX_IMAGES_PER_INDICATOR) {
        throw new BadRequestException(
          `الحد الأقصى ${MAX_IMAGES_PER_INDICATOR} صور لكل بند`,
        );
      }

      // المسار: teachers/{teacherId}/indicators/{indicatorId}/{uuid}.webp
      const { url, thumbUrl, sizeBytes } = await this.storage.put(
        teacherId,
        indicatorId,
        file,
      );

      return tx.evidence.create({
        data: {
          teacherId,
          indicatorId,
          imageUrl: url,
          thumbUrl,
          fileName: file.originalname,
          sizeBytes,
        },
      });
    });
  }

  async listForTeacher(teacherId: string) {
    const rows = await this.prisma.evidence.findMany({
      where: { teacherId },
      orderBy: { createdAt: 'asc' },
    });
    // تجميع حسب البند ليسهل عرضه في الواجهة
    const byIndicator: Record<number, typeof rows> = {};
    for (const r of rows) (byIndicator[r.indicatorId] ||= []).push(r);
    return byIndicator;
  }

  async remove(teacherId: string, evidenceId: string) {
    const ev = await this.prisma.evidence.findUnique({
      where: { id: evidenceId },
    });
    if (!ev) throw new BadRequestException('الشاهد غير موجود');
    // المعلم لا يحذف إلا شواهده
    if (ev.teacherId !== teacherId) {
      throw new ForbiddenException('غير مصرّح');
    }
    await this.storage.delete(ev.imageUrl, ev.thumbUrl);
    return this.prisma.evidence.delete({ where: { id: evidenceId } });
  }

  // نسبة الإنجاز: عدد البنود التي تحتوي شاهداً واحداً على الأقل
  async progress(teacherId: string) {
    const indicators = await this.prisma.indicator.count();
    const grouped = await this.prisma.evidence.groupBy({
      by: ['indicatorId'],
      where: { teacherId },
      _count: true,
    });
    const done = grouped.length;
    return {
      done,
      total: indicators,
      pct: indicators ? Math.round((done / indicators) * 100) : 0,
    };
  }
}
