#!/usr/bin/env python3
"""
Fix UTF-8 encoding issues in index.html.
Reads the file using latin-1 (which never fails), then re-encodes to UTF-8,
replacing any characters that cannot be encoded cleanly.
"""

import os

input_path = r"C:\Users\hp\hackathon\templates\index.html"
backup_path = r"C:\Users\hp\hackathon\templates\index.html.bak"

# 1. Read the file in binary mode first to detect the problematic bytes
with open(input_path, 'rb') as f:
    raw_bytes = f.read()

print(f"File size (bytes): {len(raw_bytes)}")
print(f"Byte at position 98760: 0x{raw_bytes[98760]:02x} = {raw_bytes[98760]}")
print(f"Context (98750-98780): {raw_bytes[98750:98780]}")

# 2. Backup original
with open(backup_path, 'wb') as f:
    f.write(raw_bytes)
print(f"\nBackup saved to: {backup_path}")

# 3. Decode with latin-1 (never fails, maps bytes 1-to-1)
content_latin1 = raw_bytes.decode('latin-1')

# 4. Re-encode to UTF-8 with 'replace' to catch any remaining issues
content_utf8_bytes = content_latin1.encode('utf-8', errors='replace')

# 5. Decode clean UTF-8
content_clean = content_utf8_bytes.decode('utf-8', errors='replace')

# 6. Also try to fix mojibake: some chars might be latin-1 interpreted as windows-1252
# Let's do a smarter approach: try utf-8 first, fall back to cp1252 for non-decodable sections
with open(input_path, 'rb') as f:
    raw = f.read()

# Try decoding with errors='replace' to get clean UTF-8
try:
    content = raw.decode('utf-8', errors='replace')
    print("\nDecoded with UTF-8 (errors replaced)")
except Exception as e:
    content = raw.decode('latin-1')
    print(f"\nDecoded with latin-1 fallback: {e}")

# Count replacement chars
replacement_count = content.count('\ufffd')
print(f"Replacement characters (corrupted bytes): {replacement_count}")

# Write clean UTF-8
with open(input_path, 'w', encoding='utf-8', errors='replace') as f:
    f.write(content)

print(f"\nFixed file saved to: {input_path}")
print(f"File size (chars): {len(content)}")

# Verify
with open(input_path, 'r', encoding='utf-8') as f:
    verify = f.read()
print(f"Verification - file reads successfully: {len(verify)} characters")
print("Done!")
