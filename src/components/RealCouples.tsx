"use client";

import { useEffect, useRef } from "react";
import { Picture, type ImageName } from "./Picture";
import { ThreadAnchor } from "./Thread";
import { gsap, useGSAP, prefersReducedMotion } from "@/lib/motion";
import s from "./RealCouples.module.css";

// Quotes are from the brides' own WhatsApp messages (emoji dropped, wording kept).
const COUPLES: { image: ImageName; alt: string; quote: string; names: string; event: string }[] = [
  {
    image: "couple-night",
    alt: "A couple walking in at night in matching white outfits under hanging lights",
    quote: "Thank you so so much for making my dream dress come true… exactly how I imagined and drew.",
    names: "Thanu",
    event: "Nikah & Sanding · 2026",
  },
  {
    image: "couple-veil",
    alt: "A couple with a cathedral veil embroidered with their names",
    quote: "Thank you kak, buatkan baju cantik.",
    names: "Aaliyah Zayan",
    event: "Nikah · 2025",
  },
  {
    image: "couple-seated",
    alt: "A couple seated hand in hand at their nikah, surrounded by white flowers",
    quote: "MashaAllah, thank you kakkkk for making my dreamy dress.",
    names: "Zana",
    event: "Nikah · 2026",
  },
];

// Real WhatsApp messages, retyped as sent.
const MESSAGES = [
  {
    text: "Alhamdulillah my Nikah and everything went well.. Thank you so so much! For making my dream dress come true... I appreciate it so much, sebab memang dapat dress exactly how I imagined and drew.. Semua orang kata I look like a princess..🥹 the dress was really beautiful.. thank you so so much!",
    from: "Thanu · Nikah & Sanding, 2026",
  },
  { text: "Nak cakap terima kasihhh buat baju sayaa cantik cantikkk tak puas pakai 🥹🥹🥹", from: "Syazwani" },
  {
    text: "Terima kasih banyak zera. It turned out to be beautiful wedding outfit. We love it. Will be sealed in our memories.",
    from: "Joyrda",
  },
  { text: "Akak!!! Cantiknyeeee! Sukaaaa lah", from: "Alya Shiffa" },
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
