import {
  Controller,
  Get,
  Param,
  Req,
  Res,
  UseGuards,
  Module,
} from '@nestjs/common';
import type { Response } from 'express';
import { DocxExportService } from './docx-export.service';
import { PdfExportService } from './pdf-export.service';
import { AuthGuard } from '../auth/auth.guard';
import { PrismaService } from '../prisma/prisma.service';
import { StorageService } from '../evidence/storage.service';

@Controller('export')
@UseGuards(AuthGuard)
export class ExportController {
  constructor(
    private docx: DocxExportService,
    private pdf: PdfExportService,
  ) {}

  @Get(':format')
  async export(
    @Req() req: any,
    @Param('format') format: 'docx' | 'pdf',
    @Res() res: Response,
  ) {
    const teacherId = req.user.sub;
    if (format === 'pdf') {
      const buf = await this.pdf.build(teacherId);
      res.set({
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename="portfolio.pdf"',
      });
      return res.send(buf);
    }
    const buf = await this.docx.build(teacherId);
    res.set({
      'Content-Type':
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'Content-Disposition': 'attachment; filename="portfolio.docx"',
    });
    return res.send(buf);
  }
}

@Module({
  controllers: [ExportController],
  providers: [
    DocxExportService,
    PdfExportService,
    PrismaService,
    StorageService,
    AuthGuard,
  ],
})
export class ExportModule {}
