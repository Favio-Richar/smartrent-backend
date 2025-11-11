// ===============================================================
// 📊 ESTADÍSTICAS SERVICE – SmartRent+ (versión final sin get-stream)
// ---------------------------------------------------------------
// ✅ Totalmente compatible con CommonJS / NestJS
// ✅ Sin dependencias ESM (get-stream eliminado)
// ✅ Exportación Excel + PDF funcional
// ===============================================================

import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as ExcelJS from 'exceljs';
import PDFDocument from 'pdfkit';

@Injectable()
export class EstadisticasService {
  constructor(private readonly prisma: PrismaService) {}

  // ===========================================================
  // 📊 Obtener resumen general de arriendos
  // ===========================================================
  async getResumenArriendos() {
    try {
      const published = await this.prisma.property.count({
        where: { state: 'published' },
      });

      const drafts = await this.prisma.property.count({
        where: { state: 'draft' },
      });

      const paused = await this.prisma.property.count({
        where: { state: 'paused' },
      });

      const archived = await this.prisma.property.count({
        where: { state: 'archived' },
      });

      const reservations = await this.prisma.reservation.count();

      const views = await this.prisma.property.aggregate({
        _sum: { visitas: true },
      });

      return {
        published,
        drafts,
        paused,
        archived,
        reservations,
        views: views._sum.visitas ?? 0,
      };
    } catch (error) {
      console.error('❌ Error al obtener estadísticas:', error);
      return {
        published: 0,
        drafts: 0,
        paused: 0,
        archived: 0,
        reservations: 0,
        views: 0,
      };
    }
  }

  // ===========================================================
  // 📄 Exportar estadísticas a PDF
  // ===========================================================
  async exportPdf(): Promise<Buffer> {
    const resumen = await this.getResumenArriendos();

    const doc = new PDFDocument({ margin: 40 });
    const chunks: Uint8Array[] = [];

    // 📦 Recolecta los datos del stream manualmente
    return new Promise((resolve, reject) => {
      doc.on('data', (chunk) => chunks.push(chunk));
      doc.on('end', () => {
        const buffer = Buffer.concat(chunks);
        resolve(buffer);
      });
      doc.on('error', (err) => reject(err));

      // === Contenido del PDF ===
      doc.fontSize(18).text('📊 Reporte de Estadísticas – SmartRent+', {
        align: 'center',
      });
      doc.moveDown();

      Object.entries(resumen).forEach(([key, value]) => {
        doc.fontSize(14).text(`${key.toUpperCase()}: ${value}`);
      });

      doc.moveDown();
      doc
        .fontSize(10)
        .text(`Generado automáticamente · ${new Date().toLocaleString()}`, {
          align: 'center',
        });

      doc.end();
    });
  }

  // ===========================================================
  // 📊 Exportar estadísticas a Excel
  // ===========================================================
  async exportExcel(): Promise<Buffer> {
    const resumen = await this.getResumenArriendos();

    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Estadísticas');

    sheet.columns = [
      { header: 'Indicador', key: 'key', width: 25 },
      { header: 'Valor', key: 'value', width: 15 },
    ];

    Object.entries(resumen).forEach(([key, value]) => {
      sheet.addRow({ key, value });
    });

    // 🎨 Estilos del encabezado
    sheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
    sheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: '4472C4' },
    };

    const buffer: Buffer = (await workbook.xlsx.writeBuffer()) as unknown as Buffer;
    return buffer;
  }
}
