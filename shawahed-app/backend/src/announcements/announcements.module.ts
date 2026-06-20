import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  Req,
  UseGuards,
  Injectable,
  Module,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuthGuard, AdminOnly } from '../auth/auth.guard';

@Injectable()
export class AnnouncementsService {
  constructor(private prisma: PrismaService) {}

  // إنشاء إعلان (للإدارة)
  create(message: string) {
    const msg = message?.trim();
    if (!msg) throw new BadRequestException('نص التنبيه مطلوب');
    return this.prisma.announcement.create({ data: { message: msg } });
  }

  // كل الإعلانات (للإدارة) — لعرضها وإدارتها
  listAll() {
    return this.prisma.announcement.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  // حذف إعلان (للإدارة)
  remove(id: string) {
    return this.prisma.announcement.delete({ where: { id } });
  }

  // الإعلانات غير المقروءة لمعلم معيّن (يظهر مرة واحدة فقط)
  async unreadFor(teacherId: string) {
    const dismissed = await this.prisma.announcementDismissal.findMany({
      where: { teacherId },
      select: { announcementId: true },
    });
    const dismissedIds = dismissed.map((d) => d.announcementId);
    return this.prisma.announcement.findMany({
      where: { id: { notIn: dismissedIds.length ? dismissedIds : ['_'] } },
      orderBy: { createdAt: 'desc' },
    });
  }

  // إغلاق المعلم لتنبيه — يُسجّل فلا يظهر ثانيةً
  async dismiss(teacherId: string, announcementId: string) {
    await this.prisma.announcementDismissal.upsert({
      where: { announcementId_teacherId: { announcementId, teacherId } },
      update: {},
      create: { announcementId, teacherId },
    });
    return { success: true };
  }
}

@Controller('announcements')
@UseGuards(AuthGuard)
export class AnnouncementsController {
  constructor(private svc: AnnouncementsService) {}

  // المعلم: التنبيهات غير المقروءة
  @Get()
  unread(@Req() req: any) {
    return this.svc.unreadFor(req.user.sub);
  }

  // المعلم: إغلاق تنبيه
  @Post(':id/dismiss')
  dismiss(@Req() req: any, @Param('id') id: string) {
    return this.svc.dismiss(req.user.sub, id);
  }

  // الإدارة: إرسال تنبيه
  @Post()
  @AdminOnly()
  create(@Body('message') message: string) {
    return this.svc.create(message);
  }

  // الإدارة: عرض كل التنبيهات
  @Get('all')
  @AdminOnly()
  all() {
    return this.svc.listAll();
  }

  // الإدارة: حذف تنبيه
  @Delete(':id')
  @AdminOnly()
  remove(@Param('id') id: string) {
    return this.svc.remove(id);
  }
}

@Module({
  controllers: [AnnouncementsController],
  providers: [AnnouncementsService, PrismaService, AuthGuard],
})
export class AnnouncementsModule {}
