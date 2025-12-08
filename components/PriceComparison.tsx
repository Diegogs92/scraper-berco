'use client';

import { useCallback, useEffect, useState } from 'react';
import { ArrowUpDown, ExternalLink, Loader2, TrendingDown } from 'lucide-react';

// Función para formatear precios correctamente en formato argentino
const formatPrice = (price: number): string => {
  return new Intl.NumberFormat('es-AR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(price);
};

type ComparisonItem = {
  id: string;
  nombre: string;
  precio: number;
  descuento: string;
  proveedor: string;
  url: string;
  fechaScraping: string;
};

type Comparison = {
  nombre: string;
  cantidadProveedores: number;
  precioMinimo: number;
  precioMaximo: number;
  diferencia: number;
  diferenciaPorcentaje: number;
  proveedorMasBarato: string;
  proveedorMasCaro: string;
  items: ComparisonItem[];
};

export default function PriceComparison() {
  const [comparisons, setComparisons] = useState<Comparison[]>([]);
  const [loading, setLoading] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const loadComparisons = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/comparacion?limit=20');
      const data = await res.json();
      setComparisons(data.comparisons || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadComparisons();
  }, [loadComparisons]);

  const toggleExpand = (nombre: string) => {
    setExpandedId(expandedId === nombre ? null : nombre);
  };

  return (
    <div className="card flex flex-col gap-4 p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-white/60">Comparación</p>
          <h3 className="text-lg font-semibold text-white">Precios por proveedor</h3>
          <p className="text-xs text-white/50 mt-1">
            {comparisons.length > 0
              ? `${comparisons.length} productos con múltiples proveedores`
              : 'Compara precios del mismo producto entre proveedores'}
          </p>
        </div>
        <button
          onClick={loadComparisons}
          className="text-xs text-[#16DB93] hover:text-[#16DB93] flex items-center gap-1"
          disabled={loading}
        >
          {loading ? <Loader2 className="h-3 w-3 animate-spin" /> : <ArrowUpDown className="h-3 w-3" />}
          Actualizar
        </button>
      </div>

      <div className="space-y-2">
        {loading && comparisons.length === 0 ? (
          <div className="py-12 text-center text-white/60">
            <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2" />
            Cargando comparaciones...
          </div>
        ) : comparisons.length === 0 ? (
          <div className="py-6 text-center text-white/60 text-sm">
            No hay productos duplicados entre proveedores aún.
          </div>
        ) : (
          comparisons.map((comp) => (
            <div
              key={comp.nombre}
              className="rounded-lg border border-white/10 bg-black/20 overflow-hidden"
            >
              <button
                onClick={() => toggleExpand(comp.nombre)}
                className="w-full px-4 py-3 flex items-center justify-between hover:bg-white/5 transition-colors"
              >
                <div className="flex-1 text-left">
                  <div className="font-medium text-white text-sm">{comp.nombre}</div>
                  <div className="flex items-center gap-3 mt-1 text-xs text-white/60">
                    <span>{comp.cantidadProveedores} proveedores</span>
                    <span className="text-white/40">•</span>
                    <span>
                      ${formatPrice(comp.precioMinimo)} - ${formatPrice(comp.precioMaximo)}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <div className="flex items-center gap-1 text-[#16DB93] font-semibold text-sm">
                      <TrendingDown className="h-4 w-4" />
                      {comp.diferenciaPorcentaje}%
                    </div>
                    <div className="text-xs text-white/60">
                      ${formatPrice(comp.diferencia)} menos
                    </div>
                  </div>
                  <ArrowUpDown
                    className={`h-4 w-4 text-white/40 transition-transform ${
                      expandedId === comp.nombre ? 'rotate-180' : ''
                    }`}
                  />
                </div>
              </button>

              {expandedId === comp.nombre && (
                <div className="border-t border-white/10 bg-black/10">
                  <div className="p-4 space-y-2">
                    {comp.items.map((item, idx) => (
                      <div
                        key={item.id}
                        className={`flex items-center justify-between p-3 rounded-lg ${
                          idx === 0
                            ? 'bg-[#16DB93]/10 border border-[#16DB93]/30'
                            : 'bg-white/5'
                        }`}
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-white">{item.proveedor}</span>
                            {idx === 0 && (
                              <span className="px-2 py-0.5 text-xs bg-[#16DB93]/30 text-emerald-100 rounded-full">
                                Mejor precio
                              </span>
                            )}
                          </div>
                          {item.descuento && (
                            <span className="text-xs text-[#16DB93] mt-1 inline-block">
                              {item.descuento}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-lg font-semibold text-white">
                            ${formatPrice(item.precio)}
                          </span>
                          <a
                            href={item.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[#16DB93] hover:text-[#16DB93]"
                            title="Ver producto"
                          >
                            <ExternalLink className="h-4 w-4" />
                          </a>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
