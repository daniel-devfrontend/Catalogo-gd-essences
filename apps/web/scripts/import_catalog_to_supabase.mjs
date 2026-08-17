import { readFileSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createClient } from '@supabase/supabase-js';
import { perfumes, collections } from '../src/data/perfumes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const envPath = path.join(rootDir, '.env');
const envValues = {};
for (const line of readFileSync(envPath, 'utf8').split(/\r?\n/)) {
  if (!line || line.startsWith('#')) continue;
  const separatorIndex = line.indexOf('=');
  if (separatorIndex === -1) continue;
  const key = line.slice(0, separatorIndex).trim();
  const value = line.slice(separatorIndex + 1).trim();
  envValues[key] = value;
}

const supabaseUrl = process.env.VITE_SUPABASE_URL || envValues.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || envValues.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase credentials. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.');
}

const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
});

const chunkArray = (items, size) => {
  const chunks = [];
  for (let i = 0; i < items.length; i += size) {
    chunks.push(items.slice(i, i + size));
  }
  return chunks;
};

const mapProduct = (product) => ({
  id: product.id,
  name: product.name,
  price: Number(product.price ?? 0),
  original_price: product.originalPrice ?? null,
  description: product.description ?? null,
  collection: product.collection ?? null,
  image: product.image ?? null,
  images: Array.isArray(product.images) ? product.images : (product.image ? [product.image] : []),
  video_url: product.video_url || product.videoUrl || null,
  status: product.status || 'published',
  is_active: product.isActive ?? true,
});

const mapCollection = (collection) => ({
  id: collection.id,
  title: collection.title,
  description: collection.description ?? null,
});

const productRows = perfumes.map(mapProduct);
const collectionRows = collections.map(mapCollection);

const importCollections = async () => {
  for (const batch of chunkArray(collectionRows, 100)) {
    const { error } = await supabase.from('collections').upsert(batch, { onConflict: 'id' });
    if (error) {
      throw error;
    }
  }
};

const importProducts = async () => {
  for (const batch of chunkArray(productRows, 100)) {
    const { error } = await supabase.from('products').upsert(batch, { onConflict: 'id' });
    if (error) {
      throw error;
    }
  }
};

try {
  await importCollections();
  await importProducts();
  console.log(`Imported ${productRows.length} products and ${collectionRows.length} collections into Supabase.`);
} catch (error) {
  console.error('Import failed:', error);
  process.exitCode = 1;
}
