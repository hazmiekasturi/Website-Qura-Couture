"use client";

import { useRef, useState } from "react";
import { Picture } from "./Picture";
import { ThreadAnchor } from "./Thread";
import { gsap, useGSAP, prefersReducedMotion } from "@/lib/motion";
import s from "./SketchToGown.module.css";

const CHAPTERS = [
  { no: "01", title: "The sketch", text: "Every commission begins with your story and her pencil." },
  { no: "02", title: "The making", text: "Lace placed by hand, beading stitched one sequin at a time." },
  { no: "03", title: "The day", text: "The drawing, made real, on the morning of your akad." },
];

/**
 * Scroll draws the designer's sketch onto paper, then the finished gown dissolves through it.
 */
export function SketchToGown() {
  const root = useRef<HTMLElement>(null);
  const [chapter, setChapter] = useState(0);

  useGSAP(
    () => {
      const frame = root.current!.querySelector<HTMLElement>(`.${s.frame}`)!;
      if (prefersReducedMotion()) {
        gsap.set(frame, { "--p": 1, "--q": 1 });
        setChapter(2);
        return;
      }
      gsap
        .timeline({
          defaults: { ease: "none" },
          scrollTrigger: {
            trigger: root.current,
            start: "top top",
            end: "bottom bottom",
            scrub: 0.8,
            onUpdate: (st) => setChapter(st.progress < 0.42 ? 0 : st.progress < 0.68 ? 1 : 2),
          },
        })
        .fromTo(frame, { "--p": 0 }, { "--p": 1, duration: 0.5 }, 0.02)
        .fromTo(frame, { "--q": 0 }, { "--q": 1, duration: 0.32, ease: "power1.inOut" }, 0.62)
        .fromTo(`.${s.paperNote}`, { autoAlpha: 1 }, { autoAlpha: 0, duration: 0.1 }, 0.64)
        .to({}, { duration: 0.06 });
    },
    { scope: root },
  );

  return (
    <section ref={root} className={`${s.section} on-dark`} data-thread-dark>
      <div className={s.sticky}>
        <div className={s.copy}>
          <p className="eyebrow">Artistry</p>
          <h2 className="display h2">
            From her pencil <em>to your akad.</em>
          </h2>
          <ol className={s.chapters}>
            {CHAPTERS.map((c, n) => (
              <li key={c.no} data-on={chapter === n}>
                <span className={s.no}>{c.no}</span>
                <span className={s.title}>{c.title}</span>
                <span className={s.text}>{c.text}</span>
              </li>
            ))}
          </ol>
        </div>

        <div className={s.frame}>
          <div className={s.paper} />
          <div className={s.sketch}>
            <Picture name="sketch" alt="" sizes="(min-width: 900px) 34vw, 70vw" />
          </div>
          <div className={s.photo}>
            <Picture
              name="sketch-photo"
              alt="The finished gown: a sequinned lace kurung, worn by the bride on her nikah day"
              sizes="(min-width: 900px) 34vw, 70vw"
            />
          </div>
          <span className={s.paperNote}>Sketch no. 01 · Qura atelier</span>
        </div>
      </div>

      <ThreadAnchor x="calc(var(--gutter) * 0.5)" y="3%" mx="10px" my="2%" />
      <ThreadAnchor x="calc(var(--gutter) * 0.5)" y="97%" mx="10px" my="98%" />
    </section>
  );
}
