# Unpublished — provenance unknown

Five photographs of a Bolex 16 Pro 100, supplied 2026-11-18, 2000px wide.

They are staged here and **not published**, because nobody has yet said
where they came from. They look like dealer or auction photography: white
sweep, even lighting, plainly shot as a set.

- If they are the site owner's own, they can be published at once.
- If they were saved from a listing, a forum or a group post, the
  photographer holds the copyright, and publishing them would make this
  archive do the thing it exists not to do.

Needed: who took them, or where they were found.

| file | view |
|---|---|
| 16pro100-right-profile.jpg | right side, magazine left, matte box fitted |
| 16pro100-three-quarter-left.jpg | three-quarter left, lens cap and eyecup detached |
| 16pro100-three-quarter-right.jpg | three-quarter right, eyecup detached |
| 16pro100-front-lens-cap.jpg | front three-quarter, "BOLEX 16 PRO 100" cap |
| 16pro100-left-profile.jpg | left side, eyecup fitted, body plate legible |

The body plate reads `BOLEX 16 PRO 100` and the lens is an Angénieux
12-120mm f/2.2. See ../../findings/bolex-16-pro.md.

## Cut-outs

`webp/` holds the same five images as transparent WebP, background removed.

The removal is by connectivity, not colour: a flood fill runs inward from
the border and only clears pixels it can reach through other background
pixels. That matters because this camera has silver knobs, a white-and-red
body plate and bright highlights — a plain "clear everything near white"
would have punched holes straight through them. Anything enclosed by dark
metal is unreachable and survives.

The threshold also clears the soft drop shadow, which at a tighter setting
stayed behind as a grey smear and looked wrong on a dark ground. It is safe
by construction: the fill can only clear pixels brighter than 160, so the
black body can never be touched.

Note these are *genuinely* transparent, unlike the rest of the site's
imagery — those are JPEGs on white that only look cut out, because `.plate`
multiplies them against a warm panel. A real alpha channel needs no plate
and works on any ground, so when these are published they should not get
the multiply treatment.
