# 🚀 Guía de Instalación Rápida

## Método 1: Copiar y Pegar (Recomendado - 5 minutos)

### Paso 1: Abrir el Editor de Scripts

1. Abre tu **Google Sheet** con los datos del scraper
2. Ve a **Extensiones → Apps Script**
3. Se abrirá una nueva pestaña con el editor

### Paso 2: Copiar el Código

1. En el editor, verás un archivo llamado `Code.gs`
2. **Elimina todo** el contenido existente
3. **Copia TODO** el contenido del archivo [`Code.gs`](./Code.gs) de este proyecto
4. **Pega** en el editor de Google Apps Script

### Paso 3: Configurar la URL de la API

Busca esta línea en el código (está al inicio):

```javascript
const URL_API = 'http://localhost:3002/api/import';
```

**Cámbiala según tu caso:**

- **Para desarrollo local** (tu computadora):
  ```javascript
  const URL_API = 'http://localhost:3002/api/import';
  ```

- **Para Vercel** (producción):
  ```javascript
  const URL_API = 'https://scrapper-berco-xxxx.vercel.app/api/import';
  ```
  *(Reemplaza con tu URL de Vercel)*

### Paso 4: Guardar y Ejecutar

1. **Guarda** el proyecto: `Ctrl+S` (o `Cmd+S` en Mac)
2. Dale un nombre al proyecto: **"Exportador Scraper Berco"**
3. En el menú superior, selecciona la función **`onOpen`**
4. Haz clic en **▶️ Ejecutar**

### Paso 5: Autorizar Permisos

La primera vez que ejecutes el script:

1. Aparecerá un mensaje: **"Autorización necesaria"**
2. Haz clic en **"Revisar permisos"**
3. Selecciona tu cuenta de Google
4. Verás una advertencia: **"Google no verificó esta app"**
   - Haz clic en **"Opciones avanzadas"**
   - Luego en **"Ir a Exportador Scraper Berco (no seguro)"**
5. Haz clic en **"Permitir"**

### Paso 6: Verificar Instalación

1. **Cierra** la pestaña del editor de Apps Script
2. **Vuelve** a tu Google Sheet
3. **Recarga** la página (F5)
4. Deberías ver un nuevo menú: **"📊 Exportar Datos"**

¡Listo! Ya está instalado.

---

## Método 2: Usar Clasp (Avanzado - Para desarrolladores)

### Requisitos previos

- Node.js instalado
- Cuenta de Google

### Instalación

```bash
# 1. Instalar clasp globalmente
npm install -g @google/clasp

# 2. Autenticarse con Google
clasp login

# 3. Navegar a la carpeta del proyecto
cd google-apps-script-project

# 4. Crear nuevo proyecto
clasp create --title "Exportador Scraper Berco" --type sheets

# 5. Subir archivos
clasp push

# 6. Abrir en el navegador
clasp open
```

---

## 🎯 Usar el Script

Una vez instalado:

### 1. Exportar Datos

1. En tu Google Sheet, ve al menú: **📊 Exportar Datos**
2. Haz clic en: **🚀 Exportar productos a API**
3. Confirma la exportación
4. Espera a que termine (verás un mensaje de confirmación)

### 2. Probar Conexión

Antes de exportar por primera vez, es buena idea probar la conexión:

1. **📊 Exportar Datos → 🧪 Probar conexión**
2. Si funciona, verás: **"✅ Conexión Exitosa"**
3. Si falla, verifica:
   - La URL en el código
   - Que el servidor esté corriendo (si es local)

### 3. Ver Resumen

Para ver cuántos productos tienes:

1. **📊 Exportar Datos → 📈 Ver resumen de datos**
2. Verás estadísticas de tus productos

---

## ❓ Preguntas Frecuentes

### ¿Cómo sé si el servidor está corriendo?

**Para desarrollo local:**
```bash
# En la terminal de tu proyecto
npm run dev

# Deberías ver algo como:
# ▲ Next.js 15.5.7
# - Local: http://localhost:3002
```

### ¿Qué URL uso para Vercel?

1. Ve a [vercel.com](https://vercel.com)
2. Abre tu proyecto "scrapper-berco"
3. Copia la URL que aparece (ejemplo: `https://scrapper-berco-xxxx.vercel.app`)
4. Agrégale `/api/import` al final

### ¿Los datos se borran al exportar?

Sí, la exportación **reemplaza todos los datos** en la API con los datos actuales de tu Google Sheet. Esto es intencional para mantener sincronizados ambos sistemas.

### ¿Puedo exportar solo algunos productos?

No directamente. El script exporta todos los productos que tengan URL en la columna A. Si quieres exportar solo algunos:

1. Crea una copia de la hoja
2. Elimina las filas que no quieras exportar
3. Exporta desde esa hoja
4. Cambia `SHEET_NAME` en el código si es necesario

### ¿Qué pasa si hay un error durante la exportación?

El script mostrará un mensaje de error detallado. Los errores comunes son:

- **No se puede conectar**: El servidor no está corriendo
- **Error 404**: La URL es incorrecta
- **Error 500**: Problema en el servidor (revisa los logs)

---

## 🔧 Solución Rápida de Problemas

### El menú no aparece

```
✅ Solución:
1. Abre el editor de Apps Script
2. Ejecuta la función onOpen() manualmente
3. Recarga tu Google Sheet (F5)
```

### Error: "No autorizado"

```
✅ Solución:
1. Ve a: https://myaccount.google.com/permissions
2. Busca "Exportador Scraper Berco"
3. Elimina el acceso
4. Vuelve a ejecutar onOpen() y autoriza de nuevo
```

### Error de conexión

```
✅ Para desarrollo local:
1. Abre la terminal
2. Ejecuta: npm run dev
3. Verifica que diga: Local: http://localhost:3002

✅ Para Vercel:
1. Ve a vercel.com
2. Verifica que el proyecto esté "Ready"
3. Copia la URL correcta
```

---

## 📞 ¿Necesitas Ayuda?

1. Revisa el [README completo](./README.md)
2. Consulta los logs: En Apps Script → Ver → Registros
3. Prueba la conexión antes de exportar
4. Verifica la documentación del proyecto principal

---

## ✅ Checklist de Instalación

- [ ] Código copiado en Apps Script
- [ ] URL_API configurada correctamente
- [ ] Función onOpen() ejecutada
- [ ] Permisos autorizados
- [ ] Menú visible en Google Sheets
- [ ] Conexión probada exitosamente
- [ ] Primera exportación realizada

¡Si completaste todos los pasos, estás listo para usar el exportador! 🎉
