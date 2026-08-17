from pathlib import Path
import re

path = Path(r'c:\Users\Daniel Marin\Desktop\GD Essences\Catalogo-gd-essences\apps\web\src\data\perfumes.js')
text = path.read_text(encoding='utf-8')
mismatches = []
for line in text.splitlines():
    if 'id:' in line and 'collection:' in line:
        id_match = re.search(r"id:\s*(['\"])(.*?)\1", line)
        coll_match = re.search(r"collection:\s*(['\"])(.*?)\1", line)
        if id_match and coll_match:
            current_id = id_match.group(2)
            collection = coll_match.group(2)
            if not current_id.startswith(collection + '-'):
                mismatches.append((current_id, collection))
print(f'Mismatches: {len(mismatches)}')
for item in mismatches[:20]:
    print(item)
