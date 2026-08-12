# apoorv2904.github.io

Personal academic site. Plain HTML and CSS with a little vanilla JavaScript —
no build step, no dependencies. Push to `main` and GitHub Pages serves it.

```
index.html          all content lives here
style.css           design tokens at the top, then sections in page order
favicon.svg
images/             portraits, posters, paper figures, the waveform divider
media/              publication clips (mp4, h.264)
data/               CV PDF
.github/workflows/  deploy + CV date stamping
```

## Trying styles

Four looks share the same `index.html` structure. Open any of these locally and
use the bar at the bottom to switch:

| file | loads | character |
|---|---|---|
| `preview-signal.html` | base | current — Archivo + serif, indigo/amber |
| `preview-pixel.html` | + pixel | 8-bit name and ornament, readable body |
| `preview-terminal.html` | + terminal | monospace throughout, shell markers |
| `preview-editorial.html` | + editorial | serif, journal-like, rules not boxes |
| `preview-arcade.html` | + arcade | CRT cabinet — scanlines, neon, dark only |
| `preview-console.html` | + terminal + console | **terminal × pixel** — DOS / BBS, double-line boxes |
| `preview-phosphor.html` | + terminal + phosphor | **terminal × arcade** — amber VT220 tube |
| `preview-handheld.html` | + pixel + handheld | **pixel × arcade** — Game Boy DMG, four shades |

The three hybrids literally load both parent sheets and then a small third file
that resolves the overlap, so they stay in sync if a parent changes.

The theme sheets are **overrides layered on `style.css`**, not replacements —
they redefine design tokens and a handful of components, so responsive
behaviour, dark mode, and print stay identical across all four.

Once you pick one: point `index.html` at that stylesheet (and its webfont link),
then delete the `preview-*.html` files and the sheets you didn't choose.

## Updating

**Add a publication.** Copy an existing `<article class="pub">` block at the top
of the `.pubs` container and edit it. Each block is: media, title link, authors
(wrap your own name in `<span class="me">`), a venue chip, an optional role chip,
the link row, and a one-sentence blurb.

**Add a clip.** Drop the mp4 in `media/`, then point the `<video>` at it and set a
`poster`. To pull a poster frame straight out of the clip:

```sh
ffmpeg -ss 12 -i media/your-clip.mp4 -frames:v 1 -q:v 3 images/poster-your-clip.jpg
```

Keep clips small — 480×270 is plenty at the size they render, and the whole site
should stay well under GitHub's limits.

**Media without a clip.** Use a plain `<div class="pub-media">` with an `<img>`.
For a dense figure that needs a closer look, use the PE-AV pattern instead: an
`<a class="pub-media is-zoom">` linking to the full-size image.

**MMS alternate.** `images/mms-map.jpg` is the language-coverage world map, kept as
an alternative to the TTS demo clip. To use it, swap the MMS `<div class="pub-media">`
for the plain image pattern used by the older entries.

**Change the CV.** Replace `data/Apoorv_Vyas_CV.pdf`, keeping the filename.

The line under the links reads `CV last updated <Month Year>`. It is stamped at
deploy time from the git history of the PDF — the last commit that touched *that
file*, not the last time anything on the site changed. Nothing to bump by hand,
and the PDF itself carries no date.

This needs **Settings → Pages → Source = "GitHub Actions"** (see
`.github/workflows/deploy.yml`). Without it the line stays hidden and nothing
else breaks. To drop the stamp entirely, delete the `<p class="cv-stamp">` line
from `index.html`.

**Change colours or type.** Everything is in the `:root` block at the top of
`style.css`, with dark-mode values just below it. Both themes need editing.

## Notes

- Theme follows the OS by default; the nav button overrides it and remembers the
  choice in `localStorage`.
- Publication clips preview muted on hover. The speaker button unmutes — starting
  one with sound stops any other that is playing.
- There is a commented-out availability line in the hero, for when you want the
  job search to be public.
- Paper thumbnails use `object-fit: contain`, so figures with unusual aspect
  ratios letterbox rather than getting cropped.
- `images/wave.svg` is the divider under the hero. It is applied as a CSS mask so
  it recolours with the theme; it tiles horizontally, so keep it 240×24.
- Links to the old `idiap.ch/~avyas/...` posters and bibtex files were dropped —
  they are almost certainly dead. Everything now points at arXiv, publishers,
  or GitHub.
