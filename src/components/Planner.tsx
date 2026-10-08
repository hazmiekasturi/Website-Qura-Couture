"use client";

import { useMemo, useState } from "react";
import { ThreadAnchor } from "./Thread";
import { useTodayISO } from "@/lib/hooks";
import { milestones, site, whatsappLink } from "@/lib/site";
import s from "./Planner.module.css";

const fmt = (d: Date) => d.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
const short = (d: Date) => d.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
const addDays = (d: Date, n: number) => {
  const x = new Date(d);
  x.setDate(x.getDate() + n);
  return x;
};
const ymd = (d: Date) =>
  `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, "0")}${String(d.getDate()).padStart(2, "0")}`;

function icsFile(dates: { label: string; note: string; date: Date }[], nikah: Date) {
  const stamp = new Date().toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
  const events = [...dates.map((d) => ({ ...d, label: `Qura Couture · ${d.label}` })), { label: "Our nikah", note: "", date: nikah }]
    .map(
      (e, i) =>
        `BEGIN:VEVENT\r\nUID:qura-${ymd(e.date)}-${i}@quracouture.com\r\nDTSTAMP:${stamp}\r\nDTSTART;VALUE=DATE:${ymd(e.date)}\r\nDTEND;VALUE=DATE:${ymd(addDays(e.date, 1))}\r\nSUMMARY:${e.label}\r\nDESCRIPTION:${e.note}\r\nEND:VEVENT`,
    )
    .join("\r\n");
  return `BEGIN:VCALENDAR\r\nVERSION:2.0\r\nPRODID:-//Qura Couture//Timeline//EN\r\nCALSCALE:GREGORIAN\r\n${events}\r\nEND:VCALENDAR\r\n`;
}

export function Planner() {
  const [value, setValue] = useState("");
  const minDate = useTodayISO() || undefined;
  const today = useMemo(() => (minDate ? new Date(`${minDate}T00:00:00`) : null), [minDate]);

  const plan = useMemo(() => {
    if (!value) return null;
    const nikah = new Date(`${value}T00:00:00`);
    if (isNaN(nikah.getTime())) return null;
    const start = addDays(nikah, -site.leadWeeks * 7);
    const dates = milestones.map((m) => ({ ...m, date: addDays(start, m.week * 7) }));
    const daysLeft = today ? Math.round((start.getTime() - today.getTime()) / 86400000) : 0;
    let msg: string;
    if (daysLeft < 0) msg = "Your nikah is less than 12 weeks away. Express service may still be possible at additional cost, so message us to check.";
    else if (daysLeft === 0) msg = "Today is the last day to book for the standard 12-week process.";
    else if (daysLeft < 14) msg = `Only ${daysLeft} day${daysLeft === 1 ? "" : "s"} left to book on the standard timeline.`;
    else msg = `You have about ${Math.floor(daysLeft / 7)} weeks to secure your slot on the standard timeline.`;
    return { nikah, start, dates, msg, late: daysLeft < 0 };
  }, [value, today]);

  const download = () => {
    if (!plan) return;
    const blob = new Blob([icsFile(plan.dates, plan.nikah)], { type: "text/calendar" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "qura-couture-timeline.ics";
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  };

  const wa = plan
    ? whatsappLink(
        `Assalamualaikum Qura, our nikah is on ${fmt(plan.nikah)}. We'd like to book a consultation${plan.late ? " and ask about express service" : ` before ${fmt(plan.start)}`}.`,
      )
    : whatsappLink("Assalamualaikum Qura, we'd like to book a consultation.");

  return (
    <section className={s.section} id="planner">
      <ThreadAnchor x="calc(var(--gutter) * 0.5)" y="3%" mx="10px" my="2%" />
      <div className={`wrap ${s.top}`}>
        <div className={s.intro}>
          <p className="eyebrow" data-reveal>
            The process
          </p>
          <h2 className="display h2" data-reveal>
            Your twelve weeks, <em>mapped.</em>
          </h2>
          <p className="lede" data-reveal>
            Five milestones from first conversation to collection. Tell us your nikah date and we&rsquo;ll draw your
            timeline, with the last day to book.
          </p>
        </div>

        <div className={s.form} data-reveal>
          <label htmlFor="nikah-date" className={s.label}>
            Your nikah date
          </label>
          <input id="nikah-date" type="date" min={minDate} value={value} onChange={(e) => setValue(e.target.value)} className={s.date} />
          <div className={s.result} data-has={!!plan} aria-live="polite">
            {plan ? (
              <>
                <span className={s.label}>{plan.late ? "Book as soon as you can" : "Book your consultation by"}</span>
                <span className={s.bookBy}>{fmt(plan.start)}</span>
                <span className={s.msg}>{plan.msg}</span>
              </>
            ) : (
              <span className={s.msg}>Choose a date to see your personal timeline.</span>
            )}
          </div>
        </div>
      </div>

      <div className="wrap">
        <ol className={s.line} data-has={!!plan}>
          {(plan?.dates ?? milestones.map((m) => ({ ...m, date: null as Date | null }))).map((m, i) => (
            <li key={m.key} style={{ "--i": i } as React.CSSProperties}>
              <span className={s.node} aria-hidden="true" />
              <span className={s.week}>{m.date ? short(m.date) : `Week ${m.week}`}</span>
              <span className={s.mLabel}>{m.label}</span>
              <span className={s.mNote}>{m.note}</span>
            </li>
          ))}
        </ol>

        <div className={s.actions}>
          <a href={wa} className="btn">
            <svg viewBox="0 0 24 24" aria-hidden="true" className={s.icon}>
              <path d="M4 20l1.3-3.9A8 8 0 1 1 8 19z" />
            </svg>
            {plan ? "Send my date on WhatsApp" : "Ask on WhatsApp"}
          </a>
          {plan && (
            <button type="button" className="btn btn-ghost" onClick={download}>
              Add to my calendar
            </button>
          )}
        </div>

        <p className={s.notes}>
          A {site.depositPct}% deposit secures your slot; the balance is settled before collection. Need it sooner? Express
          service is available at additional cost. <strong>Travelling from Singapore?</strong> We plan your fittings to keep
          trips to Puchong to a minimum.
        </p>
      </div>
      <ThreadAnchor x="calc(var(--gutter) * 0.5)" y="99%" mx="10px" my="99%" />
    </section>
  );
}
