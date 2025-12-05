# Exportador de Datos - Google Apps Script

Este proyecto de Google Apps Script permite exportar automáticamente los datos del scraper desde Google Sheets hacia la API del sistema de análisis de precios.

## 📋 Características

- ✅ Menú personalizado en Google Sheets
- ✅ Exportación con confirmación
- ✅ Validación de datos antes de exportar
- ✅ Prueba de conexión con la API
- ✅ Resumen de datos antes de exportar
- ✅ Manejo de errores detallado
- ✅ Logging completo

## 🚀 Instalación

### Opción 1: Crear proyecto nuevo en Google Apps Script

1. **Abrir tu Google Sheet** con los datos del scraper
2. **Ir a Extensiones > Apps Script**
3. **Crear un nuevo proyecto** (se abrirá el editor)
4. **Copiar los archivos:**
   - Eliminar el contenido de `Code.gs`
   - Copiar todo el contenido de `Code.gs` de este proyecto
   - Crear archivo de configuración: **⚙️ > Configuración del proyecto**
   - Copiar el contenido de `appsscript.json` en la pestaña de configuración

5. **Guardar** (Ctrl+S o Cmd+S)

### Opción 2: Usar clasp (línea de comandos)

Si tienes [clasp](https://github.com/google/clasp) instalado:

```bash
# Instalar clasp globalmente
npm install -g @google/clasp

# Autenticarse
clasp login

# Crear proyecto
clasp create --title "Exportador Scraper Berco" --type sheets

# Subir archivos
clasp push
```

## ⚙️ Configuración

### 1. Configurar la URL de la API

Edita el archivo `Code.gs` y modifica la constante `URL_API`:

```javascript
// Para desarrollo local:
const URL_API = 'http://localhost:3002/api/import';

// Para producción en Vercel:
const URL_API = 'https://tu-proyecto.vercel.app/api/import';
```

### 2. Verificar el nombre de la hoja

Por defecto busca una hoja llamada `"Scraper"`. Si tu hoja tiene otro nombre, modifica:

```javascript
const SHEET_NAME = 'TuNombreDeHoja';
```

### 3. Primera ejecución

1. **Ejecutar función `onOpen()`** una vez para crear el menú
2. **Autorizar permisos** cuando Google lo solicite
3. **Recargar la hoja** de Google Sheets
4. Verás el nuevo menú **"📊 Exportar Datos"**

## 📊 Uso

### Menú disponible

Una vez instalado, verás un menú con estas opciones:

#### 🚀 Exportar productos a API
- Exporta todos los productos de la hoja a la API
- Muestra confirmación antes de exportar
- Informa del resultado (éxito o error)

#### 📖 Ver instrucciones
- Muestra ayuda rápida sobre cómo usar el script

#### 🧪 Probar conexión
- Verifica que la API esté accesible
- Útil para debugging antes de exportar

#### 📈 Ver resumen de datos
- Muestra estadísticas de los datos en la hoja
- Total de productos, proveedores, etc.

## 📁 Estructura de Datos

El script espera que la hoja tenga esta estructura:

| Columna | Nombre | Descripción |
|---------|--------|-------------|
| A | URL | URL del producto |
| B | Nombre | Nombre del producto |
| C | Precio | Precio actual (número) |
| D | Descuento | Descuento (ej: "10%") |
| E | Categoría | Categoría del producto |
| F | Proveedor | Nombre del proveedor |
| G | Status | Status del scraping ("OK", "ERROR", etc.) |
| K | Precio Lista | Precio original antes de descuento |

## ⚠️ Notas Importantes

### Sobre la exportación

- **La exportación REEMPLAZA todos los datos** en la API (usa `clearBefore: true`)
- Las filas sin URL son ignoradas automáticamente
- Los datos se convierten automáticamente al formato esperado por la API
- Se agrega la fecha de scraping automáticamente

### Desarrollo local vs Producción

**Para desarrollo local:**
```javascript
const URL_API = 'http://localhost:3002/api/import';
```
- Asegúrate de que el servidor esté corriendo (`npm run dev`)
- El servidor debe estar en el puerto 3002 (o el que uses)

**Para producción en Vercel:**
```javascript
const URL_API = 'https://scrapper-berco-xxxx.vercel.app/api/import';
```
- Usa la URL completa de tu deployment en Vercel
- Verifica que el deployment esté activo

### Permisos necesarios

El script solicita estos permisos:

- ✅ Ver y administrar hojas de cálculo
- ✅ Conectarse a servicios externos (para llamar a la API)

## 🐛 Solución de Problemas

### Error: "No se pudo conectar con la API"

**Causas comunes:**
1. El servidor no está corriendo (si es local)
2. La URL está mal configurada
3. Problemas de red o firewall

**Solución:**
- Verifica que la URL sea correcta
- Para local: ejecuta `npm run dev` antes de exportar
- Usa "🧪 Probar conexión" para diagnosticar

### Error: "No se encontró la hoja"

**Causa:**
El nombre de la hoja no coincide con `SHEET_NAME`

**Solución:**
Verifica el nombre exacto de tu hoja y actualiza `SHEET_NAME` en el código

### Error de permisos

**Causa:**
Google no tiene autorización para ejecutar el script

**Solución:**
1. Ejecuta `onOpen()` manualmente desde el editor
2. Autoriza los permisos cuando se soliciten
3. Si persiste, ve a: https://myaccount.google.com/permissions
4. Revoca permisos del script y vuelve a autorizarlo

### No aparece el menú

**Solución:**
1. Ejecuta `onOpen()` desde el editor de Apps Script
2. Recarga la hoja de Google Sheets (F5)
3. El menú debería aparecer en la barra superior

## 📝 Logs

Para ver los logs de ejecución:

1. En el editor de Apps Script
2. **Ver > Registros** o **Ctrl+Enter**
3. Verás todos los mensajes de log del script

## 🔄 Actualizar el Script

Si necesitas actualizar el código:

1. Abre el editor de Apps Script
2. Modifica `Code.gs`
3. Guarda (Ctrl+S)
4. Los cambios se aplican inmediatamente

## 📞 Soporte

Si tienes problemas:

1. Revisa los logs en Apps Script
2. Prueba la conexión con "🧪 Probar conexión"
3. Verifica la configuración de `URL_API`
4. Consulta la documentación del proyecto principal

## 📄 Archivos del Proyecto

```
google-apps-script-project/
├── Code.gs              # Código principal del script
├── appsscript.json      # Configuración del proyecto
└── README.md           # Esta documentación
```

## 🔗 Enlaces Útiles

- [Documentación de Google Apps Script](https://developers.google.com/apps-script)
- [Clasp - CLI para Apps Script](https://github.com/google/clasp)
- [API del proyecto principal](../../README.md)
