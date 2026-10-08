"use client";

import { useRef } from "react";
import { Picture } from "./Picture";
import { ThreadAnchor } from "./Thread";
import { gsap, useGSAP, prefersReducedMotion } from "@/lib/motion";
import s from "./DesignedAsOne.module.css";

/**
 * One photograph, cut down the middle. As you scroll the two halves drift together
 * until the couple's hands meet and the seam is stitched closed.
 */
export function DesignedAsOne() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      if (prefersReducedMotion()) return;
      const tl = gsap.timeline({
        defaults: { ease: "none" },
        // Starts while the section is still scrolling into view, so less time is spent pinned.
        scrollTrigger: { trigger: root.current, start: "top 45%", end: "bottom bottom", scrub: 1 },
      });
      tl.fromTo(`.${s.left}`, { xPercent: -16, yPercent: -5 }, { xPercent: 0, yPercent: 0, duration: 1, ease: "power2.inOut" }, 0)
        .fromTo(`.${s.right}`, { xPercent: 16, yPercent: 5 }, { xPercent: 0, yPercent: 0, duration: 1, ease: "power2.inOut" }, 0)
        .fromTo(`.${s.label}`, { autoAlpha: 1 }, { autoAlpha: 0, duration: 0.25 }, 0.5)
        .fromTo(`.${s.seam} path`, { strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: 0.2 }, 0.85)
        .fromTo(`.${s.after}`, { autoAlpha: 0, y: 16 }, { autoAlpha: 1, y: 0, duration: 0.2 }, 0.95)
        .to(`.${s.seam}`, { autoAlpha: 0, duration: 0.15 }, 1.05)
        .to({}, { duration: 0.1 });
    },
    { scope: root },
  );

  return (
    <section ref={root} id="signature" className={s.section}>
      <div className={s.sticky}>
        <div className={s.copy}>
          <p className="eyebrow" data-reveal>
            The Qura signature
          </p>
          <h2 className="display h2" data-reveal>
            Two outfits.
            <br />
            <em>One design language.</em>
          </h2>
          <p className="lede" data-reveal>
            Your outfits aren&rsquo;t made separately and matched later. Fabric, colour and every detail are chosen as a
            pair, then fitted to each of you.
          </p>
        </div>

        <div className={s.frame}>
          <div className={`${s.half} ${s.left}`}>
            <Picture name="one-couple" alt="" sizes="(min-width: 900px) 46vw, 100vw" className={s.img} />
            <span className={s.label}>For him</span>
          </div>
          <div className={`${s.half} ${s.right}`}>
            <Picture
              name="one-couple"
              alt="A groom and bride in matching white outfits, holding hands in a garden"
              sizes="(min-width: 900px) 46vw, 100vw"
              className={s.img}
            />
            <span className={s.label}>For her</span>
          </div>
          <svg className={s.seam} viewBox="0 0 10 100" preserveAspectRatio="none" aria-hidden="true">
            <path d="M5 0 L5 100" pathLength={1} />
          </svg>
          <p className={s.after}>Designed as one.</p>
        </div>
      </div>

      <ThreadAnchor x="calc(var(--gutter) * 0.5)" y="12%" mx="10px" my="4%" />
      <ThreadAnchor x="calc(var(--gutter) * 0.5)" y="96%" mx="10px" my="96%" />
    </section>
  );
}
