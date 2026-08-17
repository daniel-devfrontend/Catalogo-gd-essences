# Integración Supabase - G&D Essences

Este README contiene pasos y scripts automáticos para poner en producción la parte de backend (productos e imágenes) usando Supabase.

Resumen de lo que añade este repo:
- Migraciones SQL en `migrations/` para crear `products` y la tabla `admins` y sus políticas RLS.
- Scripts CLI en `scripts/` para crear el bucket `product-images`.
- Ejemplo de `.env.example` con variables necesarias.

Requisitos locales:
- Tener una cuenta en https://supabase.com y crear un proyecto.
- Instalar `supabase` CLI: https://supabase.com/docs/guides/cli
- Tener `npm` y `node` instalados para compilar el frontend.

Pasos recomendados (rápido):

1) Crear proyecto en Supabase (GUI) y anotar `Project URL` y `anon key`.

2) Clonar repo y moverse a la carpeta web:

```bash
cd Catalogo-gd-essences/apps/web
```

3) Copia `migrations/*.sql` al proyecto Supabase y ejecútalas. Puedes usar la CLI o conectar vía SQL Editor.

Usando `supabase` CLI (desde el workspace root):

```bash
# Inicia sesión si no lo has hecho
supabase login

# Apunta al proyecto (obtén PROJECT_REF del panel supabase)
supabase link --project-ref <PROJECT_REF>

# Ejecuta migraciones (ejemplo usando psql sobre DATABASE_URL)
supabase db remote set
# o simplemente pega el SQL en SQL Editor del panel de Supabase y ejecútalo
```

4) Crear el bucket público de imágenes (usa el script):

```bash
cd apps/web
./scripts/create_bucket.sh
# o en Windows PowerShell
./scripts/create_bucket.ps1
```

5) Añadir al administrador tu usuario (desde SQL editor):

```sql
insert into public.admins (user_id) values ('tu-uid-de-supabase');
```

Para obtener tu `user_id`: regístrate en la app (o crea un usuario desde Supabase Auth) y copia el `id` del usuario en la tabla `auth.users`.

6) Añade variables al archivo `apps/web/.env` o a las variables de entorno de deploy:

```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...anon...
```

7) En tu entorno local instala dependencias y corre build/serve:

```bash
cd apps/web
npm install
npm run dev    # desarrollo
npm run build  # producción
```

Notas de seguridad:
- La política RLS que incluimos permite SELECT público y solo permite INSERT/UPDATE/DELETE a los UIDs listados en `public.admins`.
- Para producción puedes crear un workflow de CI que use la `service_role` (solo en el backend) para operaciones administrativas automatizadas.

Si quieres, puedo generar un `supabase` CLI `migrations/` compatible y un pequeño script `deploy_supabase.sh` que aplique todo automáticamente (te mostraré los comandos para pegar en tu terminal). ¿Lo genero ahora?
