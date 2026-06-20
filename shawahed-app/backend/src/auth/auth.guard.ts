import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
  ForbiddenException,
  SetMetadata,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';

// ديكوريتور لتعليم المسارات التي تتطلب دور الإدارة
export const ADMIN_ONLY = 'admin_only';
export const AdminOnly = () => SetMetadata(ADMIN_ONLY, true);

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private jwt: JwtService,
    private reflector: Reflector,
  ) {}

  async canActivate(ctx: ExecutionContext): Promise<boolean> {
    const req = ctx.switchToHttp().getRequest();
    const header: string = req.headers['authorization'] || '';
    const token = header.startsWith('Bearer ') ? header.slice(7) : null;
    if (!token) throw new UnauthorizedException('جلسة غير صالحة');

    let payload: any;
    try {
      payload = await this.jwt.verifyAsync(token);
    } catch {
      throw new UnauthorizedException('انتهت صلاحية الجلسة');
    }
    req.user = payload; // { sub, role }

    // الحماية الحقيقية للوحة الإدارة تتم هنا على الخادم — لا تعتمد على إخفاء الرابط
    const adminOnly = this.reflector.get<boolean>(
      ADMIN_ONLY,
      ctx.getHandler(),
    );
    if (adminOnly && payload.role !== 'ADMIN') {
      throw new ForbiddenException('غير مصرّح بالوصول');
    }
    return true;
  }
}
