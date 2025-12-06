import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { detectProveedor } from '@/lib/scraper';
import { isoNow, parseCsvUrls, toCsv } from '@/lib/utils';
import { UrlItem } from '@/types';

export async function GET(request: NextRequest) {
  try {
    const params = request.nextUrl.searchParams;
    const status = params.get('status');
    const proveedor = params.get('proveedor');
    const search = params.get('search')?.toLowerCase();
    const format = params.get('format');
    const limit = Math.min(parseInt(params.get('limit') || '200', 10), 500);

    const snapshot = await db.collection('urls').orderBy('fechaAgregada', 'desc').limit(limit).get();

    const urls: UrlItem[] = snapshot.docs
      .map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          url: data.url || '',
          proveedor: data.proveedor || detectProveedor(data.url || ''),
          status: data.status || 'pending',
          fechaAgregada: data.fechaAgregada || data.fecha || '',
          ultimoError: data.ultimoError || null,
        };
      })
      .filter((item) => {
        if (status && item.status !== status) return false;
        if (proveedor && item.proveedor !== proveedor) return false;
        if (search && !item.url.toLowerCase().includes(search)) return false;
        return true;
      });

    if (format === 'csv') {
      const csv = toCsv(
        urls.map((u) => ({
          url: u.url,
          proveedor: u.proveedor,
          status: u.status,
          fechaAgregada: u.fechaAgregada,
          ultimoError: u.ultimoError || '',
        })),
        ['url', 'proveedor', 'status', 'fechaAgregada', 'ultimoError']
      );
      return new NextResponse(csv, {
        headers: {
          'Content-Type': 'text/csv; charset=utf-8',
          'Content-Disposition': 'attachment; filename="urls.csv"',
        },
      });
    }

    const [pendingCount, processingCount, doneCount, errorCount] = await Promise.all([
      db.collection('urls').where('status', '==', 'pending').count().get(),
      db.collection('urls').where('status', '==', 'processing').count().get(),
      db.collection('urls').where('status', '==', 'done').count().get(),
      db.collection('urls').where('status', '==', 'error').count().get(),
    ]);

    const totals = {
      pending: pendingCount.data().count,
      processing: processingCount.data().count,
      done: doneCount.data().count,
      error: errorCount.data().count,
    };

    const configDoc = await db.collection('config').doc('scraper').get();
    const config = {
      scrapingActivo: configDoc.data()?.scrapingActivo || false,
      ultimaEjecucion: configDoc.data()?.ultimaEjecucion || '',
    };

    return NextResponse.json({ urls, totals, config });
  } catch (error) {
    console.error('GET /api/urls error', error);
    return NextResponse.json({ error: 'No se pudieron obtener las URLs' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const urls: string[] = Array.isArray(body.urls)
      ? body.urls
      : body.csv
      ? parseCsvUrls(body.csv)
      : body.url
      ? [body.url]
      : [];

    if (!urls.length) {
      return NextResponse.json({ error: 'No se enviaron URLs' }, { status: 400 });
    }

    let inserted = 0;
    const batch = db.batch();
    const now = isoNow();

    for (const url of urls) {
      const proveedor = detectProveedor(url);
      const existing = await db.collection('urls').where('url', '==', url).limit(1).get();
      if (!existing.empty) continue;

      const ref = db.collection('urls').doc();
      batch.set(ref, {
        url,
        proveedor,
        status: 'pending',
        fechaAgregada: now,
      });
      inserted += 1;
    }

    if (inserted > 0) {
      await batch.commit();
    }

    return NextResponse.json({ inserted, totalReceived: urls.length });
  } catch (error) {
    console.error('POST /api/urls error', error);
    return NextResponse.json({ error: 'No se pudieron guardar las URLs' }, { status: 500 });
  }
}
