# Documentación funcional de la página G&D Essences

## 1. Propósito general
La web es un catálogo virtual de fragancias premium que permite:
- mostrar perfumes por colección,
- filtrar y buscar productos,
- ver detalles de cada perfume,
- gestionar productos desde un panel administrativo,
- guardar cambios localmente en el navegador sin backend.

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
- Permite mover productos a borradores o eliminarlos definitivamente.
- Permite crear colecciones.
- Permite exportar e importar el estado de la base de datos local.

## 4. Funciones del módulo de datos
La capa de datos central se encarga de:
- obtener productos,
- obtener colecciones,
- crear o actualizar productos,
- insertar imágenes,
- añadir imágenes adicionales a un producto,
- eliminar productos de forma lógica,
- eliminar productos de forma permanente,
- exportar/importar datos.

## 5. Almacenamiento actual
La web usa Supabase para productos, colecciones e imágenes en el catálogo.

### Qué guarda
- productos,
- colecciones,
- imágenes codificadas en Base64 dentro de los registros de productos.

### Ventajas
- Persistencia remota en Supabase.
- Sincronización entre sesiones del usuario.
- Autenticación real para el panel de administración.

## 6. Limitaciones importantes
- Las imágenes en Base64 aumentan el tamaño de los registros.
- Requiere que `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY` estén configuradas.
- La administración no funciona sin credenciales de Supabase.

## 7. Recomendación para producción futura
Si quieres una versión más robusta, el siguiente paso natural es pasar a:
- Firebase,
- Supabase (si lo vuelves a necesitar),
- o un backend propio con API REST.

## 8. Archivos clave
- src/pages/HomePage.jsx
- src/pages/CatalogPage.jsx
- src/pages/CollectionsPage.jsx
- src/pages/CollectionDetailPage.jsx
- src/pages/AdminPage.jsx
- src/components/ProductAdmin.jsx
- src/lib/dataService.js
- src/lib/supabaseService.js
