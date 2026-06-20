import {
  Controller,
  Get,
  Put,
  Post,
  Body,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  Injectable,
  Module,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { PrismaService } from '../prisma/prisma.service';
import { AuthGuard, AdminOnly } from '../auth/auth.guard';
import { StorageService } from '../evidence/storage.service';

@Injectable()
export class SettingsService {
  constructor(private prisma: PrismaService) {}

  // القراءة متاحة للجميع (الواجهة العامة ولوحة المعلم تحتاجها)
  get() {
    return this.prisma.siteSettings.upsert({
      where: { id: 1 },
      update: {},
      create: { id: 1 },
    });
  }

  // التعديل للمدير فقط — يُحدّث الصفّ الواحد
  update(data: any) {
    const allowed = [
      'siteName',
      'tagline',
      'logoUrl',
      'colorPrimary',
      'colorAccent',
      'labelIndicators',
      'labelProfile',
      'labelEvidence',
      'labelProgress',
      'labelAlerts',
      'labelSummary',
      'footerText',
    ];
    const clean: any = {};
    for (const k of allowed) if (k in data) clean[k] = data[k];
    return this.prisma.siteSettings.update({ where: { id: 1 }, data: clean });
  }

  // تعديل نصوص البنود الـ11 وأسابيعها دفعة واحدة (للمدير)
  async updateIndicators(
    items: { id: number; titleAr: string; weekNumber: number }[],
  ) {
    await this.prisma.$transaction(
      items.map((it) =>
        this.prisma.indicator.update({
          where: { id: it.id },
          data: { titleAr: it.titleAr, weekNumber: it.weekNumber },
        }),
      ),
    );
    return this.prisma.indicator.findMany({ orderBy: { orderIndex: 'asc' } });
  }
}

@Controller('settings')
export class SettingsController {
  constructor(
    private settings: SettingsService,
    private storage: StorageService,
  ) {}

  // قراءة عامة بدون مصادقة
  @Get()
  get() {
    return this.settings.get();
  }

  // الحفظ الكامل — محمي بدور المدير على الخادم
  @Put()
  @UseGuards(AuthGuard)
  @AdminOnly()
  update(@Body() body: any) {
    return this.settings.update(body);
  }

  // تعديل البنود الـ11 — للمدير فقط
  @Put('indicators')
  @UseGuards(AuthGuard)
  @AdminOnly()
  updateIndicators(@Body('items') items: any[]) {
    return this.settings.updateIndicators(items);
  }

  // رفع شعار الموقع — للمدير فقط، يعيد الرابط لحفظه في logoUrl
  @Post('logo')
  @UseGuards(AuthGuard)
  @AdminOnly()
  @UseInterceptors(
    FileInterceptor('file', { limits: { fileSize: 2 * 1024 * 1024 } }),
  )
  uploadLogo(@UploadedFile() file: Express.Multer.File) {
    return this.storage.putLogo(file);
  }
}

@Module({
  controllers: [SettingsController],
  providers: [SettingsService, PrismaService, AuthGuard, StorageService],
})
export class SettingsModule {}
