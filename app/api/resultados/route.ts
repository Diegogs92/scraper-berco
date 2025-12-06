import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { cleanText, toCsv } from '@/lib/utils';
import { ScrapeResult } from '@/types';

export async function GET(request: NextRequest) {
  try {
    const params = request.nextUrl.searchParams;
    const proveedor = params.get('proveedor');
    const status = params.get('status');
    const categoria = params.get('categoria')?.toLowerCase();
    const search = params.get('search')?.toLowerCase();
    const format = params.get('format');
    const limit = Math.min(parseInt(params.get('limit') || '200', 10), 500);

    const snapshot = await db
      .collection('resultados')
      .orderBy('fechaScraping', 'desc')
      .limit(limit)
      .get();

    const results: ScrapeResult[] = snapshot.docs
      .map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          urlId: data.urlId || '',
          url: data.url || '',
          nombre: data.nombre || '',
          precio: Number(data.precio) || 0,
          descuento: data.descuento || '',
          categoria: data.categoria || '',
          proveedor: data.proveedor || '',
          status: data.status || '',
          fechaScraping: data.fechaScraping || '',
          error: data.error || '',
        };
      })
      .filter((item) => {
        if (proveedor && item.proveedor !== proveedor) return false;
        if (status && item.status !== status) return false;
        if (categoria && !item.categoria.toLowerCase().includes(categoria)) return false;
        if (search && !item.nombre.toLowerCase().includes(search)) return false;
        return true;
      });

    if (format === 'csv') {
      const csv = toCsv(
        results.map((r) => ({
          url: r.url,
          nombre: cleanText(r.nombre),
          precio: r.precio,
          descuento: r.descuento,
          categoria: r.categoria,
          proveedor: r.proveedor,
          status: r.status,
          fechaScraping: r.fechaScraping,
          error: r.error || '',
        })),
        ['url', 'nombre', 'precio', 'descuento', 'categoria', 'proveedor', 'status', 'fechaScraping', 'error']
      );

      return new NextResponse(csv, {
        headers: {
          'Content-Type': 'text/csv; charset=utf-8',
          'Content-Disposition': 'attachment; filename="resultados.csv"',
        },
      });
    }

    return NextResponse.json({ results });
  } catch (error) {
    console.error('GET /api/resultados error', error);
    return NextResponse.json({ error: 'No se pudieron obtener los resultados' }, { status: 500 });
  }
}
