# WEBMOSH

Marketing, optimization, UK &amp; US company formation, business taxes, business website &amp; hosting — all in one place you can trust.

Single-page marketing site. One self-contained `index.html`: no build step, no framework, no dependencies. The only external request the page makes is to Google Fonts.

---

## Deploy on Coolify

1. **New Resource → Public/Private Repository**, pick this repo, branch `main`.
2. **Build Pack: `Dockerfile`** (the `Dockerfile` in the repo root is all it needs).
3. **Port: `80`**.
4. Add your domain under **Domains**, e.g. `https://webmosh.com`, and let Coolify issue the Let's Encrypt certificate.
5. Deploy. Every push to `main` redeploys if you leave auto-deploy on.

The container is `nginx:1.27-alpine` serving the static files, with gzip, long-lived caching for assets, `no-cache` on the HTML so a deploy is visible immediately, and a set of security headers (`nginx.conf`).

> Coolify's **Static** build pack also works if you prefer it — set the base directory to `/` and the publish directory to `/`. The Dockerfile route is here because it pins the nginx config, the caching rules and the headers, so local and production behave identically.

### Run it locally

```bash
# with Docker, exactly as it runs in production
docker build -t webmosh . && docker run --rm -p 8080:80 webmosh
# → http://localhost:8080

# or just open the file, since it has no build step
open index.html
```

---

## Before it goes live

These are placeholders in `index.html` — search for each string and replace it:

| What | Current placeholder | Where |
|---|---|---|
| Email | `hello@webmosh.com` | contact section, footer, form handler, JSON-LD |
| WhatsApp | `+00 0000 000000` and `https://wa.me/` | contact section, footer |
| Office hours | `Mon–Fri, 09:00–18:00 GMT` | contact section |
| Uptime claim | `99.9%` | commitments band |
| Domain | `https://webmosh.com` | `robots.txt`, `sitemap.xml` |
| Hero photograph | `assets/hero.svg` placeholder | hero section — see below |
| Brand mark | `assets/webmosh-logo.png` (real) | hero lockup |

### The hero photograph

The hero is a 4:5 portrait framed by three floating cards. `assets/hero.svg` is a placeholder that says so on the image itself — replace it with a real photograph:

```bash
# drop your photo in, then point the tag at it
cp ~/Downloads/founder.jpg assets/hero.jpg
```

Then in `index.html` change the `src` to `assets/hero.jpg` and update the `alt` text to describe the actual photograph. Crop to 4:5 (e.g. 1200×1500) and keep it under ~300 KB; the frame uses `object-fit: cover`, so anything close to portrait will fill correctly.

Images are served with a 7-day revalidated cache rather than a permanent one, because these filenames are not content-hashed. If you replace a photo and want every visitor to see it immediately, give the new file a new name (`hero-2.jpg`) and update the `src` — that is the reliable way to bust a cache on a static site.

### The brand mark

`assets/webmosh-logo.png` is your logo with the black ground keyed out and the artwork trimmed to its bounding box (587×480, transparent), so it sits on both the dark and light themes without a black square around it. The source PNG was 2048×2048 on solid black. Brand colour is `#31B5F2`.

The dock and footer still use a gradient `W` glyph rather than this mark — see the note at the end of this section.

Favicons are generated from that same mark: `favicon.ico` plus transparent PNGs at 16/32/192/512, and a 180px `apple-touch-icon` on a `#07080D` ground — iOS composites home-screen icons onto white, so that one cannot be transparent. To regenerate after a logo change, rerun the Pillow snippet in the commit that added them.

### The brand marquee

The "We are working on" strip loops Payoneer, Wise, React, Next.js, PayPal, Stripe and WordPress left to right, monochrome, pausing on hover and static under `prefers-reduced-motion`.

The marks are [Simple Icons](https://simpleicons.org) artwork (CC0), inlined into the SVG sprite in `index.html` rather than loaded from a CDN, so the page makes no third-party request and the CSP stays closed. The trademarks themselves still belong to their owners — this is the usual "tools we work with" use, so keep the strip factual and only list platforms you genuinely build on.

To change the line-up: fetch a mark with `curl -s https://cdn.jsdelivr.net/npm/simple-icons@latest/icons/<slug>.svg`, add its path as a `<symbol id="b-<slug>">` in the sprite, then add one `<li class="logoitem">` to **each of the four** `marquee__group` lists — they must stay identical or the loop will visibly jump.

**The card tiles are deliberately generic.** The "Global business banking" card and the payment card use neutral glyphs rather than the Stripe, Wise, Mercury or Revolut logos. Swap in real brand assets only if you are comfortable doing so — reproducing a company's logo can imply a partnership or endorsement you do not have, and most of those brands publish trademark guidelines covering exactly this use. The `$4,500 from Acme Inc.` line is an illustrative mock-up, in the same way the reference design uses one.

**The contact form has no backend yet.** It validates in the browser, then hands the enquiry to the visitor's mail client via `mailto:`. To make it a real form, point it at a handler — Formspree, Coolify-hosted service, or your own endpoint — and replace the `window.location.href = "mailto:…"` block in the script at the bottom of `index.html`.

## What's in the page

Floating glass dock (site navigation, anchored bottom centre) · hero with framed portrait and status cards · brand marquee · six vendor-gap problems · six services in a bento grid · stats panel · five-step process · packages and pricing with a US/UK switch · FAQ · CTA panel · contact form · footer.

Dark-first enterprise system: `#07080D` ground, a blue-to-violet `#4D7CFE` → `#8B5CF6` accent, translucent panels over an aurora wash and a masked grid, and an inline SVG icon sprite (no icon-font dependency). The light theme is a full counterpart, not an inversion.

Interaction details: navigation is a glass pill fixed to the bottom of the viewport, with a backdrop blur and a gradient hairline ring; below 900px it collapses to the mark, the call to action and the theme switch; cards carry a pointer-tracked spotlight (pointer devices only, and skipped entirely under `prefers-reduced-motion`); a fine SVG noise layer keeps large flat areas from banding.

Light and dark themes with a toggle (preference saved to `localStorage`), keyboard focus states, a skip link, `prefers-reduced-motion` support, and `ProfessionalService` JSON-LD for search engines.

## Structure

```
index.html     the entire site — markup, CSS tokens, and the reveal/theme/form script
Dockerfile     nginx:alpine image Coolify builds
nginx.conf     caching, gzip, single-page fallback
security-headers.conf  CSP and hardening headers, included by every location
robots.txt     update the sitemap URL when the domain is final
sitemap.xml    update the domain when it is final
```
