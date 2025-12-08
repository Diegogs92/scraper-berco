'use client';

import { useCallback, useEffect, useState } from 'react';
import { Search, Loader2, TrendingDown, ExternalLink, X, CheckCircle2 } from 'lucide-react';

// Función para formatear precios correctamente en formato argentino
const formatPrice = (price: number): string => {
  return new Intl.NumberFormat('es-AR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(price);
};

type ProductResult = {
  id: string;
  nombre: string;
  precio: number;
  descuento: string;
  proveedor: string;
  url: string;
  fechaScraping: string;
};

type GroupedProduct = {
  nombre: string;
  normalizedName: string;
  items: ProductResult[];
  minPrecio: number;
  maxPrecio: number;
  diferencia: number;
  diferenciaPorcentaje: number;
  proveedorCount: number;
};

export default function ProductComparisonSelector() {
  const [products, setProducts] = useState<GroupedProduct[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<GroupedProduct[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<GroupedProduct | null>(null);

  const loadProducts = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/resultados?limit=500');
      const data = await res.json();

      // Agrupar productos por nombre (sin importar el proveedor)
      const grouped = new Map<string, ProductResult[]>();

      (data.resultados || []).forEach((result: ProductResult) => {
        const normalizedName = result.nombre.toLowerCase().trim();
        if (!grouped.has(normalizedName)) {
          grouped.set(normalizedName, []);
        }
        grouped.get(normalizedName)!.push(result);
      });

      // Convertir a array y solo incluir productos que tengan múltiples proveedores
      const groupedArray: GroupedProduct[] = [];
      grouped.forEach((items, normalizedName) => {
        // Obtener proveedores únicos
        const uniqueProviders = new Set(items.map(item => item.proveedor));

        // Solo incluir si hay múltiples proveedores
        if (uniqueProviders.size > 1) {
          const precios = items.map(item => item.precio);
          const minPrecio = Math.min(...precios);
          const maxPrecio = Math.max(...precios);
          const diferencia = maxPrecio - minPrecio;
          const diferenciaPorcentaje = ((diferencia / maxPrecio) * 100);

          groupedArray.push({
            nombre: items[0].nombre, // Usar el nombre original del primer item
            normalizedName,
            items: items.sort((a, b) => a.precio - b.precio), // Ordenar por precio
            minPrecio,
            maxPrecio,
            diferencia,
            diferenciaPorcentaje,
            proveedorCount: uniqueProviders.size,
          });
        }
      });

      // Ordenar por diferencia de precio descendente
      groupedArray.sort((a, b) => b.diferencia - a.diferencia);

      setProducts(groupedArray);
      setFilteredProducts(groupedArray);
    } catch (err) {
      console.error('Error loading products:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredProducts(products);
    } else {
      const term = searchTerm.toLowerCase();
      const filtered = products.filter(product =>
        product.normalizedName.includes(term) ||
        product.items.some(item => item.proveedor.toLowerCase().includes(term))
      );
      setFilteredProducts(filtered);
    }
  }, [searchTerm, products]);

  return (
    <div className="space-y-6">
      {/* Search and Stats */}
      <div className="card p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h3 className="text-xl font-semibold text-white">Comparación de Productos</h3>
            <p className="text-sm text-white/60 mt-1">
              {filteredProducts.length} productos con múltiples proveedores
            </p>
          </div>
          <button
            onClick={loadProducts}
            disabled={loading}
            className="btn bg-[#16DB93] hover:bg-[#16DB93] text-white flex items-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Cargando...
              </>
            ) : (
              <>
                <Search className="h-4 w-4" />
                Actualizar
              </>
            )}
          </button>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-white/40" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar producto o proveedor..."
            className="w-full pl-10 pr-10 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-[#16DB93]/50"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/40 hover:text-white/80"
            >
              <X className="h-5 w-5" />
            </button>
          )}
        </div>
      </div>

      {/* Products List */}
      <div className="grid gap-3">
        {loading && products.length === 0 ? (
          <div className="card p-12 text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-3 text-[#16DB93]" />
            <p className="text-white/60">Cargando productos...</p>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="card p-12 text-center">
            <p className="text-white/60">
              {searchTerm
                ? 'No se encontraron productos con ese nombre'
                : 'No hay productos con múltiples proveedores para comparar'}
            </p>
          </div>
        ) : (
          filteredProducts.map((product) => (
            <div
              key={product.normalizedName}
              className={`card cursor-pointer transition-all duration-200 ${
                selectedProduct?.normalizedName === product.normalizedName
                  ? 'ring-2 ring-[#16DB93] bg-[#16DB93]/5'
                  : 'hover:bg-white/5'
              }`}
              onClick={() => setSelectedProduct(selectedProduct?.normalizedName === product.normalizedName ? null : product)}
            >
              <div className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="text-white font-medium">{product.nombre}</h4>
                      {selectedProduct?.normalizedName === product.normalizedName && (
                        <CheckCircle2 className="h-5 w-5 text-[#16DB93]" />
                      )}
                    </div>
                    <div className="flex items-center gap-3 text-sm text-white/60">
                      <span>{product.proveedorCount} proveedores</span>
                      <span className="text-white/40">•</span>
                      <span>
                        ${product.minPrecio.toLocaleString('es-AR')} - $
                        {product.maxPrecio.toLocaleString('es-AR')}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-1 text-[#16DB93] font-semibold">
                      <TrendingDown className="h-4 w-4" />
                      {product.diferenciaPorcentaje.toFixed(1)}%
                    </div>
                    <div className="text-xs text-white/60 mt-1">
                      ${product.diferencia.toLocaleString('es-AR')} de ahorro
                    </div>
                  </div>
                </div>

                {/* Expanded View */}
                {selectedProduct?.normalizedName === product.normalizedName && (
                  <div className="mt-4 pt-4 border-t border-white/10 space-y-2">
                    {product.items.map((item, idx) => (
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
                          <div className="text-xs text-white/40 mt-1">
                            {new Date(item.fechaScraping).toLocaleDateString('es-AR')}
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="text-right">
                            <div className="text-lg font-semibold text-white">
                              ${formatPrice(item.precio)}
                            </div>
                            {idx > 0 && (
                              <div className="text-xs text-[#DB2B39]">
                                +${formatPrice(item.precio - product.minPrecio)}
                              </div>
                            )}
                          </div>
                          <a
                            href={item.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[#16DB93] hover:text-[#16DB93] transition-colors"
                            title="Ver producto"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <ExternalLink className="h-4 w-4" />
                          </a>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
