#!/usr/bin/env python3
"""Remove 'Nested <a> tags' annotations from annotations.json."""

import json
from pathlib import Path

ANNOT_FILE = Path(__file__).resolve().parent.parent / "annotations.json"
TARGET_NOTE = "Nested <a> tags detected in definition"

data = json.loads(ANNOT_FILE.read_text(encoding="utf-8"))

removed = 0
new_data = {}
for rid, annots in data.items():
    kept = [a for a in annots if a.get("note") != TARGET_NOTE]
    removed += len(annots) - len(kept)
    if kept:
        new_data[rid] = kept

print(f"Removed {removed} nested-tag annotations")
print(f"Entries before: {len(data)}, after: {len(new_data)}")

ANNOT_FILE.write_text(
    json.dumps(new_data, ensure_ascii=False, indent=2) + "\n",
    encoding="utf-8",
)
