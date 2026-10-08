"use client";

import { useEffect, useRef } from "react";
import { Picture, type ImageName } from "./Picture";
import { ThreadAnchor } from "./Thread";
import { gsap, useGSAP, prefersReducedMotion } from "@/lib/motion";
import s from "./RealCouples.module.css";

// TODO: replace placeholders with real couples (first names, event, month, one line from their message).
const COUPLES: { image: ImageName; alt: string; quote: string; names: string; event: string }[] = [
  {
    image: "couple-night",
    alt: "A couple walking in at night in matching white outfits under hanging lights",
    quote: "[One line from their message to Qura]",
    names: "[Bride & Groom]",
    event: "Nikah · [Month Year]",
  },
  {
    image: "couple-veil",
    alt: "A couple with a cathedral veil embroidered with their names",
    quote: "[One line from their message to Qura]",
    names: "[Bride & Groom]",
    event: "Sanding · [Month Year]",
  },
  {
    image: "couple-seated",
    alt: "A couple seated hand in hand at their nikah, surrounded by white flowers",
    quote: "[One line from their message to Qura]",
    names: "[Bride & Groom]",
    event: "Nikah · [Month Year]",
  },
];

// TODO: retype real WhatsApp messages (with permission), first names only.
const MESSAGES = [
  { text: "[A thank-you message after the nikah]", from: "[Bride] · Nikah, [Month Year]" },
  { text: "[A message about the fitting or the fabric]", from: "[Bride] · [Month Year]" },
  { text: "[A message from a groom]", from: "[Groom] · [Month Year]" },
  { text: "[A message from a mother of the bride]", from: "[Name] · [Month Year]" },
];

export function RealCouples() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      if (prefersReducedMotion()) return;
      gsap.utils.toArray<HTMLElement>(`.${s.panel}`).forEach((p) => {
        gsap.fromTo(
          p.querySelector("img"),
          { scale: 1.12 },
          { scale: 1, ease: "none", scrollTrigger: { trigger: p, start: "top bottom", end: "bottom top", scrub: true } },
        );
      });
    },
    { scope: root },
  );

  // Messages "arrive" one by one: typing dots, then the text.
  useEffect(() => {
    const bubbles = root.current!.querySelectorAll<HTMLElement>(`.${s.msg}`);
    const reduced = prefersReducedMotion();
    const timers: ReturnType<typeof setTimeout>[] = [];
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (!e.isIntersecting) return;
          const el = e.target as HTMLElement;
          io.unobserve(el);
          if (reduced) {
            el.dataset.state = "shown";
            return;
          }
          el.dataset.state = "typing";
          timers.push(setTimeout(() => (el.dataset.state = "shown"), 900));
        });
      },
      { rootMargin: "0px 0px -18% 0px" },
    );
    bubbles.forEach((b) => io.observe(b));
    return () => {
      io.disconnect();
      timers.forEach(clearTimeout);
    };
  }, []);

  return (
    <section ref={root} id="couples" className={s.section}>
      <ThreadAnchor x="calc(var(--gutter) * 0.5)" y="1%" mx="10px" my="1%" />
      <div className={`wrap ${s.head}`}>
        <p className="eyebrow" data-reveal>
          Real couples
        </p>
        <h2 className="display h2" data-reveal>
          In their <em>own words.</em>
        </h2>
      </div>

      {COUPLES.map((c, i) => (
        <article key={c.image} className={`${s.panel} grain`} data-align={i % 2 ? "right" : "left"} data-thread-dark>
          <div className={s.media}>
            <Picture name={c.image} alt={c.alt} sizes="100vw" />
          </div>
          <div className={s.overlay}>
            <blockquote className={s.quote} data-reveal>
              <p>&ldquo;{c.quote}&rdquo;</p>
              <footer>
                <span className={s.names}>{c.names}</span>
                <span className={s.event}>{c.event}</span>
              </footer>
            </blockquote>
          </div>
        </article>
      ))}

      <div className={`wrap ${s.chat}`}>
        <div className={s.chatHead}>
          <h3 className="display h3" data-reveal>
            And the messages <em>we keep.</em>
          </h3>
          <p className="lede" data-reveal>
            A few of the notes couples send us after the day. Shared with their permission.
          </p>
        </div>
        <ol className={s.thread}>
          {MESSAGES.map((m, i) => (
            <li key={i} className={s.msg} data-state="idle" data-side={i % 2 ? "out" : "in"}>
              <span className={s.dots} aria-hidden="true">
                <i />
                <i />
                <i />
              </span>
              <span className={s.bubble}>
                {m.text}
                <small>{m.from}</small>
              </span>
            </li>
          ))}
        </ol>
      </div>
      <ThreadAnchor x="calc(var(--gutter) * 0.5)" y="99%" mx="10px" my="99%" />
    </section>
  );
}
