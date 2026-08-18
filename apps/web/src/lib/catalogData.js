import { getCollections, getProducts } from '@/lib/dataService';
import { collections as localCollections, perfumes as localPerfumes } from '@/data/perfumes.js';

export const getCatalogData = async () => {
  try {
    const [remoteProducts, remoteCollections] = await Promise.all([
      getProducts(),
      getCollections(),
    ]);

    return {
      products: Array.isArray(remoteProducts) && remoteProducts.length ? remoteProducts : localPerfumes,
      collections: Array.isArray(remoteCollections) && remoteCollections.length ? remoteCollections : localCollections,
    };
  } catch (error) {
    console.warn('No se pudo cargar el catálogo remoto, usando catálogo local.', error);
    return { products: localPerfumes, collections: localCollections };
  }
};