import axios from 'axios';
import * as cheerio from 'cheerio';
import { db } from './firebase';
import { cleanText, isoNow, safeNum } from './utils';
import { ScrapeBatchSummary, ScrapeResult, UrlItem } from '@/types';

const MAX_PER_RUN = 2000; // Aumentado a 2000 URLs por ejecución
const EXECUTION_LIMIT_MS = 9 * 60 * 1000; // 9 minutos (límite de Vercel: 10min)
const PARALLEL_BATCH_SIZE = 50; // Procesar 50 URLs en paralelo (mucho más rápido)

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

function extractPrice($: cheerio.CheerioAPI, proveedor: string): number | null {
  // Meta tags (prioritarios)
  const metaSelectors = [
    'meta[property="product:price:amount"]',
    'meta[itemprop="price"]',
    'meta[name="twitter:data1"]',
    'meta[property="og:price:amount"]',
  ];

  for (const selector of metaSelectors) {
    const val = $(selector).attr('content');
    const parsed = safeNum(val);
    if (parsed !== null) return parsed;
  }

  // Selectores específicos para Tienda Nube
  if (proveedor.toLowerCase().includes('tienda nube') || proveedor.toLowerCase().includes('tiendaemi')) {
    const tiendaNubeSelectors = [
      '.js-price-display',
      '[data-product-price]',
      '.price-container .js-price-display',
      '#price_display',
      '.product-price',
      '[itemprop="price"]',
    ];

    for (const selector of tiendaNubeSelectors) {
      const elem = $(selector).first();
      const val = elem.attr('data-product-price') || elem.attr('content') || elem.text();
      const parsed = safeNum(val);
      if (parsed !== null && parsed > 0) return parsed;
    }
  }

  // HTML fragments (genéricos)
  const priceSelectors = [
    '[data-price]',
    '.price',
    '.product-price',
    '[itemprop="price"]',
    '.js-price-display',
    '#price',
  ];

  for (const selector of priceSelectors) {
    const elem = $(selector).first();
    const val = elem.attr('data-price') || elem.attr('content') || elem.text();
    const parsed = safeNum(val);
    if (parsed !== null && parsed > 0) return parsed;
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

function extractFinancing($: cheerio.CheerioAPI, proveedor: string): string {
  // Patrones comunes de financiación
  const patterns = [
    /(\d{1,2})\s*cuotas?\s*sin\s*inter[eé]s/i,
    /(\d{1,2})\s*x\s*\$[\d,.]+\s*sin\s*inter[eé]s/i,
    /(\d{1,2})\s*cuotas?\s*de\s*\$[\d,.]+/i,
    /hasta\s*(\d{1,2})\s*cuotas/i,
    /(\d{1,2})\s*cuotas/i,
  ];

  // Selectores para buscar información de financiación
  const selectors = [
    '.installments',
    '.financing',
    '.payment-info',
    '.cuotas',
    '[data-installments]',
    '.js-installments',
    '.product-installments',
    '.vtex-product-price-1-x-installments',
    '.price-installments',
  ];

  // Buscar en selectores específicos
  for (const selector of selectors) {
    const text = cleanText($(selector).first().text());
    for (const pattern of patterns) {
      const match = text.match(pattern);
      if (match) {
        // Limpiar y formatear el texto
        const cuotas = match[1];
        if (text.toLowerCase().includes('sin inter')) {
          return `${cuotas} cuotas sin interés`;
        }
        return `Hasta ${cuotas} cuotas`;
      }
    }
  }

  // Buscar en texto general de la página (más agresivo)
  const bodyText = cleanText($('.product-info, .product-details, .product-price-container').text());
  for (const pattern of patterns) {
    const match = bodyText.match(pattern);
    if (match) {
      const cuotas = match[1];
      if (bodyText.toLowerCase().includes('sin inter')) {
        return `${cuotas} cuotas sin interés`;
      }
      return `Hasta ${cuotas} cuotas`;
    }
  }

  return '';
}

export async function scrapeUrl(url: string, proveedor?: string): Promise<ScrapeResult> {
  const detectedProvider = proveedor || detectProveedor(url);
  console.log(`[SCRAPER] Scraping URL: ${url} | Provider: ${detectedProvider}`);

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

    // Extraer nombre del producto con selectores mejorados
    const name =
      cleanText(jsonLd?.name) ||
      cleanText($('meta[property="og:title"]').attr('content')) ||
      cleanText($('h1[itemprop="name"]').first().text()) ||
      cleanText($('h1.product-name').first().text()) ||
      cleanText($('h1').first().text()) ||
      cleanText($('.product-title').first().text());

    const listPrice =
      safeNum(jsonLd?.offers?.priceSpecification?.price) ||
      safeNum(jsonLd?.offers?.price) ||
      safeNum($('.list-price, .old-price, .price-compare, .js-compare-price-display').first().text());

    const price =
      safeNum(jsonLd?.offers?.price) ||
      extractPrice($, detectedProvider) ||
      safeNum($('.best-price, .sale-price').first().text()) ||
      listPrice ||
      null;

    const categoria =
      cleanText(jsonLd?.category) || cleanText(jsonLd?.breadcrumbs) || extractBreadcrumbs($);
    const descuento = extractDiscount($, detectedProvider, price, listPrice);
    const financiacion = extractFinancing($, detectedProvider);

    console.log(`[SCRAPER] Extracted data:`, {
      provider: detectedProvider,
      name: name || 'N/A',
      price: price ?? 'N/A',
      listPrice: listPrice ?? 'N/A',
      discount: descuento || 'N/A',
      financing: financiacion || 'N/A',
      category: categoria || 'N/A',
    });

    return {
      url,
      nombre: name || 'Producto sin nombre',
      precio: price ?? 0,
      descuento,
      financiacion,
      categoria,
      proveedor: detectedProvider,
      status: 'success',
      fechaScraping: isoNow(),
    };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Error desconocido';
    console.error(`[SCRAPER] Error scraping ${url}:`, message);

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

async function processSingleUrl(doc: FirebaseFirestore.QueryDocumentSnapshot) {
  const urlData = doc.data() as UrlItem;
  if (!urlData.url) {
    await doc.ref.update({ status: 'error', ultimoError: 'URL vacia' });
    return { processed: 1, errors: 1 };
  }

  try {
    await doc.ref.update({ status: 'processing', ultimoError: null });
    const result = await scrapeUrl(urlData.url, urlData.proveedor);

    // Detectar cambios de precio respecto al último éxito
    if (result.status === 'success' && result.precio > 0) {
      const prevSnap = await db
        .collection('resultados')
        .where('urlId', '==', doc.id)
        .orderBy('fechaScraping', 'desc')
        .limit(1)
        .get();

      if (!prevSnap.empty) {
        const prevData = prevSnap.docs[0].data();
        const prevPrice = Number(prevData.precio) || 0;
        if (prevPrice > 0 && Math.abs(result.precio - prevPrice) > 0.01) {
          const delta = result.precio - prevPrice;
          const deltaPct = prevPrice ? (delta / prevPrice) * 100 : 0;
          result.precioAnterior = prevPrice;
          result.cambioPrecio = delta;
          result.cambioPorcentaje = Math.round(deltaPct * 100) / 100;

          await db.collection('alerts').add({
            urlId: doc.id,
            url: result.url,
            nombre: result.nombre,
            proveedor: result.proveedor,
            precioAnterior: prevPrice,
            precioNuevo: result.precio,
            delta,
            deltaPorcentaje: result.cambioPorcentaje,
            fecha: result.fechaScraping,
            leida: false,
          });
        }
      }
    }

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

    return {
      processed: 1,
      errors: result.status === 'error' ? 1 : 0,
    };
  } catch (error) {
    // Si hay cualquier error inesperado (timeout, red, Firebase, etc.), marcar como error
    const errorMsg = error instanceof Error ? error.message : 'Error inesperado durante el procesamiento';
    console.error(`Error processing URL ${urlData.url}:`, errorMsg);

    try {
      await doc.ref.update({
        status: 'error',
        ultimoError: errorMsg,
        fechaScraping: isoNow(),
      });
    } catch (updateError) {
      console.error('Failed to update URL status after error:', updateError);
    }

    return { processed: 1, errors: 1 };
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

  // Procesar en lotes paralelos
  const docs = pendingSnapshot.docs;
  for (let i = 0; i < docs.length; i += PARALLEL_BATCH_SIZE) {
    if (Date.now() - startedAt > EXECUTION_LIMIT_MS) {
      break;
    }

    const batch = docs.slice(i, i + PARALLEL_BATCH_SIZE);
    const results = await Promise.all(batch.map(doc => processSingleUrl(doc)));

    results.forEach(result => {
      processed += result.processed;
      errors += result.errors;
    });

    // Sin delay - procesamiento máximo de velocidad
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
