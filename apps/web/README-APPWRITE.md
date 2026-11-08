# Appwrite Cloud

El frontend usa la API REST de Appwrite Cloud desde el navegador. No requiere una clave de API en el cliente. La clave de servidor solo se usa temporalmente desde el script de migración.

## Recursos ya configurados

En el proyecto `G&D Essences` de [Appwrite Cloud](https://cloud.appwrite.io/console/) ya quedaron preparados:

- Endpoint: `https://sfo.cloud.appwrite.io/v1`
- Project ID: `6adec311002f8886f961`
- Plataforma web para `localhost` y para `daniel-devfrontend.github.io`
- Base TablesDB `G&D Essences Catalog` (ID `6adec5b400255cc20770`)
- Tablas `products` y `collections`, con seguridad por fila y permisos de equipo `admins`
- Bucket `product-images`: lectura pública, escritura del equipo `admins` y seguridad por archivo desactivada
- Equipo `admins` (ID `admins`)

La tabla `products` tiene estas columnas:

   | Columna | Tipo | Requerido |
   | --- | --- | --- |
   | `legacy_id` | Text | Sí |
   | `name` | Text | Sí |
   | `price` | Float | Sí |
   | `original_price` | Float | No |
   | `description` | Text | No |
   | `collection` | Text | No |
   | `image` | Text | No |
   | `images` | Array de Text | No |
   | `video_url` | Text | No |
   | `status` | Text | Sí |
   | `deleted_at` | Text | No |

La tabla `collections` tiene estas columnas:

   | Columna | Tipo | Requerido |
   | --- | --- | --- |
   | `legacy_id` | Text | Sí |
   | `title` | Text | Sí |
   | `description` | Text | No |
   | `image` | Text | No |

La columna `products.images` está configurada como array. Para privacidad, no habilites lectura pública a nivel de tabla: cada fila publicada recibe lectura pública y los borradores permanecen privados.

### Cuenta administradora

La cuenta administradora ya fue creada en **Auth → Users** y agregada al equipo **Auth → Teams → admins**. Las contraseñas de Supabase Auth no se pueden exportar; la cuenta de Appwrite usa su propia contraseña.

## Variables del frontend

La configuración local de `apps/web/.env.local` ya apunta a este proyecto; el archivo está excluido de Git. Para otro equipo o un despliegue, usa `.env.example` como plantilla y completa las variables. Estas variables son configuración pública; **nunca pongas una API key de servidor en una variable `VITE_`**.

Para iniciar o compilar:

```powershell
cd apps
npm install
npm run dev
npm run build
```

## Estado de la migración del catálogo

La migración inicial terminó correctamente:

- Colecciones copiadas: **22**
- Productos copiados: **133**
- URLs de imágenes procesadas: **470**

La migración se puede volver a ejecutar. Lee las tablas públicas `products` y `collections` de Supabase, copia las imágenes al bucket de Appwrite y conserva los IDs originales en `legacy_id`. Para IDs demasiado largos o incompatibles con Appwrite genera IDs de fila deterministas, sin cambiar las referencias del catálogo.

Antes de retirar Supabase, verifica en Appwrite que los conteos y las imágenes estén presentes, prueba el catálogo público y el acceso administrativo, y confirma que los borradores permanezcan privados. Conserva Supabase como respaldo hasta terminar estas comprobaciones. Después de validar, revoca la API key temporal de Appwrite en **Settings → API Keys**.

Para repetir la migración manualmente, crea una API key temporal de Appwrite con solo `rows.write` y `files.write`. El lanzador solicita la clave pública **anon** de Supabase y la clave temporal de Appwrite; nunca uses `service_role` ni una clave `secret` de Supabase. Abre PowerShell en `apps/web` y ejecuta `.\scripts\run_migration.ps1`. No elimina datos de Supabase y se detiene ante errores, incluida la descarga fallida de una imagen pública de origen.

Después de migrar, configura las variables públicas de Appwrite en el entorno de despliegue y valida catálogo, imágenes, borradores y acceso administrativo. Conserva Supabase como respaldo hasta completar esa validación.

## Notas

- La autenticación usa sesiones de Appwrite. El dominio de la web debe estar registrado como plataforma Web en el proyecto.
- Los límites de almacenamiento, transferencia y solicitudes dependen del plan de Appwrite Cloud.
- Contacto y selección de WhatsApp siguen siendo funciones del frontend; no dependen de Appwrite.
