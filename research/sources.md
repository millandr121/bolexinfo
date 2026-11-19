# Source register

Every site offered for research, what it actually holds, whether it can be
reached from a build session, and what its terms allow. Kept so the same
links are not re-tested and the same dead ends not re-walked.

Reachability was tested on 2026-11-18 from this project's cloud session.

## Reachable

| Source | Holds | Reachable | Terms |
|---|---|---|---|
| [pacificrimcamera.com](https://www.pacificrimcamera.com/rl/rlBolex.htm) | **83 Bolex PDFs** — 72 misc (brochures, instruction books, catalogues 1946–1965, *Bolex Reporter* 1967–72, 29 technical bulletins), 8 price lists, 3 projector | yes | none stated; describes itself as "an online library of photo related PDF files" |
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
- `rl/01775`, `01859`, `02027`, `04916` — Bolex catalogues, 1946, Feb 1952,
  Nov 1952, Feb 1965. Useful for dating models the archive left undated.
- "Bolex Sterero Instruction Book" (their spelling) — the Stereo/Triorama.
- "Bolex SP8/SP80 Instruction Book" — projectors absent from this site.
- 29 technical bulletins, 1959–1962 — repair and service material.

## How material gets here

Attaching a file to the conversation works: it arrives as a real file and
can be read, catalogued and committed. That is the shortest path for
anything found by hand, the Facebook group included.
