import { NextResponse } from 'next/server';
import { runScrapingBatch } from '@/lib/scraper';
import { db } from '@/lib/firebase';
import { isoNow } from '@/lib/utils';

export async function POST() {
  try {
    const summary = await runScrapingBatch('manual');
    await db.collection('config').doc('scraper').set(
      {
        scrapingActivo: false,
        ultimaEjecucion: isoNow(),
      },
      { merge: true }
    );
    return NextResponse.json(summary);
  } catch (error) {
    console.error('POST /api/scraper/manual error', error);
    return NextResponse.json({ error: 'Error ejecutando el scraping manual' }, { status: 500 });
  }
}
