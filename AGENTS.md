# AGENTS.md

## Project Overview

Personal blog built with Next.js 15 (App Router), React 19, TypeScript 5, and Tailwind CSS 3. Blog posts are written in MDX with frontmatter. Deployed as a static site to GitHub Pages.

## Tech Stack

- **Framework:** Next.js 16.2.6 (App Router, static export, Turbopack)
- **Language:** TypeScript 5.9 (strict mode)
- **UI:** React 19.2, Tailwind CSS 4
- **Content:** MDX with `remark-frontmatter` / `remark-mdx-frontmatter`, `gray-matter` for metadata
- **API Client:** OpenAPI-generated (`typescript-fetch`) for holidays API
- **Font:** Roboto via `next/font/google`
- **Node.js:** v20.18.0

## Commands

| Command | Description |
|---|---|
| `npm run dev` | Start dev server |
| `npm run build` | Production build |
| `npm run deploy` | Build with `BASE_PATH=/personal-blog` for GitHub Pages |
| `npm run lint` | Run ESLint (flat config with next/core-web-vitals + next/typescript) |
| `npm run generate-holidays-api` | Regenerate OpenAPI client from swagger spec |

Run `npm run lint` after making changes. There is no test framework configured.

## Project Structure

```
src/
  app/              # Next.js App Router pages
    layout.tsx      # Root layout (Header, font, global styles)
    page.tsx        # Home page
    about/          # About page
    [postSlug]/     # Dynamic blog post route
  components/       # React components
  markdown/         # MDX blog posts and content
    posts/          # Individual blog post .mdx files
  api/              # Generated API clients (do not edit manually)
  utilts/           # Utility functions
  constants.ts      # App-wide constants
  mdx-components.tsx # Custom MDX component overrides
```

## Conventions

- Path alias: `@/*` maps to `./src/*`
- Blog posts live in `src/markdown/posts/` as `.mdx` files with YAML frontmatter
- Generated API code in `src/api/` must not be edited manually; regenerate via `npm run generate-holidays-api`
- Static export: no server-side runtime; all pages are statically generated at build time
- Styling via Tailwind CSS 4 utility classes; CSS variables for theming (`--background`, `--foreground`, `--font-family`)
- Tailwind 4 config is CSS-based (no `tailwind.config.ts`); customizations in `src/app/globals.css`
- ESLint 9 uses flat config (`eslint.config.mjs`)
- Components use named exports for pages (`export default async function Page`)

## Deployment

GitHub Actions (`.github/workflows/gh-pages.yml`) builds and deploys to `gh-pages` branch on push to `main`.

## Important

**When in doubt, ask the user before making a decision. Do not make assumptions about project direction, design choices, architecture, or feature scope. If something is ambiguous or you are unsure about the best approach, always clarify with the user first.**
