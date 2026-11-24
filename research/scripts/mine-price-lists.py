"""
Pull code-and-price rows out of Paillard's dealer price lists.

Reads the OCR'd text in research/price-lists/, which is kept in the repo
because the PDFs it came from are 350 MB and are a download away at
Pacific Rim Camera (see research/findings/price-lists.md for the ids).

Output is a CANDIDATE table and nothing more. The scans interleave their
columns, so a code regularly lands beside the previous entry's
description. Nothing from here goes on the site until it has been read
back against the page: the first run of this gave the Yvar 13mm the
price of a 200mm mask, because the two shared one OCR'd line.
"""

import re, json, pathlib

DOCS = {
 "04929": ("Bolex Dealer Price List, H-8", "March 1965", 1965),
 "04928": ("Bolex Dealer Price List, H-8", "June 1965", 1965),
 "04933": ("Bolex Dealer Price List, H-16", "May 1967", 1967),
 "04932": ("Bolex 16mm Cameras and Projectors Price List", "February 1972", 1972),
 "02211": ("Bolex 16mm Cameras and Projectors Price List", "October 1976", 1976),
 "02210": ("Bolex 16mm Cameras and Projectors Price List", "January 1978", 1978),
 "02209": ("Bolex 16mm Cameras and Projectors Price List", "November 1979", 1979),
}
# CODE  (nnnnn-nn)  1,234.00   — the price belongs to the code immediately before it
PAT = re.compile(r"\b([A-Z]{5})\b\s*\(?[\dOol,.\s·-]{3,12}\)?\s*([\d,]+\.\d{2})")
out=[]
for doc,(title,date,year) in DOCS.items():
    path = pathlib.Path(f"research/price-lists/{doc}.txt")
    if not path.exists():
        print(f"  missing {path}")
        continue
    txt = path.read_text(errors="replace")
    for line in txt.splitlines():
        clean=" ".join(line.split())
        for m in PAT.finditer(clean):
            code, price = m.group(1), m.group(2)
            before = clean[:m.start()].strip()
            out.append({"code":code,"price":price,"year":year,"date":date,"title":title,
                        "doc":doc,"description":before[-70:]})
json.dump(out, open("research/price-list-codes.json","w"), indent=1)
print(len(out),"code+price pairs;", len({r['code'] for r in out}),"distinct codes")
