# Source register

Every site offered for research, what it actually holds, whether it can be
reached from a build session, and what its terms allow. Kept so the same
links are not re-tested and the same dead ends not re-walked.

Reachability was tested on 2026-11-18 from this project's cloud session.

## Reachable

| Source | Holds | Reachable | Terms |
|---|---|---|---|
| [pacificrimcamera.com](https://www.pacificrimcamera.com/rl/rlBolex.htm) | **83 Bolex PDFs** — 72 misc (brochures, instruction books, catalogues 1946–1965, *Bolex Reporter* 1967–72, 16 technical bulletins), 8 price lists, 3 projector | yes | none stated; describes itself as "an online library of photo related PDF files" |
| [camera-wiki.org](https://camera-wiki.org/wiki/Bolex) | encyclopaedia entries | yes | **GFDL 1.3** — reusable with attribution and share-alike |
| [filmatlas.com](https://www.filmatlas.com/entry/150) | Bolex Stereo / Triorama, detailed | yes | no licence stated; cite Hess, Hillary (2024), *Film Atlas*, FIAF / George Eastman Museum. Some images credited individually |
| [pathefilm.uk](https://pathefilm.uk/95gear/95gearBolex.htm) | 9.5mm gear, Pathé side | yes | none stated |
| [bolexh16user.net](http://bolexh16user.net/) | H16 cameras, lenses, motors, accessories; a repair list | yes | none stated |
| [phsc.ca](https://phsc.ca/repair/Bolex/bolex_camera-h8_h16.pdf) | H8/H16 **repair manual**, 31 MB | yes | none stated |
| [cinematography.com](https://cinematography.com/index.php?/forums/forum/78-bolex/) **via the Wayback Machine** | a dedicated **Bolex forum** (forum 78), 27 listing pages, **571 threads** 2003–2026 — repair knowledge, technical argument, history, the working technicians | **only through web.archive.org** — see below | posts are their authors' own words; treat as citable sources, not reusable content |

## Not reachable from a build session

| Source | Why |
|---|---|
| [bolex.com](https://bolex.com/) | 406 — blocks automated requests |
| [manuals.plus/category/bolex](https://manuals.plus/category/bolex) | 403 |
| [learncamerarepair.com](https://learncamerarepair.com/productlist.php?category=2&secondary=109) | 403 |
| [filmlabs.org Bolex_Manual.pdf](https://www.filmlabs.org/docs/Bolex_Manual.pdf) | no response |
| [Facebook group 746982282801800](https://www.facebook.com/groups/746982282801800) | private; serves a login wall to anything unauthenticated |

Blocked does not mean unusable — a person with a browser can open any of
them. It means the material has to be fetched by hand and brought in.

## Reading cinematography.com

The live site sits behind a Cloudflare interstitial that answers anything
non-interactive with 403, a real headless Chromium included — it never gets
past "Just a moment...". The forum is readable all the same, because the
Wayback Machine has it: 1,930 archived URLs under the Bolex forum and
snapshots of the listing pages as recent as 2026.

Two details make the difference between working and not:

- Use the **raw `id_` replay endpoint**
  (`web.archive.org/web/<timestamp>id_/<url>`), which serves the stored
  bytes without the archive's own chrome. It answers in about a second,
  where the ordinary replay URL takes long enough that this session's
  proxy closes the tunnel first and curl reports a bare connection reset.
- The forum is **Invision Community**, and its post bodies are
  `<div data-role='commentContent'>` with **single-quoted** attributes and
  nested divs. Author, date and body appear in that order per post.

`research/findings/cinematography-forum.md` records what the threads
actually hold. The harvest scripts are not committed: they are scaffolding,
and re-running them is a minute's work from the notes above.

### What may be done with it

Forum posts are the writing of the people who wrote them — Dom Jaeger,
Simon Wyss and the rest are living specialists, not an anonymous data set.
So the rule here is the same one the rest of this project follows for
material it did not create:

- **Facts** learned from a thread may be stated on the site in our own
  words, cited to the thread.
- **Short quotations** with the author named are ordinary scholarly use.
- **Wholesale republication** of posts is not ours to do, and bulk forum
  text never becomes page content.
- Nothing is **attributed** to a named person that they did not write.

## Notable documents

Picked out of the Pacific Rim list because they close a known gap:

- `rl/00936/00936.pdf` — **Bolex 16 Pro Sales Brochure**. Primary source,
  Paillard Inc., dating code 7/70. Read; see findings/bolex-16-pro.md.
- `rl/02239/02239.pdf` — **Bolex 5120 dealer sheet**, Ehrenreich
  Photo-Optical Industries, code P-76. Read. Settles that the 5120 is a
  Super 8 sound camera, not a projector, and heads the Sound-8 line above
  the 581 and the 551XL.
- Bolex catalogues, paired to the right ids. This file previously listed
  them in the wrong order, which would have dated a Feb 1952 catalogue to
  1946 and backdated everything read out of it by six years:
  - `rl/02027` — **1946**. Image-only scan, 122 MB.
  - `rl/01775` — **Feb 1952**. Image-only, 78 MB; OCR'd, and its pages 21
    and 22 are a full Bolex retail price list.
  - `rl/01859` — **Nov 1952**. Carries text.
  - `rl/04916` — **Feb 1965**. Carries text.
- **The dealer price lists, and a trap in the 1970s ones.** Seven of the
  eight Pacific Rim holds have now been mined: `rl/04928`, `rl/04929`,
  `rl/04932`, `rl/04933` (1965–67), `rl/02211`, `rl/02210`, `rl/02209`
  (1976–79). Transcriptions are in `research/price-lists/`.
  - `rl/02211` — **1 October 1976**, EPOI. Columns print as **Dealer Cost
    then Suggested Retail**, so retail is the *second* number.
  - `rl/02210` — **1 January 1978**, EPOI. Columns print as **Suggested
    Retail then Dealer Net**, the other way round, so retail is the
    *first* number.
  - Nothing distinguishes them but the column headers, which the OCR does
    not reliably keep beside their own numbers. Taking the same column
    from both would publish a dealer's cost as a shop price, roughly a
    third under. Both headers were read off the rendered page, and so was
    every figure taken from them. The same rule holds for the rest.
  - These two also price the **H-16 EL, EBM and SBM**, which the archive
    has no entries for at all. Three major production cameras with no
    page: the clearest gap the price lists have turned up.
- "Bolex Sterero Instruction Book" (their spelling) — the Stereo/Triorama.
- The SP 80 is **not on Pacific Rim**, despite an earlier note here saying
  an "SP8/SP80 Instruction Book" was listed. It is not. The SP59 to SP62
  codes on that site are its own bulletin numbering, not model names. The
  SP 80 entry rests on dealer and collector listings only, and a
  manufacturer document for it is still wanted.
- **15 technical bulletins, 1959–1962, downloaded and hosted** at /manuals.
  Not repair material, which is what this file and the roadmap both said:
  they are dealer literature. Lens charts, accessories, the Tripod H, the
  Pan Cinors, anamorphic projection, photomicrography. The count of 29 was
  wrong too. The series runs to at least No. 36, Pacific Rim holds 16, and
  one of those (No. 3, `rl/02108/02108.pdf`) 404s on their own server.

## How material gets here

Attaching a file to the conversation works: it arrives as a real file and
can be read, catalogued and committed. That is the shortest path for
anything found by hand, the Facebook group included.

## ETH-Bibliothek Bildarchiv (E-Pics Image Archive)

<https://ba.e-pics.ethz.ch/> — the ETH Zurich library's image archive.
Given by the site owner, 2026-11-19, as five record links.

**This is the first source found that offers genuinely reusable
historic photography of Paillard and Bolex.** Nearly everything else
is either rights-reserved (bolex.com states its pictures are the
property of Bolex International SA and may not be reproduced without
written permission) or simply does not exist (Wikimedia Commons holds
nothing for Moïse Paillard, Bogopolsky or the early factory).

Almost every relevant record is **Creative Commons BY-SA 4.0**; a few
older ones carry the **Public Domain Mark**. Each record states its
licence in `eth_license` and its required credit line in
`eth_copyright_notice`, e.g. "ETH Library Zurich, Image Archive /
PI_38-G-0023".

### Reading it

The site is a JavaScript application and its URLs are hash fragments,
so the asset id never reaches the server and fetching the URL returns
only the shell. Two non-obvious things, recorded so they need not be
rediscovered:

- The data comes from `https://api.ethz.sharedien.com/api/v10/`.
  `assets/{id}/properties` is the metadata, `assets/{id}/derivations`
  lists the files (Original TIFF, Print, Screen, Thumbnail), and
  `POST assets/search` takes `{"q": "...", "operator": "And"}`.
- It needs a bearer token, which the front end obtains anonymously.
  Load any archive page in a browser and read the `authorization`
  header off its own API calls. The token is short-lived.

Titles are frequently **German only**. A reader that keeps only
`dataLanguageIdentifier == "en"` silently drops most records' titles
and makes the archive look empty — it is not.

### What it holds

"Bolex" returns 7 records; "Paillard" returns far more, but most are
an unrelated person (C. Paillard) or a street, so results must be
filtered on the title and description actually naming the company or
Sainte-Croix.

Genuinely relevant, all CC BY-SA 4.0:

- `PI_38-G-0023` — **Paillard cine projector, 10 January 1937**, glass
  plate, Photographisches Institut der ETH Zürich. A studio
  photograph; the Paillard name is legible on the reel.
- `PI_51-S-0086` — **Paillard 16mm camera in an equatorial mount**,
  December 1951, made for the Swiss Federal Observatory's solar
  eclipse observations, ordered by Prof. Max Waldmeier.
- `Com_C16-049-001` … `-005` — five press photographs, **1967**, Jack
  Metzger (1918–1999), "Fototipps für Amateure": a Paillard Bolex 150
  Super beside a Kodak Retina S2.
- `SIK_03-080632`, `-080636` — **the Paillard-Bolex-Hermes works at
  Sainte-Croix**, November 1996, Hans-Peter Bärtschi (1950–2022).
- `SIK_03-080637` — Sainte-Croix, Paillard, Colonie du Progrès, 1996.
- `SIK_03-080656`, `-080659`, `-080660`, `-080663`, `-080664`,
  `-080665` — Sainte-Croix, Avenue des Alpes, Paillard, September 1996.
- `SIK_03-080641` — Sainte-Croix, Paillard, "à vendre 23'000m2",
  October 2002. The works offered for sale.
- `SIK_04-E1401-061` — Ste-Croix, the former Paillard MEM factory,
  2013, "today Migros".

The two ETH Photographic Institute plates are the only period
photographs of Paillard equipment this project has found that may be
reused. The Bärtschi series is modern but is the actual factory.

### Using it

BY-SA 4.0 requires the author, the licence and a link, and that
adaptations be shared alike. Putting a licensed photograph on a page
does not place the page under the licence; cropping or retouching one
does make that image an adaptation. So these are shown unaltered,
credited to the named photographer and to "ETH Library Zurich, Image
Archive", with the record signature and a link to the licence.
