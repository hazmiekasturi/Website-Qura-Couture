"use client";

import { useEffect, useRef, useState } from "react";
import { whatsappLink } from "@/lib/site";
import s from "./MobileBar.module.css";

/** Phones and tablets: a slim booking bar. Appears after the hero, steps aside while scrolling down. */
export function MobileBar() {
  const [show, setShow] = useState(false);
  const last = useRef(0);

  useEffect(() => {
    let atEnquiry = false;
    const target = document.getElementById("enquire");
    const io = new IntersectionObserver(([e]) => {
      atEnquiry = e.isIntersecting;
      if (atEnquiry) setShow(false);
    });
    if (target) io.observe(target);

    const onScroll = () => {
      const y = window.scrollY;
      const pastHero = y > window.innerHeight * 0.9;
      if (!pastHero || atEnquiry) setShow(false);
      else if (y < last.current - 6) setShow(true);
      else if (y > last.current + 6) setShow(false);
      last.current = y;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      io.disconnect();
    };
  }, []);

  return (
    <div className={s.bar} data-show={show}>
      <a href="#enquire" className={`btn ${s.book}`} tabIndex={show ? 0 : -1}>
        Book a consultation
      </a>
      <a
        href={whatsappLink("Assalamualaikum Qura, I'd like to ask about a consultation.")}
        className={s.wa}
        aria-label="Message Qura on WhatsApp"
        tabIndex={show ? 0 : -1}
      >
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M4 20l1.3-3.9A8 8 0 1 1 8 19z" />
          <path d="M9.2 9.3c.3 1.6 1.7 3.6 3.6 4.5l1-1 1.7.8-.3 1.3c-3.2.3-6.7-3.2-6.5-6.4l1.3-.3.8 1.7z" />
        </svg>
      </a>
    </div>
  );
}
