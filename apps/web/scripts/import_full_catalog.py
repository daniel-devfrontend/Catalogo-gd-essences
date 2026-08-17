from pathlib import Path
import re
import fitz

root = Path(r'c:\Users\Daniel Marin\Desktop\GD Essences\Catalogo-gd-essences\apps\web')
data_file = root / 'src' / 'data' / 'perfumes.js'
pdf_path = Path(r'C:\Users\Daniel Marin\Desktop\GD Essences\CatalogoMayor.pdf')


def js_escape(value: str) -> str:
    return value.replace("\\", "\\\\").replace("'", "\\'")


def slugify(value: str) -> str:
    return re.sub(r'[^a-z0-9]+', '-', value.lower()).strip('-')


def normalize(value: str) -> str:
    return re.sub(r'[^a-z0-9]+', '', value.lower())


def parse_pdf_rows(pdf_path: Path):
    rows = []
    doc = fitz.open(pdf_path)
    known_brands = {
        'Afnan', 'Al Haramain', 'Ariana Grande', 'Armaf', 'Bharara', 'Britney Spears',
        'Calvin Klein', 'Carolina Herrera', 'Chanel', 'Creed', 'Dolce & Gabbana', 'Dumont',
        'Escada', 'French Avenue', 'Giorgio Armani', 'Givenchy', 'Hugo Boss', 'Issey Miyake',
        'Jean Paul Gaultier', 'Lacoste', 'Lancôme', 'Lattafa', 'Le Labo', 'Marc Jacobs',
        'Moschino', 'Nautica', 'Orientica', 'Paco Rabanne', 'Parfums de Marly', 'Paris Hilton',
        'Perry Ellis', 'Rasasi', 'Rave', 'Swiss Arabian', 'Tommy Hilfiger', 'Valentino',
        'Versace', 'Victoria Secret', 'Victorinox', 'Xerjoff'
    }

    for page in doc:
        lines = [line.strip() for line in page.get_text().splitlines() if line.strip()]
        for idx in range(0, len(lines) - 3):
            if not re.fullmatch(r'\d+', lines[idx]):
                continue
            brand = lines[idx + 1]
            perfume_name = lines[idx + 2]
            price_line = lines[idx + 3]
            if not brand or not perfume_name or not re.fullmatch(r'\d+', price_line):
                continue
            if brand not in known_brands:
                continue
            rows.append((brand, perfume_name.strip(), int(price_line)))

    # Deduplicate by brand + normalized name
    seen = set()
    unique_rows = []
    for brand, name, price in rows:
        key = (brand.lower(), normalize(name))
        if key in seen:
            continue
        seen.add(key)
        unique_rows.append((brand, name, price))
    return unique_rows


def is_already_present(existing_names, brand, perfume_name):
    current_name = normalize(perfume_name)
    for existing_name in existing_names:
        existing_without_brand = existing_name.replace(brand, '').strip()
        existing_norm = normalize(existing_without_brand)
        if current_name == existing_norm or current_name in existing_norm or existing_norm in current_name:
            return True
    return False


text = data_file.read_text(encoding='utf-8')
parsed_rows = parse_pdf_rows(pdf_path)

perfumes_match = re.search(r"export const perfumes = \[(.*?)\];", text, re.S)
if not perfumes_match:
    raise SystemExit('perfumes block not found')

perfumes_block = perfumes_match.group(1)
existing_names = re.findall(r"name:\s*['\"]([^'\"]+)['\"]", perfumes_block)

collection_map = {
    'Afnan': 'afnan',
    'Al Haramain': 'haramain',
    'Ariana Grande': 'ariana-grande',
    'Armaf': 'armaf',
    'Bharara': 'bharara',
    'Britney Spears': 'britney-spears',
    'Calvin Klein': 'calvin-klein',
    'Carolina Herrera': 'herrera',
    'Chanel': 'chanel',
    'Creed': 'creed',
    'Dolce & Gabbana': 'dolce-gabbana',
    'Dumont': 'dumont',
    'Escada': 'escada',
    'French Avenue': 'vulcan',
    'Giorgio Armani': 'giorgio-armani',
    'Givenchy': 'givenchy',
    'Hugo Boss': 'hugo-boss',
    'Issey Miyake': 'issey-miyake',
    'Jean Paul Gaultier': 'gaultier',
    'Lacoste': 'lacoste',
    'Lancôme': 'lancome',
    'Lattafa': 'lattafa',
    'Le Labo': 'le-labo',
    'Marc Jacobs': 'marc-jacobs',
    'Moschino': 'moschino',
    'Nautica': 'nautica',
    'Orientica': 'orientica',
    'Paco Rabanne': 'paco-rabanne',
    'Parfums de Marly': 'parfums-de-marly',
    'Paris Hilton': 'paris-hilton',
    'Perry Ellis': 'perry-ellis',
    'Rasasi': 'rasasi',
    'Rave': 'rave',
    'Swiss Arabian': 'swiss-arabian',
    'Tommy Hilfiger': 'tommy',
    'Valentino': 'valentino',
    'Versace': 'versace',
    'Victoria Secret': 'victoria-secret',
    'Victorinox': 'victorinox',
    'Xerjoff': 'xerjoff',
}

new_entries = []
for brand, perfume_name, pdf_price in parsed_rows:
    if is_already_present(existing_names, brand, perfume_name):
        continue

    collection = collection_map.get(brand, slugify(brand))
    description = f'Fragancia premium de {brand} añadida desde el catálogo mayor y disponible en G&D Essences.'
    new_entries.append((brand, perfume_name.strip(), collection, pdf_price + 10, description))

if new_entries:
    entries_block = '\n'.join([
        f"  {{ id: '{slugify(brand + ' ' + perfume_name)}', name: '{js_escape(perfume_name)}', price: {price}, description: '{js_escape(desc)}', image: '/perfumes/placeholder.svg', collection: '{collection}' }},"
        for brand, perfume_name, collection, price, desc in new_entries
    ])
    text = text.replace(perfumes_block.rstrip(), perfumes_block.rstrip() + '\n' + entries_block, 1)

# Write data file
data_file.write_text(text, encoding='utf-8')
print(f'Imported {len(new_entries)} perfumes from PDF')
