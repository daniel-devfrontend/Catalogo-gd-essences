import { supabase, supabaseEnabled } from '@/lib/supabaseClient';

import { preserveExactText } from '@/lib/textSafety';

const isEnabled = supabaseEnabled;
const PRODUCT_CACHE_KEY = 'gd-essences-products-cache';
const COLLECTION_CACHE_KEY = 'gd-essences-collections-cache';
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
    // Ignore cache write failures silently.
  }
};

const clearCache = (key) => {
  try {
    window.localStorage.removeItem(key);
  } catch (error) {
    // Ignore cache clear failures silently.
  }
};

const isExpiredDeletedProduct = (product) => {
  if (!product?.deleted_at) return false;
  const deletedAt = new Date(product.deleted_at);
  if (Number.isNaN(deletedAt.getTime())) return false;
  return Date.now() - deletedAt.getTime() > 7 * 24 * 60 * 60 * 1000;
};

const normalizeProductStatus = (product) => {
  const value = String(product?.status || '').trim().toLowerCase();
  if (value === 'draft') return 'draft';
  if (value === 'published') return 'published';
  if (product?.deleted_at || product?.deletedAt) return 'draft';
  return 'published';
};

const purgeExpiredDeletedProducts = async (products) => {
  const activeProducts = products.filter((product) => !isExpiredDeletedProduct(product));
  if (activeProducts.length === products.length) {
    return products;
  }

  const expiredIds = products.filter((product) => isExpiredDeletedProduct(product)).map((product) => product.id);
  if (expiredIds.length && supabase) {
    await supabase.from('products').delete().in('id', expiredIds);
  }

  return activeProducts;
};

export const getCollections = async () => {
  const cachedCollections = readCache(COLLECTION_CACHE_KEY);

  if (!isEnabled || !supabase) {
    return cachedCollections || [];
  }

  try {
    let { data, error } = await supabase.from('collections').select('id,title,description,image').order('title');
    let includesImage = true;

    if (error) {
      const fallbackResult = await supabase.from('collections').select('id,title,description').order('title');
      data = fallbackResult.data;
      error = fallbackResult.error;
      includesImage = false;
    }

    if (error) throw error;

    const result = Array.isArray(data)
      ? data.map((collection) => ({
          ...collection,
          id: preserveExactText(collection?.id),
          title: preserveExactText(collection?.title),
          description: preserveExactText(collection?.description),
          image: includesImage ? preserveExactText(collection?.image) : '',
        }))
      : [];
    writeCache(COLLECTION_CACHE_KEY, result);
    return result;
  } catch (error) {
    console.warn('No se pudieron cargar las colecciones desde Supabase.', error);
    return cachedCollections || [];
  }
};

export const createCollection = async (collection) => {
  if (!isEnabled || !supabase) {
    throw new Error('Supabase no está configurado.');
  }

  const payload = {
    ...collection,
    id: preserveExactText(collection?.id),
    title: preserveExactText(collection?.title),
    description: preserveExactText(collection?.description),
    image: preserveExactText(collection?.image),
  };

  const { error } = await supabase.from('collections').upsert(payload);
  if (error) throw error;
  clearCache(COLLECTION_CACHE_KEY);
  return getCollections();
};

export const updateCollection = async (collectionId, collection) => {
  if (!isEnabled || !supabase) {
    throw new Error('Supabase no está configurado.');
  }

  const payload = {
    title: preserveExactText(collection?.title),
    description: preserveExactText(collection?.description),
    image: preserveExactText(collection?.image),
  };

  const { error } = await supabase
    .from('collections')
    .update(payload)
    .eq('id', collectionId);
  if (error) throw error;
  clearCache(COLLECTION_CACHE_KEY);
  return getCollections();
};

export const deleteCollection = async (collectionId) => {
  if (!isEnabled || !supabase) {
    throw new Error('Supabase no está configurado.');
  }

  const slugifiedId = String(collectionId || '').trim().toLowerCase().replace(/\s+/g, '-');

  const { data: productsToDelete, error: fetchError } = await supabase
    .from('products')
    .select('id')
    .or(`collection.eq.${collectionId},collection.eq.${slugifiedId}`);

  if (fetchError) throw fetchError;

  const productIds = Array.isArray(productsToDelete) ? productsToDelete.map(({ id }) => id).filter(Boolean) : [];
  if (productIds.length) {
    const { error: productsError } = await supabase.from('products').delete().in('id', productIds);
    if (productsError) throw productsError;
  }

  const { error } = await supabase.from('collections').delete().eq('id', collectionId);
  if (error) throw error;

  clearCache(COLLECTION_CACHE_KEY);
  clearCache(PRODUCT_CACHE_KEY);
  return true;
};

export const getProducts = async () => {
  const cachedProducts = readCache(PRODUCT_CACHE_KEY);

  if (!isEnabled || !supabase) {
    return cachedProducts || [];
  }

  try {
    const { data, error } = await supabase.from('products').select('*');
    if (error) throw error;

    const result = await purgeExpiredDeletedProducts((data || []).map((product) => ({
      ...product,
      id: preserveExactText(product?.id),
      name: preserveExactText(product?.name),
      description: preserveExactText(product?.description),
      collection: preserveExactText(product?.collection),
      image: preserveExactText(product?.image),
      images: Array.isArray(product?.images) ? product.images.map((image) => preserveExactText(image)) : product?.images ?? [],
      originalPrice: product.original_price ?? product.originalPrice,
      videoUrl: product.video_url || product.videoUrl,
      deletedAt: product.deleted_at ?? product.deletedAt ?? null,
      status: normalizeProductStatus(product),
    })));

    writeCache(PRODUCT_CACHE_KEY, result);
    return result;
  } catch (error) {
    console.warn('No se pudieron cargar los productos desde Supabase.', error);
    return cachedProducts || [];
  }
};

export const createOrUpdateProduct = async (product) => {
  if (!isEnabled || !supabase) {
    throw new Error('Supabase no está configurado.');
  }

  const {
    originalPrice,
    videoUrl,
    deletedAt,
    deleted_at,
    original_price,
    video_url,
    ...rest
  } = product;

  const productWithStatus = {
    ...rest,
    name: preserveExactText(rest?.name),
    description: preserveExactText(rest?.description),
    collection: preserveExactText(rest?.collection),
    image: preserveExactText(rest?.image),
    video_url: preserveExactText(video_url || videoUrl || null),
    original_price: originalPrice ?? original_price ?? null,
    deleted_at: deleted_at ?? deletedAt ?? null,
    status: product.status ?? 'published',
  };
  // Only send known columns to avoid schema errors if some columns (eg. deleted_at) don't exist
  const allowedCols = ['id', 'name', 'price', 'original_price', 'description', 'collection', 'image', 'images', 'video_url', 'status', 'deleted_at'];
  const payload = {};
  allowedCols.forEach((col) => {
    if (Object.prototype.hasOwnProperty.call(productWithStatus, col)) {
      // avoid sending undefined
      const v = productWithStatus[col];
      if (v !== undefined) payload[col] = v;
    }
  });

  const { data, error } = await supabase.from('products').upsert(payload, { onConflict: 'id' }).select('*');
  if (error) throw error;
  clearCache(PRODUCT_CACHE_KEY);
  return data;
};

export const uploadProductImage = async (file) => {
  if (!isEnabled || !supabase) {
    throw new Error('Supabase no está configurado.');
  }

  if (typeof file === 'string') return file;

  const extension = file.name?.split('.').pop()?.toLowerCase() || 'jpg';
  const filePath = `products/${crypto.randomUUID()}.${extension}`;
  const { error } = await supabase.storage
    .from('product-images')
    .upload(filePath, file, {
      cacheControl: '31536000',
      contentType: file.type || 'image/jpeg',
      upsert: false,
    });

  if (error) throw error;

  const { data } = supabase.storage.from('product-images').getPublicUrl(filePath);
  if (!data?.publicUrl) throw new Error('No se pudo obtener la URL pública de la imagen.');
  return data.publicUrl;
};

export const removeProductImages = async (imageUrls) => {
  if (!isEnabled || !supabase || !Array.isArray(imageUrls) || !imageUrls.length) return;

  const paths = imageUrls
    .filter((imageUrl) => typeof imageUrl === 'string')
    .map((imageUrl) => {
      const marker = '/storage/v1/object/public/product-images/';
      const markerIndex = imageUrl.indexOf(marker);
      return markerIndex === -1 ? null : decodeURIComponent(imageUrl.slice(markerIndex + marker.length));
    })
    .filter(Boolean);

  if (!paths.length) return;

  const { error } = await supabase.storage.from('product-images').remove(paths);
  if (error) throw error;
};

export const addImagesToProduct = async (productId, imageUrls) => {
  if (!isEnabled || !supabase) {
    throw new Error('Supabase no está configurado.');
  }

  const { data: existing, error: fetchError } = await supabase.from('products').select('images').eq('id', productId).single();
  if (fetchError) throw fetchError;

  const images = Array.isArray(existing?.images) ? [...existing.images, ...imageUrls] : [...imageUrls];
  // Only update images column to avoid sending unknown columns
  const { data, error } = await supabase.from('products').upsert({ id: productId, images }, { onConflict: 'id' }).select('*');
  if (error) throw error;
  clearCache(PRODUCT_CACHE_KEY);
  return data;
};

export const deleteProduct = async (productId) => {
  if (!isEnabled || !supabase) {
    throw new Error('Supabase no está configurado.');
  }

  const { error } = await supabase.from('products').delete().eq('id', productId);
  if (error) throw error;
  clearCache(PRODUCT_CACHE_KEY);
  return true;
};

export const restoreProduct = async (productId) => {
  if (!isEnabled || !supabase) {
    throw new Error('Supabase no está configurado.');
  }

  const { data, error } = await supabase.from('products').upsert({ id: productId, status: 'published', deleted_at: null }, { onConflict: 'id' }).select('*');
  if (error) throw error;
  clearCache(PRODUCT_CACHE_KEY);
  return data;
};

export const deleteProductPermanently = async (productId) => {
  if (!isEnabled || !supabase) {
    throw new Error('Supabase no está configurado.');
  }

  const { error } = await supabase.from('products').delete().eq('id', productId);
  if (error) throw error;
  clearCache(PRODUCT_CACHE_KEY);
  return getProducts();
};

export const getProductById = async (productId) => {
  const products = await getProducts();
  return products.find((product) => product.id === productId) || null;
};
