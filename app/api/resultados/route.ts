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
    const offset = parseInt(params.get('offset') || '0', 10);

    // Build query with filters
    let query = db.collection('resultados').orderBy('fechaScraping', 'desc');

    if (proveedor) {
      query = query.where('proveedor', '==', proveedor);
    }
    if (status) {
      query = query.where('status', '==', status);
    }

    // Get total count for pagination
    const countQuery = proveedor || status ? query : db.collection('resultados');
    const totalSnapshot = await countQuery.count().get();
    const total = totalSnapshot.data().count;

    // Get paginated data
    const snapshot = await query.limit(limit).offset(offset).get();

    let results: ScrapeResult[] = snapshot.docs.map((doc) => {
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
    });

    // Client-side filters (Firestore doesn't support contains or multiple inequality)
    if (categoria) {
      results = results.filter(item => item.categoria.toLowerCase().includes(categoria));
    }
    if (search) {
      results = results.filter(item => item.nombre.toLowerCase().includes(search));
    }

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

    return NextResponse.json({ results, total });
  } catch (error) {
    console.error('GET /api/resultados error', error);
    return NextResponse.json({ error: 'No se pudieron obtener los resultados' }, { status: 500 });
  }
}
