import {
  Controller,
  Get,
  Patch,
  Body,
  Req,
  UseGuards,
  Injectable,
  Module,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuthGuard } from '../auth/auth.guard';

@Injectable()
export class TeachersService {
  constructor(private prisma: PrismaService) {}

  getProfile(id: string) {
    return this.prisma.teacher.findUnique({ where: { id } });
  }

  updateProfile(id: string, data: any) {
    const { fullName, subject, school, stage, mobile, email } = data;
    return this.prisma.teacher.update({
      where: { id },
      data: { fullName, subject, school, stage, mobile, email },
    });
  }
}

@Controller()
@UseGuards(AuthGuard)
export class TeachersController {
  constructor(private teachers: TeachersService) {}

  @Get('me')
  me(@Req() req: any) {
    return this.teachers.getProfile(req.user.sub);
  }

  @Patch('me')
  update(@Req() req: any, @Body() body: any) {
    return this.teachers.updateProfile(req.user.sub, body);
  }
}

@Module({
  controllers: [TeachersController],
  providers: [TeachersService, PrismaService, AuthGuard],
})
export class TeachersModule {}
