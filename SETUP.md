# Setup guide for AI assistants

This file is for an AI assistant (in an IDE or chat) that a user has pointed at this repository. Follow it to set up the site with the user.

## How to run the setup

1. Ask the questions below one short group at a time, like a survey. Wait for the answers before moving to the next group. Offer the default in brackets so the user can accept it with one word.
2. Do not edit any file until the first two groups are answered.
3. After each group, apply the answers (see "Where each answer goes").
4. When all groups are done, run `npm install` (if needed) and `npm run build`, then run `npm run dev` and show the user the home page at http://localhost:3000 and one essay page.
5. Summarize what you changed and list anything still set to `REPLACE_ME`.
6. Do not commit, push, or publish anything unless the user asks.

## Questions

**Group 1: identity**
- What is the site name?
- What one-line tagline should appear under the name?
- What author name should appear on essays?

**Group 2: about and sections**
- A few sentences for the About page.
- Which sections do you want? [About, Essays, Notes]

**Group 3: look**
- Any colour or theme preference? [keep the current neutral theme]
- Do you have a logo or images to use? [keep the plain placeholders]

**Group 4: content**
- Give me your first one or two posts (title and text), or keep the examples for now. [keep examples]

**Group 5: hosting**
- Where will the site be hosted? [GitHub Pages; IPFS is optional]
- Do you have a custom domain? [none]

## Where each answer goes

| Answer | File |
| --- | --- |
| Name, tagline, author, description | `src/config/site.ts` (`SiteIdentity`: `name`, `tagline`, `author`, `description`, `colophon`) |
| Sections | `src/config/site.ts` (`BentoRegistry`) plus a folder per section under `ontology/` |
| About text | `ontology/site/about.md` |
| Posts | Markdown files under `ontology/writing/` (copy the frontmatter from `ontology/writing/welcome.md`; set `stage: published`) |
| Colours and theme | `src/app/globals.css` |
| Logo and images | `public/visuals/` (`icon.png` is the header mark) |
| Site URL | `NEXT_PUBLIC_SITE_URL` in `.env.local` (copy from `.env.local.example`) |
| GitHub Pages | `MIRROR_REPO` in `.env.local`, then `npm run ship -- --mirror` (only when the user asks to publish) |
| Custom domain | `MIRROR_CNAME` in `.env.local` |
| IPFS | keys listed in `.env.sovereign.example`, copied into `.env.local` |

Remove example posts the user does not want. Keep wording plain.
