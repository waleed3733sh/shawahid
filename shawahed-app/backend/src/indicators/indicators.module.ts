import {
  Controller,
  Get,
  UseGuards,
  Injectable,
  Module,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuthGuard } from '../auth/auth.guard';

@Injectable()
export class IndicatorsService {
  constructor(private prisma: PrismaService) {}
  findAll() {
    return this.prisma.indicator.findMany({ orderBy: { orderIndex: 'asc' } });
  }
}

@Controller('indicators')
@UseGuards(AuthGuard)
export class IndicatorsController {
  constructor(private indicators: IndicatorsService) {}
  @Get()
  all() {
    return this.indicators.findAll();
  }
}

@Module({
  controllers: [IndicatorsController],
  providers: [IndicatorsService, PrismaService, AuthGuard],
})
export class IndicatorsModule {}
