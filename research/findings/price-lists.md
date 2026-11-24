# Paillard's dealer price lists

Nine of them survive on Pacific Rim Camera, 1965 to 1979, and they are
the best primary source this project has found for dating and
identifying equipment. Each entry gives an item, Paillard's five-letter
code, and a price on a stated date. A price in the May 1967 dealer list
is proof the thing was on sale in May 1967, which is harder than
anything a web search returns.

| Document | What it covers | Date | Text? |
|---|---|---|---|
| `rl/04929` | Dealer price list, H-8 | March 1965 | yes |
| `rl/04928` | Dealer price list, H-8 | June 1965 | yes |
| `rl/04933` | Dealer price list, H-16 | May 1967 | yes |
| `rl/04932` | 16mm cameras and projectors | February 1972 | yes |
| `rl/04942` | Super 8 cameras and projectors | February 1972 | not read |
| `rl/02211` | 16mm cameras and projectors | October 1976 | yes |
| `rl/02210` | 16mm cameras and projectors | January 1978 | yes |
| `rl/02226` | Super 8 cameras and projectors | April 1979 | not read |
| `rl/02209` | 16mm cameras and projectors | November 1979 | yes |

Catalogues read alongside them: `rl/01859` (February 1952) and
`rl/04916` (February 1965) carry text. `rl/01775` (1946) and `rl/02027`
(November 1952) are image-only scans and would need OCR; both are
large, and the 1946 one is the only thing likely to date the
Wollensak, Meyer and Goerz lenses that currently have no description at
all.

## What has been taken from them so far

`research/price-list-codes.json` holds every code-and-price pair the
parse found: **191 rows, 136 distinct codes**. It is raw output and is
not to be used directly. The scans are OCR'd and the columns interleave,
so a code regularly ends up printed beside the previous entry's
description. Every row that has been published was read back against
the page first.

Published so far, in `data/lens-items/listings.json`:

- **11 lenses gained a code** they did not have, because Michael did not
  give one in the name. DACRO, DAREX, DAROU, DARIF, HIENT, HIONG, PAHUX,
  VASOT, VAMAT, PATEM, PACOM. These are the valuable ones: the code is
  what is engraved on the barrel.
- **17 lenses gained a dated price.** Lenses with a code now number 32
  of 116, up from 21.

## What is still in there

Most of the 136 codes are not lenses. From a first read they include,
with prices and dates attached, a great many accessories this archive
already holds without codes:

- FADOM Rexofader 40, FAOUI Rexofader 32, DEMAT Automatic Selftimer,
  DECLA H-20 cable release, DELON H-40 cable release, NOVOF bellows
  extension unit, MOLEC Unimotor B, MOSTE Unimotor, MOTRA transformer,
  MONOP monopod, MONTO monopod with ball joint, TUBEX extension tubes,
  PERAM Perfectone motor, SUTEL lens and accessory support, TITRA basic
  titler, COPEN matte box, FOGOS lightmeter for the H Rex, CASFA 400ft
  magazine, CASMO take-up motor, BATAC power pack BX55, TRICA H-tripod,
  TRIBA H-tripod with ball joint, CADIL and CADRO prismatic focusers,
  REFTU eye-level focus for the H-8, HAFRA H-camera grip.

Doing for the accessories what has been done for the lenses is the
obvious next pass, and it is the same work: match by hand, quote the
printed wording, cite the document.

There are also items in these lists the archive has **no entry for at
all**, which is the other reason to keep reading them. CINET, a Cinor
25mm f/1.8 at $70 in 1967, is one: there is no page for it here. A
proper sweep for those is worth doing.

## How to work with them

```
python3 -I research/scripts/mine-price-lists.py   # rebuilds the raw table
```

Then read the candidate rows against the PDF before publishing any of
them. Never publish a row the parse produced without doing that: the
first automated attempt gave the Yvar 13mm the price of a 200mm mask,
because the two sat on one OCR'd line.
