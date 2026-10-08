"use client";

import { useEffect, useRef } from "react";
import { ScrollTrigger, prefersReducedMotion } from "@/lib/motion";
import s from "./Thread.module.css";

type Pt = { x: number; y: number };

/**
 * Anchor point the thread passes through. Positions are CSS lengths relative to the
 * nearest positioned ancestor: (x, y) on desktop, (mx, my) below 900px.
 * kind "loop" ties a small stitch loop; "sign" ends the thread in a signature flourish.
 */
export function ThreadAnchor({
  x,
  y,
  mx,
  my,
  kind,
  mkind,
  r,
}: {
  x: string;
  y: string;
  mx?: string;
  my?: string;
  kind?: "loop" | "sign" | "pt";
  /** kind below 900px; defaults to kind */
  mkind?: "loop" | "sign" | "pt";
  r?: number;
}) {
  return (
    <span
      aria-hidden="true"
      className={s.anchor}
      data-thread={kind ?? "pt"}
      data-thread-m={mkind ?? kind ?? "pt"}
      data-r={r}
      style={{ "--x": x, "--y": y, "--mx": mx ?? x, "--my": my ?? y } as React.CSSProperties}
    />
  );
}

// Catmull-Rom spline through points, as cubic Béziers.
function spline(pts: Pt[]) {
  if (pts.length < 2) return "";
  let d = `M${pts[0].x.toFixed(1)},${pts[0].y.toFixed(1)}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] ?? pts[i];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[i + 2] ?? p2;
    // Tangents are capped to a third of the segment so uneven spacing never overshoots backwards.
    const seg = Math.hypot(p2.x - p1.x, p2.y - p1.y);
    const cap = (dx: number, dy: number) => {
      const m = Math.hypot(dx, dy) / 6;
      const k = m > seg / 3 && m > 0 ? seg / 3 / m : 1;
      return { x: (dx / 6) * k, y: (dy / 6) * k };
    };
    const t1 = cap(p2.x - p0.x, p2.y - p0.y);
    const t2 = cap(p3.x - p1.x, p3.y - p1.y);
    const c1 = { x: p1.x + t1.x, y: p1.y + t1.y };
    const c2 = { x: p2.x - t2.x, y: p2.y - t2.y };
    d += ` C${c1.x.toFixed(1)},${c1.y.toFixed(1)} ${c2.x.toFixed(1)},${c2.y.toFixed(1)} ${p2.x.toFixed(1)},${p2.y.toFixed(1)}`;
  }
  return d;
}

function loopPoints(c: Pt, r: number, from: Pt | undefined): Pt[] {
  // Enter on the side facing the previous point, travel once around, exit downward.
  const start = from ? Math.atan2(from.y - c.y, from.x - c.x) : Math.PI;
  const out: Pt[] = [];
  const steps = 10;
  for (let i = 0; i <= steps; i++) {
    const a = start + (i / steps) * Math.PI * 2;
    // slight spiral so the loop reads as a hand-tied stitch, not a perfect circle
    const rr = r * (1 - 0.12 * Math.sin((i / steps) * Math.PI));
    out.push({ x: c.x + Math.cos(a) * rr, y: c.y + Math.sin(a) * rr * 0.86 });
  }
  return out;
}

function signPoints(c: Pt, w: number): Pt[] {
  // A loose cursive flourish: a loop, a dip, and a long tapering tail.
  const u = w / 10;
  return [
    { x: c.x - 3 * u, y: c.y },
    { x: c.x - 1.6 * u, y: c.y - 1.4 * u },
    { x: c.x - 0.6 * u, y: c.y - 0.2 * u },
    { x: c.x - 1.8 * u, y: c.y + 0.5 * u },
    { x: c.x - 0.4 * u, y: c.y + 0.3 * u },
    { x: c.x + 1.2 * u, y: c.y - 0.9 * u },
    { x: c.x + 1.6 * u, y: c.y + 0.4 * u },
    { x: c.x + 3.4 * u, y: c.y - 0.2 * u },
    { x: c.x + 6 * u, y: c.y - 0.5 * u },
  ];
}

export function Thread() {
  const svgRef = useRef<SVGSVGElement>(null);
  const pathRef = useRef<SVGPathElement>(null);
  const tipRef = useRef<SVGCircleElement>(null);
  const gradRef = useRef<SVGLinearGradientElement>(null);

  useEffect(() => {
    const svg = svgRef.current!;
    const path = pathRef.current!;
    const tip = tipRef.current!;
    const grad = gradRef.current!;
    const host = svg.parentElement as HTMLElement;
    const reduced = prefersReducedMotion();

    let total = 0;
    let lens: number[] = [];
    let maxYs: number[] = [];
    let hostTop = 0;
    let current = 0;
    let raf = 0;
    let lastDrawn = -1;

    const build = () => {
      const hr = host.getBoundingClientRect();
      hostTop = hr.top + window.scrollY;
      const W = host.offsetWidth;
      const H = host.offsetHeight;
      svg.setAttribute("viewBox", `0 0 ${W} ${H}`);
      svg.setAttribute("width", String(W));
      svg.setAttribute("height", String(H));

      const pts: Pt[] = [];
      const mobile = window.innerWidth < 900;
      host.querySelectorAll<HTMLElement>("[data-thread]").forEach((el) => {
        if (!el.offsetParent && getComputedStyle(el).position !== "fixed") return;
        const r = el.getBoundingClientRect();
        const c = { x: r.left - hr.left, y: r.top - hr.top };
        const kind = mobile ? el.dataset.threadM : el.dataset.thread;
        if (kind === "loop") pts.push(...loopPoints(c, Number(el.dataset.r) || 26, pts[pts.length - 1]));
        else if (kind === "sign") pts.push(...signPoints(c, Math.min(W * 0.5, 260)));
        else pts.push(c);
      });
      path.setAttribute("d", spline(pts));
      total = path.getTotalLength();
      path.style.strokeDasharray = `${total} ${total}`;

      // Sample length → running max y, so the tip can follow the scroll position.
      lens = [];
      maxYs = [];
      let my = -Infinity;
      const step = 10;
      for (let l = 0; l <= total; l += step) {
        my = Math.max(my, path.getPointAtLength(l).y);
        lens.push(l);
        maxYs.push(my);
      }

      // Thread turns champagne over the dark sections.
      grad.setAttribute("y2", String(H));
      const stops: string[] = [];
      const pct = (y: number) => `${((y / H) * 100).toFixed(3)}%`;
      host.querySelectorAll<HTMLElement>("[data-thread-dark]").forEach((el) => {
        const r = el.getBoundingClientRect();
        const a = r.top - hr.top;
        const b = r.bottom - hr.top;
        stops.push(
          `<stop offset="${pct(a - 1)}" stop-color="var(--thread)"/>`,
          `<stop offset="${pct(a)}" stop-color="var(--thread-dark)"/>`,
          `<stop offset="${pct(b)}" stop-color="var(--thread-dark)"/>`,
          `<stop offset="${pct(b + 1)}" stop-color="var(--thread)"/>`,
        );
      });
      grad.innerHTML = `<stop offset="0" stop-color="var(--thread)"/>${stops.join("")}<stop offset="1" stop-color="var(--thread)"/>`;
      lastDrawn = -1;
      if (reduced) draw(total);
    };

    const targetLength = () => {
      const y = window.scrollY - hostTop + window.innerHeight * 0.64;
      let lo = 0;
      let hi = maxYs.length - 1;
      if (hi < 0) return 0;
      while (lo < hi) {
        const mid = (lo + hi + 1) >> 1;
        if (maxYs[mid] <= y) lo = mid;
        else hi = mid - 1;
      }
      return lens[lo];
    };

    const draw = (len: number) => {
      if (Math.abs(len - lastDrawn) < 0.4) return;
      lastDrawn = len;
      path.style.strokeDashoffset = String(total - len);
      const p = path.getPointAtLength(Math.max(0, len));
      tip.setAttribute("cx", p.x.toFixed(1));
      tip.setAttribute("cy", p.y.toFixed(1));
      tip.style.opacity = len > 4 && len < total - 4 ? "1" : "0";
    };

    const tick = () => {
      const t = targetLength();
      current += (t - current) * 0.09;
      draw(current);
      raf = requestAnimationFrame(tick);
    };

    let timer: ReturnType<typeof setTimeout>;
    const rebuild = () => {
      clearTimeout(timer);
      timer = setTimeout(build, 120);
    };

    build();
    if (!reduced) raf = requestAnimationFrame(tick);
    const ro = new ResizeObserver(rebuild);
    ro.observe(host);
    window.addEventListener("load", rebuild);
    ScrollTrigger.addEventListener("refresh", rebuild);
    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(timer);
      ro.disconnect();
      window.removeEventListener("load", rebuild);
      ScrollTrigger.removeEventListener("refresh", rebuild);
    };
  }, []);

  return (
    <svg ref={svgRef} className={s.thread} aria-hidden="true" focusable="false">
      <defs>
        <linearGradient ref={gradRef} id="thread-grad" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="0" y2="1" />
      </defs>
      <path ref={pathRef} className={s.path} stroke="url(#thread-grad)" />
      <circle ref={tipRef} className={s.tip} r="2.4" />
    </svg>
  );
}
