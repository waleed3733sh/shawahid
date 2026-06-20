import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
  ) {}

  // الدخول بالكود الخاص — يصلح للمعلم والإدارة على حد سواء
  async loginWithCode(accessCode: string) {
    const code = accessCode?.trim();
    if (!code) throw new UnauthorizedException('الرجاء إدخال الكود');

    const teacher = await this.prisma.teacher.findUnique({
      where: { accessCode: code },
    });
    if (!teacher) throw new UnauthorizedException('الكود غير صحيح');

    const token = await this.jwt.signAsync({
      sub: teacher.id,
      role: teacher.role,
    });

    return {
      token,
      profile: {
        id: teacher.id,
        fullName: teacher.fullName,
        email: teacher.email,
        role: teacher.role, // الواجهة توجّه بناءً على الدور
      },
    };
  }
}
