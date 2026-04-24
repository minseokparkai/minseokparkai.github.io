# AGENTS.md

Guidance for future Codex work in this repository.

## Framework and Layout

This is a Hugo static blog published at `https://minseokparkai.github.io/`.

- `hugo.toml`: site config, menus, taxonomies, params, markup settings.
- `content/`: Markdown pages and posts.
- `layouts/`: custom Hugo templates; there is no external theme dependency.
- `assets/css/main.css`: Hugo-processed stylesheet.
- `assets/js/search.js`: Hugo-processed client-side search script.
- `assets/js/comments.js`: Hugo-processed Utterances loader for post comments.
- `static/`: files copied directly to the built site, including images.
- `.github/workflows/hugo.yaml`: GitHub Pages deployment workflow.
- `public/`, `resources/`, `.hugo_build.lock`, and `*.log` are generated or local-only files and should not be committed.

## Header Navigation

- `layouts/_default/baseof.html` owns the header and main navigation markup.
- `assets/css/main.css` owns the header positioning and responsive navigation layout.
- Keep desktop and wider tablet widths above `820px` using the existing sticky header behavior.
- At `max-width: 820px`, the header uses normal document flow so the mobile navigator starts at the top of the page and scrolls away with the content.

## Content Navigator

Post pages have a Google Docs-style content navigator generated from Hugo's `.TableOfContents`.

- `hugo.toml` owns `[markup.tableOfContents]`; keep the navigator limited to `h2` and `h3` headings unless the user asks for a different outline depth.
- `layouts/_default/single.html` renders the desktop navigator before the article so it appears on the left, and renders the mobile navigator as a collapsible block below the post header.
- `assets/css/main.css` owns the left sticky desktop panel, collapsed rail state, active-link styling, and mobile collapsible panel.
- `assets/js/content-navigator.js` owns the desktop show/hide toggle, `localStorage` persistence under `content-navigator-collapsed`, scroll-synced active tracking, and mobile close-on-select behavior.

Keep the navigator posts-only and dependency-free. Post detail pages use the `article-layout-post` width contract in `assets/css/main.css`: the article targets a centered `1020px` content column where viewport space allows. The desktop navigator should stay on the left side, expand as an in-flow sidebar that pushes the article to the right, collapse to a narrow rail instead of a modal/overlay, and use matching collapsed rails so the article recenters when the navigator is hidden. Keep `aria-expanded`, `aria-controls`, labels, and titles synced with state. Active tracking should update both desktop and mobile links while scrolling, after hash changes, and after navigator link clicks.

When changing navigator behavior, verify post-only rendering, left-side desktop placement, expanded sidebar push, centered collapsed article, collapse/expand persistence after refresh, scroll-synced active highlighting, correct anchor scrolling with the sticky header, mobile fit, and light/dark/system theme readability.

## Content

Posts live in `content/posts/`.

Important content files:

- `content/posts/_index.md`: posts listing metadata.
- `content/topics/_index.md`: Topics page metadata.
- `content/about.md`: About page.
- `content/_index.md`: home page metadata.

Create a new post with:

```powershell
hugo new content content/posts/my-new-post.md
```

The archetype starts new content as `draft = true`. Do not publish until the post is ready.

## Frontmatter

Existing posts use YAML frontmatter:

```yaml
---
title: "Post Title"
date: 2026-04-24T00:00:00+09:00
description: "Short summary for cards and metadata."
tags: ["tag-one", "tag-two"]
categories: ["notes"]
draft: false
---
```

Use `draft: false` only for content that should be published. Keep dates timezone-aware, preferably `+09:00` for this repo. Use short lowercase tags and broad categories.

## Topics and Taxonomies

The site uses Hugo taxonomies for post discovery:

- `tags` and `categories` are configured in `hugo.toml`.
- `/topics/` is a custom landing page that combines categories and tags with post counts.
- `layouts/topics/list.html` renders the Topics page from `site.Taxonomies.categories` and `site.Taxonomies.tags`.
- `layouts/taxonomy/term.html` renders individual tag/category archive pages.
- `layouts/_default/single.html` renders post header taxonomy toggles as links, with categories first and tags second in frontmatter order.
- `layouts/partials/post-card.html` renders card-level taxonomy buttons from categories first and tags second, capped at 5 total items.
- `assets/css/main.css` styles those toggles; keep category toggles in the warm/orange palette and tag toggles in the teal accent palette so the two taxonomy types stay visually distinct.

Do not add a separate `topics` taxonomy unless the user explicitly asks for a new content model. When borrowing ideas from reference sites, use them as behavior and UX inspiration only; implement the code in the style of this repository instead of copying source markup, styles, or theme-specific classes.

## Search

The site has a lightweight posts-only search overlay.

- `hugo.toml` enables JSON output for the home page with `[outputs] home = ['html', 'rss', 'json']`.
- `layouts/index.json.json` generates `/index.json` from published pages in `content/posts/` only.
- `layouts/_default/baseof.html` owns the header Search button, dialog markup, and fingerprinted search script include.
- `assets/js/search.js` lazily fetches `/index.json`, scores results locally, and renders results with DOM APIs.
- `assets/css/main.css` owns the overlay, result list, and responsive search styles.

Keep search first-party and dependency-free unless the user explicitly asks for a richer search engine. Do not copy Hugo theme bundles or reference-site source. Search results should stay focused on posts; do not include About, Topics, tags, categories, or generated listing pages unless the user asks to expand the scope.

When changing search behavior, verify the header button, `/` keyboard shortcut, focus behavior, `Esc` close, backdrop close, empty/no-result states, mobile fit, and light/dark/system theme readability.

## Comments

Post comments use Utterances, backed by GitHub Issues in `minseokparkai/minseokparkai.github.io`.

- `hugo.toml` owns `[params.comments]`, including `enabled`, `repo`, `issueTerm`, and `label`.
- `layouts/partials/comments.html` renders the comments mount only for pages in `content/posts/`.
- `layouts/_default/single.html` includes the comments partial below `.article-body`.
- `layouts/_default/baseof.html` fingerprints and loads `assets/js/comments.js` only on post pages when comments are enabled.
- `assets/js/comments.js` injects `https://utteranc.es/client.js`, uses `issue-term="pathname"` for post-specific threads, and maps the site theme to `github-light` or `github-dark`.
- `assets/css/main.css` owns the comments section spacing and Utterances width override.

Keep comments post-only unless the user explicitly asks to add comments to pages or listings. Do not add a custom backend, database, OAuth app, or client-side GitHub API code for comments unless requested; GitHub login and posting are handled by Utterances. If comment posting does not work after deployment, check that GitHub Issues are enabled on the repo and that the Utterances GitHub app is installed/authorized for the repo.

When changing comment behavior, verify post-specific `pathname` threads, no comments on Home/About/Topics/tag/category/list pages, light/dark/system theme readability, theme switching after the iframe loads, mobile fit, and the fallback/no-JavaScript text.

## Code Blocks

The site has a universal toolbar for fenced Markdown code blocks.

- `layouts/_default/_markup/render-codeblock.html` overrides Hugo fenced-code rendering with a card, language label, download button, copy button, collapse button, highlighted code, and a raw-code JSON payload.
- `assets/js/code-blocks.js` owns copy, download, filename generation, and collapse/expand behavior.
- `assets/css/main.css` owns the code block card, toolbar, icon buttons, token colors, responsive behavior, and light/dark theme variables.
- `layouts/_default/baseof.html` fingerprints and loads the code block script after the search script.

Keep this feature first-party and dependency-free. Use Hugo's `transform.HighlightCodeBlock` so Chroma highlighting options still work. Copy/download actions should use the original fence contents, not the syntax-highlighted DOM text, and should trim only trailing fence line breaks. For example, an `html` fence in `content/posts/01-codex-primer.md` should copy exactly `<button>날 클릭해</button>` and download as `01-codex-primer-code-1.html`.

When changing code block behavior, verify language labels, copy, download extension fallback to `.txt`, collapse/expand ARIA state, keyboard focus states, horizontal scrolling, mobile fit, and light/dark/system theme readability.

## Dark Mode

The site has a three-state theme control in `layouts/_default/baseof.html`.

- Default behavior is `System`: no `data-theme` attribute is set, and CSS follows `prefers-color-scheme`.
- Explicit `Light` and `Dark` choices are stored in `localStorage` under `theme-preference`.
- Forced themes are applied by setting `data-theme="light"` or `data-theme="dark"` on the root `<html>` element.
- Keep the small head script before the stylesheet link so saved themes are applied before CSS loads and the page avoids a theme flash.
- The footer button is icon-only and cycles `System -> Light -> Dark -> System`; keep CSS-drawn computer, sun, and moon icons synced through `data-theme-mode`.
- Because the theme button has no visible text, keep `aria-label` and `title` synced with the current mode and next action.
- The GitHub link lives in the footer action row with the theme button; keep the header focused on internal navigation and Search.

Theme colors live in `assets/css/main.css` as CSS custom properties. When adding UI colors, prefer new or existing variables over hard-coded component colors, and verify both automatic system dark mode and explicit light/dark overrides remain readable.

## Commands

Local dev:

```powershell
hugo server
```

Production build:

```powershell
hugo --gc --minify
```

Strict Hugo check, useful as the repo's lint equivalent:

```powershell
hugo --renderToMemory --panicOnWarning --printPathWarnings
```

Optional template audit:

```powershell
hugo --renderToMemory --printUnusedTemplates
```

There is no separate test suite or configured Markdown/CSS linter. Treat the strict Hugo check plus the production build as the required validation.

## Editing Published Posts

Published posts are public URLs. Be conservative.

- Do not change a published post filename, slug, date, or title unless the user explicitly asks.
- Preserve existing URLs and link targets where possible.
- Fix typos and formatting in place.
- For factual changes, prefer a small update note or clearly scoped correction instead of silently rewriting the post's meaning.
- Do not delete published posts unless the user explicitly requests removal.
- Keep `draft: false` on already-published posts unless the user asks to unpublish.

## Deployment

GitHub Pages deploys from pushes to `main` using `.github/workflows/hugo.yaml`.

The workflow installs Hugo Extended `0.160.1`, builds with:

```bash
hugo build --gc --minify --baseURL "${{ steps.pages.outputs.base_url }}/" --cacheDir "${{ runner.temp }}/hugo_cache"
```

Do not commit generated `public/` output. Source files only should be pushed.

## Done Checklist

Before saying a task is done, Codex should check:

- `git status --short` shows only intended changes.
- Only requested files were edited; for content-only tasks, avoid template/style/config changes.
- New or changed posts have valid frontmatter, a clear title, a description, tags/categories when useful, and the correct `draft` value.
- Internal links and image paths are valid for Hugo.
- Taxonomy or Topics changes preserve `/tags/`, `/categories/`, and `/topics/` URLs.
- Post card taxonomy changes preserve category-first/tag-second ordering, the 5-item maximum, and clickable taxonomy archive links.
- Search changes preserve the posts-only `/index.json` contract unless the user asks for a broader index.
- Content navigator changes preserve posts-only rendering, left-side desktop placement, expanded-sidebar article push, centered collapsed article, collapse persistence, and scroll-synced active tracking.
- Comment changes preserve post-only rendering and the `pathname` Utterances issue mapping unless the user asks for a broader scope.
- `hugo --renderToMemory --panicOnWarning --printPathWarnings` passes.
- `hugo --gc --minify` passes when publishing or changing templates/config/styles.
- Deployment-impacting changes respect the GitHub Pages workflow and do not require committing generated files.
