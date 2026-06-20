import { Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';
import sharp from 'sharp';
import { put, del } from '@vercel/blob';

@Injectable()
export class StorageService {
  // التوكن يُمرّر صراحةً لضمان استخدام المتجر الصحيح
  private get token() {
    return process.env.BLOB_READ_WRITE_TOKEN;
  }

  // نوع وصول المتجر — المتجر يجب أن يكون عاماً (public) لتظهر الصور في الموقع
  // ملاحظة: أنشئ متجر Vercel Blob واختر Public صراحةً عند الإنشاء
  private get access() {
    return (process.env.BLOB_ACCESS === 'private' ? 'private' : 'public') as 'public';
  }

  // يحوّل الصورة إلى webp + يولّد مصغّراً، ثم يرفعها للتخزين
  async put(teacherId: string, indicatorId: number, file: Express.Multer.File) {
    const base = `teachers/${teacherId}/indicators/${indicatorId}/${randomUUID()}`;

    const fullBuf = await sharp(file.buffer)
      .rotate()
      .resize({ width: 1600, withoutEnlargement: true })
      .webp({ quality: 82 })
      .toBuffer();

    const thumbBuf = await sharp(file.buffer)
      .rotate()
      .resize({ width: 320, height: 320, fit: 'cover' })
      .webp({ quality: 70 })
      .toBuffer();

    const opts = {
      access: this.access,
      contentType: 'image/webp',
      token: this.token,
      addRandomSuffix: true,
    };

    const full = await put(`${base}.webp`, fullBuf, opts);
    const thumb = await put(`${base}-thumb.webp`, thumbBuf, opts);

    return { url: full.url, thumbUrl: thumb.url, sizeBytes: fullBuf.length };
  }

  async delete(imageUrl: string, thumbUrl?: string | null) {
    try {
      await del(imageUrl, { token: this.token });
      if (thumbUrl) await del(thumbUrl, { token: this.token });
    } catch {
      // تجاهل أخطاء الحذف حتى لا توقف العملية
    }
  }

  // رفع شعار الموقع — يُخزّن مباشرةً كـ data URL (لا يعتمد على متجر خارجي)
  async putLogo(file: Express.Multer.File) {
    const buf = await sharp(file.buffer)
      .resize({ height: 96, withoutEnlargement: true })
      .png({ quality: 80, compressionLevel: 9 })
      .toBuffer();
    const dataUrl = `data:image/png;base64,${buf.toString('base64')}`;
    return { url: dataUrl };
  }

  // يجلب البايتات لاستخدامها عند التصدير (خادمياً — يتجنّب قيود CORS)
  async fetchBytes(url: string): Promise<Buffer> {
    if (url.startsWith('data:')) {
      const b64 = url.split(',')[1] || '';
      return Buffer.from(b64, 'base64');
    }
    const res = await fetch(url);
    return Buffer.from(await res.arrayBuffer());
  }
}
