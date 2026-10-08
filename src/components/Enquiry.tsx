"use client";

import { useState } from "react";
import { ThreadAnchor } from "./Thread";
import { site, whatsappLink } from "@/lib/site";
import s from "./Enquiry.module.css";

type Form = { bride: string; groom: string; date: string; outfits: string; style: string; place: string; phone: string };

const fmt = (v: string) => {
  const d = new Date(`${v}T00:00:00`);
  return isNaN(d.getTime()) ? "" : d.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
};

/**
 * The enquiry reads like a wedding card. On submit the card turns over into an
 * invitation, ready to send to Qura on WhatsApp or share with family.
 * TODO (phase 1b): also save the request to Supabase.
 */
export function Enquiry() {
  const [f, setF] = useState<Form>({ bride: "", groom: "", date: "", outfits: "both outfits", style: "not sure yet", place: "Selangor", phone: "" });
  const [done, setDone] = useState(false);
  const set = (k: keyof Form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => setF({ ...f, [k]: e.target.value });

  const names = [f.bride.trim(), f.groom.trim()].filter(Boolean).join(" & ");
  const message =
    `Assalamualaikum Qura, we'd like to request a consultation.\n\n` +
    `Names: ${names || "-"}\n` +
    `Nikah date: ${fmt(f.date) || "not set yet"}\n` +
    `Outfits: ${f.outfits}\n` +
    `Package: ${f.style}\n` +
    `Meet in: ${f.place}\n` +
    `WhatsApp: ${f.phone || "-"}`;

  const share = async () => {
    const data = { title: "Qura Couture", text: `${names}: our nikah outfits, designed as one.`, url: site.url };
    if (navigator.share) {
      try {
        await navigator.share(data);
      } catch {}
    } else {
      await navigator.clipboard?.writeText(`${data.text} ${data.url}`);
    }
  };

  return (
    <section id="enquire" className={s.section}>
      <ThreadAnchor x="calc(var(--gutter) * 0.5)" y="3%" mx="10px" my="2%" />
      <div className={`wrap ${s.head}`}>
        <p className="eyebrow" data-reveal>
          Begin here
        </p>
        <h2 className="display h2" data-reveal>
          Begin with a <em>consultation.</em>
        </h2>
        <p className="lede" data-reveal>
          We meet couples privately, by appointment, in Selangor and Johor Bahru. Fill in your card and we&rsquo;ll confirm your date
          within {site.replyTime}.
        </p>
      </div>

      {/* down the margin, under the card, then it signs */}
      <ThreadAnchor x="calc(var(--gutter) * 0.5)" y="calc(100% - 140px)" mx="10px" my="calc(100% - 100px)" />
      <ThreadAnchor x="calc(50% - 300px)" y="calc(100% - 92px)" mx="22%" my="calc(100% - 78px)" />
      <div className={s.scene}>
        <div className={s.card} data-flipped={done}>
          <form
            className={s.front}
            aria-hidden={done}
            inert={done}
            onSubmit={(e) => {
              e.preventDefault();
              setDone(true);
            }}
          >
            <img src="/brand/logo-teal.webp" alt="" width={480} height={254} className={s.logo} />
            <p className={s.cardEyebrow}>Request for an appointment</p>
            <p className={s.sentence}>
              We are{" "}
              <label className="sr-only" htmlFor="e-bride">
                Bride&rsquo;s name
              </label>
              <input id="e-bride" required placeholder="bride" value={f.bride} onChange={set("bride")} size={9} autoComplete="off" />{" "}
              &amp;{" "}
              <label className="sr-only" htmlFor="e-groom">
                Groom&rsquo;s name
              </label>
              <input id="e-groom" placeholder="groom" value={f.groom} onChange={set("groom")} size={9} autoComplete="off" />. Our nikah is on{" "}
              <label className="sr-only" htmlFor="e-date">
                Nikah date
              </label>
              <input id="e-date" type="date" value={f.date} onChange={set("date")} className={s.dateIn} />, and we would love{" "}
              <label className="sr-only" htmlFor="e-outfits">
                Outfits for
              </label>
              <select id="e-outfits" value={f.outfits} onChange={set("outfits")}>
                <option>both outfits</option>
                <option>the bride&rsquo;s outfit</option>
                <option>the groom&rsquo;s outfit</option>
              </select>{" "}
              in the{" "}
              <label className="sr-only" htmlFor="e-style">
                Package
              </label>
              <select id="e-style" value={f.style} onChange={set("style")}>
                <option value="not sure yet">package you recommend</option>
                <option value="Essential">Essential</option>
                <option value="Signature">Signature</option>
                <option value="Couture">Couture</option>
              </select>
              . We&rsquo;d like to meet in{" "}
              <label className="sr-only" htmlFor="e-place">
                Where to meet
              </label>
              <select id="e-place" value={f.place} onChange={set("place")}>
                <option>Selangor</option>
                <option>Johor Bahru</option>
              </select>
              . Reach us on WhatsApp at{" "}
              <label className="sr-only" htmlFor="e-phone">
                WhatsApp number
              </label>
              <input
                id="e-phone"
                type="tel"
                required
                inputMode="tel"
                placeholder="+60 or +65"
                value={f.phone}
                onChange={set("phone")}
                size={13}
                autoComplete="tel"
              />
              .
            </p>
            <button type="submit" className="btn">
              Prepare my card
            </button>
          </form>

          <div className={s.back} aria-hidden={!done} inert={!done} aria-live="polite">
            <img src="/brand/logo-teal.webp" alt="" width={480} height={254} className={s.logo} />
            <p className={s.cardEyebrow}>With love, from the atelier</p>
            <p className={s.names}>{names || "Your names"}</p>
            <p className={s.when}>{f.date ? `Nikah · ${fmt(f.date)}` : "Nikah date to be confirmed"}</p>
            <p className={s.when}>Consultation in {f.place}</p>
            <p className={s.backNote}>Your request is ready. Send it to us on WhatsApp and we&rsquo;ll reply to confirm your consultation.</p>
            <div className={s.backActions}>
              <a href={whatsappLink(message)} className="btn">
                Send on WhatsApp
              </a>
              <button type="button" className="btn btn-ghost" onClick={share}>
                Share our card
              </button>
            </div>
            <button type="button" className={s.edit} onClick={() => setDone(false)}>
              Edit details
            </button>
          </div>
        </div>
        <ThreadAnchor x="62%" y="calc(100% + 56px)" mx="56%" my="calc(100% + 46px)" kind="sign" />
      </div>
    </section>
  );
}
