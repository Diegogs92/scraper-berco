/**
 * EXPORTADOR DE DATOS A API - SCRAPER BERCO
 *
 * Este script exporta los datos de scraping desde Google Sheets
 * hacia la API del sistema de análisis de precios.
 *
 * CONFIGURACIÓN INICIAL:
 * 1. Modificar la variable URL_API con tu URL (local o Vercel)
 * 2. Verificar que SHEET_NAME coincida con el nombre de tu hoja
 * 3. Ejecutar la función onOpen() una vez para crear el menú
 */

// ============================================================================
// CONFIGURACIÓN
// ============================================================================

// Nombre de la hoja de cálculo con los datos
const SHEET_NAME = 'Scraper';

// URL de la API - MODIFICAR SEGÚN TU ENTORNO
// Para desarrollo local (con el servidor corriendo en tu PC):
const URL_API = 'http://localhost:3002/api/import';

// Para producción en Vercel (descomentar y modificar con tu URL):
// const URL_API = 'https://scrapper-berco-2ri9s4b22-dgarciasantillan-7059s-projects.vercel.app/api/import';

// ============================================================================
// MENÚ PERSONALIZADO
// ============================================================================

/**
 * Crea un menú personalizado en Google Sheets
 * Se ejecuta automáticamente cuando se abre la hoja
 */
function onOpen() {
  const ui = SpreadsheetApp.getUi();
  ui.createMenu('📊 Exportar Datos')
    .addItem('🚀 Exportar productos a API', 'exportarAAPI')
    .addSeparator()
    .addItem('📖 Ver instrucciones', 'mostrarInstrucciones')
    .addItem('🧪 Probar conexión', 'probarConexion')
    .addItem('📈 Ver resumen de datos', 'verResumenDatos')
    .addToUi();
}

// ============================================================================
// FUNCIÓN PRINCIPAL DE EXPORTACIÓN
// ============================================================================

/**
 * Exporta los productos desde Google Sheets a la API
 */
function exportarAAPI() {
  const ui = SpreadsheetApp.getUi();

  // Validar que existe la hoja
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);
  if (!sheet) {
    ui.alert(
      '❌ Error',
      'No se encontró la hoja "' + SHEET_NAME + '".\n\n' +
      'Por favor verifica el nombre de la hoja en la configuración del script.',
      ui.ButtonSet.OK
    );
    return;
  }

  // Obtener todos los datos
  const data = sheet.getDataRange().getValues();

  // Verificar que hay datos
  if (data.length <= 1) {
    ui.alert(
      '⚠️ Advertencia',
      'No hay datos para exportar.\n\n' +
      'La hoja solo contiene la fila de encabezados.',
      ui.ButtonSet.OK
    );
    return;
  }

  // Confirmar antes de exportar
  const totalProductos = data.length - 1; // Restar el header
  const respuesta = ui.alert(
    '🚀 Confirmar Exportación',
    'Se van a exportar ' + totalProductos + ' productos.\n\n' +
    '⚠️ IMPORTANTE: Esto eliminará todos los datos existentes en la API\n' +
    'y los reemplazará con los datos actuales de esta hoja.\n\n' +
    '¿Deseas continuar?',
    ui.ButtonSet.YES_NO
  );

  if (respuesta !== ui.Button.YES) {
    ui.alert('✋ Exportación cancelada');
    return;
  }

  // Mostrar progreso
  const progressMsg = ui.alert(
    '⏳ Exportando...',
    'Por favor espera mientras se exportan los datos.\n' +
    'Esto puede tardar unos segundos...',
    ui.ButtonSet.OK
  );

  // Construir array de productos
  const products = [];
  let filasVacias = 0;
  let filasConError = 0;

  for (let i = 1; i < data.length; i++) {
    const row = data[i];

    // Saltar filas sin URL
    if (!row[0]) {
      filasVacias++;
      continue;
    }

    try {
      // Mapear columnas según el formato del scraper
      const producto = {
        url: row[0] || '',                    // Columna A: URL
        nombre: row[1] || '',                 // Columna B: Nombre
        precio: parseFloat(row[2]) || 0,      // Columna C: Precio
        descuento: row[3] || '',              // Columna D: Descuento
        categoria: row[4] || '',              // Columna E: Categoría
        proveedor: row[5] || '',              // Columna F: Proveedor
        status: row[6] || '',                 // Columna G: Status
        fecha_scraping: new Date().toISOString(),
        precioLista: row[10] ? parseFloat(row[10]) : null  // Columna K: Precio Lista
      };

      products.push(producto);
    } catch (error) {
      Logger.log('Error procesando fila ' + (i + 1) + ': ' + error);
      filasConError++;
    }
  }

  if (products.length === 0) {
    ui.alert(
      '❌ Error',
      'No hay productos válidos para exportar.\n\n' +
      'Filas vacías: ' + filasVacias + '\n' +
      'Filas con error: ' + filasConError,
      ui.ButtonSet.OK
    );
    return;
  }

  // Preparar payload
  const payload = {
    products: products,
    clearBefore: true  // Limpiar DB antes de importar
  };

  // Configurar petición HTTP
  const options = {
    method: 'post',
    contentType: 'application/json',
    payload: JSON.stringify(payload),
    muteHttpExceptions: true
  };

  // Realizar petición
  try {
    const response = UrlFetchApp.fetch(URL_API, options);
    const statusCode = response.getResponseCode();
    const result = JSON.parse(response.getContentText());

    if (statusCode === 200) {
      // Éxito
      Logger.log('✅ Exportación exitosa: ' + result.message);

      let mensaje = '✅ ¡Exportación Exitosa!\n\n' +
                   '📊 Productos exportados: ' + result.imported + '\n';

      if (filasVacias > 0) {
        mensaje += '⚠️ Filas vacías ignoradas: ' + filasVacias + '\n';
      }
      if (filasConError > 0) {
        mensaje += '⚠️ Filas con error: ' + filasConError + '\n';
      }

      mensaje += '\n📍 Los datos están ahora disponibles en:\n' + URL_API.replace('/api/import', '');

      ui.alert('✅ Exportación Exitosa', mensaje, ui.ButtonSet.OK);

    } else {
      // Error del servidor
      Logger.log('❌ Error del servidor: ' + result.error);
      ui.alert(
        '❌ Error en la Exportación',
        'Error del servidor (Status ' + statusCode + '):\n\n' +
        result.error + '\n\n' +
        'Por favor verifica:\n' +
        '1. Que la URL de la API sea correcta\n' +
        '2. Que el servidor esté funcionando\n' +
        '3. Los logs del navegador para más detalles',
        ui.ButtonSet.OK
      );
    }
  } catch (error) {
    // Error de conexión
    Logger.log('❌ Error de conexión: ' + error);
    ui.alert(
      '❌ Error de Conexión',
      'No se pudo conectar con la API:\n\n' +
      error + '\n\n' +
      'Verifica que:\n' +
      '1. La URL es correcta: ' + URL_API + '\n' +
      '2. El servidor está funcionando\n' +
      '3. No hay problemas de red o firewall\n\n' +
      'Para desarrollo local, asegúrate de que el servidor\n' +
      'está corriendo con "npm run dev"',
      ui.ButtonSet.OK
    );
  }
}

// ============================================================================
// FUNCIONES AUXILIARES
// ============================================================================

/**
 * Muestra las instrucciones de uso
 */
function mostrarInstrucciones() {
  const ui = SpreadsheetApp.getUi();

  const mensaje =
    '📖 INSTRUCCIONES DE USO\n\n' +
    '1️⃣ CONFIGURACIÓN INICIAL:\n' +
    '   • Abre el editor de scripts (Extensiones > Apps Script)\n' +
    '   • Modifica la variable URL_API con tu URL\n' +
    '   • Para local: http://localhost:3002/api/import\n' +
    '   • Para Vercel: https://tu-proyecto.vercel.app/api/import\n\n' +
    '2️⃣ EXPORTAR DATOS:\n' +
    '   • Menú: Exportar Datos > Exportar productos a API\n' +
    '   • Confirma la exportación\n' +
    '   • Espera a que termine el proceso\n\n' +
    '3️⃣ ESTRUCTURA DE DATOS:\n' +
    '   • Columna A: URL del producto\n' +
    '   • Columna B: Nombre\n' +
    '   • Columna C: Precio\n' +
    '   • Columna D: Descuento\n' +
    '   • Columna E: Categoría\n' +
    '   • Columna F: Proveedor\n' +
    '   • Columna G: Status\n' +
    '   • Columna K: Precio Lista\n\n' +
    '⚠️ IMPORTANTE:\n' +
    '   • La exportación REEMPLAZA todos los datos en la API\n' +
    '   • Asegúrate de que el servidor esté funcionando\n' +
    '   • Verifica que la URL sea correcta\n\n' +
    '📍 URL actual: ' + URL_API;

  ui.alert('📖 Instrucciones', mensaje, ui.ButtonSet.OK);
}

/**
 * Prueba la conexión con la API
 */
function probarConexion() {
  const ui = SpreadsheetApp.getUi();

  ui.alert('🧪 Probando Conexión', 'Verificando conexión con la API...', ui.ButtonSet.OK);

  try {
    // Intentar hacer GET a la API de productos
    const testUrl = URL_API.replace('/api/import', '/api/products?action=providers');
    const response = UrlFetchApp.fetch(testUrl, {
      muteHttpExceptions: true,
      method: 'get'
    });

    const statusCode = response.getResponseCode();

    if (statusCode === 200) {
      const data = JSON.parse(response.getContentText());
      ui.alert(
        '✅ Conexión Exitosa',
        '¡La conexión con la API funciona correctamente!\n\n' +
        '📍 URL: ' + URL_API + '\n' +
        '📊 Proveedores en la API: ' + (data.providers ? data.providers.length : 0) + '\n\n' +
        'Puedes proceder con la exportación de datos.',
        ui.ButtonSet.OK
      );
    } else {
      ui.alert(
        '⚠️ Conexión con Problemas',
        'Se conectó al servidor pero hubo un problema:\n\n' +
        'Status Code: ' + statusCode + '\n' +
        'URL: ' + testUrl + '\n\n' +
        'Verifica que la URL sea correcta.',
        ui.ButtonSet.OK
      );
    }
  } catch (error) {
    ui.alert(
      '❌ Error de Conexión',
      'No se pudo conectar con la API:\n\n' +
      error + '\n\n' +
      'URL: ' + URL_API + '\n\n' +
      'Verifica que:\n' +
      '1. El servidor esté funcionando\n' +
      '2. La URL sea correcta\n' +
      '3. No haya problemas de red',
      ui.ButtonSet.OK
    );
  }
}

/**
 * Muestra un resumen de los datos en la hoja
 */
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

  // Contar por proveedor
  const proveedores = {};
  let totalProductos = 0;
  let conPrecio = 0;
  let conDescuento = 0;

  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    if (!row[0]) continue; // Saltar filas vacías

    totalProductos++;

    const proveedor = row[5] || 'Sin proveedor';
    proveedores[proveedor] = (proveedores[proveedor] || 0) + 1;

    if (row[2]) conPrecio++;
    if (row[3]) conDescuento++;
  }

  let mensaje = '📊 RESUMEN DE DATOS\n\n';
  mensaje += '📦 Total de productos: ' + totalProductos + '\n';
  mensaje += '💰 Con precio: ' + conPrecio + '\n';
  mensaje += '🏷️ Con descuento: ' + conDescuento + '\n\n';
  mensaje += '📊 POR PROVEEDOR:\n';

  for (const [prov, count] of Object.entries(proveedores)) {
    mensaje += '   • ' + prov + ': ' + count + '\n';
  }

  ui.alert('📊 Resumen de Datos', mensaje, ui.ButtonSet.OK);
}
