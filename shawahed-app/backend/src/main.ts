import { Module } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AuthModule } from './auth/auth.module';
import { TeachersModule } from './teachers/teachers.module';
import { EvidenceModule } from './evidence/evidence.module';
import { IndicatorsModule } from './indicators/indicators.module';
import { ExportModule } from './export/export.module';
import { SettingsModule } from './settings/settings.module';
import { AnnouncementsModule } from './announcements/announcements.module';

@Module({
  imports: [
    AuthModule,
    TeachersModule,
    EvidenceModule,
    IndicatorsModule,
    ExportModule,
    SettingsModule,
    AnnouncementsModule,
  ],
})
export class AppModule {}

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('api');
  app.enableCors({ origin: process.env.FRONTEND_URL || '*' });
  await app.listen(process.env.PORT || 4000);
  console.log('شواهد API يعمل على المنفذ', process.env.PORT || 4000);
}
bootstrap();
