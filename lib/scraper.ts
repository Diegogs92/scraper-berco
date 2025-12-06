import axios from 'axios';
import * as cheerio from 'cheerio';
import { db } from './firebase';
import { cleanText, delay, isoNow, safeNum } from './utils';
import { ScrapeBatchSummary, ScrapeResult, UrlItem } from '@/types';

const RATE_LIMIT_MS = 500;
const MAX_PER_RUN = 300;
const EXECUTION_LIMIT_MS = 4 * 60 * 1000;

type JsonLdProduct = {
  name?: string;
  category?: string;
  breadcrumbs?: string;
  offers?: {
    price?: string | number;
    priceSpecification?: { price?: string | number };
  };
};

const PROVIDER_MAP: Record<string, string> = {
  'supermat.com.ar': 'VTEX - Supermat',
  'elamigo.com.ar': 'VTEX - El Amigo',
  'unimax.com.ar': 'VTEX - Unimax',
  'bercovich.com.ar': 'VTEX - Bercovich',
  'tiendaemi.com.ar': 'Tienda Nube - Tienda Emi',
  'zeramiko.com.ar': 'Tienda Nube - Zeramiko',
};

export function detectProveedor(url: string): string {
  try {
    const host = new URL(url).hostname.replace('www.', '').toLowerCase();
    const match = Object.entries(PROVIDER_MAP).find(([domain]) => host.includes(domain));
    if (match) return match[1];
    if (host.includes('vtex')) return 'VTEX';
    if (host.includes('tiendanube')) return 'Tienda Nube';
    return host;
  } catch {
    return 'desconocido';
  }
}

export function parseJSONLD(html: string): JsonLdProduct | null {
  try {
    const $ = cheerio.load(html);
    const scripts = $('script[type="application/ld+json"]')
      .map((_, el) => $(el).contents().text())
      .get();
    for (const raw of scripts) {
      try {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          const product = parsed.find((p) => p['@type'] === 'Product');
          if (product) return product as JsonLdProduct;
        }
        if (parsed['@type'] === 'Product') return parsed as JsonLdProduct;
      } catch {
        continue;
      }
    }
  } catch (err) {
    console.error('parseJSONLD error', err);
  }
  return null;
}

function extractBreadcrumbs($: cheerio.CheerioAPI): string {
  const breadcrumbSelectors = [
    '[data-breadcrumb]',
    'nav[aria-label*="breadcrumb"]',
    '.breadcrumb',
    '[itemtype*="Breadcrumb"]',
  ];
  for (const selector of breadcrumbSelectors) {
    const text = cleanText(
      $(selector)
        .find('a, span, li')
        .map((_, el) => $(el).text())
        .get()
        .join(' > ')
    );
    if (text) return text;
  }
  const metaCategory = cleanText($('meta[property="product:category"]').attr('content'));
  if (metaCategory) return metaCategory;
  return '';
}

function extractPrice($: cheerio.CheerioAPI): number | null {
  const metaSelectors = [
    'meta[property="product:price:amount"]',
    'meta[itemprop="price"]',
    'meta[name="twitter:data1"]',
    'meta[name="twitter:label1"]',
    'meta[property="og:price:amount"]',
  ];

  for (const selector of metaSelectors) {
    const val = $(selector).attr('content');
    const parsed = safeNum(val);
    if (parsed !== null) return parsed;
  }

  // HTML fragments
  const priceSelectors = ['[data-price]', '.price', '.product-price', '[itemprop="price"]'];
  for (const selector of priceSelectors) {
    const val = $(selector).first().attr('data-price') || $(selector).first().text();
    const parsed = safeNum(val);
    if (parsed !== null) return parsed;
  }
  return null;
}

function extractDiscount(
  $: cheerio.CheerioAPI,
  proveedor: string,
  price: number | null,
  listPrice?: number | null
): string {
  const discountSelectors = ['.discount', '.product-discount', '[data-discount]'];
  for (const selector of discountSelectors) {
    const val = $(selector).first().attr('data-discount') || $(selector).first().text();
    const percentMatch = val?.match(/(\d{1,3})%/);
    if (percentMatch) return `${percentMatch[1]}%`;
  }

  if (listPrice && price && listPrice > 0 && listPrice > price) {
    const pct = Math.round(((listPrice - price) / listPrice) * 100);
    if (pct > 0) return `${pct}%`;
  }

  if (proveedor.toLowerCase().includes('vtex')) {
    const spot = safeNum($('.vtex-product-price-1-x-sellingPriceValue').text());
    const list = safeNum($('.vtex-product-price-1-x-listPriceValue').text());
    if (list && spot && list > spot) {
      const pct = Math.round(((list - spot) / list) * 100);
      return `${pct}%`;
    }
  }

  return '';
}

export async function scrapeUrl(url: string, proveedor?: string): Promise<ScrapeResult> {
  const detectedProvider = proveedor || detectProveedor(url);
  try {
    const { data: html } = await axios.get<string>(url, {
      timeout: 20000,
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120 Safari/537.36',
      },
    });

    const $ = cheerio.load(html);
    const jsonLd = parseJSONLD(html);
    const name =
      cleanText(jsonLd?.name) ||
      cleanText($('meta[property="og:title"]').attr('content')) ||
      cleanText($('h1').first().text());

    const listPrice =
      safeNum(jsonLd?.offers?.priceSpecification?.price) ||
      safeNum(jsonLd?.offers?.price) ||
      safeNum($('.list-price, .old-price').first().text());

    const price =
      safeNum(jsonLd?.offers?.price) ||
      extractPrice($) ||
      safeNum($('.best-price, .sale-price').first().text()) ||
      listPrice ||
      null;

    const categoria =
      cleanText(jsonLd?.category) || cleanText(jsonLd?.breadcrumbs) || extractBreadcrumbs($);
    const descuento = extractDiscount($, detectedProvider, price, listPrice);

    return {
      url,
      nombre: name || 'Producto sin nombre',
      precio: price ?? 0,
      descuento,
      categoria,
      proveedor: detectedProvider,
      status: 'success',
      fechaScraping: isoNow(),
    };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Error desconocido';
    return {
      url,
      nombre: '',
      precio: 0,
      descuento: '',
      categoria: '',
      proveedor: detectedProvider,
      status: 'error',
      fechaScraping: isoNow(),
      error: message,
    };
  }
}

export async function runScrapingBatch(
  mode: 'manual' | 'auto',
  limit = MAX_PER_RUN
): Promise<ScrapeBatchSummary> {
  const startedAt = Date.now();
  const pendingSnapshot = await db
    .collection('urls')
    .where('status', '==', 'pending')
    .orderBy('fechaAgregada', 'asc')
    .limit(limit)
    .get();

  let processed = 0;
  let errors = 0;

  for (const doc of pendingSnapshot.docs) {
    if (Date.now() - startedAt > EXECUTION_LIMIT_MS) {
      break;
    }

    const urlData = doc.data() as UrlItem;
    if (!urlData.url) {
      await doc.ref.update({ status: 'error', ultimoError: 'URL vacia' });
      errors += 1;
      continue;
    }
    await doc.ref.update({ status: 'processing', ultimoError: null });

    const result = await scrapeUrl(urlData.url, urlData.proveedor);

    await db.collection('resultados').add({
      ...result,
      urlId: doc.id,
    });

    await doc.ref.update({
      proveedor: result.proveedor,
      status: result.status === 'success' ? 'done' : 'error',
      fechaScraping: result.fechaScraping,
      ultimoError: result.status === 'error' ? result.error || 'Error desconocido' : null,
    });

    processed += 1;
    if (result.status === 'error') errors += 1;

    await delay(RATE_LIMIT_MS);
  }

  const remainingSnapshot = await db.collection('urls').where('status', '==', 'pending').get();

  return {
    mode,
    processed,
    errors,
    remaining: remainingSnapshot.size,
    durationMs: Date.now() - startedAt,
  };
}
