export type UrlStatus = 'pending' | 'processing' | 'done' | 'error';
export type ScrapeStatus = 'success' | 'error';

export interface UrlItem {
  id: string;
  url: string;
  proveedor: string;
  status: UrlStatus;
  fechaAgregada: string;
  ultimoError?: string | null;
}

export interface ScrapeResult {
  id?: string;
  urlId?: string;
  url: string;
  nombre: string;
  precio: number;
  descuento?: string;
  categoria?: string;
  proveedor: string;
  status: ScrapeStatus;
  fechaScraping: string;
  error?: string;
  imagen?: string;
}

export interface ScrapeBatchSummary {
  mode: 'manual' | 'auto';
  processed: number;
  errors: number;
  remaining: number;
  durationMs: number;
}

export interface ProgressTotals {
  pending: number;
  processing: number;
  done: number;
  error: number;
}

export interface ScraperConfig {
  scrapingActivo: boolean;
  ultimaEjecucion?: string;
}

export interface ResultFilter {
  proveedor?: string;
  status?: ScrapeStatus;
  categoria?: string;
  search?: string;
}

// Legacy tipos usados por componentes antiguos (no afectan al nuevo dashboard)
export interface Product {
  id: number;
  url: string;
  nombre: string;
  precio: number;
  descuento: string;
  categoria: string;
  proveedor: string;
  status: string;
  fecha_scraping: string;
  precioLista?: number;
}

export interface ProductFilter {
  proveedor?: string;
  categoria?: string;
  search?: string;
  minPrice?: number;
  maxPrice?: number;
  hasDiscount?: boolean;
}

export interface PriceStats {
  producto: string;
  precioMinimo: number;
  precioMaximo: number;
  precioPromedio: number;
  proveedorMasBarato: string;
  proveedorMasCaro: string;
  diferenciaPorcentaje: number;
}

export interface ProviderStats {
  proveedor: string;
  cantidadProductos: number;
  precioPromedio: number;
  productosConDescuento: number;
  descuentoPromedio: number;
}
