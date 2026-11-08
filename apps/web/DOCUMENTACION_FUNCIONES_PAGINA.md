# Documentación funcional de la página G&D Essences

## 1. Propósito general
La web es un catálogo virtual de fragancias premium que permite:
- mostrar perfumes por colección,
- filtrar y buscar productos,
- ver detalles de cada perfume,
- gestionar productos desde un panel administrativo,
- administrar el catálogo mediante Appwrite Cloud.

## 2. Estructura de la aplicación
- HomePage: portada y presentación.
- CatalogPage: catálogo completo con filtros y búsqueda.
- CollectionsPage: listado de colecciones.
- CollectionDetailPage: detalle de una colección específica.
- ContactPage: formulario de contacto.
- AdminPage: panel de administración.

## 3. Flujos principales
### 3.1 Inicio
- Muestra una portada con imagen destacada.
- Presenta perfumes destacados de forma aleatoria diaria.
- Permite abrir el detalle del perfume desde la tarjeta.

### 3.2 Catálogo
- Carga la lista de perfumes desde la capa de datos.
- Permite filtrar por colección, buscar por texto y ordenar por nombre o precio.
- Abre un modal con información detallada del perfume.

### 3.3 Colecciones
- Carga las colecciones y cuenta cuántos perfumes pertenecen a cada una.
- Permite navegar a la vista de detalle de una colección.

### 3.4 Contacto
- Muestra un formulario para que el visitante contacte con la tienda.

### 3.5 Administración
- Permite crear o editar productos.
- Permite adjuntar imágenes al producto.
- Permite publicar, restaurar y eliminar productos.
- Permite crear colecciones.

## 4. Funciones del módulo de datos
La capa de datos central se encarga de:
- obtener productos,
- obtener colecciones,
- crear o actualizar productos,
- insertar imágenes,
- añadir imágenes adicionales a un producto,
- borrar y restaurar productos,
- cargar y borrar imágenes en Appwrite Storage.

## 5. Almacenamiento
La web usa Appwrite Cloud para autenticación, productos, colecciones e imágenes. Si el servicio no está configurado o no responde, las vistas públicas pueden usar el catálogo local incluido en el proyecto.

### Qué guarda
- productos,
- colecciones,
- imágenes en un bucket de Appwrite Storage,
- sesiones del panel de administración administradas por Appwrite Auth.

### Ventajas
- Persistencia remota en Appwrite Cloud.
- Sincronización entre sesiones del usuario.
- Autenticación real para el panel de administración.

## 6. Limitaciones importantes
- Requiere las variables `VITE_APPWRITE_*` documentadas en `README-APPWRITE.md`.
- El dominio del catálogo debe registrarse como plataforma Web en Appwrite.
- Las contraseñas de usuarios de Supabase Auth no se pueden copiar a Appwrite; deben restablecerse.
- Los permisos de Appwrite deben configurarse correctamente para que el catálogo lea los datos y los borradores sigan privados.

## 7. Migración desde Supabase
El script `scripts/migrate_supabase_to_appwrite.mjs` copia productos, colecciones e imágenes. La migración se ejecuta manualmente y requiere credenciales locales; consulta `README-APPWRITE.md`.

## 8. Archivos clave
- src/pages/HomePage.jsx
- src/pages/CatalogPage.jsx
- src/pages/CollectionsPage.jsx
- src/pages/CollectionDetailPage.jsx
- src/pages/AdminPage.jsx
- src/components/ProductAdmin.jsx
- src/lib/dataService.js
- src/lib/appwriteClient.js
- src/lib/appwriteService.js
