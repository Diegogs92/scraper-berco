'use client';

import { X, TrendingDown, Store, Package, DollarSign } from 'lucide-react';
import { ScrapeResult } from '@/types';

type Props = {
  products: ScrapeResult[];
  onClose: () => void;
};

// Función para formatear precios correctamente en formato argentino
const formatPrice = (price: number): string => {
  return new Intl.NumberFormat('es-AR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(price);
};

export default function ComparisonModal({ products, onClose }: Props) {
  if (products.length === 0) return null;

  // Agrupar por nombre (case-insensitive)
  const groupedByName = products.reduce((acc, product) => {
    const key = product.nombre.toLowerCase().trim();
    if (!acc[key]) {
      acc[key] = [];
    }
    acc[key].push(product);
    return acc;
  }, {} as Record<string, ScrapeResult[]>);

  const groups = Object.entries(groupedByName).map(([_, items]) => {
    const sortedItems = items.sort((a, b) => a.precio - b.precio);
    const precios = items.map(item => item.precio);
    const minPrecio = Math.min(...precios);
    const maxPrecio = Math.max(...precios);
    const diferencia = maxPrecio - minPrecio;

    return {
      nombre: items[0].nombre,
      items: sortedItems,
      minPrecio,
      maxPrecio,
      diferencia,
      hasMultipleProviders: items.length > 1,
    };
  });

  // Estadísticas
  const totalProviders = new Set(products.map(p => p.proveedor)).size;
  const totalSavings = groups.reduce((sum, g) => sum + g.diferencia, 0);
  const avgPrice = products.reduce((sum, p) => sum + p.precio, 0) / products.length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
      <div className="w-full max-w-6xl max-h-[90vh] overflow-y-auto">
        <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-2xl border border-white/10 shadow-2xl">
          {/* Header */}
          <div className="sticky top-0 bg-slate-900/95 backdrop-blur-sm border-b border-white/10 px-6 py-4 rounded-t-2xl">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-white">Comparación de Precios</h2>
                <p className="text-sm text-white/60 mt-1">
                  {products.length} {products.length === 1 ? 'producto seleccionado' : 'productos seleccionados'}
                </p>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                aria-label="Cerrar"
              >
                <X className="h-6 w-6 text-white/70 hover:text-white" />
              </button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 px-6 py-6 border-b border-white/5">
            <div className="bg-gradient-to-br from-[#16DB93]/10 to-[#16DB93]/5 border border-[#16DB93]/20 rounded-xl p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-[#16DB93]/20 flex items-center justify-center">
                  <Package className="h-5 w-5 text-[#16DB93]" />
                </div>
                <div>
                  <p className="text-xs text-emerald-200/60 uppercase tracking-wider">Productos</p>
                  <p className="text-xl font-bold text-white">{groups.length}</p>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-blue-500/10 to-blue-600/5 border border-blue-500/20 rounded-xl p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
                  <Store className="h-5 w-5 text-blue-400" />
                </div>
                <div>
                  <p className="text-xs text-blue-200/60 uppercase tracking-wider">Proveedores</p>
                  <p className="text-xl font-bold text-white">{totalProviders}</p>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-purple-500/10 to-purple-600/5 border border-purple-500/20 rounded-xl p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center">
                  <DollarSign className="h-5 w-5 text-purple-400" />
                </div>
                <div>
                  <p className="text-xs text-purple-200/60 uppercase tracking-wider">Precio Promedio</p>
                  <p className="text-xl font-bold text-white">
                    ${formatPrice(avgPrice)}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-[#598392]/10 to-amber-600/5 border border-[#598392]/20 rounded-xl p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-[#598392]/20 flex items-center justify-center">
                  <TrendingDown className="h-5 w-5 text-[#598392]" />
                </div>
                <div>
                  <p className="text-xs text-amber-200/60 uppercase tracking-wider">Ahorro Total</p>
                  <p className="text-xl font-bold text-white">
                    ${formatPrice(totalSavings)}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Comparison List */}
          <div className="px-6 py-6 space-y-6">
            {groups.map((group, idx) => (
              <div key={idx} className="bg-white/5 rounded-xl border border-white/10 overflow-hidden">
                {/* Product Header */}
                <div className="bg-white/5 px-4 py-3 border-b border-white/10">
                  <h3 className="text-base font-semibold text-white">{group.nombre}</h3>
                  {group.hasMultipleProviders && (
                    <div className="flex items-center gap-2 mt-1 text-xs text-white/60">
                      <span>{group.items.length} proveedores</span>
                      <span>•</span>
                      <span>
                        Rango: ${formatPrice(group.minPrecio)} - ${formatPrice(group.maxPrecio)}
                      </span>
                      {group.diferencia > 0 && (
                        <>
                          <span>•</span>
                          <span className="text-[#16DB93] font-medium">
                            Ahorra ${formatPrice(group.diferencia)}
                          </span>
                        </>
                      )}
                    </div>
                  )}
                </div>

                {/* Product Items */}
                <div className="divide-y divide-white/5">
                  {group.items.map((item, itemIdx) => (
                    <div
                      key={item.id || item.url}
                      className={`px-4 py-3 flex items-center justify-between hover:bg-white/5 transition-colors ${
                        itemIdx === 0 && group.hasMultipleProviders
                          ? 'bg-[#16DB93]/5'
                          : ''
                      }`}
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-white">{item.proveedor}</span>
                          {itemIdx === 0 && group.hasMultipleProviders && (
                            <span className="px-2 py-0.5 text-xs bg-[#16DB93]/20 text-[#16DB93] border border-[#16DB93]/30 rounded-full font-medium">
                              Mejor precio
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          {item.descuento && (
                            <span className="text-xs text-[#16DB93] font-medium">
                              {item.descuento}
                            </span>
                          )}
                          <span className="text-xs text-white/40">
                            {new Date(item.fechaScraping).toLocaleDateString('es-AR', {
                              day: '2-digit',
                              month: '2-digit',
                              year: '2-digit'
                            })}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <div className="text-xl font-bold text-white">
                            ${formatPrice(item.precio)}
                          </div>
                          {itemIdx > 0 && group.hasMultipleProviders && (
                            <div className="text-xs text-[#DB2B39] font-medium">
                              +${formatPrice(item.precio - group.minPrecio)} más caro
                            </div>
                          )}
                        </div>
                        <a
                          href={item.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-3 py-2 bg-[#16DB93]/10 hover:bg-[#16DB93]/20 text-[#16DB93] text-sm font-medium rounded-lg border border-[#16DB93]/30 transition-colors"
                        >
                          Ver
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Footer */}
          <div className="sticky bottom-0 bg-slate-900/95 backdrop-blur-sm border-t border-white/10 px-6 py-4 rounded-b-2xl">
            <div className="flex justify-end">
              <button
                onClick={onClose}
                className="px-6 py-2.5 bg-white/10 hover:bg-white/20 text-white font-medium rounded-lg transition-colors"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
