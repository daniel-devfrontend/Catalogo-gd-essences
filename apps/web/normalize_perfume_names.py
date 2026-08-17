from pathlib import Path
import re

path = Path(r'c:\Users\Daniel Marin\Desktop\GD Essences\Catalogo-gd-essences\apps\web\src\data\perfumes.js')
text = path.read_text(encoding='utf-8')

collection_labels = {
    'lattafa': ['Lattafa'],
    'armaf': ['Armaf'],
    'carolina-herrera': ['Carolina Herrera', 'Herrera'],
    'orientica': ['Orientica'],
    'lacoste': ['Lacoste'],
    'al-haramain': ['Al Haramain', 'Haramain'],
    'gaultier': ['Jean Paul Gaultier', 'Gaultier'],
    'afnan': ['Afnan'],
    'paco-rabanne': ['Paco Rabanne'],
    'moschino': ['Moschino'],
    'dior': ['Dior'],
    'victorinox': ['Victorinox'],
    'bharara': ['Bharara'],
    'versace': ['Versace'],
    'creed': ['Creed'],
    'valentino': ['Valentino'],
    'vulcan': ['Vulcan', 'French Avenue'],
    'ariana-grande': ['Ariana Grande'],
    'chanel': ['Chanel'],
    'calvin-klein': ['Calvin Klein'],
    'dolce-gabbana': ['Dolce & Gabbana'],
    'giorgio-armani': ['Giorgio Armani'],
    'givenchy': ['Givenchy'],
    'hugo-boss': ['Hugo Boss'],
    'issey-miyake': ['Issey Miyake'],
    'lancome': ['Lancôme', 'Lancome'],
    'le-labo': ['Le Labo'],
    'marc-jacobs': ['Marc Jacobs'],
    'nautica': ['Nautica'],
    'parfums-de-marly': ['Parfums de Marly'],
    'paris-hilton': ['Paris Hilton'],
    'perry-ellis': ['Perry Ellis'],
    'rasasi': ['Rasasi'],
    'rave': ['Rave'],
    'swiss-arabian': ['Swiss Arabian'],
    'victoria-secret': ["Victoria's Secret"],
    'xerjoff': ['Xerjoff'],
    'britney-spears': ['Britney Spears'],
    'tommy': ['Tommy'],
    'britney-spears': ['Britney Spears'],
}

pattern = re.compile(
    r"(name:\s*)(['\"])(.*?)\2(?=[\s\S]*?collection:\s*(['\"])([^'\"]*)\4)",
    re.S,
)


def normalize_name(name: str, collection: str) -> str:
    new_name = name
    for label in collection_labels.get(collection, []):
        if label:
            new_name = re.sub(rf"(?<!\\w){re.escape(label)}(?!\\w)", '', new_name)
    new_name = re.sub(r'\s+', ' ', new_name).strip(' -')
    return new_name


def replace_name(match: re.Match) -> str:
    quote = match.group(2)
    current_name = match.group(3)
    collection = match.group(5)
    new_name = normalize_name(current_name, collection)
    return f"{match.group(1)}{quote}{new_name}{quote}"

updated_text, count = pattern.subn(replace_name, text)
path.write_text(updated_text, encoding='utf-8')
print(f'Changed {count} perfume names')
