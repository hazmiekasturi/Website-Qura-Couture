"use client";

import { useRef } from "react";
import { gsap, useGSAP } from "@/lib/motion";
import s from "./VeilIntro.module.css";

/**
 * First-visit intro: a sheer ivory veil with a scalloped lace hem lifts off the hero.
 * Plays once per session; skipped for reduced motion (see bootScript in layout).
 */
export function VeilIntro() {
  const root = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const html = document.documentElement;
      if (html.classList.contains("veil-skip")) return;
      html.classList.add("veil-playing");
      window.__lenis?.stop();

      const finish = () => {
        html.classList.remove("veil-playing");
        html.classList.add("veil-skip");
        try {
          sessionStorage.setItem("qc-veil", "1");
        } catch {}
        window.__lenis?.start();
      };

      const tl = gsap.timeline({ onComplete: finish, delay: 0.15 });
      tl.fromTo(`.${s.mark}`, { autoAlpha: 0, y: 12 }, { autoAlpha: 1, y: 0, duration: 1, ease: "power2.out" })
        .to(`.${s.mark}`, { autoAlpha: 0, y: -10, duration: 0.6, ease: "power2.in" }, "+=0.45")
        .to(`.${s.fabric}`, { yPercent: -118, scaleY: 0.94, duration: 1.7, ease: "power3.inOut" }, "-=0.2")
        .to(`.${s.folds}`, { xPercent: -6, duration: 1.7, ease: "power2.inOut" }, "<")
        // The hero sits outside this component's scope, so query the document directly.
        .from(document.querySelectorAll("[data-hero-in]"), { autoAlpha: 0, y: 28, stagger: 0.09, duration: 1.3, ease: "power3.out" }, "-=1.05")
        .from(document.querySelectorAll("[data-hero-depth]"), { scale: 1.06, duration: 2.2, ease: "power2.out" }, "<-0.2");

      // Any interaction fast-forwards the intro rather than blocking the visitor.
      const skip = () => tl.timeScale(3.5);
      const opts = { once: true, passive: true } as const;
      window.addEventListener("pointerdown", skip, opts);
      window.addEventListener("wheel", skip, opts);
      window.addEventListener("keydown", skip, opts);
      window.addEventListener("touchstart", skip, opts);
      return () => {
        window.removeEventListener("pointerdown", skip);
        window.removeEventListener("wheel", skip);
        window.removeEventListener("keydown", skip);
        window.removeEventListener("touchstart", skip);
      };
    },
    { scope: root },
  );

  return (
    <div ref={root} className={s.veil} aria-hidden="true">
      <div className={s.fabric}>
        <div className={s.folds} />
        <div className={s.mesh} />
        <div className={s.hem} />
      </div>
      <div className={s.mark}>
        <img src="/brand/logo-teal.webp" alt="" width={480} height={254} className={s.logo} />
        <p className="eyebrow">Private atelier · Est. 2015</p>
      </div>
    </div>
  );
}
