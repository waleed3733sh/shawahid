import {
  Controller,
  Get,
  Put,
  Body,
  UseGuards,
  Injectable,
  Module,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuthGuard, AdminOnly } from '../auth/auth.guard';

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
}

@Controller('settings')
export class SettingsController {
  constructor(private settings: SettingsService) {}

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
}

@Module({
  controllers: [SettingsController],
  providers: [SettingsService, PrismaService, AuthGuard],
})
export class SettingsModule {}
