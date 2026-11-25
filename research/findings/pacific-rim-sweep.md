# Every Bolex PDF on Pacific Rim, catalogued

All 75 of them downloaded and read at least far enough to say what each
one is. Done on 25 November 2026, because the archive had opened perhaps
a dozen and was guessing about the rest.

The index is at `pacificrimcamera.com/rl/rlBolex.htm`, split into Misc
(72), Price Lists (11, one of which is a projector sheet) and Projector
(3). Some documents appear in more than one list, so the unique count is
75. Fetch any of them at
`https://www.pacificrimcamera.com/rl/NNNNN/NNNNN.pdf`.

**The one that does not work:** `02108`, technical bulletin No. 3,
returns an HTML error page rather than a PDF. Re-checked on the sweep
date; still broken, as it has been every time anyone has looked.

---

## Read the rendered page, not the text layer

Every scan here is OCR'd and the OCR is bad in ways that would publish
wrong facts rather than obvious nonsense. Collected so nobody rediscovers
them one at a time:

| Document | What its OCR does |
| --- | --- |
| `04932` Feb 1972 16mm | Renders **every capital B as an E**. BOLEX reads EOLEX, SBM reads SEM. |
| `04950` Feb 1970 16mm | Corrupts **the prices themselves**: 48.00 as 4B.00, 59.50 as 59_50, 250.00 as 250_00. |
| `02241` H-16 systems | Mangles fractions: 13½ as 13112, 3¾ as 3314. |
| `02226` Apr 1979 Super 8 | Runs model numbers into lens specs, inventing "71415-30mm", which is not a model. |
| `00953` H16 range | Interleaves columns, prints 501 as **507**, and lifts the factory code 240.510 into what looks like a model heading. |
| `01859` Nov 1952 | `$3 ..00`, `372:75`, `~05.50`. |
| `04927` service charges | `$~8.00` for $48.00, `$?q.50` for $74.50. |

And the trap that is not OCR at all: **`02211` (Oct 1976) prints Dealer
Cost then Suggested Retail; `02210` (Jan 1978) prints Suggested Retail
then Dealer Net.** Same publisher, opposite order, nothing but the column
headers to tell them apart.

---

## Price lists: all eleven

Every one is mined. `04946` is the exception and is explained below.

| Id | What | Mined |
| --- | --- | --- |
| `04929` | H-8 dealer list, June 1965 | yes, incl. projectors |
| `04928` | H-8 dealer list, March 1965 | yes |
| `04933` | H-16 dealer list, May 1967 | yes, incl. projectors |
| `04950` | H-16 dealer list, **13 Feb 1970** | yes — the densest document here |
| `04932` | 16mm, 23 Feb 1972 | yes, incl. bodies |
| `04942` | Super 8, 23 Feb 1972 | yes |
| `02211` | 16mm, 1 Oct 1976 | yes |
| `02210` | 16mm, 1 Jan 1978 | yes |
| `02226` | Super 8, 1 Apr 1979 | yes |
| `02209` | 16mm, 1 Nov 1979 | yes, incl. bodies |
| `04946` | **Bolex/Hasselblad Federal Supply Schedule**, 30 Mar to 30 Nov 1970, 16pp | **no** |

`04946` is a GSA contract list covering Bolex cameras, Super 8
projectors, Hasselblad and the Bolex 16 Pro. Government contract prices
are not retail and mixing them into the price series would be wrong
without saying so loudly. Left for a decision rather than quietly
included.

### Lists that exist and are not here

Each is named as the one its successor replaced, so all three are
certain to have existed:

- **February 1969**, 16mm — named by `04950`.
- **July 1971**, 16mm — named by `04932`.
- **June 1971**, Super 8 — named by `04942`.

The 1971 pair would be the earliest pricing the archive could hold for
the EBM and for the whole Super 8 line.

---

## What the sweep produced

Written up from these documents, with prices where the lists carry them:

- **Cameras**: H-16 EL, EBM, SBM (from `02241`); 680, 583, 563 XL (from
  `02223`, `02232`); 280, 250, 233 Compact (from `02675`, `02670`).
- **Projectors**: SP 8 (`04942`), SM 80 Programmatic (`02226`), 18-9 DUO
  (`02675`), 521, 510, 501 (`00953`).
- **The Bolex Stereo** gained Paillard's own fitting instructions
  (`01392`), including the standoff parallax conversion.
- **The SP 80** gained its first manufacturer document (`04328`), which
  states that the SP 80 special and SP 8 special are "practically
  identical, except for a few details".
- **What a service cost** (`04927`): an H camera overhaul at $48.00,
  cited in the valuation article.

### Two questions closed

- **What the R means on an 18-5R.** `04924`: "A 50-cycle version R is
  available for use outside of the U.S.A." It is the export 18-5
  Automatic, which is why it costs the same to the cent. Not a model.
- **Whether technical bulletin No. 3 can be had.** No. Still 404.

---

## The lens brochure, mined

**`01992`, Lenses for 16mm Motion Picture and Television Cameras.** Two
of its four pages are specification tables. Ten lenses are in, each read
off the rendered page because the OCR interleaves the columns and pairs
every figure with the wrong lens: the Switar 10mm, 16mm and 25mm, the
Yvar 16mm, the Cinor 25mm f/0.95, the Pizar 25mm, the Vario-Switar 86
and the Pan Cinor 70, 85 and 100.

They are in `data/lens-items/specs.json` and show as a **Measured**
table on the lens page.

The **Pan Cinor 100** came out of it as a lens the original site never
listed at all, and now has an entry.

Two things the tables give that the archive had no way to record before:

- **The catalogue-number pairs.** "34 & 5" means number 34 for C mount
  and Vidicon and number 5 for the Bolex Reflex. The Pan Cinors pair a
  "C" number with an "S" (Kodak) one instead.
- **Weights and lengths**, which is what somebody carrying a camera
  actually wants.

One figure was left out on purpose. The Vario-Switar 86's area covered
at 20 feet at its shortest focal length reads "17in x 84in" where every
comparable lens is about 120 inches wide. The leading digit has not
survived the scan, so the field is absent rather than wrong.

**What remains in it:** the brochure says the two lines run to 27
lenses, and these tables cover ten. The rest are named in the prose
without a table, or are on pages whose tables were not reproduced.

---

## Everything else, by what it is

**Bolex Reporter**, Paillard's own magazine, nine issues: `02589` (Vol
17 No. 2, 1967-68, carries an SM8 article), `02689` (Vol 18 No. 2),
`02810` (Vol 20 No. 2, 1970), `02628`, `02655`, `02670`, `02731`,
`02746`, `03040` (carries the moon landing). Editorial rather than
specification, and the 1970 price list keys its rows to a **Bolex
Reporter Product Buying Guide** by page number, so the matching issue
would pair a picture and a description to each priced line. Not yet
identified which issue that is.

**Instruction books**: `03154` (150), `03949` (155), `03242` (B8),
`01522`, `01795` (exposure meter), `03796` (Model H), `04265` (H-16 REX,
a PROCAM reprint), `04584`, `01829`, `04328` (SP 80/SP 8 special),
`02233` (H-16 EL, a life-size cutaway).

**Camera brochures**: `00936` (16 Pro), `00937` (H16 EBM), `00953` (H16
range), `02241` (H-16 systems), `00044` and `04923` (H-8 Rex), `01860`
and `00667` (B-8 variable shutter and twin turret), `03761` (two new
16mm models), `03266` (main features), `04307` (8mm range), `02598` and
`02509` (155 and 160), `02224` and `02232` (583/563 XL), `02223` (680),
`02239` and `02240` (Sound-8 range), `02675` (Super 8 range).

**Accessories**: `01992` (lenses, above), `02231` (underwater housing
for the electric-motor H16), `02238` (Super 8 accessories, matching the
1979 product numbers), `01447` (MC-17 motor), `01796` (camera base),
`01797` (cable releases), `01861` and `01862` (Declic grips), `01521`
(B8L Compumatic lightmeter), `02988` (**Pellegrini-Piek variable shutter
units**, a third-party fitting the archive does not cover), `01392`
(Stereo), `02234` (product number to numeric factory code
cross-reference, which also names an **H-16 SBM/TV**).

**Projectors**: `04634`, `04924` (8mm, and the source of the R answer),
`04328`.

**Catalogues**: `02027` (1946), `01775` (Feb 1952), `01859` (Nov 1952),
`04916` (Feb 1965, prices nothing).

**Technical bulletins**, all hosted at /manuals: `01882`, `01883`,
`01884`, `01885`, `02105`, `02106`, `02107`, `02109`, `02118`, `02119`,
`02120`, `02122`, `03221`, `03222`, `03223`.

**Service**: `04927`.

**Image-only, no text layer at all**, so they need OCR before anything
can be said about them: `01775`, `02027`, `02225`, `02655`, `02746`,
`03221`.
