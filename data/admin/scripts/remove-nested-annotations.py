#!/usr/bin/env python3
"""Remove 'Nested <a> tags' annotations from annotations.json."""

import json
import shutil
import sys
from pathlib import Path

ANNOT_FILE = Path(__file__).resolve().parent.parent / "annotations.json"
TARGET_NOTE = "Nested <a> tags detected in definition"

try:
    data = json.loads(ANNOT_FILE.read_text(encoding="utf-8"))
except (FileNotFoundError, OSError) as exc:
    print(f"Error reading {ANNOT_FILE}: {exc}")
    sys.exit(1)
except json.JSONDecodeError as exc:
    print(f"Error parsing {ANNOT_FILE}: {exc}")
    sys.exit(1)

removed = 0
new_data = {}
for rid, annots in data.items():
    kept = [a for a in annots if a.get("note") != TARGET_NOTE]
    removed += len(annots) - len(kept)
    if kept:
        new_data[rid] = kept

print(f"Removed {removed} nested-tag annotations")
print(f"Entries before: {len(data)}, after: {len(new_data)}")

# Preserve the original before overwriting.
backup = ANNOT_FILE.with_name(ANNOT_FILE.name + ".bak")
shutil.copy2(ANNOT_FILE, backup)
print(f"Backed up original to {backup}")

ANNOT_FILE.write_text(
    json.dumps(new_data, ensure_ascii=False, indent=2) + "\n",
    encoding="utf-8",
)
