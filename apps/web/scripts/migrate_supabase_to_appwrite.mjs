import { createHash } from 'crypto';

const requiredEnv = [
  'SUPABASE_URL',
  'SUPABASE_ANON_KEY',
  'APPWRITE_ENDPOINT',
  'APPWRITE_PROJECT_ID',
  'APPWRITE_API_KEY',
  'APPWRITE_DATABASE_ID',
  'APPWRITE_ADMIN_TEAM_ID',
];

for (const key of requiredEnv) {
  if (!process.env[key]) throw new Error(`Falta la variable de entorno ${key}.`);
}

const supabaseUrl = process.env.SUPABASE_URL.replace(/\/+$/, '');
const supabaseKey = process.env.SUPABASE_ANON_KEY;
const appwriteEndpoint = process.env.APPWRITE_ENDPOINT.replace(/\/+$/, '');
const appwriteProjectId = process.env.APPWRITE_PROJECT_ID;
const appwriteApiKey = process.env.APPWRITE_API_KEY;
const databaseId = process.env.APPWRITE_DATABASE_ID;
const productsTableId = process.env.APPWRITE_PRODUCTS_TABLE_ID || 'products';
const collectionsTableId = process.env.APPWRITE_COLLECTIONS_TABLE_ID || 'collections';
const bucketId = process.env.APPWRITE_BUCKET_ID || 'product-images';
const adminTeamId = process.env.APPWRITE_ADMIN_TEAM_ID;
const migratedImageUrls = new Map();

const appwriteHeaders = {
  'X-Appwrite-Project': appwriteProjectId,
  'X-Appwrite-Key': appwriteApiKey,
};

const fetchWithContext = async (url, options, operation) => {
  try {
    return await fetch(url, options);
  } catch (error) {
    const cause = error?.cause;
    const details = [cause?.code, cause?.message].filter(Boolean).join(': ');
    throw new Error(`${operation}: falló la conexión${details ? ` (${details})` : ''}.`);
  }
};

const checkedJson = async (response, serviceName) => {
  const text = await response.text();
  let value = null;
  if (text) {
    try {
      value = JSON.parse(text);
    } catch (error) {
      throw new Error(`${serviceName} devolvió una respuesta no válida.`);
    }
  }
  if (!response.ok) {
    throw new Error(`${serviceName}: ${value?.message || response.statusText} (${response.status}).`);
  }
  return value;
};

const fetchSupabaseRows = async (tableName) => {
  const rows = [];
  const pageSize = 1000;
  let offset = 0;

  while (true) {
    const url = new URL(`${supabaseUrl}/rest/v1/${tableName}`);
    url.searchParams.set('select', '*');
    url.searchParams.set('limit', String(pageSize));
    url.searchParams.set('offset', String(offset));
    const response = await fetchWithContext(url, {
      headers: {
        apikey: supabaseKey,
        Authorization: `Bearer ${supabaseKey}`,
      },
    }, `Supabase (leer ${tableName})`);
    const page = await checkedJson(response, `Supabase (${tableName})`);
    if (!Array.isArray(page)) throw new Error(`Supabase devolvió una respuesta inesperada para ${tableName}.`);
    rows.push(...page);
    if (page.length < pageSize) return rows;
    offset += page.length;
  }
};

const appwriteRowsUrl = (tableId, rowId = '') => {
  const base = `${appwriteEndpoint}/tablesdb/${encodeURIComponent(databaseId)}/tables/${encodeURIComponent(tableId)}/rows`;
  return rowId ? `${base}/${encodeURIComponent(rowId)}` : base;
};

const saveRow = async (tableId, rowId, data, permissions) => {
  const response = await fetchWithContext(appwriteRowsUrl(tableId), {
    method: 'POST',
    headers: { ...appwriteHeaders, 'Content-Type': 'application/json' },
    body: JSON.stringify({ rowId, data, permissions }),
  }, 'Appwrite (crear fila)');
  if (response.status === 409) {
    const update = await fetchWithContext(appwriteRowsUrl(tableId, rowId), {
      method: 'PATCH',
      headers: { ...appwriteHeaders, 'Content-Type': 'application/json' },
      body: JSON.stringify({ data, permissions }),
    }, 'Appwrite (actualizar fila)');
    return checkedJson(update, 'Appwrite (actualizar documento)');
  }
  return checkedJson(response, 'Appwrite (crear documento)');
};

const makePermissions = (isPublished) => {
  const team = `team:${adminTeamId}`;
  const permissions = [`read("${team}")`, `update("${team}")`, `delete("${team}")`];
  if (isPublished) permissions.push('read("any")');
  return permissions;
};

const toRowId = (legacyId, prefix) => {
  if (/^[A-Za-z0-9][A-Za-z0-9._-]{0,35}$/.test(legacyId)) return legacyId;
  const digest = createHash('sha256').update(legacyId).digest('hex').slice(0, 32);
  return `${prefix}-${digest}`;
};

const publicFileUrl = (fileId) => (
  `${appwriteEndpoint}/storage/buckets/${encodeURIComponent(bucketId)}/files/${encodeURIComponent(fileId)}/view?project=${encodeURIComponent(appwriteProjectId)}`
);

const uploadBlob = async (blob, fileId, filename) => {
  const chunkSize = 5 * 1024 * 1024;
  const path = `${appwriteEndpoint}/storage/buckets/${encodeURIComponent(bucketId)}/files`;
  let result;

  if (blob.size <= chunkSize) {
    const formData = new FormData();
    formData.append('fileId', fileId);
    formData.append('file', blob, filename);
    const response = await fetchWithContext(
      path,
      { method: 'POST', headers: appwriteHeaders, body: formData },
      'Appwrite (subir imagen)',
    );
    if (response.status === 409) return;
    return checkedJson(response, 'Appwrite (subir imagen)');
  }

  for (let start = 0; start < blob.size; start += chunkSize) {
    const end = Math.min(start + chunkSize, blob.size);
    const formData = new FormData();
    if (start === 0) formData.append('fileId', fileId);
    formData.append('file', blob.slice(start, end), filename);
    const response = await fetchWithContext(path, {
      method: 'POST',
      headers: {
        ...appwriteHeaders,
        'Content-Range': `bytes ${start}-${end - 1}/${blob.size}`,
        ...(start ? { 'X-Appwrite-ID': fileId } : {}),
      },
      body: formData,
    }, 'Appwrite (subir imagen)');
    if (response.status === 409 && start === 0) return;
    result = await checkedJson(response, 'Appwrite (subir imagen)');
  }
  return result;
};

const migrateImage = async (imageUrl) => {
  if (typeof imageUrl !== 'string' || !/^https?:\/\//i.test(imageUrl)) return imageUrl || '';
  const existingMatch = imageUrl.match(/\/storage\/buckets\/([^/]+)\/files\/([^/]+)\/(?:view|preview|download)(?:$|\?)/);
  if (existingMatch && decodeURIComponent(existingMatch[1]) === bucketId) return imageUrl;
  if (migratedImageUrls.has(imageUrl)) return migratedImageUrls.get(imageUrl);

  const download = await fetchWithContext(imageUrl, undefined, 'Imagen de origen');
  if (!download.ok) throw new Error(`No se pudo descargar una imagen del catálogo (${download.status}).`);
  const blob = await download.blob();
  const fileId = createHash('sha256').update(imageUrl).digest('hex').slice(0, 32);
  const extension = new URL(imageUrl).pathname.match(/\.([a-z0-9]{2,5})$/i)?.[1] || 'img';
  await uploadBlob(blob, fileId, `catalog-image.${extension}`);

  const migratedUrl = publicFileUrl(fileId);
  migratedImageUrls.set(imageUrl, migratedUrl);
  return migratedUrl;
};

const mapCollection = async (collection) => ({
  legacy_id: String(collection.id),
  title: collection.title || '',
  description: collection.description || '',
  image: await migrateImage(collection.image || ''),
});

const mapProduct = async (product) => {
  const isDraft = product.status === 'draft' || Boolean(product.deleted_at || product.deletedAt);
  const sourceImages = Array.isArray(product.images)
    ? product.images
    : product.image
      ? [product.image]
      : [];
  const images = await Promise.all(sourceImages.map(migrateImage));
  const image = await migrateImage(product.image || images[0] || '');

  return {
    data: {
      legacy_id: String(product.id),
      name: product.name || '',
      price: Number(product.price || 0),
      original_price: product.original_price == null ? null : Number(product.original_price),
      description: product.description || '',
      collection: product.collection || '',
      image,
      images: [...new Set([...(image ? [image] : []), ...images])],
      video_url: product.video_url || product.videoUrl || '',
      status: isDraft ? 'draft' : 'published',
      deleted_at: product.deleted_at || product.deletedAt || null,
    },
    permissions: makePermissions(!isDraft),
  };
};

const migrateCollections = async () => {
  const sourceCollections = await fetchSupabaseRows('collections');
  for (const collection of sourceCollections) {
    const id = String(collection.id || '');
    if (!id) throw new Error('Se encontró una colección sin identificador.');
    await saveRow(
      collectionsTableId,
      toRowId(id, 'c'),
      await mapCollection(collection),
      [
        'read("any")',
        `update("team:${adminTeamId}")`,
        `delete("team:${adminTeamId}")`,
      ],
    );
  }
  return sourceCollections.length;
};

const migrateProducts = async () => {
  const sourceProducts = await fetchSupabaseRows('products');
  for (const product of sourceProducts) {
    const id = String(product.id || '');
    if (!id) throw new Error('Se encontró un producto sin identificador.');
    const migrated = await mapProduct(product);
    await saveRow(productsTableId, toRowId(id, 'p'), migrated.data, migrated.permissions);
  }
  return sourceProducts.length;
};

try {
  console.log('Copiando colecciones desde Supabase...');
  const collectionCount = await migrateCollections();
  console.log(`Colecciones copiadas: ${collectionCount}`);
  console.log('Copiando productos e imágenes desde Supabase...');
  const productCount = await migrateProducts();
  console.log(`Productos copiados: ${productCount}`);
  console.log(`Imágenes transferidas o reutilizadas: ${migratedImageUrls.size}`);
  console.log('Migración terminada. Verifica los datos y permisos en Appwrite antes de retirar Supabase.');
} catch (error) {
  console.error('La migración se detuvo:', error.message);
  process.exitCode = 1;
}
