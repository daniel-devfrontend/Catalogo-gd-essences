import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))

import sync_perfume_images as sync


def test_update_perfume_data_file_replaces_placeholder():
    original = """export const perfumes = [
  { id: 'foo', name: 'Foo', price: 20, description: 'A', image: '/perfumes/placeholder.svg', collection: 'bar' },
];
"""

    updated = sync.update_perfume_data_file(original, {"foo": "/perfumes/bar/foo.jpg"})

    assert "/perfumes/bar/foo.jpg" in updated
    assert "/perfumes/placeholder.svg" not in updated
