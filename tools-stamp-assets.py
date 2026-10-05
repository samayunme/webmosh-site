"""Append a content hash to the asset URLs so a changed file is a changed URL.
Re-run after editing anything in assets/ and before deploying."""
import hashlib, pathlib, re

ROOT = pathlib.Path(__file__).resolve().parent
ASSETS = ["site.css", "site.js", "globe.js"]

digest = {}
for a in ASSETS:
    f = ROOT / "assets" / a
    if f.exists():
        digest[a] = hashlib.sha1(f.read_bytes()).hexdigest()[:8]

pages = ["index.html","about.html","contact.html","404.html","terms.html",
         "refund-policy.html","privacy-policy.html"] + \
        [str(p.relative_to(ROOT)) for p in sorted((ROOT/"services").glob("*.html"))]

changed = 0
for pg in pages:
    p = ROOT / pg
    s = p.read_text(); orig = s
    for a, h in digest.items():
        # match the asset with or without an existing ?v=
        s = re.sub(r'(["\'][^"\']*assets/' + re.escape(a) + r')(\?v=[0-9a-f]+)?(["\'])',
                   lambda m: f"{m.group(1)}?v={h}{m.group(3)}", s)
    if s != orig:
        p.write_text(s); changed += 1

for a, h in digest.items():
    print(f"  {a:12} v={h}")
print(f"stamped {changed} pages")
