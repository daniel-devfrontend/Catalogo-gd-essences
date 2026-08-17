from __future__ import annotations
from pathlib import Path
import re
import sys

ROOT = Path(__file__).resolve().parent.parent
DATA_FILE = ROOT / 'src' / 'data' / 'perfumes.js'
IMAGES_ROOT = ROOT / 'public' / 'perfumes'


def slugify(value: str) -> str:
    return re.sub(r'[^a-z0-9]+', '-', value.lower()).strip('-')


def update_perfume_data_file(content: str, image_map: dict[str, str]) -> str:
    for perfume_id, image_path in image_map.items():
        pattern = rf"\{{\s*id:\s*['\"]{re.escape(perfume_id)}['\"],"
        replacement = lambda m: m.group(0).replace(m.group(0), m.group(0))
        if not re.search(pattern, content):
            continue
        content = re.sub(
            pattern,
            lambda m: m.group(0),
            content,
            count=1,
        )
        content = re.sub(
            rf"(id:\s*['\"]{re.escape(perfume_id)}['\"].*?image:\s*)['\"][^'\"]*['\"]",
            rf"\1'{image_path}'",
            content,
            count=1,
        )
    return content


def discover_images() -> dict[str, str]:
    image_map: dict[str, str] = {}
    for image_path in IMAGES_ROOT.rglob('*'):
        if not image_path.is_file() or image_path.suffix.lower() not in {'.jpg', '.jpeg', '.png', '.webp', '.svg'}:
            continue
        rel_path = image_path.relative_to(ROOT).as_posix()
        stem = image_path.stem.lower()
        name_tokens = re.split(r'[^a-z0-9]+', stem)
        candidate_ids = []
        candidate_ids.append(slugify(stem))
        for token in name_tokens:
            candidate_ids.append(token)
        candidate_ids = [c for c in candidate_ids if c]
        if candidate_ids:
            image_map[candidate_ids[0]] = '/' + rel_path
    return image_map


def main() -> None:
    content = DATA_FILE.read_text(encoding='utf-8')
    image_map = discover_images()
    updated = update_perfume_data_file(content, image_map)
    DATA_FILE.write_text(updated, encoding='utf-8')
    print('Updated perfume image references automatically.')


if __name__ == '__main__':
    main()
