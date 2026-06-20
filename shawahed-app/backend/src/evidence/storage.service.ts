import { Injectable } from '@nestjs/common';
import sharp from 'sharp';

@Injectable()
export class StorageService {
  // يحوّل الصورة إلى webp + مصغّر، ويخزّنهما كـ data URL (base64)
  // لا يعتمد على متجر تخزين خارجي — يعمل مباشرةً
  async put(teacherId: string, indicatorId: number, file: Express.Multer.File) {
    const fullBuf = await sharp(file.buffer)
      .rotate()
      .resize({ width: 1280, withoutEnlargement: true })
      .webp({ quality: 78 })
      .toBuffer();

    const thumbBuf = await sharp(file.buffer)
      .rotate()
      .resize({ width: 320, height: 320, fit: 'cover' })
      .webp({ quality: 65 })
      .toBuffer();

    const url = `data:image/webp;base64,${fullBuf.toString('base64')}`;
    const thumbUrl = `data:image/webp;base64,${thumbBuf.toString('base64')}`;

    return { url, thumbUrl, sizeBytes: fullBuf.length };
  }

  async delete() {
    // الصور مخزّنة كـ data URL داخل قاعدة البيانات، فالحذف يتم بحذف السجلّ نفسه
    return;
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
