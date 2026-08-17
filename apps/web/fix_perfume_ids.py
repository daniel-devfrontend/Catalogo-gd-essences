from pathlib import Path
import re

path = Path(r'c:\Users\Daniel Marin\Desktop\GD Essences\Catalogo-gd-essences\apps\web\src\data\perfumes.js')
text = path.read_text(encoding='utf-8')
lines = text.splitlines()
changed = 0

for idx, line in enumerate(lines):
    if "id:" in line and "collection:" in line:
        id_match = re.search(r'id:\s*([\'\"])(.*?)\1', line)
        coll_match = re.search(r'collection:\s*([\'\"])(.*?)\1', line)
        if id_match and coll_match:
            current_id = id_match.group(2)
            collection = coll_match.group(2)
            base = current_id
            if base.startswith(collection + '-'):
                new_id = base
            else:
                if base.endswith('-' + collection):
                    base = base[:-len(collection) - 1]
                elif base.endswith(collection):
                    base = base[:-len(collection)]
                new_id = f"{collection}-{base}"
            if new_id != current_id:
                line = line.replace(id_match.group(0), f"id: {id_match.group(1)}{new_id}{id_match.group(1)}", 1)
                lines[idx] = line
                changed += 1

path.write_text("\n".join(lines) + "\n", encoding='utf-8')
print(f'Changed {changed} perfume ids')
