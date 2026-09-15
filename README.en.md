# Next.js Static Blog Template

**English** · [中文](./README.md)

[![Next.js](https://img.shields.io/badge/Next.js-16.2.6-black?logo=next.js)](https://nextjs.org)
[![React](https://img.shields.io/badge/React-19.2.4-087ea4?logo=react)](https://react.dev)
[![Tailwind](https://img.shields.io/badge/Tailwind-v4-38bdf8?logo=tailwindcss)](https://tailwindcss.com)
[![License](https://img.shields.io/badge/license-MIT-blue)](./LICENSE)

A ready-to-use static blog template: static export, dual themes, MDX authoring, full-text search,
plus a small tool shed. **It builds out of the box** — no environment variables required.

- **Light theme** — bamboo grove: paper-white canvas (`#FAFAF8`) with a vermilion accent (`#C43A1B`)
- **Dark theme** — starry night: near-black neutral canvas (`#0A0A0D`), warm-gold moon glow and a brighter vermilion. Blue appears only in the night-glow layer; the canvas itself stays neutral.
- The theme switches automatically based on the **visitor's local time** (06:00–17:59 is light), and can be toggled manually.

> The site's UI text is in Chinese. All author-facing docs are in Chinese as well
> (`DESIGN.md`, `CLAUDE.md`, the per-directory `AGENTS.md` files). This English README covers
> setup and deployment; for anything deeper, the Chinese files are the reference.

## Features

| Feature | Notes | Extra config needed |
|---------|-------|---------------------|
| Static export | `output: "export"` — plain HTML/CSS/JS, hostable anywhere | — |
| Dual themes | Light/dark, driven by CSS variables, no flash on first paint | — |
| MDX authoring | GFM tables, KaTeX math, Shiki highlighting, auto table of contents, reading time | — |
| Full-text search | Index built at build time, case-insensitive substring match, `Ctrl/Cmd + K` | — |
| Three index views | By tag, by category, by year | — |
| SEO | RSS, sitemap, robots, Open Graph, JSON-LD | Set your site URL |
| Share image / icons | Script-generated OG image and icons; re-run to rebrand | — |
| Tool shed | Random numbers, Base64, an ADHD self-screen, a work-value calculator (all client-side) | — |
| Comments | Waline, self-hosted backend | Self-host Waline |
| Friends | Link cards + application notes | — |
| Small easter eggs | A bamboo sprout that grows with visit count; the tab title changes when you leave | — |

## Quick start

Requires **Node ≥ 20.19** (see `engines` in `package.json`).

```bash
npm install
npm run dev          # → http://localhost:3000
```

Build the static output into `out/`:

```bash
npm run build
```

Other commands:

```bash
npm run build:verify # build only, skipping the rest of the build chain
npm start            # preview out/ locally (same as npx serve out)
npm run lint         # ESLint
npx tsc --noEmit     # type check
npm test             # unit tests (vitest)
```

> **Search is empty under `npm run dev`.** The search index (`public/search-index.json`) is a build
> artifact and is gitignored; `next dev` never generates it. Run
> `node scripts/generate-search-index.mjs` once if you want search while developing.

## Make it yours

Do these in order and the site is yours.

### 1. Site identity — edit `site.config.mjs`

Site name, author, tagline, description, locales and GitHub username all live in this one file.
Page titles, SEO meta, RSS, sitemap, header/footer, the home page headline and the friends page's
"about this site" block all read from it, so one edit updates the whole site.

```js
export const siteConfig = {
  name: "示例博客",           // → page titles, header/footer, home page headline
  tagline: "记录技术、思考与生活",  // → home page subtitle, share image title line
  description: "一个记录技术、思考与生活的个人博客。",  // → meta description, friends page
  author: "示例博主",         // → meta author/creator, article JSON-LD
  github: "",                // → leave empty to hide the GitHub links in the footer and about page
  // …
};
```

The default values are Chinese; replace them with your own text.

> The home page headline is an **animated, per-character reveal** — it is driven by
> `Array.from(site.name)`, so any name length works (it does not have to be four characters).
>
> `author` only affects meta tags and structured data; **there is no visible byline on the page.**

### 2. Site URL — copy `.env.example` to `.env.local`

```bash
cp .env.example .env.local
```

Set at least `NEXT_PUBLIC_SITE_URL`. The build still succeeds without it, but canonical URLs,
the sitemap and the RSS feed will all point at `https://example.com` — the build prints a warning.

### 3. Brand images — re-run the generators

```bash
npm run og     # → public/og-default.png (must re-run after changing the site name)
npm run icons  # → public/favicon.svg + apple-touch-icon.png (no text in them; usually not needed)
```

**The site name is burned into the pixels.** If you change `site.config.mjs` without re-running
`npm run og`, the share image keeps the old name. This is the easiest step to forget: everything
else updates automatically, the image does not.

These scripts load `.env.local` just like `next build` does (via `scripts/load-env.mjs`), so
`npm run og` works as-is once you have configured it. Real environment variables (e.g. CI secrets)
take precedence and are never overwritten by the file.

### 4. Content

- Delete `content/blog/hello-world/`, or turn it into your first post.
- Keep `content/blog/syntax-test/`: it exercises every Markdown/MDX rendering path, so an
  upstream upgrade that breaks one is immediately visible. See `content/AGENTS.md`.
- Article images go in `public/blog/<slug>/` and are referenced with absolute paths.

### 5. Everything else

| What | Where |
|------|-------|
| Friends list | `data/friends.json` (three placeholder entries to replace) |
| Tools in the shed | `lib/tools.ts` |
| The "About" page | `app/about/page.tsx` (written as generic wording, fine to leave as-is) |
| Navigation menu | `components/layout/nav-data.ts` |
| Site icon | the ink-bamboo geometry in `scripts/generate-icons.mjs` |
| Copyright holder in the license | line 3 of `LICENSE` (`你的名字`) |

## Environment variables

All of them are **optional** — `npm run build` succeeds with none of them set.
See [`.env.example`](./.env.example) for the full annotated list.

| Variable | Purpose | When unset |
|----------|---------|------------|
| `NEXT_PUBLIC_SITE_URL` | Site root URL for canonical / sitemap / RSS / JSON-LD | Falls back to `https://example.com` and prints a build warning |
| `NEXT_PUBLIC_BASE_PATH` | Sub-path prefix, only for project-page deployments | Assumes deployment at the domain root |
| `NEXT_PUBLIC_WALINE_SERVER_URL` | Waline comment backend URL | Comment areas show a "not configured" notice |

## Deploying to GitHub Pages

The repo ships `.github/workflows/deploy.yml`; pushing to `main` builds and publishes.

**Two things must be done before the first deploy**, or nothing will happen / the deploy will fail:

1. Actions are **disabled on forks by default** — open the Actions tab and enable them.
   (Without this, a push produces no workflow run and no error message.)
2. Go to **Settings → Pages** and set **Source** to **"GitHub Actions"**.

The site URL and basePath are derived automatically — no configuration needed in either case:

- **User site** (repository named `<username>.github.io`) → served at the root, no basePath
- **Project page** (any other repository name, e.g. a fork of this template) → automatically uses
  `https://<username>.github.io/<repo>` and sets the matching basePath

> ### ⚠️ The sub-path trap
>
> If your site lives under a **sub-path** (project page), both variables must be correct:
>
> ```
> NEXT_PUBLIC_SITE_URL=https://<username>.github.io/<repo>
> NEXT_PUBLIC_BASE_PATH=/<repo>
> ```
>
> Missing `BASE_PATH` gives you a **blank site** (CSS/JS are requested from the domain root).
> If the two values disagree, canonical URLs and the sitemap point at the wrong place.
>
> Also note that Next.js does **not** rewrite raw string asset references — `<link href="/favicon.svg">`,
> `fetch("/search-index.json")` and hand-written `<img src="/...">` in posts all fall outside its
> automatic prefixing. This template routes those through `publicUrl()` in `lib/site.ts`;
> **wrap new references the same way**, otherwise they silently 404 under a sub-path.
>

With a custom domain, set repository **Variables** (Settings → Secrets and variables → Actions →
Variables — note *Variables*, not Secrets):

- `SITE_URL`, e.g. `https://blog.example.com`
- `BASE_PATH`, usually empty for a custom domain

> `BASE_PATH` is only read when `SITE_URL` is also set; setting `BASE_PATH` alone is silently ignored.

### Other static hosts

The build output is `out/` — plain static files, deployable to Cloudflare Pages, Netlify, Vercel,
object storage, etc. Note `trailingSlash: true`: the host must serve directory-style URLs correctly.

## Accessibility

- Both themes meet WCAG AA contrast
- Fully keyboard navigable: skip link, visible focus rings, 44px touch targets
- Form controls have accessible names; tool errors are announced via `role="alert"`, and `aria-invalid` is set only on the field that actually failed
- Overlays (search modal, mobile drawer) expose `role="dialog"` + `aria-modal`, trap focus while open, and return focus to the button that opened them
- `prefers-reduced-motion` disables all looping animations and the entrance choreography
- With JavaScript disabled, a `<noscript>` style takes over the entrance animations' initial state, so above-the-fold text and lists stay visible

## Optional features

| Feature | Dependency | Without it |
|---------|------------|------------|
| Comments | A self-hosted [Waline](https://waline.js.org/) backend (Vercel + Supabase free tier works) | Comment areas show a "not configured" notice |
| Friend avatars | None — `npm run avatars` downloads them from GitHub | Avatar slot falls back to the name's first letter |

`scripts/keepalive-waline.mjs` pings the Waline backend during the build to keep the free-tier
database from pausing after ~7 days of inactivity. It **never blocks the build**: failures only warn.

> On GitHub Pages, enabling comments requires a repository secret named
> **`WALINE_SERVER_URL`** (`deploy.yml` reads that name and assigns it to the environment variable
> `NEXT_PUBLIC_WALINE_SERVER_URL`).

## Removing pages you don't need

Routes are file-based, so deleting the directory takes the page offline. Update three places too:

1. The static route list in `app/sitemap.ts` (otherwise the sitemap points at 404s)
2. The nav items in `components/layout/nav-data.ts`
3. The module guide in `app/about/page.tsx` and the `ENTRIES` list at the bottom of `app/page.tsx`

The usual candidates: `app/friends/`, `app/guestbook/` (the latter needs a Waline backend).

## Known difference: building on Windows

**After `npm run build` on Windows, local preview logs a batch of 404s**
(like `/blog/__next.blog.__PAGE__.txt`). Verified on Next 16.2.6:

| Build environment | RSC payload filename produced |
|-------------------|-------------------------------|
| Linux (including GitHub Actions) | `__next.blog.__PAGE__.txt` (flat file) — this is what the client prefetches |
| Windows | `__next.blog/__PAGE__.txt` (a directory) |

These files are used for **client-side prefetching**. The only consequence is that prefetch misses
and clicking a link degrades to a full page load — navigation itself works (verified: all entries
navigate client-side, just with one extra full load).

**Nothing to do**: this repo deploys via GitHub Actions (`ubuntu-latest`), which produces the flat
files as expected. To avoid the 404 noise in local Windows previews, use `npm run dev`.

> Recorded from measurements taken while extracting this template. Delete this section once upstream fixes it.

## Project structure

### Code

```
app/                    # Routes (App Router)
├── layout.tsx          # Root layout (metadata, theme bootstrap script, Header/GlobalUI)
├── page.tsx            # Home page (3D hero scene + text-only article index)
├── blog/[slug]/        # Article detail (SSG)
├── tags/ types/ archive/   # Three index views
├── tools/              # Tool shed
├── friends/            # Friends list
├── guestbook/          # Guestbook
├── about/              # About this site
└── sitemap.ts / robots.ts / rss.xml/route.ts

components/             # React components, grouped by domain
├── layout/             # Header / DesktopNav / MobileDrawer / Footer / PageShell
│                       #   SearchModal / ThemeToggle / TimeThemeController
│                       #   GlobalUI / ErrorFallback / FarewellTitle / JsonLd / nav-data
├── blog/               # PostCard / PostCardSkeleton / MdxContent
│                       #   TableOfContents / WalineComments
├── home/               # HeroSection (composition & timing) / HeroScenery (scene drawing)
├── tools/              # RandomNumber / Base64Tool / ADHDTest / WorkValueCalculator
└── ui/                 # FadeUp / GlowCard / BambooSprout / CopyCodeButton
                        #   BackToTop / ScrollProgress

lib/                    # Core logic (no JSX, no browser APIs)
├── content.ts          # Content reading/processing (incl. image dimension checks)
├── data.ts             # Data layer (JSON + Zod validation + graceful fallback)
├── site.ts             # Site identity outlet (reads site.config.mjs, derives helpers)
├── schemas.ts          # Zod schemas
├── types.ts            # Shared types
├── constants.ts        # Article categories etc.
├── mdx.ts              # MDX compile config (plugin chain)
├── readingTime.ts      # Reading-time estimation
├── timeTheme.ts        # Time-based light/dark switching
├── bamboo.ts           # Bamboo-sprout easter egg stages
├── random.ts           # Random-number algorithms
├── tools.ts            # Tool shed configuration
└── a11y.ts             # Accessibility helpers

site.config.mjs         # ★ Single source of truth for site identity (shared with Node scripts)
```

### Content and data

```
content/blog/<slug>/    # MDX source files (plain text; images live elsewhere)
data/
└── friends.json        # Friends list (the only data file; hand-maintained)
public/                 # Static assets (the only location served by a static export)
├── blog/<slug>/        #   Article images — see public/AGENTS.md
├── cursors/            #   Custom cursors (bamboo leaf by day / star by night)
└── friends/avatars/    #   Friend avatars (generated by npm run avatars, not committed)
```

### Styles and scripts

```
styles/                 # Global styles (imported from app/globals.css)
├── theme.css           #   Design tokens and dual-theme variables (single source)
├── hero-scene.css      #   Hero scene: SVG drawing + CSS 3D depth
└── components.css / animations.css / print.css
                        #   waline.css is imported separately by WalineComments

scripts/                # Build chain and manual generators
├── keepalive-waline.mjs / generate-search-index.mjs    # in the build chain (never blocking)
├── generate-og.mjs / generate-icons.mjs / fetch-avatars.mjs   # run manually
└── audit/              # Dev-time checks (screenshots / perf), manual only
```

### Documentation

The repo ships design and architecture docs — that is the main difference from a bare template.
They are written in Chinese.

| File | Contents |
|------|----------|
| `DESIGN.md` | Single source of truth for design tokens and visual rules |
| `CLAUDE.md` | Architecture, coding conventions, code↔doc sync map |
| `AGENTS.md` under `app/` `components/` `lib/` `content/` `data/` `scripts/` `styles/` `public/` | Per-directory rules and pitfalls |
| `test/fixtures/blog/README.md` | Test fixture notes |

## Writing

One post = one directory + one `index.mdx`:

```
content/blog/my-first-post/index.mdx
```

```mdx
---
title: "文章标题"
pubDate: 2026-01-01
description: "文章摘要"
tags: ["标签1", "标签2"]
category: 随笔
tocDepth: 2
---

正文……
```

All frontmatter fields, image conventions and typography rules are documented in
[`content/AGENTS.md`](./content/AGENTS.md) (Chinese).

## Tech stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16.2.6 (App Router, static export) |
| Runtime | React 19.2.4 |
| Styling | Tailwind CSS v4 (CSS-first, no `tailwind.config.js`) + `@tailwindcss/typography` |
| Fonts | System font stacks only — no webfonts (CJK webfonts are too heavy: removing them cut LCP from 5.5s to 1.7s) |
| Theming | `next-themes` with `attribute="data-theme"` |
| MDX | `next-mdx-remote` + remark-gfm + remark-math + rehype-slug + rehype-pretty-code (Shiki) + rehype-katex |
| Animation | Framer Motion |
| Icons | Lucide React |
| Validation | Zod |
| Testing | Vitest |
| Comments | Waline (optional) |

## License

[MIT](./LICENSE). Use it, modify it, ship it commercially — just keep the copyright notice.
