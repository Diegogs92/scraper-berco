import { NextRequest, NextResponse } from 'next/server';
import { runScrapingBatch } from '@/lib/scraper';
import { db } from '@/lib/firebase';
import { isoNow } from '@/lib/utils';

export async function POST(req: NextRequest) {
  try {
    const configRef = db.collection('config').doc('scraper');
    const configSnap = await configRef.get();
    const force = req.nextUrl.searchParams.get('force') === '1';

    if (configSnap.exists && configSnap.data()?.scrapingActivo && !force) {
      return NextResponse.json({ message: 'Ya hay un scraping en curso' }, { status: 202 });
    }

    await configRef.set({ scrapingActivo: true, ultimaEjecucion: isoNow() }, { merge: true });
    const summary = await runScrapingBatch('auto');
    await configRef.set(
      {
        scrapingActivo: summary.remaining > 0,
        ultimaEjecucion: isoNow(),
      },
      { merge: true }
    );

    return NextResponse.json(summary);
  } catch (error) {
    console.error('POST /api/scraper/start error', error);
    return NextResponse.json({ error: 'Error iniciando el scraping automatico' }, { status: 500 });
  }
}
