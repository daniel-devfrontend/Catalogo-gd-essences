from pathlib import Path
import re
from PIL import Image
import os

root = Path(r'c:\Users\Daniel Marin\Desktop\GD Essences\Catalogo-gd-essences\apps\web')
data_file = root / 'src' / 'data' / 'perfumes.js'

# Create placeholder image if needed
placeholder_path = root / 'public' / 'perfumes' / 'placeholder.svg'
placeholder_path.write_text('''<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="1500" viewBox="0 0 1200 1500">
  <rect width="1200" height="1500" fill="#f4efe8"/>
  <rect x="80" y="80" width="1040" height="1340" rx="45" fill="#ffffff" stroke="#d8c8aa" stroke-width="8"/>
  <circle cx="600" cy="610" r="260" fill="#f2e7d5"/>
  <path d="M600 370c-90 100-155 185-155 280 0 95 70 175 155 175s155-80 155-175c0-95-65-180-155-280Z" fill="#2f241d"/>
  <path d="M470 760h260" stroke="#8b6b3f" stroke-width="14" stroke-linecap="round"/>
  <path d="M470 830h260" stroke="#8b6b3f" stroke-width="14" stroke-linecap="round"/>
  <path d="M470 900h200" stroke="#8b6b3f" stroke-width="14" stroke-linecap="round"/>
  <text x="600" y="1230" text-anchor="middle" font-family="Georgia, serif" font-size="56" fill="#2f241d">G&amp;D Essences</text>
</svg>''', encoding='utf-8')

# Create transparent logo PNG from the uploaded JPEG
logo_in = root / 'public' / 'Logos' / 'LogoWhite2.jpeg'
logo_out = root / 'public' / 'Logos' / 'LogoWhite2-transparent.png'
if logo_in.exists() and (not logo_out.exists() or os.path.getmtime(logo_in) > os.path.getmtime(logo_out)):
    img = Image.open(logo_in).convert('RGBA')
    data = img.getdata()
    new_data = []
    for item in data:
        r, g, b, a = item
        if r > 240 and g > 240 and b > 240:
            new_data.append((255, 255, 255, 0))
        else:
            new_data.append((r, g, b, a))
    img.putdata(new_data)
    img.save(logo_out)

text = data_file.read_text(encoding='utf-8')

# Add missing collections
collections_match = re.search(r"export const collections = \[(.*?)\];", text, re.S)
if collections_match:
    collections_block = collections_match.group(1)
    existing_ids = set(re.findall(r"\bid:\s*'([^']+)'", collections_block))
    new_collection_entries = []
    collection_specs = [
        ("ariana-grande", "Colección Ariana Grande", "Fragancias suaves, juveniles y muy reconocibles con un perfil dulce y femenino."),
        ("chanel", "Colección Chanel", "Elegancia clásica y sofisticación refinada para quienes valoran el lujo contemporáneo."),
        ("calvin-klein", "Colección Calvin Klein", "Perfumes limpios, modernos y minimalistas con una identidad fresca y urbana."),
        ("dolce-gabbana", "Colección Dolce & Gabbana", "Fragancias mediterráneas, sensuales y con carácter italiano."),
        ("dumont", "Colección Dumont", "Aromas intensos y con personalidad, pensados para destacar con fuerza."),
        ("escada", "Colección Escada", "Fragancias luminosas y divertidas con un aire femenino y alegre."),
        ("giorgio-armani", "Colección Giorgio Armani", "Perfumes elegantes, sofisticados y con una sensación de lujo discreto."),
        ("givenchy", "Colección Givenchy", "Aromas chic, sofisticados y con una propuesta premium muy reconocible."),
        ("hugo-boss", "Colección Hugo Boss", "Fragancias formales, modernas y con una presencia elegante para día y noche."),
        ("issey-miyake", "Colección Issey Miyake", "Aromas frescos y acuáticos con una propuesta limpia y contemporánea."),
        ("lancome", "Colección Lancôme", "Fragancias femeninas y refinadas con un toque de lujo internacional."),
        ("le-labo", "Colección Le Labo", "Perfumes artesanales, profundos y con una identidad muy marcada."),
        ("marc-jacobs", "Colección Marc Jacobs", "Aromas creativos, juveniles y muy visuales con un estilo fashion."),
        ("nautica", "Colección Nautica", "Fragancias deportivas, frescas y fáciles de usar para un estilo activo."),
        ("parfums-de-marly", "Colección Parfums de Marly", "Lujo francés con un perfil refinado, elegante y muy premium."),
        ("paris-hilton", "Colección Paris Hilton", "Fragancias divertidas, glamour y con un carácter femenino muy marcado."),
        ("perry-ellis", "Colección Perry Ellis", "Aromas clásicos, modernos y muy cómodos para el día a día."),
        ("rasasi", "Colección Rasasi", "Perfumes orientales, intensos y con mucha presencia y profundidad."),
        ("rave", "Colección Rave", "Fragancias atrevidas y con personalidad para quienes buscan destacar."),
        ("swiss-arabian", "Colección Swiss Arabian", "Aromas orientales y premium con un enfoque artesanal y muy envolvente."),
        ("victoria-secret", "Colección Victoria's Secret", "Fragancias femeninas, ligeras y con un aire seductor muy reconocible."),
        ("xerjoff", "Colección Xerjoff", "Perfumes de nicho con una propuesta de lujo y sofisticación muy alta."),
    ]
    for cid, title, desc in collection_specs:
        if cid not in existing_ids:
            new_collection_entries.append(f"  {{ id: '{cid}', title: '{title}', description: '{desc}' }},")
    if new_collection_entries:
        text = text.replace(collections_block.rstrip(), collections_block.rstrip() + '\n' + '\n'.join(new_collection_entries), 1)

# Add new perfumes and increase existing prices by 10
perfumes_match = re.search(r"export const perfumes = \[(.*?)\];", text, re.S)
if perfumes_match:
    perfumes_block = perfumes_match.group(1)
    perfumes_block = re.sub(r'price:\s*(\d+)', lambda m: f"price: {int(m.group(1)) + 10}", perfumes_block)
    existing_names = set(re.findall(r"name:\s*['\"]([^'\"]+)['\"]", perfumes_block))

    pdf_entries = [
        ("Afnan", "9 AM Dive", 20), ("Afnan", "9 AM Pour Femme", 20), ("Afnan", "9 PM Elixir", 20), ("Afnan", "9 PM Men", 20), ("Afnan", "9 PM Night Out", 23), ("Afnan", "9 PM Pour Femme", 20), ("Afnan", "9 PM Rebel", 21),
        ("Al Haramain", "Amber Oud Aqua Dubai Edition", 23), ("Al Haramain", "Amber Oud Dubai Night", 21), ("Al Haramain", "Amber Oud Gold Edition", 21), ("Al Haramain", "Amber Oud Ultra Violet", 21),
        ("Ariana Grande", "Ari", 16), ("Ariana Grande", "Cloud", 9), ("Ariana Grande", "Cloud Intense", 9), ("Ariana Grande", "Mod", 16), ("Ariana Grande", "Mod Blush", 16), ("Ariana Grande", "REM", 16), ("Ariana Grande", "Sweet Like Candy", 16), ("Ariana Grande", "Thank U Next", 16),
        ("Armaf", "Club de Nuit Intense Man", 18), ("Armaf", "Club de Nuit Lionheart Men", 23), ("Armaf", "Club de Nuit Lionheart Woman", 23), ("Armaf", "Club de Nuit Oud", 16), ("Armaf", "Club de Nuit Sillage", 18), ("Armaf", "Club de Nuit Untold", 16), ("Armaf", "Club de Nuit Urban Man Elixir", 16), ("Armaf", "Club de Nuit Woman", 16), ("Armaf", "Island Bliss", 23), ("Armaf", "Island Breeze", 23), ("Armaf", "Odyssey AOUD", 16), ("Armaf", "Odyssey Aqua", 23), ("Armaf", "Odyssey Artisto", 18), ("Armaf", "Odyssey Bahamas", 23), ("Armaf", "Odyssey Candee", 18), ("Armaf", "Odyssey Dubai Chocolate", 23), ("Armaf", "Odyssey Homme", 16), ("Armaf", "Odyssey Limoni", 20), ("Armaf", "Odyssey Mandarin Sky", 19), ("Armaf", "Odyssey Mashmellow", 23), ("Armaf", "Odyssey Mega", 19), ("Armaf", "Odyssey Spectra", 18), ("Armaf", "Odyssey Tyrant", 16), ("Armaf", "Odyssey Wild One", 16), ("Armaf", "Yum Yum", 21),
        ("Bharara", "Bharara Gold", 21), ("Bharara", "Bharara King", 21), ("Bharara", "Bharara Niche Femme", 21), ("Bharara", "Bharara Onyx", 21), ("Bharara", "Bharara Queen", 21), ("Bharara", "Bharara Rose", 21), ("Bharara", "Bharara Scarlett", 21),
        ("Britney Spears", "Fantasy", 17),
        ("Calvin Klein", "Eternity", 16), ("Calvin Klein", "One", 18),
        ("Carolina Herrera", "212 Héroes Forever Young W", 17), ("Carolina Herrera", "212 Men Heroes Forever Young", 17), ("Carolina Herrera", "212 Men NYC", 17), ("Carolina Herrera", "212 VIP Black", 17), ("Carolina Herrera", "212 VIP Black I Love NY", 17), ("Carolina Herrera", "212 VIP Men", 17), ("Carolina Herrera", "212 VIP Rosé", 18), ("Carolina Herrera", "Bad Boy", 17), ("Carolina Herrera", "Good Girl", 16), ("Carolina Herrera", "Good Girl Blush", 21), ("Carolina Herrera", "Good Girl Gold Fantasy", 16), ("Carolina Herrera", "Good Girl Blush Elixir", 21), ("Carolina Herrera", "La Bomba", 21), ("Carolina Herrera", "Very Good Girl", 15),
        ("Chanel", "Allure Homme Sport", 17), ("Chanel", "Bleu de Chanel", 18), ("Chanel", "Chance Eau Tendre", 18), ("Chanel", "Chanel No. 5", 18), ("Chanel", "Coco Mademoiselle", 18),
        ("Creed", "Creed Aventus", 18),
        ("Dolce & Gabbana", "Light Blue Pour Femme", 18), ("Dolce & Gabbana", "Light Blue Pour Homme", 18),
        ("Dumont", "Nitro Red", 23),
        ("Escada", "Fairy Love", 9), ("Escada", "Sorbetto Rosso", 17),
        ("French Avenue", "Vulcan Baie", 21), ("French Avenue", "Vulcan Feu", 21), ("French Avenue", "Vulcan Sable", 21),
        ("Giorgio Armani", "Acqua Di Gio", 16), ("Giorgio Armani", "Acqua Di Gio Profumo", 16), ("Giorgio Armani", "Stronger With You Intensely", 23),
        ("Givenchy", "Pour Homme", 17),
        ("Hugo Boss", "Boss Bottled", 18), ("Hugo Boss", "Boss Bottled Infinite", 18), ("Hugo Boss", "Boss Bottled Night", 18), ("Hugo Boss", "The Scent Woman", 9),
        ("Issey Miyake", "L'eau D'issey pour Homme", 17),
        ("Jean Paul Gaultier", "Gaultier Divine", 21), ("Jean Paul Gaultier", "La Belle Paradise Garden", 21), ("Jean Paul Gaultier", "Le Male", 21), ("Jean Paul Gaultier", "Le Male Elixir", 21), ("Jean Paul Gaultier", "Ultra Male", 21),
        ("Lacoste", "Essential", 15),
        ("Lancôme", "Idôle", 9), ("Lancôme", "La Vie Est Belle", 17),
        ("Lattafa", "Art of Universe", 21), ("Lattafa", "Asad Bourbon", 18), ("Lattafa", "Asad Elixir", 21), ("Lattafa", "Asad", 17), ("Lattafa", "Asad Zanzibar", 17), ("Lattafa", "Bade'e Al Oud Amethyst", 23), ("Lattafa", "Bade'e Al Oud Honor & Glory", 23), ("Lattafa", "Bade'e Al Oud Noble Blush", 21), ("Lattafa", "Bade'e Al Oud Oud For Glory", 21), ("Lattafa", "Bade'e Al Oud Sublime", 23), ("Lattafa", "Eclaire", 23), ("Lattafa", "Fakhar", 21), ("Lattafa", "Haya", 21), ("Lattafa", "Her Confession", 21), ("Lattafa", "Khamrah", 21), ("Lattafa", "Khamrah Dukhan", 23), ("Lattafa", "Khamrah Qahwa", 23), ("Lattafa", "Mayar", 21), ("Lattafa", "Mayar Cherry", 21), ("Lattafa", "Mayar Natural Intense", 21), ("Lattafa", "Victoria", 21), ("Lattafa", "Yara", 18), ("Lattafa", "Yara Candy", 18), ("Lattafa", "Yara Moi", 18), ("Lattafa", "Yara Tous", 17),
        ("Le Labo", "Santal 33", 21),
        ("Marc Jacobs", "Decadence", 9),
        ("Moschino", "Moschino Toy 2", 13), ("Moschino", "Moschino Toy 2 Gum", 17),
        ("Nautica", "Voyage", 16),
        ("Orientica", "Orientica Amber Rouge", 21), ("Orientica", "Orientica Exclusive Dania", 21), ("Orientica", "Orientica Noble", 21), ("Orientica", "Orientica Royal Amber", 21), ("Orientica", "Orientica Royal Bleu", 21), ("Orientica", "Velvet Gold", 21),
        ("Paco Rabanne", "1 Million", 18), ("Paco Rabanne", "1 Million Elixir", 15), ("Paco Rabanne", "1 Million Lucky", 15), ("Paco Rabanne", "Fame", 17), ("Paco Rabanne", "Fame Intense", 17), ("Paco Rabanne", "Fame Parfum", 17), ("Paco Rabanne", "Invictus Aqua", 17), ("Paco Rabanne", "Olympéa", 18), ("Paco Rabanne", "Phantom", 17),
        ("Parfums de Marly", "Layton", 21),
        ("Paris Hilton", "Paris Hilton For Men", 18), ("Paris Hilton", "Paris Hilton For Women", 17),
        ("Perry Ellis", "360 For Men", 17), ("Perry Ellis", "360 Red", 18),
        ("Rasasi", "Hawas for Her", 21), ("Rasasi", "Hawas for Him", 21),
        ("Rave", "Now Pink", 21),
        ("Swiss Arabian", "Stallion 53", 21),
        ("Tommy Hilfiger", "Tommy", 15), ("Tommy Hilfiger", "Tommy Girl", 15),
        ("Valentino", "Valentino Donna Born In Roma", 20), ("Valentino", "Valentino Donna Born In Roma Ivory", 21), ("Valentino", "Valentino Uomo", 20), ("Valentino", "Valentino Uomo Born In Roma", 21),
        ("Versace", "Eros", 15), ("Versace", "Eros Energy", 15), ("Versace", "Eros Flame", 15),
        ("Victoria Secret", "Bombshell Intense", 9),
        ("Victorinox", "Swiss Army Classic", 18),
        ("Xerjoff", "Erba Pura", 23), ("Xerjoff", "Naxos", 21),
    ]

    collection_map = {
        'Afnan': 'afnan', 'Al Haramain': 'haramain', 'Ariana Grande': 'ariana-grande', 'Armaf': 'armaf', 'Bharara': 'bharara', 'Britney Spears': 'britney-spears',
        'Calvin Klein': 'calvin-klein', 'Carolina Herrera': 'herrera', 'Chanel': 'chanel', 'Creed': 'creed', 'Dolce & Gabbana': 'dolce-gabbana', 'Dumont': 'dumont', 'Escada': 'escada', 'French Avenue': 'vulcan',
        'Giorgio Armani': 'giorgio-armani', 'Givenchy': 'givenchy', 'Hugo Boss': 'hugo-boss', 'Issey Miyake': 'issey-miyake', 'Jean Paul Gaultier': 'gaultier', 'Lacoste': 'lacoste', 'Lancôme': 'lancome', 'Lattafa': 'lattafa', 'Le Labo': 'le-labo', 'Marc Jacobs': 'marc-jacobs', 'Moschino': 'moschino', 'Nautica': 'nautica', 'Orientica': 'orientica', 'Paco Rabanne': 'paco-rabanne', 'Parfums de Marly': 'parfums-de-marly', 'Paris Hilton': 'paris-hilton', 'Perry Ellis': 'perry-ellis', 'Rasasi': 'rasasi', 'Rave': 'rave', 'Swiss Arabian': 'swiss-arabian', 'Tommy Hilfiger': 'tommy', 'Valentino': 'valentino', 'Versace': 'versace', 'Victoria Secret': 'victoria-secret', 'Victorinox': 'victorinox', 'Xerjoff': 'xerjoff',
    }

    def slugify(value: str) -> str:
        return re.sub(r'[^a-z0-9]+', '-', value.lower()).strip('-')

    new_entries = []
    for brand, name, base_price in pdf_entries:
        if name in existing_names:
            continue
        collection = collection_map.get(brand, slugify(brand))
        description = f'Fragancia premium de {brand} añadida desde el catálogo mayor y disponible en G&D Essences.'
        new_entries.append((brand, name, collection, base_price + 10, description))

    if new_entries:
        entries_block = '\n'.join([
            f"  {{ id: '{slugify(brand + ' ' + name)}', name: '{name.replace("'", "\\'")}', price: {price}, description: '{desc.replace("'", "\\'")}', image: '/perfumes/placeholder.svg', collection: '{collection}' }},"
            for brand, name, collection, price, desc in new_entries
        ])
        text = text.replace(perfumes_block.rstrip(), perfumes_block.rstrip() + '\n' + entries_block, 1)

# Write updated data file
text = text.replace("/perfumes/placeholder.svg", "/perfumes/placeholder.svg")
data_file.write_text(text, encoding='utf-8')

# Update branding references in key components
for rel_path in [root / 'src' / 'components' / 'Header.jsx', root / 'src' / 'components' / 'Footer.jsx', root / 'src' / 'pages' / 'HomePage.jsx']:
    content = rel_path.read_text(encoding='utf-8')
    content = content.replace('https://horizons-cdn.hostinger.com/c05faf8a-437d-406d-99ba-9cff3f611d9b/f817902bcc22ce898fb35b749bf91d9f.png', '/Logos/LogoWhite2-transparent.png')
    rel_path.write_text(content, encoding='utf-8')

# Replace header brand block with image logo
header_path = root / 'src' / 'components' / 'Header.jsx'
header_content = header_path.read_text(encoding='utf-8')
old_header = '''          <Link to="/" className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-3">
              <div className="w-10 h-10 rounded-md bg-gradient-to-br from-yellow-600 to-yellow-400 text-black flex items-center justify-center font-semibold">GD</div>
              <div className="leading-tight">
                <span className="block font-display text-lg">G&amp;D Essences</span>
                <small className="text-xs text-muted-foreground">Alta Perfumería</small>
              </div>
            </div>
            {/* Logo image intentionally removed to prevent brand image from appearing */}
          </Link>'''
new_header = '''          <Link to="/" className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-3">
              <img
                src="/Logos/LogoWhite2-transparent.png"
                alt="G&D Essences"
                className="h-10 w-auto object-contain"
              />
            </div>
            <img
              src="/Logos/LogoWhite2-transparent.png"
              alt="G&D Essences"
              className="h-10 w-auto object-contain sm:hidden"
            />
          </Link>'''
if old_header in header_content:
    header_content = header_content.replace(old_header, new_header)
header_path.write_text(header_content, encoding='utf-8')

# Update footer/homepage logo markup if present
footer_path = root / 'src' / 'components' / 'Footer.jsx'
footer_content = footer_path.read_text(encoding='utf-8')
if 'https://horizons-cdn.hostinger.com' in footer_content:
    footer_content = footer_content.replace('https://horizons-cdn.hostinger.com/c05faf8a-437d-406d-99ba-9cff3f611d9b/f817902bcc22ce898fb35b749bf91d9f.png', '/Logos/LogoWhite2-transparent.png')
    footer_content = footer_content.replace('className="h-10 w-auto object-contain mb-6 invert brightness-0"', 'className="h-10 w-auto object-contain mb-6"')
footer_path.write_text(footer_content, encoding='utf-8')

home_path = root / 'src' / 'pages' / 'HomePage.jsx'
home_content = home_path.read_text(encoding='utf-8')
if 'https://horizons-cdn.hostinger.com' in home_content:
    home_content = home_content.replace('https://horizons-cdn.hostinger.com/c05faf8a-437d-406d-99ba-9cff3f611d9b/f817902bcc22ce898fb35b749bf91d9f.png', '/Logos/LogoWhite2-transparent.png')
home_path.write_text(home_content, encoding='utf-8')

print('Catalog import completed')
