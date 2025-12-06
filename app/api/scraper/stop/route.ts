import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase';

export async function POST() {
  try {
    await db.collection('config').doc('scraper').set({ scrapingActivo: false }, { merge: true });
    return NextResponse.json({ stopped: true });
  } catch (error) {
    console.error('POST /api/scraper/stop error', error);
    return NextResponse.json({ error: 'No se pudo detener el scraping' }, { status: 500 });
  }
}
