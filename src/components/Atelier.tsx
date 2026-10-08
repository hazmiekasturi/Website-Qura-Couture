"use client";

import { useEffect, useRef, useState } from "react";
import { Picture, largest, type ImageName } from "./Picture";
import { ThreadAnchor } from "./Thread";
import { useMediaQuery } from "@/lib/hooks";
import s from "./Atelier.module.css";

const ZOOM = 2.4;
const HOLD_MS = 260;

/** Magnifying loupe. Mouse: follows the cursor. Touch: press and hold, then drag; the loupe sits above the finger. */
function Loupe({ name, alt }: { name: ImageName; alt: string }) {
  const box = useRef<HTMLDivElement>(null);
  const lens = useRef<HTMLDivElement>(null);
  const [on, setOn] = useState(false);
  const fine = useMediaQuery("(hover: hover) and (pointer: fine)", true);
  const hint = fine ? "Hover to look closer" : "Press and hold to look closer";

  useEffect(() => {
    const el = box.current!;
    const l = lens.current!;
    let active = false;
    let timer: ReturnType<typeof setTimeout> | undefined;
    let start = { x: 0, y: 0 };

    const place = (cx: number, cy: number, lift: number) => {
      const r = el.getBoundingClientRect();
      const x = Math.min(r.width, Math.max(0, cx - r.left));
      const y = Math.min(r.height, Math.max(0, cy - r.top));
      const size = l.offsetWidth;
      l.style.transform = `translate(${x - size / 2}px, ${y - size / 2 - lift}px)`;
      l.style.backgroundSize = `${r.width * ZOOM}px ${r.height * ZOOM}px`;
      l.style.backgroundPosition = `${-(x * ZOOM - size / 2)}px ${-(y * ZOOM - size / 2)}px`;
    };

    const show = (v: boolean) => {
      active = v;
      setOn(v);
    };

    // Mouse
    const mMove = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      if (!active) show(true);
      place(e.clientX, e.clientY, 0);
    };
    const mLeave = (e: PointerEvent) => e.pointerType === "mouse" && show(false);

    // Touch: long-press so normal scrolling still works.
    const tStart = (e: TouchEvent) => {
      const t = e.touches[0];
      start = { x: t.clientX, y: t.clientY };
      timer = setTimeout(() => {
        show(true);
        place(start.x, start.y, 96);
        navigator.vibrate?.(8);
      }, HOLD_MS);
    };
    const tMove = (e: TouchEvent) => {
      const t = e.touches[0];
      if (active) {
        e.preventDefault();
        place(t.clientX, t.clientY, 96);
      } else if (Math.hypot(t.clientX - start.x, t.clientY - start.y) > 8) {
        clearTimeout(timer);
      }
    };
    const tEnd = () => {
      clearTimeout(timer);
      show(false);
    };

    el.addEventListener("pointermove", mMove);
    el.addEventListener("pointerleave", mLeave);
    el.addEventListener("touchstart", tStart, { passive: true });
    el.addEventListener("touchmove", tMove, { passive: false });
    el.addEventListener("touchend", tEnd);
    el.addEventListener("touchcancel", tEnd);
    return () => {
      clearTimeout(timer);
      el.removeEventListener("pointermove", mMove);
      el.removeEventListener("pointerleave", mLeave);
      el.removeEventListener("touchstart", tStart);
      el.removeEventListener("touchmove", tMove);
      el.removeEventListener("touchend", tEnd);
      el.removeEventListener("touchcancel", tEnd);
    };
  }, []);

  return (
    <div ref={box} className={s.loupeBox} data-on={on} onContextMenu={(e) => e.preventDefault()}>
      <Picture name={name} alt={alt} sizes="(min-width: 900px) 50vw, 100vw" draggable={false} />
      <div ref={lens} className={s.lens} style={{ backgroundImage: `url(${largest(name)})` }} aria-hidden="true" />
      <span className={s.hint} aria-hidden="true">
        <svg viewBox="0 0 24 24">
          <circle cx="11" cy="11" r="6" />
          <path d="M20 20l-4.5-4.5M11 8v6M8 11h6" />
        </svg>
        {hint}
      </span>
    </div>
  );
}

const HISTORY = [
  { year: "2015", place: "Mersing, Johor", text: "Where it began: a small boutique and our first brides." },
  { year: "2021", place: "Johor Bahru", text: "A boutique in the city, and a growing list of couples." },
  { year: "Today", place: "Selangor & Johor Bahru", text: "A private atelier in Selangor, with appointments in Johor Bahru." },
];

export function Atelier() {
  return (
    <section id="atelier" className={s.section}>
      <ThreadAnchor x="calc(var(--gutter) * 0.5)" y="4%" mx="10px" my="2%" />
      <div className={`wrap ${s.head}`}>
        <div className={s.headText}>
          <p className="eyebrow" data-reveal>
            The atelier
          </p>
          <h2 className="display h2" data-reveal>
            Craft you can see <em>up close.</em>
          </h2>
        </div>
        <p className="lede" data-reveal>
          French lace placed by hand. Buttons covered in the gown&rsquo;s own fabric. Chiffon draped on the form until it
          falls just so. Look closer.
        </p>
      </div>

      <div className={`wrap ${s.grid}`}>
        <figure className={s.main} data-reveal>
          {/* the thread runs along the top edge and ties a stitch loop at the lace's top-right corner */}
          <ThreadAnchor x="calc(var(--gutter) * -0.5)" y="-30px" mx="calc(-1 * var(--gutter) + 10px)" my="-20px" />
          <ThreadAnchor x="45%" y="-22px" mx="calc(-1 * var(--gutter) + 10px)" my="0px" />
          <ThreadAnchor x="calc(100% - 6px)" y="10%" mx="calc(-1 * var(--gutter) + 10px)" my="8%" kind="loop" mkind="pt" r={30} />
          <Loupe name="atelier-lace" alt="Beaded French lace with crystal accents on tulle, in progress at the atelier" />
          <figcaption>French lace, beaded by hand</figcaption>
        </figure>
        <figure className={s.side} data-reveal style={{ "--d": "0.1s" } as React.CSSProperties}>
          <div className={s.sideImg}>
            <Picture name="atelier-buttons" alt="A row of fabric-covered buttons down the back of a gown" sizes="(min-width: 900px) 24vw, 50vw" />
          </div>
          <figcaption>Covered buttons, one by one</figcaption>
        </figure>
        <figure className={s.side} data-reveal style={{ "--d": "0.2s" } as React.CSSProperties}>
          <div className={s.sideImg}>
            <Picture name="atelier-drape" alt="Hands pinning chiffon drapery on a dress form" sizes="(min-width: 900px) 24vw, 50vw" />
          </div>
          <figcaption>Draped on the form</figcaption>
        </figure>
      </div>

      <ThreadAnchor x="calc(var(--gutter) * 0.5)" y="58%" mx="10px" my="62%" />
      <div className={`wrap ${s.history}`}>
        <h3 className="display h3" data-reveal>
          Eleven years, <em>three cities.</em>
        </h3>
        <ol>
          {HISTORY.map((h, i) => (
            <li key={h.year} data-reveal style={{ "--d": `${i * 0.12}s` } as React.CSSProperties}>
              <span className={s.year}>{h.year}</span>
              <span className={s.place}>{h.place}</span>
              <span className={s.htext}>{h.text}</span>
            </li>
          ))}
        </ol>
      </div>

      <ThreadAnchor x="calc(var(--gutter) * 0.5)" y="99%" mx="10px" my="99%" />
    </section>
  );
}
