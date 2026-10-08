"use client";

import { useRef } from "react";
import { Picture } from "./Picture";
import { ThreadAnchor } from "./Thread";
import { gsap, useGSAP, hasFinePointer, prefersReducedMotion } from "@/lib/motion";
import s from "./Hero.module.css";

export function Hero() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      if (prefersReducedMotion()) return;
      // Scroll depth: the garden recedes, the couple rises, the words drift away.
      const tl = gsap.timeline({
        scrollTrigger: { trigger: root.current, start: "top top", end: "bottom top", scrub: true },
      });
      tl.to(`.${s.bgScroll}`, { yPercent: 10, ease: "none" }, 0)
        .to(`.${s.coupleScroll}`, { yPercent: -7, ease: "none" }, 0)
        .to(`.${s.copy}`, { y: -70, autoAlpha: 0.15, ease: "none" }, 0);

      if (!hasFinePointer()) return;
      // Mouse depth on desktop: layers move in opposite directions.
      const bgX = gsap.quickTo(`.${s.bgMouse}`, "x", { duration: 1.1, ease: "power3.out" });
      const bgY = gsap.quickTo(`.${s.bgMouse}`, "y", { duration: 1.1, ease: "power3.out" });
      const cX = gsap.quickTo(`.${s.coupleMouse}`, "x", { duration: 1.1, ease: "power3.out" });
      const cY = gsap.quickTo(`.${s.coupleMouse}`, "y", { duration: 1.1, ease: "power3.out" });
      const el = root.current!;
      const move = (e: PointerEvent) => {
        const r = el.getBoundingClientRect();
        const mx = ((e.clientX - r.left) / r.width) * 2 - 1;
        const my = ((e.clientY - r.top) / r.height) * 2 - 1;
        bgX(mx * -10);
        bgY(my * -6);
        cX(mx * 16);
        cY(my * 8);
      };
      const leave = () => {
        bgX(0);
        bgY(0);
        cX(0);
        cY(0);
      };
      el.addEventListener("pointermove", move);
      el.addEventListener("pointerleave", leave);
      return () => {
        el.removeEventListener("pointermove", move);
        el.removeEventListener("pointerleave", leave);
      };
    },
    { scope: root },
  );

  return (
    <section ref={root} id="top" className={s.hero}>
      <div className={s.stage}>
        <div className={s.depth} data-hero-depth>
        <div className={s.bgScroll}>
          <div className={s.bgMouse}>
            <div className={`${s.layer} ${s.kb}`}>
              <Picture name="hero-bg" alt="" priority sizes="(min-width: 900px) 100vw, 190vw" />
            </div>
          </div>
        </div>
        <div className={s.wash} />
        <div className={s.coupleScroll}>
          <div className={s.coupleMouse}>
            <div className={s.layer}>
              <Picture
                name="hero-couple"
                alt="A Qura couple walking hand in hand in matching white nikah outfits"
                priority
                sizes="(min-width: 900px) 100vw, 190vw"
              />
            </div>
          </div>
        </div>
      </div>
        </div>

      <div className={s.copy}>
        <p className="eyebrow" data-hero-in>
          Selangor &amp; Johor Bahru<span className={s.appt}> · By appointment</span>
        </p>
        <h1 className="display h1" data-hero-in>
          Nikah &amp; wedding couture for the bride and groom, <em>designed as one.</em>
        </h1>
        <div className={s.ctas} data-hero-in>
          <a href="#enquire" className="btn">
            Book a consultation
          </a>
          <a href="#edit" className="btn btn-ghost">
            View the edit
          </a>
        </div>
      </div>

      <div className={s.cue} data-hero-in aria-hidden="true">
        <span />
        Scroll
      </div>

      {/* The thread begins here, under the eyebrow, and drops into the margin. */}
      <ThreadAnchor x="calc(var(--gutter) - 28px)" y="26%" mx="10px" my="calc(var(--header-h) + 22px)" />
      <ThreadAnchor x="calc(var(--gutter) - 40px)" y="70%" mx="10px" my="60%" />
      <ThreadAnchor x="calc(var(--gutter) * 0.5)" y="100%" mx="10px" my="100%" />
    </section>
  );
}
