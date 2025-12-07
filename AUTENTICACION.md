# Sistema de Autenticación

## Resumen

El sistema ahora requiere autenticación para acceder al dashboard. Existen 3 tipos de usuarios:

### Roles de Usuario

1. **Desarrollador**
   - Máximo nivel de permisos
   - Puede crear otros desarrolladores
   - Puede administrar todos los usuarios
   - Puede limpiar el sistema completo
   - Solo tú eres desarrollador

2. **Administrador**
   - Puede registrar nuevos usuarios (excepto desarrolladores)
   - Puede consultar y administrar usuarios
   - Puede activar/desactivar usuarios

3. **Consultante**
   - Solo puede registrar URLs para scraping
   - No puede administrar usuarios
   - Acceso limitado al dashboard

## Inicialización del Primer Usuario

### Opción 1: Usando la API (Recomendado)

Ejecuta este comando desde tu terminal (reemplaza los valores):

```bash
curl -X POST https://scrapper-berco.vercel.app/api/auth/init \
  -H "Content-Type: application/json" \
  -d '{
    "email": "tu-email@ejemplo.com",
    "password": "tu-contraseña-segura",
    "nombre": "Tu Nombre"
  }'
```

**Importante:** Este endpoint solo funciona cuando NO hay usuarios en el sistema. Una vez creado el primer usuario, se deshabilitará automáticamente.

### Opción 2: Desde Postman o Insomnia

**Endpoint:** `POST https://scrapper-berco.vercel.app/api/auth/init`

**Headers:**
```json
{
  "Content-Type": "application/json"
}
```

**Body:**
```json
{
  "email": "tu-email@ejemplo.com",
  "password": "tu-contraseña-segura",
  "nombre": "Tu Nombre"
}
```

## Uso del Sistema

### 1. Iniciar Sesión

Visita: `https://scrapper-berco.vercel.app/login`

Ingresa tu email y contraseña.

### 2. Registrar Nuevos Usuarios

Como desarrollador o administrador:

1. Ve a tu perfil (esquina superior derecha)
2. Haz clic en "Administrar usuarios"
3. Haz clic en "Registrar Usuario"
4. Completa el formulario:
   - Nombre
   - Email
   - Contraseña
   - Rol (consultante, administrador, o desarrollador*)

\* Solo el desarrollador puede crear otros desarrolladores

### 3. Administrar Usuarios

En la sección de administración de usuarios puedes:
- Ver todos los usuarios registrados
- Activar/desactivar usuarios
- Ver información de roles y fechas

## Seguridad

- Las contraseñas se hashean con bcrypt (10 rounds)
- Los tokens JWT expiran en 7 días
- Se recomienda cambiar el `JWT_SECRET` en producción (variable de entorno)
- Los usuarios inactivos no pueden iniciar sesión

## Variables de Entorno

Asegúrate de configurar en Vercel:

```env
JWT_SECRET=tu-clave-secreta-super-segura-y-larga
```

Si no se configura, se usará una clave por defecto (no recomendado para producción).

## Permisos por Rol

| Acción | Consultante | Administrador | Desarrollador |
|--------|-------------|---------------|---------------|
| Ver dashboard | ✅ | ✅ | ✅ |
| Agregar URLs | ✅ | ✅ | ✅ |
| Ver resultados | ✅ | ✅ | ✅ |
| Ejecutar scraper | ✅ | ✅ | ✅ |
| Administrar usuarios | ❌ | ✅ | ✅ |
| Crear desarrolladores | ❌ | ❌ | ✅ |
| Modificar desarrolladores | ❌ | ❌ | ✅ |
| Limpiar sistema | ❌ | ❌ | ✅ |

## Limpiar el Sistema

Como desarrollador, puedes limpiar la información del scraper para comenzar de cero:

### Acceso

1. Haz clic en tu perfil (esquina superior derecha)
2. Selecciona "Limpiar sistema"

### Opciones de Limpieza

**Eliminar todas las URLs**
- Elimina todas las URLs (pendientes, en proceso, completadas, con errores)
- Los resultados del scraping permanecen intactos
- Útil para limpiar la cola de trabajo

**Eliminar todos los resultados**
- Elimina todos los productos scrapeados
- Las URLs permanecen para poder volver a scrapear
- Útil para limpiar el historial de scraping

**Limpiar TODO el sistema**
- Elimina URLs y resultados
- Resetea el estado del scraper
- El sistema queda completamente limpio
- ⚠️ Acción irreversible

### API para Limpieza

También puedes limpiar vía API:

```bash
# Limpiar solo URLs
curl -X POST https://scraper-berco.vercel.app/api/admin/clear \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TU_TOKEN" \
  -d '{"type": "urls"}'

# Limpiar solo resultados
curl -X POST https://scraper-berco.vercel.app/api/admin/clear \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TU_TOKEN" \
  -d '{"type": "resultados"}'

# Limpiar todo
curl -X POST https://scraper-berco.vercel.app/api/admin/clear \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TU_TOKEN" \
  -d '{"type": "all"}'
```

## Comparación de Precios

El sistema incluye una sección de comparación de precios que:

- Agrupa productos por nombre
- Compara precios entre diferentes proveedores
- Muestra el mejor precio disponible
- Calcula el ahorro potencial
- Incluye enlaces directos a cada producto

La sección se actualiza automáticamente y se encuentra en la parte inferior del dashboard.

## Cerrar Sesión

Haz clic en tu nombre en la esquina superior derecha y selecciona "Cerrar sesión".

## Solución de Problemas

### No puedo acceder al dashboard
- Verifica que hayas iniciado sesión
- Revisa que tu usuario esté activo
- Intenta limpiar el localStorage y volver a iniciar sesión

### No puedo crear el primer usuario
- Asegúrate de que no existan usuarios en Firestore
- Verifica que la colección `users` esté vacía
- Revisa los logs de Vercel Functions

### Token inválido o expirado
- Los tokens expiran en 7 días
- Cierra sesión y vuelve a iniciar sesión
- Verifica que el `JWT_SECRET` sea el mismo en todas las instancias
