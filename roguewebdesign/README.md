# roguewebdesign

The website for roguewebdesign, Euan Rogers' freelance web design business in Kent. Built with [Astro](https://astro.build), [GSAP](https://gsap.com) and [Lenis](https://lenis.darkroom.engineering).

## Run it locally

You need Node.js 22 or newer.

```bash
cd roguewebdesign
npm install
npm run dev       # http://localhost:4321, reloads as you edit
npm run build     # builds the finished site into dist/
npm run preview   # serves the built site so you can check it
npm run check     # type-checks the project
```

## Where things live

| What | File |
|------|------|
| Business details (email, phone, socials, domain, reply promise) | `src/data/site.ts` |
| Projects and case studies | `src/data/projects.ts` |
| Services, prices, what's included, process steps and FAQs | `src/data/services.ts` |
| Colours, fonts, spacing and easing | `src/styles/tokens.css` |
| All animation | `src/scripts/motion.ts` |
| Contact form behaviour | `src/scripts/contact-form.ts` |
| Pages | `src/pages/` |
| Design system notes | `design-system/MASTER.md` |

Most copy changes are one edit in a data file. The pages read from those files, so you rarely need to touch the page code.

## Add a new project

1. Take a screenshot of the site's home page at roughly 2400 × 1500 and save it as a JPG in `src/assets/work/`, for example `smith-builders.jpg`.
2. In `src/data/projects.ts`, import it at the top:
   ```ts
   import smith from '../assets/work/smith-builders.jpg';
   ```
3. Copy one of the existing entries in the `projects` list and change the details. Set `concept: false` for real client work. `accent` is the project's main brand colour, and `onAccent` is a text colour that reads well on it.
4. Save. The project appears on the home page, the Work page, and gets its own case study at `/work/smith-builders/`.

Astro converts the screenshot to AVIF and WebP in several sizes when it builds, so there's no need to compress it yourself.

## Before launch: fill in the placeholders

Anything still missing shows on the site in a dashed box starting "To add:". Search the code for `Placeholder` to find them all.

- [ ] Email, phone and social links in `src/data/site.ts`
- [ ] The real domain in `src/data/site.ts` (`url`) and in `public/robots.txt`
- [ ] A photo of Euan: add it to `src/assets/` and swap out the placeholder on the home page and in `src/pages/about.astro`
- [ ] Euan's story on the About page (`src/pages/about.astro`)
- [ ] The monthly price for hosting and care in `src/data/services.ts`, if it should be shown

### Copy to check

I wrote these as sensible defaults, but they're promises to customers, so make sure they're true:

- Replying within one working day (`replyPromise` in `site.ts`)
- Two to three weeks from first chat to going live (FAQ)
- What the £300 site includes (FAQ)
- Clients owning their domain and content, and help with a Google Business Profile (FAQ)
- The four projects are labelled as concept builds. If any are real client work, set `concept: false`.

## Deploy to Netlify

1. Push this repository to GitHub.
2. In Netlify, choose **Add new site → Import an existing project** and pick the repository.
3. Set **Base directory** to `roguewebdesign`. The build command (`npm run build`) and publish directory (`dist`) come from `netlify.toml`.
4. Deploy, then add your domain under **Domain management**.
5. Enquiries from the contact form appear under **Forms** in Netlify. Set up email notifications there so they land in your inbox (**Forms → Form notifications → Add notification → Email notification**).

The form uses Netlify Forms, so it only sends on Netlify, not when running locally.

## How the motion works

- **Smooth scrolling:** Lenis, synced with GSAP's ScrollTrigger.
- **First-visit intro:** grid lines draw in and a counter runs to 100. It plays once per browser session, and any key or click skips it.
- **Hero wordmark:** letters are pushed away from the cursor and spring back (desktop only), scatter as you scroll away, and settle on the way back. The "r" never lines up.
- **Page transitions:** a signal-orange panel wipes across between pages, using Astro's client router.
- **Reveals:** headings reveal line by line, and content fades up as it scrolls into view.
- **Work showcase:** on screens 900px and wider it pins and scrolls sideways. Keyboard focus scrolls the page so the focused card is always on screen.
- **Cursor and buttons:** a custom cursor and magnetic buttons, only on devices with a mouse. The normal cursor always stays visible.

Everything animates only `transform` and `opacity`. If someone has reduced motion turned on in their device settings, none of it runs and the site shows everything in its final state. If the script fails to load, a safety net in `src/layouts/Base.astro` shows all content after four seconds.
