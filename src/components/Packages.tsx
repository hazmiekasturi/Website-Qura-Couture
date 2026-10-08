"use client";

import { useRef } from "react";
import { Picture } from "./Picture";
import { ThreadAnchor } from "./Thread";
import { packages, site, formatRM } from "@/lib/site";
import { gsap, useGSAP, prefersReducedMotion } from "@/lib/motion";
import s from "./Packages.module.css";

/** Stacking cards: each package sticks, and the next slides over it like a layer of fabric. */
export function Packages() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      if (prefersReducedMotion()) return;
      const cards = gsap.utils.toArray<HTMLElement>(`.${s.card}`);
      cards.forEach((card, i) => {
        const next = cards[i + 1];
        if (!next) return;
        gsap.to(card.querySelector(`.${s.inner}`), {
          scale: 0.95,
          ease: "none",
          scrollTrigger: { trigger: next, start: "top bottom", end: "top 20%", scrub: true },
        });
      });
    },
    { scope: root },
  );

  return (
    <section ref={root} id="packages" className={s.section}>
      <ThreadAnchor x="calc(var(--gutter) * 0.5)" y="1%" mx="10px" my="1%" />
      <div className={`wrap ${s.head}`}>
        <p className="eyebrow" data-reveal>
          Packages
        </p>
        <h2 className="display h2" data-reveal>
          For the bride and groom, <em>together.</em>
        </h2>
        <p className="lede" data-reveal>
          Every package includes a custom nikah outfit for her and a custom Baju Melayu for him.
        </p>
      </div>

      <div className={`wrap ${s.stack}`}>
        {packages.map((p, i) => (
          <article key={p.id} className={s.card} data-tone={p.id} style={{ "--i": i } as React.CSSProperties}>
            <div className={`${s.inner} ${p.id !== "essential" ? "on-dark" : ""}`}>
              <div className={s.media}>
                <Picture name={p.image} alt="" sizes="(min-width: 900px) 40vw, 100vw" />
              </div>
              <div className={s.body}>
                <p className="eyebrow">
                  {String(i + 1).padStart(2, "0")} · {p.name}
                </p>
                <p className={s.price}>
                  <span className={s.from}>from</span> {formatRM(p.from)}
                  {site.myrPerSgd && <span className={s.sgd}>≈ S${Math.round(p.from / site.myrPerSgd).toLocaleString("en-SG")}</span>}
                </p>
                <ul>
                  {p.lines.map((l) => (
                    <li key={l}>{l}</li>
                  ))}
                </ul>
                <a href="#enquire" className={`btn ${p.id === "essential" ? "btn-ghost" : "btn-light"}`}>
                  {p.id === "couture" ? "Book a couture consultation" : `Ask about ${p.name}`}
                </a>
              </div>
            </div>
          </article>
        ))}
      </div>

      <p className={`wrap ${s.fine}`}>
        Prices are for the bride &amp; groom set. Sampin available on request. Full details are shared at your consultation.
        A {site.depositPct}% deposit secures your slot.
      </p>
      <ThreadAnchor x="calc(var(--gutter) * 0.5)" y="99%" mx="10px" my="99%" />
    </section>
  );
}
