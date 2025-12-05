import { NextRequest, NextResponse } from 'next/server';
import { insertProducts, clearAllProducts } from '@/lib/db';

interface ProductInput {
  url?: string;
  URL?: string;
  nombre?: string;
  Nombre?: string;
  precio?: string | number;
  Precio?: string | number;
  descuento?: string;
  Descuento?: string;
  categoria?: string;
  Categoria?: string;
  proveedor?: string;
  Proveedor?: string;
  status?: string;
  Status?: string;
  fecha_scraping?: string;
  Fecha?: string;
  precioLista?: string | number;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { products, clearBefore } = body;

    if (!Array.isArray(products)) {
      return NextResponse.json(
        { error: 'El campo products debe ser un array' },
        { status: 400 }
      );
    }

    // Limpiar base de datos si se solicita
    if (clearBefore) {
      clearAllProducts();
    }

    // Insertar productos
    const productsToInsert = products.map((p: ProductInput) => ({
      url: p.url || p.URL || '',
      nombre: p.nombre || p.Nombre || '',
      precio: parseFloat(String(p.precio || p.Precio || '0')),
      descuento: p.descuento || p.Descuento || '',
      categoria: p.categoria || p.Categoria || '',
      proveedor: p.proveedor || p.Proveedor || '',
      status: p.status || p.Status || '',
      fecha_scraping: p.fecha_scraping || p.Fecha || new Date().toISOString(),
      precioLista: p.precioLista ? parseFloat(String(p.precioLista)) : undefined,
    }));

    insertProducts(productsToInsert);

    return NextResponse.json({
      success: true,
      imported: productsToInsert.length,
      message: `${productsToInsert.length} productos importados exitosamente`,
    });
  } catch (error) {
    console.error('Error importing products:', error);
    return NextResponse.json(
      { error: 'Error al importar productos: ' + (error as Error).message },
      { status: 500 }
    );
  }
}

// Endpoint para obtener instrucciones de importación desde Google Sheets
export async function GET() {
  const instructions = {
    message: 'Endpoint para importar productos desde Google Sheets',
    method: 'POST',
    body: {
      products: [
        {
          url: 'https://ejemplo.com/producto',
          nombre: 'Producto Ejemplo',
          precio: 1000,
          descuento: '10%',
          categoria: 'Categoría > Subcategoría',
          proveedor: 'Proveedor',
          status: 'OK',
          fecha_scraping: '2024-01-01',
          precioLista: 1100,
        },
      ],
      clearBefore: false, // true para limpiar la DB antes de importar
    },
    googleSheetsScript: `
// Script para Google Apps Script
function exportarAAPI() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Scraper');
  const data = sheet.getDataRange().getValues();
  const headers = data[0];

  const products = [];
  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    products.push({
      url: row[0],
      nombre: row[1],
      precio: row[2],
      descuento: row[3],
      categoria: row[4],
      proveedor: row[5],
      status: row[6],
      fecha_scraping: new Date().toISOString(),
      precioLista: row[10] || null
    });
  }

  const url = 'TU_URL_LOCAL_O_VERCEL/api/import';
  const options = {
    method: 'post',
    contentType: 'application/json',
    payload: JSON.stringify({
      products: products,
      clearBefore: true
    })
  };

  const response = UrlFetchApp.fetch(url, options);
  Logger.log(response.getContentText());
}
`,
  };

  return NextResponse.json(instructions);
}
