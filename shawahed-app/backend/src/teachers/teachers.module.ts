import {
  Controller,
  Get,
  Post,
  Patch,
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
export class TeachersService {
  constructor(private prisma: PrismaService) {}

  getProfile(id: string) {
    return this.prisma.teacher.findUnique({ where: { id } });
  }

  updateProfile(id: string, data: any) {
    const {
      fullName,
      subject,
      school,
      stage,
      mobile,
      email,
      semesterStart,
      alertFrequency,
      schedule,
    } = data;
    return this.prisma.teacher.update({
      where: { id },
      data: {
        fullName,
        subject,
        school,
        stage,
        mobile,
        email,
        semesterStart: semesterStart ? new Date(semesterStart) : undefined,
        alertFrequency,
        schedule,
      },
    });
  }

  // توليد كود فريد للمعلم: حرف T + 6 أرقام، ويعيد المحاولة لو تكرّر
  private async generateUniqueCode(): Promise<string> {
    for (let i = 0; i < 10; i++) {
      const code = 'T-' + Math.floor(100000 + Math.random() * 900000);
      const exists = await this.prisma.teacher.findUnique({
        where: { accessCode: code },
      });
      if (!exists) return code;
    }
    throw new BadRequestException('تعذّر توليد كود، حاول مجدداً');
  }

  // إضافة معلم جديد (للإدارة): الاسم + الجوال، والكود يُولّد تلقائياً
  async createTeacher(data: { fullName: string; mobile?: string }) {
    if (!data.fullName?.trim()) {
      throw new BadRequestException('اسم المعلم مطلوب');
    }
    const accessCode = await this.generateUniqueCode();
    // البريد ليس مطلوباً لكنه فريد في القاعدة، فنولّد بريداً مؤقتاً فريداً
    const placeholderEmail = `${accessCode.toLowerCase()}@shawahed.local`;
    const teacher = await this.prisma.teacher.create({
      data: {
        accessCode,
        fullName: data.fullName.trim(),
        mobile: data.mobile?.trim() || null,
        email: placeholderEmail,
        role: 'TEACHER',
      },
    });
    return { id: teacher.id, accessCode, fullName: teacher.fullName };
  }

  // قائمة المعلمين (للإدارة)
  listTeachers() {
    return this.prisma.teacher.findMany({
      where: { role: 'TEACHER' },
      select: {
        id: true,
        accessCode: true,
        fullName: true,
        mobile: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  // حذف معلم (للإدارة) — يحذف شواهده معه (onDelete: Cascade في المخطّط)
  deleteTeacher(id: string) {
    return this.prisma.teacher.delete({ where: { id } });
  }

  // تغيير كود دخول الإدارة (للمدير الحالي فقط)
  async changeAdminCode(adminId: string, newCode: string) {
    const code = newCode?.trim();
    if (!code || code.length < 6) {
      throw new BadRequestException('الكود يجب أن يكون 6 أحرف على الأقل');
    }
    // التأكّد أن الكود غير مستخدم
    const exists = await this.prisma.teacher.findUnique({
      where: { accessCode: code },
    });
    if (exists && exists.id !== adminId) {
      throw new BadRequestException('هذا الكود مستخدم بالفعل');
    }
    await this.prisma.teacher.update({
      where: { id: adminId },
      data: { accessCode: code },
    });
    return { success: true };
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

  // ===== مسارات الإدارة =====
  @Post('admin/teachers')
  @AdminOnly()
  create(@Body() body: { fullName: string; mobile?: string }) {
    return this.teachers.createTeacher(body);
  }

  @Get('admin/teachers')
  @AdminOnly()
  list() {
    return this.teachers.listTeachers();
  }

  @Delete('admin/teachers/:id')
  @AdminOnly()
  remove(@Param('id') id: string) {
    return this.teachers.deleteTeacher(id);
  }

  // تغيير كود دخول الإدارة
  @Patch('admin/code')
  @AdminOnly()
  changeCode(@Req() req: any, @Body('newCode') newCode: string) {
    return this.teachers.changeAdminCode(req.user.sub, newCode);
  }
}

@Module({
  controllers: [TeachersController],
  providers: [TeachersService, PrismaService, AuthGuard],
})
export class TeachersModule {}
