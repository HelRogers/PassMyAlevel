// All site motion lives here: smooth scrolling, the intro, page transitions,
// scroll reveals, the hero wordmark, the work showcase, the cursor and the
// magnetic buttons.
//
// Rules this file sticks to:
// - Only transform and opacity are animated.
// - Nothing runs when the visitor prefers reduced motion; the CSS already
//   shows every element in its final state.
// - Every page's animations are created inside one gsap.context so they can
//   be torn down cleanly before the next page is swapped in.

import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';
import Lenis from 'lenis';

gsap.registerPlugin(ScrollTrigger, SplitText);

const root = document.documentElement;
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
const finePointer = matchMedia('(hover: hover) and (pointer: fine)').matches;

const EASE_OUT = 'expo.out';
const EASE_IN_OUT = 'expo.inOut';

let lenis: Lenis | null = null;
let ctx: gsap.Context | null = null;
let cleanups: Array<() => void> = [];
let introFinished = !root.classList.contains('intro-play');
let pendingHeroEntry: (() => void) | null = null;

root.classList.add('motion-ready');

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */

function on<K extends keyof HTMLElementEventMap>(
  el: HTMLElement | Window | Document,
  type: K | string,
  fn: (e: any) => void,
  opts?: AddEventListenerOptions,
) {
  el.addEventListener(type, fn, opts);
  cleanups.push(() => el.removeEventListener(type, fn, opts));
}

const $$ = <T extends Element = HTMLElement>(sel: string, scope: ParentNode = document) =>
  Array.from(scope.querySelectorAll<T>(sel));

/* ------------------------------------------------------------------ */
/* Smooth scrolling                                                    */
/* ------------------------------------------------------------------ */

function lenisRaf(time: number) {
  lenis?.raf(time * 1000);
}

function startLenis() {
  if (reducedMotion || lenis) return;
  lenis = new Lenis({ lerp: 0.11, wheelMultiplier: 1, touchMultiplier: 1.4 });
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add(lenisRaf);
  gsap.ticker.lagSmoothing(0);
}

function stopLenis() {
  if (!lenis) return;
  gsap.ticker.remove(lenisRaf);
  lenis.destroy();
  lenis = null;
}

/* ------------------------------------------------------------------ */
/* Header: hide on scroll down, show on scroll up                      */
/* ------------------------------------------------------------------ */

let lastY = window.scrollY;
window.addEventListener(
  'scroll',
  () => {
    const y = window.scrollY;
    if (root.classList.contains('menu-open')) return;
    if (y > 160 && y > lastY + 4) root.classList.add('header-hidden');
    else if (y < lastY - 4 || y <= 160) root.classList.remove('header-hidden');
    lastY = y;
  },
  { passive: true },
);

/* ------------------------------------------------------------------ */
/* First-visit intro                                                   */
/* ------------------------------------------------------------------ */

function playIntro() {
  const intro = document.querySelector<HTMLElement>('[data-intro]');
  if (!intro || introFinished) return;

  try {
    sessionStorage.setItem('rwd-intro', '1');
  } catch {}

  const count = intro.querySelector<HTMLElement>('[data-intro-count]')!;
  const lines = $$('.intro__lines span', intro);
  const gridLines = $$('.grid-lines span');
  const counter = { v: 0 };

  lenis?.stop();

  const tl = gsap.timeline({
    defaults: { ease: EASE_OUT },
    onComplete: finish,
  });

  tl.to(lines, { scaleY: 1, duration: 0.7, stagger: 0.06, ease: EASE_IN_OUT }, 0)
    .to(counter, {
      v: 100,
      duration: 0.9,
      ease: 'power2.inOut',
      onUpdate: () => (count.textContent = String(Math.round(counter.v)).padStart(3, '0')),
    }, 0.1)
    .from(gridLines, { scaleY: 0, duration: 0.9, stagger: 0.06, ease: EASE_IN_OUT }, 0.9)
    .to(intro, { yPercent: -100, duration: 0.75, ease: EASE_IN_OUT }, 1.0)
    .add(() => {
      introFinished = true;
      pendingHeroEntry?.();
      pendingHeroEntry = null;
    }, 1.2);

  function skip() {
    tl.progress(1);
  }

  function finish() {
    root.classList.remove('intro-play');
    gsap.set(intro, { clearProps: 'all' });
    lenis?.start();
    window.removeEventListener('keydown', skip);
    intro.removeEventListener('click', skip);
  }

  window.addEventListener('keydown', skip, { once: true });
  intro.addEventListener('click', skip, { once: true });
}

/* ------------------------------------------------------------------ */
/* Custom cursor (fine pointers only, alongside the native cursor)     */
/* ------------------------------------------------------------------ */

function setupCursor() {
  if (reducedMotion || !finePointer) return;
  const cursor = document.querySelector<HTMLElement>('[data-cursor]');
  if (!cursor) return;
  root.classList.add('has-cursor');

  const dot = cursor.querySelector<HTMLElement>('[data-cursor-dot]')!;
  const ring = cursor.querySelector<HTMLElement>('[data-cursor-ring]')!;
  const label = cursor.querySelector<HTMLElement>('[data-cursor-label]')!;

  gsap.set([dot, ring], { x: -100, y: -100 });
  const dotX = gsap.quickTo(dot, 'x', { duration: 0.12, ease: 'power3' });
  const dotY = gsap.quickTo(dot, 'y', { duration: 0.12, ease: 'power3' });
  const ringX = gsap.quickTo(ring, 'x', { duration: 0.5, ease: 'power3' });
  const ringY = gsap.quickTo(ring, 'y', { duration: 0.5, ease: 'power3' });

  window.addEventListener('pointermove', (e) => {
    if (e.pointerType !== 'mouse') return;
    dotX(e.clientX);
    dotY(e.clientY);
    ringX(e.clientX);
    ringY(e.clientY);
  }, { passive: true });

  document.addEventListener('pointerleave', () => gsap.to([dot, ring], { opacity: 0, duration: 0.2 }));
  document.addEventListener('pointerenter', () => {
    gsap.to(dot, { opacity: 1, duration: 0.2 });
    gsap.to(ring, { opacity: 0.6, duration: 0.2 });
  });

  // Hover states are delegated so they keep working after page swaps.
  let current: Element | null = null;
  document.addEventListener('pointerover', (e) => {
    const target = (e.target as Element).closest('[data-cursor-text], a, button, summary, input, textarea, select, label');
    if (target === current) return;
    current = target;
    const text = target?.getAttribute('data-cursor-text');
    const onDark = !!target?.closest('.theme-ink');
    ring.style.borderColor = onDark ? 'var(--color-paper)' : 'var(--color-ink)';
    if (text) {
      label.textContent = text;
      gsap.to(ring, { scale: 2.6, opacity: 1, backgroundColor: 'var(--color-signal)', borderColor: 'var(--color-signal)', duration: 0.4, ease: EASE_OUT });
      gsap.to(label, { opacity: 1, scale: 1 / 2.6, duration: 0.3 });
      gsap.to(dot, { opacity: 0, duration: 0.2 });
    } else if (target) {
      gsap.to(ring, { scale: 1.6, opacity: 0.9, backgroundColor: 'transparent', duration: 0.35, ease: EASE_OUT });
      gsap.to(label, { opacity: 0, duration: 0.15 });
      gsap.to(dot, { opacity: 1, duration: 0.2 });
    } else {
      gsap.to(ring, { scale: 1, opacity: 0.6, backgroundColor: 'transparent', duration: 0.35, ease: EASE_OUT });
      gsap.to(label, { opacity: 0, duration: 0.15 });
      gsap.to(dot, { opacity: 1, duration: 0.2 });
    }
  });
}

/* ------------------------------------------------------------------ */
/* Page transitions (Astro view transitions + a signal-orange wipe)    */
/* ------------------------------------------------------------------ */

function setupTransitions() {
  const wipe = document.querySelector<HTMLElement>('[data-wipe]');
  if (!wipe || reducedMotion) return;

  document.addEventListener('astro:before-preparation', (event: any) => {
    const load = event.loader;
    event.loader = async () => {
      closeMenu(true);
      gsap.set(wipe, { visibility: 'visible', yPercent: 100 });
      const cover = gsap.to(wipe, { yPercent: 0, duration: 0.6, ease: EASE_IN_OUT });
      await Promise.all([cover.then(), load()]);
    };
  });

  document.addEventListener('astro:page-load', () => {
    if (gsap.getProperty(wipe, 'yPercent') === 0 && getComputedStyle(wipe).visibility === 'visible') {
      gsap.to(wipe, {
        yPercent: -100,
        duration: 0.7,
        delay: 0.05,
        ease: EASE_IN_OUT,
        onComplete: () => gsap.set(wipe, { visibility: 'hidden', yPercent: 100 }),
      });
    }
  });
}

/* ------------------------------------------------------------------ */
/* Mobile menu                                                         */
/* ------------------------------------------------------------------ */

let closeMenu: (instant?: boolean) => void = () => {};

function setupMenu() {
  const toggle = document.querySelector<HTMLButtonElement>('[data-menu-toggle]');
  const menu = document.querySelector<HTMLElement>('[data-menu]');
  if (!toggle || !menu) return;
  const label = toggle.querySelector<HTMLElement>('[data-menu-label]')!;
  const links = $$('a', menu);
  const outside = [document.getElementById('main'), document.querySelector('.site-footer')].filter(Boolean) as HTMLElement[];

  function open() {
    menu!.hidden = false;
    toggle!.setAttribute('aria-expanded', 'true');
    label.textContent = 'Close menu';
    root.classList.add('menu-open');
    root.classList.remove('header-hidden');
    outside.forEach((el) => (el.inert = true));
    lenis?.stop();
    if (!reducedMotion) {
      gsap.fromTo(menu, { yPercent: -100 }, { yPercent: 0, duration: 0.7, ease: EASE_IN_OUT });
      gsap.fromTo(links, { yPercent: 110 }, { yPercent: 0, duration: 0.8, stagger: 0.05, delay: 0.25, ease: EASE_OUT });
    }
    links[0]?.focus({ preventScroll: true });
  }

  closeMenu = (instant = false) => {
    if (menu!.hidden) return;
    toggle!.setAttribute('aria-expanded', 'false');
    label.textContent = 'Open menu';
    root.classList.remove('menu-open');
    outside.forEach((el) => (el.inert = false));
    lenis?.start();
    const done = () => {
      menu!.hidden = true;
      gsap.set(menu, { clearProps: 'transform' });
    };
    if (instant || reducedMotion) done();
    else gsap.to(menu, { yPercent: -100, duration: 0.5, ease: EASE_IN_OUT, onComplete: done });
  };

  on(toggle, 'click', () => (menu.hidden ? open() : (closeMenu(), toggle.focus())));
  on(document, 'keydown', (e: KeyboardEvent) => {
    if (e.key === 'Escape' && !menu.hidden) {
      closeMenu();
      toggle.focus();
    }
  });
  // Keep Tab inside the header and menu while it is open.
  on(document, 'keydown', (e: KeyboardEvent) => {
    if (e.key !== 'Tab' || menu.hidden) return;
    const focusable = [toggle, ...links];
    const i = focusable.indexOf(document.activeElement as HTMLElement);
    if (e.shiftKey && i <= 0) {
      e.preventDefault();
      focusable[focusable.length - 1].focus();
    } else if (!e.shiftKey && i === focusable.length - 1) {
      e.preventDefault();
      focusable[0].focus();
    }
  });
}

/* ------------------------------------------------------------------ */
/* Hero wordmark                                                       */
/* ------------------------------------------------------------------ */

function heroWordmark() {
  const hero = document.querySelector<HTMLElement>('[data-hero]');
  const mark = hero?.querySelector<HTMLElement>('[data-wordmark]');
  if (!hero || !mark) return;

  const outer = $$('.hl', mark); // scroll scatter
  const magnets = $$('.hl__m', mark); // cursor push
  const inners = $$('.hl__i', mark); // entry
  const heroBits = $$('[data-hero-fade]', hero);

  const entry = () => {
    const tl = gsap.timeline();
    tl.fromTo(
      inners,
      { yPercent: 120, rotation: () => gsap.utils.random(-30, 30), opacity: 0 },
      { yPercent: 0, rotation: 0, opacity: 1, duration: 1.3, stagger: 0.045, ease: EASE_OUT },
    ).fromTo(heroBits, { y: 30, opacity: 0 }, { y: 0, opacity: 1, duration: 1, stagger: 0.08, ease: EASE_OUT }, 0.45);
  };

  if (introFinished) entry();
  else {
    gsap.set(heroBits, { opacity: 0 });
    pendingHeroEntry = entry;
  }

  // Letters scatter as the hero scrolls away, and settle again on the way back.
  gsap.to(outer, {
    yPercent: () => gsap.utils.random(-140, -40),
    rotation: () => gsap.utils.random(-35, 35),
    ease: 'none',
    scrollTrigger: { trigger: hero, start: 'top top', end: 'bottom top', scrub: 0.6, invalidateOnRefresh: true },
  });

  // Cursor pushes letters away and they spring back. Desktop only.
  if (!finePointer) return;
  const movers = magnets.map((el) => ({
    el,
    x: gsap.quickTo(el, 'x', { duration: 0.6, ease: 'power3' }),
    y: gsap.quickTo(el, 'y', { duration: 0.6, ease: 'power3' }),
    r: gsap.quickTo(el, 'rotation', { duration: 0.8, ease: 'power3' }),
    cx: 0,
    cy: 0,
    rogue: el.closest('.hl--rogue') !== null,
  }));

  const measure = () => {
    const box = mark.getBoundingClientRect();
    movers.forEach((m) => {
      const b = m.el.getBoundingClientRect();
      m.cx = b.left - box.left + b.width / 2 - (gsap.getProperty(m.el, 'x') as number);
      m.cy = b.top - box.top + b.height / 2 - (gsap.getProperty(m.el, 'y') as number);
    });
  };
  measure();
  on(window, 'resize', measure);

  on(hero, 'pointermove', (e: PointerEvent) => {
    if (e.pointerType !== 'mouse') return;
    const box = mark.getBoundingClientRect();
    const px = e.clientX - box.left;
    const py = e.clientY - box.top;
    const radius = box.height * 1.4;
    movers.forEach((m) => {
      const dx = m.cx - px;
      const dy = m.cy - py;
      const dist = Math.hypot(dx, dy) || 1;
      const force = Math.max(0, 1 - dist / radius) ** 2;
      const push = box.height * (m.rogue ? 0.55 : 0.35) * force;
      m.x((dx / dist) * push);
      m.y((dy / dist) * push);
      m.r((dx / dist) * force * (m.rogue ? 40 : 18));
    });
  });

  on(hero, 'pointerleave', () => {
    gsap.to(magnets, { x: 0, y: 0, rotation: 0, duration: 1.4, ease: 'elastic.out(1, 0.35)', stagger: 0.02, overwrite: true });
  });
}

/* ------------------------------------------------------------------ */
/* Scroll reveals                                                      */
/* ------------------------------------------------------------------ */

function reveals() {
  const show = (els: Element[]) =>
    gsap.fromTo(els, { y: 48, opacity: 0 }, { y: 0, opacity: 1, duration: 1.1, stagger: 0.09, ease: EASE_OUT, overwrite: true });

  ScrollTrigger.batch('[data-reveal]', { start: 'top 90%', once: true, onEnter: show });
  $$('[data-reveal-group]').forEach((group) => {
    ScrollTrigger.batch(Array.from(group.children), { start: 'top 90%', once: true, onEnter: show });
  });

  // Headlines reveal line by line from behind a mask.
  $$('[data-split]').forEach((el) => {
    SplitText.create(el, {
      type: 'lines',
      mask: 'lines',
      linesClass: 'split-line',
      autoSplit: true,
      onSplit(self) {
        gsap.set(el, { visibility: 'visible' });
        return gsap.from(self.lines, {
          yPercent: 110,
          duration: 1.2,
          stagger: 0.1,
          ease: EASE_OUT,
          scrollTrigger: { trigger: el, start: 'top 88%', once: true },
        });
      },
    });
  });

  // Images drift slightly inside their frames.
  $$('[data-parallax]').forEach((frame) => {
    const img = frame.querySelector('img');
    if (!img) return;
    // "top" frames start aligned to the top of an oversized image and drift up;
    // plain frames drift either side of centre.
    const fromTop = frame.dataset.parallax === 'top';
    const travel = fromTop ? (1 - frame.clientHeight / img.clientHeight) * -100 : 7;
    gsap.fromTo(
      img,
      { yPercent: fromTop ? 0 : -travel },
      { yPercent: travel, ease: 'none', scrollTrigger: { trigger: frame, start: fromTop ? 'top 70%' : 'top bottom', end: 'bottom top', scrub: true, invalidateOnRefresh: true } },
    );
  });

  // Frames are uncovered by a panel that slides away as they enter.
  $$('[data-unveil]').forEach((el) => {
    const cover = document.createElement('span');
    cover.className = 'unveil-cover';
    cover.setAttribute('aria-hidden', 'true');
    el.append(cover);
    gsap.to(cover, {
      scaleY: 0,
      duration: 1.3,
      ease: EASE_IN_OUT,
      scrollTrigger: { trigger: el, start: 'top 85%', once: true },
      onComplete: () => cover.remove(),
    });
    cleanups.push(() => cover.remove());
  });
}

/* ------------------------------------------------------------------ */
/* Marquee and rotating seal, both nudged by scroll speed              */
/* ------------------------------------------------------------------ */

function loops() {
  const tweens: gsap.core.Tween[] = [];

  $$('[data-marquee]').forEach((track) => {
    tweens.push(gsap.to(track, { xPercent: -50, repeat: -1, duration: 40, ease: 'none' }));
  });
  $$('[data-seal]').forEach((seal) => {
    tweens.push(gsap.to(seal, { rotation: 360, repeat: -1, duration: 22, ease: 'none' }));
  });
  if (!tweens.length) return;

  let boost = 0;
  ScrollTrigger.create({
    onUpdate(self) {
      boost = Math.min(Math.abs(self.getVelocity()) / 250, 6);
    },
  });
  const tick = () => {
    boost *= 0.92;
    tweens.forEach((t) => t.timeScale(1 + boost));
  };
  gsap.ticker.add(tick);
  cleanups.push(() => gsap.ticker.remove(tick));
}

/* ------------------------------------------------------------------ */
/* Work showcase: pinned horizontal scroll on wide screens             */
/* ------------------------------------------------------------------ */

function workShowcase(mm: gsap.MatchMedia) {
  const section = document.querySelector<HTMLElement>('[data-hscroll]');
  const track = section?.querySelector<HTMLElement>('[data-hscroll-track]');
  if (!section || !track) return;

  mm.add('(min-width: 900px)', () => {
    section.classList.add('is-horizontal');
    const distance = () => track.scrollWidth - window.innerWidth;

    const tween = gsap.to(track, {
      x: () => -distance(),
      ease: 'none',
      scrollTrigger: {
        trigger: section,
        start: 'top top',
        end: () => `+=${distance()}`,
        pin: true,
        scrub: 0.8,
        invalidateOnRefresh: true,
      },
    });

    const progress = section.querySelector<HTMLElement>('[data-hscroll-progress]');
    if (progress) {
      gsap.fromTo(progress, { scaleX: 0 }, { scaleX: 1, ease: 'none', scrollTrigger: { trigger: section, start: 'top top', end: () => `+=${distance()}`, scrub: true, invalidateOnRefresh: true } });
    }

    $$('[data-hscroll-card]', track).forEach((card) => {
      const img = card.querySelector('img');
      if (img) {
        gsap.fromTo(img, { scale: 1.18 }, { scale: 1, ease: 'none', scrollTrigger: { trigger: card, containerAnimation: tween, start: 'left right', end: 'left 30%', scrub: true } });
      }
    });

    // Keyboard users: scroll the page so a focused card is actually on screen.
    const onFocus = (e: FocusEvent) => {
      const card = (e.target as Element).closest<HTMLElement>('[data-hscroll-card]');
      const st = tween.scrollTrigger;
      if (!card || !st) return;
      const ratio = Math.min(1, Math.max(0, (card.offsetLeft - window.innerWidth * 0.1) / distance()));
      const y = st.start + (st.end - st.start) * ratio;
      if (lenis) lenis.scrollTo(y, { immediate: true });
      else window.scrollTo(0, y);
    };
    track.addEventListener('focusin', onFocus);

    return () => {
      section.classList.remove('is-horizontal');
      track.removeEventListener('focusin', onFocus);
    };
  });
}

/* ------------------------------------------------------------------ */
/* Process steps: a line draws down and each step lights up             */
/* ------------------------------------------------------------------ */

function processSteps() {
  $$('[data-process]').forEach((list) => {
    const line = list.querySelector('[data-process-line]');
    if (line) {
      gsap.fromTo(line, { scaleY: 0 }, { scaleY: 1, ease: 'none', scrollTrigger: { trigger: list, start: 'top 70%', end: 'bottom 60%', scrub: true } });
    }
    $$('[data-process-step]', list).forEach((step) => {
      ScrollTrigger.create({ trigger: step, start: 'top 65%', end: 'bottom 35%', toggleClass: 'is-active' });
    });
  });
}

/* ------------------------------------------------------------------ */
/* Footer wordmark rises into view                                     */
/* ------------------------------------------------------------------ */

function footerMark() {
  const mark = document.querySelector<HTMLElement>('[data-footer-mark] svg');
  if (!mark) return;
  gsap.fromTo(mark, { yPercent: 100 }, { yPercent: 0, ease: 'none', scrollTrigger: { trigger: mark.parentElement, start: 'top bottom', end: 'bottom bottom', scrub: 0.6 } });
}

/* ------------------------------------------------------------------ */
/* Magnetic buttons                                                    */
/* ------------------------------------------------------------------ */

function magnetic() {
  if (!finePointer) return;
  $$('[data-magnetic]').forEach((wrap) => {
    const child = wrap.firstElementChild as HTMLElement | null;
    if (!child) return;
    const x = gsap.quickTo(child, 'x', { duration: 0.5, ease: 'power3' });
    const y = gsap.quickTo(child, 'y', { duration: 0.5, ease: 'power3' });
    on(wrap, 'pointermove', (e: PointerEvent) => {
      const b = wrap.getBoundingClientRect();
      x((e.clientX - (b.left + b.width / 2)) * 0.35);
      y((e.clientY - (b.top + b.height / 2)) * 0.35);
    });
    on(wrap, 'pointerleave', () => gsap.to(child, { x: 0, y: 0, duration: 1, ease: 'elastic.out(1, 0.4)' }));
  });
}

/* ------------------------------------------------------------------ */
/* Page lifecycle                                                      */
/* ------------------------------------------------------------------ */

function initPage() {
  root.classList.add('motion-ok', 'motion-ready');
  setupMenu();

  const scrollTop = document.querySelector<HTMLElement>('[data-scroll-top]');
  if (scrollTop) {
    on(scrollTop, 'click', (e: Event) => {
      e.preventDefault();
      if (lenis) lenis.scrollTo(0, { duration: 1.6 });
      else window.scrollTo({ top: 0 });
      (document.querySelector('.skip-link') as HTMLElement | null)?.focus({ preventScroll: true });
    });
  }

  if (reducedMotion) return;

  startLenis();
  const mm = gsap.matchMedia();
  ctx = gsap.context(() => {
    heroWordmark();
    reveals();
    loops();
    workShowcase(mm);
    processSteps();
    footerMark();
  });
  magnetic();
  cleanups.push(() => mm.revert());

  // Recalculate positions once fonts and images have settled.
  document.fonts?.ready.then(() => ScrollTrigger.refresh());
}

function destroyPage() {
  cleanups.forEach((fn) => fn());
  cleanups = [];
  ctx?.revert();
  ctx = null;
  ScrollTrigger.getAll().forEach((t) => t.kill());
  stopLenis();
  root.classList.remove('header-hidden');
}

function safely(fn: () => void) {
  try {
    fn();
  } catch (err) {
    console.error(err);
    root.classList.add('motion-failed');
    root.classList.remove('intro-play');
  }
}

safely(() => {
  setupCursor();
  setupTransitions();
});

document.addEventListener('astro:before-swap', () => safely(destroyPage));
document.addEventListener('astro:after-swap', () => {
  // Astro replaces the <html> attributes on navigation; restore ours.
  if (!reducedMotion) root.classList.add('motion-ok');
  root.classList.add('motion-ready');
  if (finePointer && !reducedMotion) root.classList.add('has-cursor');
});
document.addEventListener('astro:page-load', () =>
  safely(() => {
    initPage();
    if (!introFinished) playIntro();
  }),
);
