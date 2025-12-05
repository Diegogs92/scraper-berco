# 🚀 Inicio Rápido

## 1. Instalar y ejecutar

```bash
# Instalar dependencias (ya hecho)
npm install

# Ejecutar servidor
npm run dev
```

## 2. Acceder al dashboard

Abre tu navegador en: **http://localhost:3002** (o el puerto que te indique)

## 3. Cargar datos de prueba

```bash
curl -X POST http://localhost:3002/api/import \
  -H "Content-Type: application/json" \
  -d @scripts/seed-data.json
```

O desde PowerShell (Windows):

```powershell
$body = Get-Content scripts/seed-data.json -Raw
Invoke-RestMethod -Uri "http://localhost:3002/api/import" -Method POST -ContentType "application/json" -Body $body
```

## 4. Importar desde Google Sheets

Hemos creado un **proyecto completo de Google Apps Script** con menú personalizado y validaciones.

### Instalación Rápida (5 minutos)

1. **Abre tu Google Sheet** con los datos del scraper
2. Ve a **Extensiones → Apps Script**
3. **Copia el código** de [`google-apps-script-project/Code.gs`](google-apps-script-project/Code.gs)
4. **Pega** en el editor y guarda
5. **Modifica la URL** al inicio del código:
   ```javascript
   const URL_API = 'http://localhost:3002/api/import';
   ```
6. Ejecuta la función **`onOpen()`** y autoriza permisos
7. **Recarga** tu Google Sheet (F5)

### Usar el Menú

Verás un nuevo menú **"📊 Exportar Datos"** con opciones:

- **🚀 Exportar productos a API** - Exporta todos los datos
- **🧪 Probar conexión** - Verifica que la API funcione
- **📈 Ver resumen de datos** - Estadísticas de tus productos
- **📖 Ver instrucciones** - Ayuda rápida

### Documentación Completa

- [📖 README del proyecto Apps Script](google-apps-script-project/README.md)
- [🚀 Guía de instalación paso a paso](google-apps-script-project/INSTALACION.md)

## 5. Explorar el dashboard

### Pestaña "Productos"
- Ver todos los productos importados
- Filtrar por proveedor, categoría, precio
- Buscar productos específicos
- Ver enlaces a productos originales

### Pestaña "Análisis de Precios"
- Comparar precios entre proveedores
- Ver quién tiene el mejor precio
- Identificar productos con mayor diferencia de precio

### Pestaña "Estadísticas"
- Métricas por proveedor
- Precios promedio
- Productos con descuento
- Descuentos promedio

## 6. Próximos pasos

- 📖 Lee [README.md](README.md) para más detalles
- 📚 Consulta [INSTRUCCIONES.md](INSTRUCCIONES.md) para guía completa
- 🚀 Cuando estés listo para producción, sigue las instrucciones de Vercel en el README

## Estructura de archivos importante

```
scrapper-berco/
├── google-apps-script-project/  # 🆕 Proyecto de Google Apps Script
│   ├── Code.gs                  # Código del exportador
│   ├── README.md                # Documentación completa
│   └── INSTALACION.md          # Guía de instalación
├── scripts/
│   └── seed-data.json          # Datos de prueba
├── README.md                    # Documentación general
├── INSTRUCCIONES.md            # Guía completa paso a paso
└── INICIO_RAPIDO.md            # Este archivo
```

## Comandos útiles

```bash
# Desarrollo
npm run dev              # Iniciar servidor de desarrollo

# Producción
npm run build            # Compilar para producción
npm start                # Ejecutar en modo producción

# Linting
npm run lint             # Verificar código
```

## Endpoints principales

- `GET /api/products` - Obtener productos con filtros
- `GET /api/products?action=providers` - Lista de proveedores
- `GET /api/stats?type=price-analysis` - Análisis de precios
- `GET /api/stats?type=provider-stats` - Estadísticas por proveedor
- `POST /api/import` - Importar productos

## Solución rápida de problemas

### No aparece nada en el dashboard
```bash
# Cargar datos de prueba
curl -X POST http://localhost:3002/api/import \
  -H "Content-Type: application/json" \
  -d @scripts/seed-data.json
```

### Error en Google Apps Script
1. Verifica que el servidor esté corriendo (`npm run dev`)
2. Verifica la URL en el script (debe incluir `http://`)
3. Para desarrollo local, usa `http://localhost:3002/api/import`

### Base de datos no persiste en Vercel
- SQLite no funciona en Vercel (filesystem efímero)
- Migra a Vercel Postgres (ver README.md)

## ¿Necesitas ayuda?

1. Revisa los logs: `npm run dev` te mostrará errores en consola
2. Abre la consola del navegador (F12) para ver errores del frontend
3. Consulta [INSTRUCCIONES.md](INSTRUCCIONES.md) para más detalles
