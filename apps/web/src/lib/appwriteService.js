import { appwriteConfig, appwriteEnabled, appwriteRequest, requireAdminTeam, uploadAppwriteFile } from '@/lib/appwriteClient';
import { preserveExactText } from '@/lib/textSafety';

const PRODUCT_CACHE_KEY = `gd-essences-appwrite-products-cache-${appwriteConfig.projectId || 'unconfigured'}`;
const COLLECTION_CACHE_KEY = `gd-essences-appwrite-collections-cache-${appwriteConfig.projectId || 'unconfigured'}`;
const CACHE_TTL_MS = 10 * 60 * 1000;

const readCache = (key) => {
  try {
    const cachedValue = window.localStorage.getItem(key);
    if (!cachedValue) return null;

    const parsed = JSON.parse(cachedValue);
    if (!parsed || typeof parsed !== 'object') return null;
    if (Date.now() - (parsed.savedAt || 0) > CACHE_TTL_MS) {
      window.localStorage.removeItem(key);
      return null;
    }

    return parsed.value;
  } catch (error) {
    return null;
  }
};

const writeCache = (key, value) => {
  try {
    window.localStorage.setItem(key, JSON.stringify({ value, savedAt: Date.now() }));
  } catch (error) {
    console.warn('No se pudo guardar la caché local del catálogo.', error);
  }
};

const clearCache = (key) => {
  try {
    window.localStorage.removeItem(key);
  } catch (error) {
    console.warn('No se pudo limpiar la caché local del catálogo.', error);
  }
};

const tableRowsPath = (tableId) => (
  `/tablesdb/${encodeURIComponent(appwriteConfig.databaseId)}/tables/${encodeURIComponent(tableId)}/rows`
);

const normalizeProduct = (document) => ({
  ...document,
  id: preserveExactText(document?.legacy_id || document?.$id || document?.id),
  name: preserveExactText(document?.name),
  description: preserveExactText(document?.description),
  collection: preserveExactText(document?.collection),
  image: preserveExactText(document?.image),
  images: Array.isArray(document?.images) ? document.images.map((image) => preserveExactText(image)) : [],
  originalPrice: document?.original_price ?? document?.originalPrice,
  videoUrl: document?.video_url || document?.videoUrl,
  deletedAt: document?.deleted_at ?? document?.deletedAt ?? null,
  status: normalizeProductStatus(document),
});

const normalizeProductStatus = (product) => {
  const value = String(product?.status || '').trim().toLowerCase();
  if (value === 'draft') return 'draft';
  if (value === 'published') return 'published';
  if (product?.deleted_at || product?.deletedAt) return 'draft';
  return 'published';
};

const normalizeCollection = (document) => ({
  ...document,
  id: preserveExactText(document?.legacy_id || document?.$id || document?.id),
  title: preserveExactText(document?.title),
  description: preserveExactText(document?.description),
  image: preserveExactText(document?.image),
});

const listRows = async (tableId) => {
  const rows = [];
  const pageSize = 100;
  let offset = 0;

  while (true) {
    const query = encodeURIComponent(JSON.stringify({ method: 'limit', values: [pageSize] }));
    const offsetQuery = encodeURIComponent(JSON.stringify({ method: 'offset', values: [offset] }));
    const result = await appwriteRequest(
      `${tableRowsPath(tableId)}?queries[]=${query}&queries[]=${offsetQuery}`
    );
    const page = Array.isArray(result?.rows) ? result.rows : [];
    rows.push(...page);
    if (page.length < pageSize) return rows;
    offset += page.length;
  }
};

const rowPermissions = (status = 'published') => {
  const teamId = requireAdminTeam();
  const permissions = [
    `read("team:${teamId}")`,
    `update("team:${teamId}")`,
    `delete("team:${teamId}")`,
  ];
  if (status === 'published') permissions.push('read("any")');
  return permissions;
};

const upsertRow = async (tableId, rowId, data, permissions) => {
  if (!rowId || String(rowId).length > 36 || !/^[A-Za-z0-9][A-Za-z0-9._-]*$/.test(String(rowId))) {
    throw new Error('El identificador de Appwrite debe tener hasta 36 caracteres y usar letras, números, punto, guion o guion bajo.');
  }
  const path = `${tableRowsPath(tableId)}/${encodeURIComponent(rowId)}`;
  try {
    return await appwriteRequest(tableRowsPath(tableId), {
      method: 'POST',
      body: JSON.stringify({ rowId, data, permissions }),
    });
  } catch (error) {
    if (error.code !== 409) throw error;
    return appwriteRequest(path, {
      method: 'PATCH',
      body: JSON.stringify({ data, permissions }),
    });
  }
};

const isExpiredDeletedProduct = (product) => {
  if (!product?.deletedAt) return false;
  const deletedAt = new Date(product.deletedAt);
  return !Number.isNaN(deletedAt.getTime())
    && Date.now() - deletedAt.getTime() > 7 * 24 * 60 * 60 * 1000;
};

export const getCollections = async () => {
  const cachedCollections = readCache(COLLECTION_CACHE_KEY);
  if (!appwriteEnabled) return cachedCollections || [];

  try {
    const rows = await listRows(appwriteConfig.collectionsTableId);
    const result = rows.map(normalizeCollection)
      .sort((first, second) => first.title.localeCompare(second.title));
    writeCache(COLLECTION_CACHE_KEY, result);
    return result;
  } catch (error) {
    console.warn('No se pudieron cargar las colecciones desde Appwrite.', error);
    return cachedCollections || [];
  }
};

export const createCollection = async (collection) => {
  const id = preserveExactText(collection?.id);
  const payload = {
    title: preserveExactText(collection?.title),
    description: preserveExactText(collection?.description),
    image: preserveExactText(collection?.image),
    legacy_id: id,
  };
  await upsertRow(
    appwriteConfig.collectionsTableId,
    collection?.$id || id,
    payload,
    rowPermissions()
  );
  clearCache(COLLECTION_CACHE_KEY);
  return getCollections();
};

export const updateCollection = async (collectionId, collection) => (
  createCollection({ ...collection, id: collectionId, $id: collection?.$id })
);

export const deleteCollection = async (collectionId) => {
  const products = await listRows(appwriteConfig.productsTableId);
  const collections = await listRows(appwriteConfig.collectionsTableId);
  const targetCollection = collections.find((item) => (item.legacy_id || item.$id) === collectionId);
  if (!targetCollection) throw new Error('No se encontró la colección seleccionada.');
  const associatedProducts = products.filter((product) => product.collection === collectionId);

  await Promise.all(associatedProducts.map((product) => (
    appwriteRequest(
      `${tableRowsPath(appwriteConfig.productsTableId)}/${encodeURIComponent(product.$id)}`,
      { method: 'DELETE' }
    )
  )));
  await appwriteRequest(
    `${tableRowsPath(appwriteConfig.collectionsTableId)}/${encodeURIComponent(targetCollection.$id)}`,
    { method: 'DELETE' }
  );

  clearCache(COLLECTION_CACHE_KEY);
  clearCache(PRODUCT_CACHE_KEY);
  return true;
};

export const getProducts = async () => {
  const cachedProducts = readCache(PRODUCT_CACHE_KEY);
  const publicCachedProducts = Array.isArray(cachedProducts)
    ? cachedProducts.filter((product) => product.status === 'published' && !product.deletedAt)
    : [];
  if (!appwriteEnabled) return publicCachedProducts;

  try {
    const rows = await listRows(appwriteConfig.productsTableId);
    const result = rows
      .map(normalizeProduct)
      .filter((product) => !isExpiredDeletedProduct(product));
    writeCache(
      PRODUCT_CACHE_KEY,
      result.filter((product) => product.status === 'published' && !product.deletedAt)
    );
    return result;
  } catch (error) {
    console.warn('No se pudieron cargar los productos desde Appwrite.', error);
    return publicCachedProducts;
  }
};

export const createOrUpdateProduct = async (product) => {
  const {
    originalPrice,
    videoUrl,
    deletedAt,
    deleted_at,
    original_price,
    video_url,
    id,
  } = product;
  const status = product.status || 'published';
  const payload = {
    legacy_id: preserveExactText(id),
    name: preserveExactText(product?.name),
    price: Number(product?.price),
    description: preserveExactText(product?.description),
    collection: preserveExactText(product?.collection),
    image: preserveExactText(product?.image),
    images: Array.isArray(product?.images) ? product.images : [],
    video_url: preserveExactText(video_url || videoUrl || ''),
    original_price: originalPrice ?? original_price ?? null,
    deleted_at: deleted_at ?? deletedAt ?? null,
    status,
  };
  const savedProduct = await upsertRow(
    appwriteConfig.productsTableId,
    product?.$id || preserveExactText(id),
    payload,
    rowPermissions(status)
  );
  clearCache(PRODUCT_CACHE_KEY);
  return savedProduct;
};

export const uploadProductImage = async (file) => {
  if (typeof file === 'string') return file;
  requireAdminTeam();

  const result = await uploadAppwriteFile(file);
  return `${appwriteConfig.endpoint}/storage/buckets/${encodeURIComponent(appwriteConfig.bucketId)}/files/${encodeURIComponent(result.$id)}/view?project=${encodeURIComponent(appwriteConfig.projectId)}`;
};

const getAppwriteFileId = (imageUrl) => {
  try {
    const url = new URL(imageUrl);
    const match = url.pathname.match(/\/storage\/buckets\/([^/]+)\/files\/([^/]+)\/(?:view|preview|download)$/);
    if (!match || decodeURIComponent(match[1]) !== appwriteConfig.bucketId) return null;
    return decodeURIComponent(match[2]);
  } catch (error) {
    return null;
  }
};

export const removeProductImages = async (imageUrls) => {
  if (!Array.isArray(imageUrls) || !imageUrls.length) return;
  const fileIds = imageUrls.map(getAppwriteFileId).filter(Boolean);
  await Promise.all(fileIds.map((fileId) => (
    appwriteRequest(
      `/storage/buckets/${encodeURIComponent(appwriteConfig.bucketId)}/files/${encodeURIComponent(fileId)}`,
      { method: 'DELETE' }
    )
  )));
};

export const addImagesToProduct = async (productId, imageUrls) => {
  const product = await getProductById(productId);
  if (!product) throw new Error('No se encontró el producto seleccionado.');
  return createOrUpdateProduct({
    ...product,
    images: [...new Set([...(product.images || []), ...imageUrls])],
  });
};

export const deleteProduct = async (productId) => {
  const products = await getProducts();
  const product = products.find((item) => item.id === productId || item.$id === productId);
  if (!product) throw new Error('No se encontró el producto seleccionado.');
  await appwriteRequest(
    `${tableRowsPath(appwriteConfig.productsTableId)}/${encodeURIComponent(product.$id)}`,
    { method: 'DELETE' }
  );
  clearCache(PRODUCT_CACHE_KEY);
  return true;
};

export const restoreProduct = async (productId) => {
  const product = await getProductById(productId);
  if (!product) throw new Error('No se encontró el producto seleccionado.');
  return createOrUpdateProduct({ ...product, status: 'published', deletedAt: null });
};

export const deleteProductPermanently = async (productId) => {
  await deleteProduct(productId);
  return getProducts();
};

export const getProductById = async (productId) => {
  const products = await getProducts();
  return products.find((product) => product.id === productId) || null;
};
