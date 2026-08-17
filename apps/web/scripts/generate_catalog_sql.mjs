import { writeFileSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { collections, perfumes } from '../src/data/perfumes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const outputPath = path.join(__dirname, 'catalog_import.sql');

const escapeSql = (value) => {
  if (value === null || value === undefined) return 'NULL';
  return `'${String(value).replace(/'/g, "''")}'`;
};

const escapeArray = (value) => {
  if (!Array.isArray(value) || value.length === 0) return 'ARRAY[]::text[]';
  return `ARRAY[${value.map((item) => escapeSql(item)).join(', ')}]::text[]`;
};

const uniqueCollections = Array.from(new Map(collections.map((item) => [item.id, item])).values());
const uniqueProducts = Array.from(new Map(perfumes.map((item) => [item.id, item])).values());

const lines = [];
lines.push('-- Generated catalog import');
lines.push('');
lines.push('insert into public.collections (id, title, description, created_at, updated_at) values');
for (const [index, item] of uniqueCollections.entries()) {
  const suffix = index === uniqueCollections.length - 1 ? '' : ',';
  lines.push(`  (${escapeSql(item.id)}, ${escapeSql(item.title)}, ${escapeSql(item.description)}, now(), now())${suffix}`);
}
lines.push('on conflict (id) do update set');
lines.push('  title = excluded.title,');
lines.push('  description = excluded.description,');
lines.push('  updated_at = now();');
lines.push('');
lines.push('insert into public.products (id, name, price, original_price, description, collection, image, images, video_url, status, is_active, created_at, updated_at) values');
for (const [index, item] of uniqueProducts.entries()) {
  const suffix = index === uniqueProducts.length - 1 ? '' : ',';
  const price = Number(item.price ?? 0);
  const originalPrice = item.originalPrice == null ? null : Number(item.originalPrice);
  const images = Array.isArray(item.images) ? item.images : (item.image ? [item.image] : []);
  lines.push(`  (${escapeSql(item.id)}, ${escapeSql(item.name)}, ${price}, ${originalPrice == null ? 'NULL' : originalPrice}, ${escapeSql(item.description)}, ${escapeSql(item.collection)}, ${escapeSql(item.image)}, ${escapeArray(images)}, ${escapeSql(item.video_url || item.videoUrl || null)}, ${escapeSql(item.status || 'published')}, ${item.isActive === false ? 'false' : 'true'}, now(), now())${suffix}`);
}
lines.push('on conflict (id) do update set');
lines.push('  name = excluded.name,');
lines.push('  price = excluded.price,');
lines.push('  original_price = excluded.original_price,');
lines.push('  description = excluded.description,');
lines.push('  collection = excluded.collection,');
lines.push('  image = excluded.image,');
lines.push('  images = excluded.images,');
lines.push('  video_url = excluded.video_url,');
lines.push('  status = excluded.status,');
lines.push('  is_active = excluded.is_active,');
lines.push('  updated_at = now();');

writeFileSync(outputPath, lines.join('\n'), 'utf8');
console.log(`Wrote ${outputPath}`);
