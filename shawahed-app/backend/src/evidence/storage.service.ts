import { Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';
import sharp from 'sharp';
import { put, del } from '@vercel/blob'; // أو استبدلها بـ S3

@Injectable()
export class StorageService {
  // يحوّل الصورة إلى webp + يولّد مصغّراً، ثم يرفعها للتخزين
  async put(teacherId: string, indicatorId: number, file: Express.Multer.File) {
    const base = `teachers/${teacherId}/indicators/${indicatorId}/${randomUUID()}`;

    const fullBuf = await sharp(file.buffer)
      .rotate() // تصحيح اتجاه صور الجوال
      .resize({ width: 1600, withoutEnlargement: true })
      .webp({ quality: 82 })
      .toBuffer();

    const thumbBuf = await sharp(file.buffer)
      .rotate()
      .resize({ width: 320, height: 320, fit: 'cover' })
      .webp({ quality: 70 })
      .toBuffer();

    const full = await put(`${base}.webp`, fullBuf, {
      access: 'public',
      contentType: 'image/webp',
    });
    const thumb = await put(`${base}-thumb.webp`, thumbBuf, {
      access: 'public',
      contentType: 'image/webp',
    });

    return { url: full.url, thumbUrl: thumb.url, sizeBytes: fullBuf.length };
  }

  async delete(imageUrl: string, thumbUrl?: string | null) {
    await del(imageUrl);
    if (thumbUrl) await del(thumbUrl);
  }

  // رفع شعار الموقع — يحوّله إلى png محسّن
  async putLogo(file: Express.Multer.File) {
    const buf = await sharp(file.buffer)
      .resize({ height: 120, withoutEnlargement: true })
      .png()
      .toBuffer();
    const res = await put(`site/logo-${randomUUID()}.png`, buf, {
      access: 'public',
      contentType: 'image/png',
    });
    return { url: res.url };
  }

  // يجلب البايتات لاستخدامها عند التصدير (خادمياً — يتجنّب قيود CORS)
  async fetchBytes(url: string): Promise<Buffer> {
    const res = await fetch(url);
    return Buffer.from(await res.arrayBuffer());
  }
}
