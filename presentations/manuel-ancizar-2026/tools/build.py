#!/usr/bin/env python3
"""Builds index.html from src/_template.html + the act files in src/ (in ORDER) and
every js/diagrams/*.js (and css/diagrams/*.css, if any). Run: python3 tools/build.py"""
import pathlib, re, sys
ROOT = pathlib.Path(__file__).resolve().parent.parent
ORDER = ["00-apertura", "01-actuar", "02-cerebro", "03-optimizar", "04-comprimir",
         "05-agentes", "06-sombra", "07-cierre"]
tpl = (ROOT / "src/_template.html").read_text(encoding="utf-8")
parts = []
for name in ORDER:
    f = ROOT / "src" / f"{name}.html"
    if f.exists():
        parts.append(f"\n<!-- ==================== {name} ==================== -->\n" + f.read_text(encoding="utf-8"))
    else:
        print(f"warning: missing src/{name}.html", file=sys.stderr)
diag = sorted((ROOT / "js/diagrams").glob("*.js"))
css = sorted((ROOT / "css/diagrams").glob("*.css")) if (ROOT / "css/diagrams").exists() else []
html = (tpl.replace("<!-- SLIDES -->", "\n".join(parts))
           .replace("<!-- DIAGRAMS -->", "\n".join(f'<script src="js/diagrams/{p.name}"></script>' for p in diag))
           .replace("<!-- DIAGRAM-CSS -->", "\n".join(f'<link rel="stylesheet" href="css/diagrams/{p.name}">' for p in css)))
ids = re.findall(r'<section[^>]*\bid="([^"]+)"', html)
dup = {i for i in ids if ids.count(i) > 1}
if dup: print("duplicate slide ids:", sorted(dup), file=sys.stderr)
(ROOT / "index.html").write_text(html, encoding="utf-8")
print(f"index.html: {len(ids)} slides, {len(diag)} diagram files")
