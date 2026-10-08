"use client";

import { useEffect, useRef, useState } from "react";
import { site, whatsappLink } from "@/lib/site";
import s from "./Header.module.css";

const NAV = [
  { href: "#signature", label: "The Signature" },
  { href: "#edit", label: "The Edit" },
  { href: "#atelier", label: "Atelier" },
  { href: "#couples", label: "Real Couples" },
  { href: "#packages", label: "Packages" },
];

export function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [open, setOpen] = useState(false);
  const lastY = useRef(0);

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      setScrolled(y > 24);
      const goingDown = y > lastY.current + 4;
      const goingUp = y < lastY.current - 4;
      if (goingDown && y > window.innerHeight * 0.6) setHidden(true);
      else if (goingUp) setHidden(false);
      lastY.current = y;
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const html = document.documentElement;
    html.classList.toggle("menu-open", open);
    if (open) window.__lenis?.stop();
    else window.__lenis?.start();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <>
      <header className={s.header} data-scrolled={scrolled} data-hidden={hidden && !open} data-open={open}>
        <a href="#top" className={s.brand} aria-label="Qura Couture, back to top" onClick={() => setOpen(false)}>
          <img src="/brand/logo-teal.webp" alt="Qura Couture" width={480} height={254} />
        </a>
        <nav aria-label="Main" className={s.nav}>
          {NAV.map((n) => (
            <a key={n.href} href={n.href}>
              {n.label}
            </a>
          ))}
        </nav>
        <a href="#enquire" className={`btn ${s.cta}`}>
          Book a consultation
        </a>
        <button
          type="button"
          className={s.menuBtn}
          aria-expanded={open}
          aria-controls="menu"
          onClick={() => setOpen((v) => !v)}
        >
          <span>{open ? "Close" : "Menu"}</span>
          <i aria-hidden="true" />
        </button>
      </header>

      <div id="menu" className={s.menu} data-open={open} aria-hidden={!open} inert={!open}>
        <nav aria-label="Menu" className={s.menuNav}>
          {NAV.map((n, i) => (
            <a key={n.href} href={n.href} onClick={() => setOpen(false)} style={{ "--i": i } as React.CSSProperties}>
              <span className={s.num}>{String(i + 1).padStart(2, "0")}</span>
              {n.label}
            </a>
          ))}
        </nav>
        <div className={s.menuFoot}>
          <a href="#enquire" className="btn" onClick={() => setOpen(false)}>
            Book a consultation
          </a>
          <div className={s.menuLinks}>
            <a href={whatsappLink("Assalamualaikum Qura, I'd like to ask about a consultation.")}>WhatsApp</a>
            <a href={site.instagram}>Instagram</a>
          </div>
          <p className={s.menuNote}>{site.location}</p>
        </div>
      </div>
    </>
  );
}
