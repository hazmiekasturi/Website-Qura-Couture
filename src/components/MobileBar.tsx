"use client";

import { useEffect, useState } from "react";
import { whatsappLink } from "@/lib/site";
import s from "./MobileBar.module.css";

/**
 * Phones and tablets: a booking bar that stays put once you're past the hero.
 * It steps aside where it would duplicate or cover something: the enquiry card,
 * the footer, and while a form field is focused (so it never rides on the keyboard).
 */
export function MobileBar() {
  const [pastHero, setPastHero] = useState(false);
  const [covered, setCovered] = useState(false);
  const [typing, setTyping] = useState(false);

  useEffect(() => {
    const onScroll = () => setPastHero(window.scrollY > window.innerHeight * 0.75);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });

    const inView = new Set<Element>();
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => (e.isIntersecting ? inView.add(e.target) : inView.delete(e.target)));
        setCovered(inView.size > 0);
      },
      { rootMargin: "0px 0px -15% 0px" },
    );
    [document.getElementById("enquire"), document.getElementById("site-footer")].forEach((el) => el && io.observe(el));

    // Only fields that raise the on-screen keyboard; date pickers and selects keep focus after use.
    const isField = (t: EventTarget | null) =>
      t instanceof HTMLElement && t.matches("textarea, input:is([type=text], [type=tel], [type=email], :not([type]))");
    const onFocusIn = (e: FocusEvent) => isField(e.target) && setTyping(true);
    const onFocusOut = (e: FocusEvent) => isField(e.target) && setTyping(false);
    document.addEventListener("focusin", onFocusIn);
    document.addEventListener("focusout", onFocusOut);

    return () => {
      window.removeEventListener("scroll", onScroll);
      io.disconnect();
      document.removeEventListener("focusin", onFocusIn);
      document.removeEventListener("focusout", onFocusOut);
    };
  }, []);

  const show = pastHero && !covered && !typing;

  return (
    <div className={s.bar} data-show={show} inert={!show}>
      <a href="#enquire" className={`btn ${s.book}`}>
        Book a consultation
      </a>
      <a
        href={whatsappLink("Assalamualaikum Qura, I'd like to ask about a consultation.")}
        className={s.wa}
        aria-label="Message Qura on WhatsApp"
      >
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M4 20l1.3-3.9A8 8 0 1 1 8 19z" />
          <path d="M9.2 9.3c.3 1.6 1.7 3.6 3.6 4.5l1-1 1.7.8-.3 1.3c-3.2.3-6.7-3.2-6.5-6.4l1.3-.3.8 1.7z" />
        </svg>
      </a>
    </div>
  );
}
