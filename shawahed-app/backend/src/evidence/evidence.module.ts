import {
  Controller,
  Post,
  Get,
  Delete,
  Param,
  Req,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  Module,
  ParseIntPipe,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { EvidenceService } from './evidence.service';
import { StorageService } from './storage.service';
import { AuthGuard } from '../auth/auth.guard';
import { PrismaService } from '../prisma/prisma.service';

@Controller('evidence')
@UseGuards(AuthGuard)
export class EvidenceController {
  constructor(private evidence: EvidenceService) {}

  @Post(':indicatorId')
  @UseInterceptors(
    FileInterceptor('file', { limits: { fileSize: 8 * 1024 * 1024 } }), // 8MB
  )
  upload(
    @Req() req: any,
    @Param('indicatorId', ParseIntPipe) indicatorId: number,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.evidence.upload(req.user.sub, indicatorId, file);
  }

  @Get()
  list(@Req() req: any) {
    return this.evidence.listForTeacher(req.user.sub);
  }

  @Get('progress')
  progress(@Req() req: any) {
    return this.evidence.progress(req.user.sub);
  }

  @Delete(':evidenceId')
  remove(@Req() req: any, @Param('evidenceId') evidenceId: string) {
    return this.evidence.remove(req.user.sub, evidenceId);
  }
}

@Module({
  controllers: [EvidenceController],
  providers: [EvidenceService, StorageService, PrismaService, AuthGuard],
  exports: [StorageService],
})
export class EvidenceModule {}
