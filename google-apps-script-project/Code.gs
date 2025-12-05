/**
 * EXPORTADOR DE DATOS A API (Firestore en Vercel)
 *
 * Pasos rápidos:
 * 1) Cambia BASE_URL a tu dominio (ej: https://scrapper-berco.vercel.app)
 * 2) Abre la hoja "Scraper" (o ajusta SHEET_NAME)
 * 3) Ejecuta onOpen() una vez para crear el menú
 *
 * Menú: Exportar productos, Probar conexión, Ver instrucciones, Ver resumen.
 */

// ============================
// CONFIGURACIÓN
// ============================
const SHEET_NAME = 'Scraper';
const BASE_URL = 'https://scrapper-berco.vercel.app'; // <-- cambia aquí si usas otro dominio
const IMPORT_URL = BASE_URL + '/api/import';
const TEST_URL = BASE_URL + '/api/products?action=providers';
const CLEAR_BEFORE = true; // true = limpia Firestore antes de insertar

// ============================
// MENÚ
// ============================
function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu('📊 Exportar Datos')
    .addItem('🚀 Exportar productos a API', 'exportarAAPI')
    .addSeparator()
    .addItem('🧪 Probar conexión', 'probarConexion')
    .addItem('📖 Ver instrucciones', 'mostrarInstrucciones')
    .addItem('📈 Ver resumen de datos', 'verResumenDatos')
    .addToUi();
}

// ============================
// EXPORTACIÓN PRINCIPAL
// ============================
function exportarAAPI() {
  const ui = SpreadsheetApp.getUi();
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);
  if (!sheet) {
    ui.alert('❌ Error', 'No se encontró la hoja "' + SHEET_NAME + '".', ui.ButtonSet.OK);
    return;
  }

  const data = sheet.getDataRange().getValues();
  if (data.length <= 1) {
    ui.alert('⚠️ Advertencia', 'No hay datos (solo encabezados).', ui.ButtonSet.OK);
    return;
  }

  const totalProductos = data.length - 1;
  const confirmar = ui.alert(
    '🚀 Confirmar Exportación',
    'Se exportarán ' + totalProductos + ' productos.\n\n' +
      (CLEAR_BEFORE ? 'Se limpiará la base antes de insertar.' : 'Se agregarán sin limpiar.'),
    ui.ButtonSet.YES_NO
  );
  if (confirmar !== ui.Button.YES) {
    ui.alert('✋ Exportación cancelada');
    return;
  }

  const products = [];
  let filasVacias = 0;
  let filasConError = 0;

  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    if (!row[0]) {
      filasVacias++;
      continue;
    }
    try {
      products.push({
        url: row[0] || '',
        nombre: row[1] || '',
        precio: parseFloat(row[2]) || 0,
        descuento: row[3] || '',
        categoria: row[4] || '',
        proveedor: row[5] || '',
        status: row[6] || '',
        fecha_scraping: new Date().toISOString(),
        precioLista: row[10] ? parseFloat(row[10]) : null,
      });
    } catch (err) {
      Logger.log('Error fila ' + (i + 1) + ': ' + err);
      filasConError++;
    }
  }

  if (!products.length) {
    ui.alert(
      '❌ Error',
      'No hay productos válidos.\nFilas vacías: ' + filasVacias + '\nFilas con error: ' + filasConError,
      ui.ButtonSet.OK
    );
    return;
  }

  const payload = {
    products,
    clearBefore: CLEAR_BEFORE,
  };

  const options = {
    method: 'post',
    contentType: 'application/json',
    payload: JSON.stringify(payload),
    muteHttpExceptions: true,
  };

  try {
    const res = UrlFetchApp.fetch(IMPORT_URL, options);
    const status = res.getResponseCode();
    const body = res.getContentText();
    let parsed = {};
    try { parsed = JSON.parse(body); } catch (e) {}

    if (status === 200) {
      ui.alert(
        '✅ Exportación Exitosa',
        'Productos exportados: ' + (parsed.imported || products.length) +
          '\nFilas vacías: ' + filasVacias +
          '\nFilas con error: ' + filasConError +
          '\n\nDestino: ' + BASE_URL,
        ui.ButtonSet.OK
      );
    } else {
      ui.alert(
        '❌ Error (' + status + ')',
        (parsed.error || body || 'Error desconocido') +
          '\n\nRevisa logs en Vercel Functions.',
        ui.ButtonSet.OK
      );
    }
  } catch (error) {
    ui.alert(
      '❌ Error de conexión',
      String(error) + '\n\nURL: ' + IMPORT_URL,
      ui.ButtonSet.OK
    );
  }
}

// ============================
// PROBAR CONEXIÓN
// ============================
function probarConexion() {
  const ui = SpreadsheetApp.getUi();
  try {
    const res = UrlFetchApp.fetch(TEST_URL, { method: 'get', muteHttpExceptions: true });
    const status = res.getResponseCode();
    const body = res.getContentText();
    let parsed = {};
    try { parsed = JSON.parse(body); } catch (e) {}

    if (status === 200) {
      ui.alert(
        '✅ Conexión OK',
        'API responde.\nProveedores: ' + (parsed.providers ? parsed.providers.length : 0) +
          '\nURL: ' + TEST_URL,
        ui.ButtonSet.OK
      );
    } else {
      ui.alert(
        '⚠️ Problema de conexión',
        'Status ' + status + '\n' + (parsed.error || body || 'Error desconocido') +
          '\nURL: ' + TEST_URL,
        ui.ButtonSet.OK
      );
    }
  } catch (error) {
    ui.alert(
      '❌ Error de conexión',
      String(error) + '\nURL: ' + TEST_URL,
      ui.ButtonSet.OK
    );
  }
}

// ============================
// INSTRUCCIONES
// ============================
function mostrarInstrucciones() {
  const ui = SpreadsheetApp.getUi();
  const msg =
    '1) Cambia BASE_URL a tu dominio.\n' +
    '2) Hoja con datos: ' + SHEET_NAME + '\n' +
    '3) onOpen() crea el menú.\n' +
    '4) Probar conexión antes de exportar.\n' +
    '5) Exportar productos los envía a Firestore vía la API.';
  ui.alert('📖 Instrucciones', msg, ui.ButtonSet.OK);
}

// ============================
// RESUMEN DE DATOS EN HOJA
// ============================
function verResumenDatos() {
  const ui = SpreadsheetApp.getUi();
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);
  if (!sheet) {
    ui.alert('❌ Error', 'No se encontró la hoja "' + SHEET_NAME + '"', ui.ButtonSet.OK);
    return;
  }
  const data = sheet.getDataRange().getValues();
  if (data.length <= 1) {
    ui.alert('📊 Resumen', 'No hay datos en la hoja.', ui.ButtonSet.OK);
    return;
  }

  const proveedores = {};
  let total = 0;
  let conPrecio = 0;
  let conDescuento = 0;

  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    if (!row[0]) continue;
    total++;
    const prov = row[5] || 'Sin proveedor';
    proveedores[prov] = (proveedores[prov] || 0) + 1;
    if (row[2]) conPrecio++;
    if (row[3]) conDescuento++;
  }

  let msg = '📊 RESUMEN DE DATOS\n\n';
  msg += 'Total productos: ' + total + '\n';
  msg += 'Con precio: ' + conPrecio + '\n';
  msg += 'Con descuento: ' + conDescuento + '\n\n';
  msg += 'Por proveedor:\n';
  for (const [prov, count] of Object.entries(proveedores)) {
    msg += ' • ' + prov + ': ' + count + '\n';
  }

  ui.alert('📊 Resumen de Datos', msg, ui.ButtonSet.OK);
}
