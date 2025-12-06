# Scraper de precios (Next.js + Firebase + Vercel)

Aplicacion web para gestionar URLs de productos, ejecutar scraping por lote y visualizar resultados con filtros y exportes CSV.

## Stack
- Next.js 14 (App Router) + API Routes
- Firebase Firestore (admin SDK)
- Scraping con Axios + Cheerio
- Tailwind CSS + lucide-react
- Deploy en Vercel + Vercel Cron (cada 2 minutos)

## Estructura
```
app/
  dashboard/page.tsx        # Vista principal
  api/
    urls/route.ts           # GET/POST URLs (import/export CSV)
    urls/[id]/route.ts      # PATCH/DELETE URL
    resultados/route.ts     # GET resultados (filtros + CSV)
    scraper/manual/route.ts # Ejecutar lote manual
    scraper/start/route.ts  # Inicia modo automatico (usa cron)
    scraper/stop/route.ts   # Detiene modo automatico
components/
  URLManager.tsx            # Altas/edicion/import/export de URLs
  ResultsTable.tsx          # Tabla de resultados con filtros
  ScraperControls.tsx       # Botones de control
  ProgressBar.tsx           # Indicador de progreso
lib/
  firebase.ts               # Inicializacion de Firebase Admin
  scraper.ts                # Logica de scraping y batch
  utils.ts                  # Helpers (CSV, numeros, fechas)
types/                      # Tipos compartidos
```

## Configuracion de Firebase
1. Crea un proyecto en Firebase y habilita Firestore en modo production.
2. Crea una cuenta de servicio (Project Settings → Service Accounts → Generate new private key).
3. Copia el JSON en un archivo seguro y exporta las variables:
   ```
   FIREBASE_PROJECT_ID=tu-proyecto
   FIREBASE_CLIENT_EMAIL=firebase-adminsdk@tu-proyecto.iam.gserviceaccount.com
   FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nXXXX\n-----END PRIVATE KEY-----\n"
   ```
   - Respeta los `\n` en la clave privada.
   - Alternativa: `FIREBASE_SERVICE_ACCOUNT='{"projectId":"...","clientEmail":"...","privateKey":"..."}'`
4. Variables opcionales para cliente (no se usan en el dashboard actual pero puedes agregarlas si necesitas SDK de cliente):
   ```
   FIREBASE_API_KEY=
   FIREBASE_AUTH_DOMAIN=
   FIREBASE_STORAGE_BUCKET=
   FIREBASE_MESSAGING_SENDER_ID=
   FIREBASE_APP_ID=
   ```
5. Colecciones usadas:
   - `urls`: { url, proveedor, status, fechaAgregada, ultimoError }
   - `resultados`: { urlId, url, nombre, precio, descuento, categoria, proveedor, status, fechaScraping, error }
   - `config/scraper`: { scrapingActivo, ultimaEjecucion }

## Variables de entorno
Copia `.env.example` a `.env.local` y completa los valores de Firebase.

## Scripts
- `npm run dev` – ambiente local
- `npm run build` – build de produccion
- `npm run start` – serve de build

## Despliegue en Vercel
1. Conecta el repo a Vercel y selecciona framework Next.js.
2. Agrega las variables de entorno de Firebase en el proyecto Vercel.
3. `vercel.json` ya incluye la region y el cron job:
   ```json
   {
     "crons": [
       { "path": "/api/scraper/start", "schedule": "*/2 * * * *" }
     ]
   }
   ```
4. Cada ejecucion de cron procesa hasta 300 URLs pendientes con rate-limit de 500ms y tope de 4 minutos.

## Uso del dashboard
1. **Carga de URLs**
   - Agrega una URL individual.
   - Importa CSV pegando la columna de URLs (la primera columna se toma como URL). Evita duplicados automaticamente.
   - Exporta CSV desde el boton "Exportar".
2. **Scraping**
   - `Ejecutar manual`: procesa hasta 300 pendientes en el momento.
   - `Iniciar automatico`: marca el flag en `config/scraper` y corre un lote; si quedan pendientes seguira en la proxima ejecucion del cron.
   - `Detener`: apaga el flag `scrapingActivo`.
3. **Resultados**
   - Tabla con filtros por proveedor, estado, categoria y busqueda por nombre.
   - Exporta resultados a CSV.
   - Indicador de progreso muestra pendientes, en curso, completadas y errores.

## Notas de scraping
- Detecta proveedor automaticamente segun dominio (VTEX: Supermat, El Amigo, Unimax, Bercovich; Tienda Nube: Tienda Emi, Zeramiko; fallback al hostname).
- Prioriza precio en meta tags y JSON-LD; luego fragmentos HTML.
- Extrae breadcrumbs para categoria cuando esten presentes.
- Rate-limit: 500ms entre requests. Maximo 300 URLs por ejecucion y 4 minutos por lote.
- Guarda cada resultado en `resultados` y marca el estado de la URL (`done`/`error`).

## Comandos rapidos
```
npm install
npm run dev
```
