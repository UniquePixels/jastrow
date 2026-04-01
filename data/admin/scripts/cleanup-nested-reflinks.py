#!/usr/bin/env python3
"""
Cleanup nested refLinks in processed JSONL data files.

Problem: 1,211 entries have a word-link <a> wrapping an unrewritten Sefaria
refLink <a>, creating invalid nested anchors:
  <a href="#rid:X" class="word-link"><a class="refLink" href="/Jastrow,_...">text</a>.</a>

Fix: Strip the inner <a class="refLink"...>...</a>, keeping text content,
so only the outer word-link remains:
  <a href="#rid:X" class="word-link">text.</a>

Also fixes 1 standalone truncated refLink in C01331's quotes field.

Usage: python3 cleanup-nested-reflinks.py [--dry-run]
"""

import json
import re
import sys
from pathlib import Path

DRY_RUN = "--dry-run" in sys.argv

# Pattern: inner refLink nested inside a word-link
# Matches: <a ...class="refLink"... href="/Jastrow,_...">TEXT</a>
NESTED_REFLINK = re.compile(
    r'<a\b[^>]*class="refLink"[^>]*href="/Jastrow,_[^"]*"[^>]*>'
    r'(.*?)'
    r'</a>'
)


def strip_nested_reflinks(text: str) -> str:
    """Remove inner refLink anchors, keeping their text content."""
    return NESTED_REFLINK.sub(r'\1', text)


def fix_c01331_quote(text: str) -> str:
    """Fix the truncated refLink in C01331's quotes field."""
    if 'href="/Jastrow,_סְאָה' in text:
        return text.replace(
            '<a dir="rtl" class="refLink" href="/Jastrow,_סְאָה',
            '<a href="#rid:O00007" class="word-link">סְאָה</a'
        )
    return text


def process_value(val, entry_id: str = ""):
    """Recursively process all string values in an entry."""
    if isinstance(val, str):
        result = strip_nested_reflinks(val)
        if entry_id == "C01331":
            result = fix_c01331_quote(result)
        return result
    elif isinstance(val, dict):
        return {k: process_value(v, entry_id) for k, v in val.items()}
    elif isinstance(val, list):
        return [process_value(v, entry_id) for v in val]
    return val


def process_file(filepath: Path) -> tuple[int, int]:
    """Process a JSONL file. Returns (entries_changed, links_fixed)."""
    lines = filepath.read_text(encoding="utf-8").splitlines()
    output = []
    entries_changed = 0
    links_fixed = 0

    for line in lines:
        if not line.strip():
            output.append(line)
            continue

        entry = json.loads(line)
        entry_id = entry.get("id", "")
        before_count = line.count("Jastrow,_")

        if before_count == 0:
            output.append(line)
            continue

        processed = process_value(entry, entry_id)
        new_line = json.dumps(processed, ensure_ascii=False, separators=(",", ":"))
        after_count = new_line.count("Jastrow,_")

        fixed = before_count - after_count
        if fixed > 0:
            entries_changed += 1
            links_fixed += fixed
            if DRY_RUN and entries_changed <= 5:
                print(f"  {entry_id} ({entry.get('hw', '?')}): {fixed} link(s)")

        output.append(new_line)

    if not DRY_RUN:
        filepath.write_text("\n".join(output) + "\n", encoding="utf-8")

    return entries_changed, links_fixed


def main():
    data_dir = Path(__file__).resolve().parent.parent.parent
    files = [
        data_dir / "jastrow-part1.jsonl",
        data_dir / "jastrow-part2.jsonl",
    ]

    total_entries = 0
    total_links = 0

    for filepath in files:
        print(f"{'[DRY RUN] ' if DRY_RUN else ''}Processing {filepath.name}...")
        entries, links = process_file(filepath)
        total_entries += entries
        total_links += links
        print(f"  {entries} entries changed, {links} links fixed")

    print(f"\nTotal: {total_entries} entries, {total_links} links fixed")

    # Verify no Jastrow,_ links remain
    remaining = 0
    for filepath in files:
        with open(filepath) as f:
            for line in f:
                remaining += line.count("Jastrow,_")

    if remaining > 0:
        print(f"\nWARNING: {remaining} Jastrow,_ references still remain!")
    else:
        print("\nAll Jastrow,_ references cleaned up.")


if __name__ == "__main__":
    main()
