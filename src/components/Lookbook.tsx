"use client";

import { useEffect, useRef, useState } from "react";
import { Picture, type ImageName } from "./Picture";
import { ThreadAnchor } from "./Thread";
import { gsap, useGSAP } from "@/lib/motion";
import s from "./Lookbook.module.css";

const LOOKS: { name: string; meta: string; image: ImageName; alt: string }[] = [
  { name: "The Veil", meta: "Nikah · Lace cuffs, sheer veil", image: "look-veil", alt: "A bride seated by a window under a sheer veil" },
  { name: "Window Light", meta: "Nikah · Beaded lace bodice", image: "look-window", alt: "A bride in a beaded lace gown holding white roses by a window" },
  { name: "Blush Bloom", meta: "Sanding · Floral appliqué, cape", image: "look-blush", alt: "A bride in a white gown with blush floral appliqué and a cape" },
  { name: "Silver Thread", meta: "Nikah · Sequinned lace kurung", image: "look-lace", alt: "A laughing bride in a sequinned lace kurung holding orchids" },
  { name: "Majestic", meta: "Couple set · Cathedral veil", image: "look-cathedral", alt: "A bride with a cathedral-length veil beside her groom" },
  { name: "Beyond the Nikah", meta: "Evening couture · Sequins, tulle train", image: "look-evening", alt: "A woman in a deep red sequinned gown with a black peplum and tulle train" },
];

const DURATION = 5.5;

export function Lookbook() {
  return (
    <section id="edit" className={s.section}>
      <div className={`wrap ${s.head}`}>
        <p className="eyebrow" data-reveal>
          The edit
        </p>
        <h2 className="display h2" data-reveal>
          Six looks, <em>one hand.</em>
        </h2>
      </div>
      <Index />
      <Stories />
      <ThreadAnchor x="calc(var(--gutter) * 0.5)" y="6%" mx="10px" my="3%" />
      <ThreadAnchor x="calc(var(--gutter) * 0.5)" y="98%" mx="10px" my="99%" />
    </section>
  );
}

/** Desktop: an editorial index; the photo follows the cursor. */
function Index() {
  const root = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState<number | null>(null);

  useGSAP(
    () => {
      const el = root.current!;
      const preview = el.querySelector<HTMLElement>(`.${s.preview}`)!;
      const xTo = gsap.quickTo(preview, "x", { duration: 0.8, ease: "power3.out" });
      const yTo = gsap.quickTo(preview, "y", { duration: 0.8, ease: "power3.out" });
      const rTo = gsap.quickTo(preview, "rotation", { duration: 0.8, ease: "power3.out" });
      let lastX = 0;
      const move = (e: PointerEvent) => {
        const r = el.getBoundingClientRect();
        const x = e.clientX - r.left;
        xTo(x);
        yTo(e.clientY - r.top);
        rTo(gsap.utils.clamp(-6, 6, (x - lastX) * 0.4));
        lastX = x;
      };
      el.addEventListener("pointermove", move);
      return () => el.removeEventListener("pointermove", move);
    },
    { scope: root },
  );

  return (
    <div ref={root} className={s.index} onPointerLeave={() => setActive(null)} data-active={active !== null}>
      <ol className="wrap">
        {LOOKS.map((l, i) => (
          <li
            key={l.name}
            className={s.row}
            data-on={active === i}
            onPointerEnter={() => setActive(i)}
            data-reveal
            style={{ "--d": `${i * 0.06}s` } as React.CSSProperties}
          >
            <span className={s.no}>{String(i + 1).padStart(2, "0")}</span>
            <span className={s.name}>{l.name}</span>
            <span className={s.meta}>{l.meta}</span>
          </li>
        ))}
      </ol>
      <div className={s.preview} aria-hidden="true">
        {LOOKS.map((l, i) => (
          <div key={l.name} className={s.frame} data-on={active === i}>
            <Picture name={l.image} alt="" sizes="340px" />
          </div>
        ))}
      </div>
    </div>
  );
}

/** Touch: a Stories-style lookbook. Tap to advance, hold to pause. */
function Stories() {
  const root = useRef<HTMLDivElement>(null);
  const [i, setI] = useState(0);
  const [paused, setPaused] = useState(true);
  const [held, setHeld] = useState(false);
  const progress = useRef(0);
  const holdTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const didHold = useRef(false);

  // Play only while on screen.
  useEffect(() => {
    const io = new IntersectionObserver(([e]) => setPaused(!e.isIntersecting), { threshold: 0.55 });
    io.observe(root.current!);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    progress.current = 0;
    root.current!.querySelectorAll<HTMLElement>(`.${s.bar} i`).forEach((b, n) => {
      b.style.transform = `scaleX(${n < i ? 1 : 0})`;
    });
  }, [i]);

  useEffect(() => {
    if (paused || held) return;
    let raf = 0;
    let last = performance.now();
    const bar = root.current!.querySelectorAll<HTMLElement>(`.${s.bar} i`)[i];
    const tick = (now: number) => {
      progress.current += (now - last) / 1000 / DURATION;
      last = now;
      if (bar) bar.style.transform = `scaleX(${Math.min(1, progress.current)})`;
      if (progress.current >= 1) setI((v) => (v + 1) % LOOKS.length);
      else raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [i, paused, held]);

  const go = (d: number) => setI((v) => (v + d + LOOKS.length) % LOOKS.length);

  const down = () => {
    didHold.current = false;
    holdTimer.current = setTimeout(() => {
      didHold.current = true;
      setHeld(true);
    }, 220);
  };
  const up = (e: React.PointerEvent) => {
    clearTimeout(holdTimer.current);
    setHeld(false);
    if (didHold.current) return;
    const r = (e.currentTarget as HTMLElement).getBoundingClientRect();
    go(e.clientX - r.left < r.width * 0.33 ? -1 : 1);
  };

  const look = LOOKS[i];
  return (
    <div ref={root} className={s.stories}>
      <div
        className={s.viewer}
        onPointerDown={down}
        onPointerUp={up}
        onPointerCancel={() => {
          clearTimeout(holdTimer.current);
          setHeld(false);
        }}
        onContextMenu={(e) => e.preventDefault()}
        role="group"
        aria-roledescription="carousel"
        aria-label="The edit, six looks"
      >
        {LOOKS.map((l, n) => (
          <div key={l.name} className={s.slide} data-on={n === i} aria-hidden={n !== i}>
            <Picture name={l.image} alt={l.alt} sizes="100vw" draggable={false} />
          </div>
        ))}
        <div className={s.bar} aria-hidden="true">
          {LOOKS.map((l) => (
            <span key={l.name}>
              <i />
            </span>
          ))}
        </div>
        <div className={s.caption} aria-live="polite">
          <span className={s.count}>
            {String(i + 1).padStart(2, "0")} / {String(LOOKS.length).padStart(2, "0")}
          </span>
          <span className={s.capName}>{look.name}</span>
          <span className={s.capMeta}>{look.meta}</span>
        </div>
        {held && <span className={s.pausedTag}>Paused</span>}
      </div>
      <div className={s.controls}>
        <button type="button" onClick={() => go(-1)} aria-label="Previous look">
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M15 5l-7 7 7 7" />
          </svg>
        </button>
        <p>Tap to see the next look · hold to pause</p>
        <button type="button" onClick={() => go(1)} aria-label="Next look">
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </div>
  );
}
