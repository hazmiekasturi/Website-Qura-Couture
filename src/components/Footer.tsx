import { site, whatsappLink } from "@/lib/site";
import s from "./Footer.module.css";

export function Footer() {
  return (
    <footer className={`${s.footer} on-dark`} data-thread-dark>
      <div className={`wrap ${s.top}`}>
        <p className={s.line}>
          Designed <em>as one.</em>
        </p>
        <a href="#enquire" className="btn btn-light">
          Book a consultation
        </a>
      </div>
      <div className={`wrap ${s.cols}`}>
        <img src="/brand/logo-ivory.webp" alt="Qura Couture" width={480} height={254} className={s.logo} />
        <div>
          <p className="eyebrow">Visit</p>
          <p>
            Private atelier, Selangor
            <br />
            Appointments in Johor Bahru
            <br />
            By appointment only
          </p>
        </div>
        <div>
          <p className="eyebrow">Explore</p>
          <p>
            <a href="#edit">The edit</a>
            <br />
            <a href="#atelier">The atelier</a>
            <br />
            <a href="#packages">Packages</a>
          </p>
        </div>
        <div>
          <p className="eyebrow">Follow</p>
          <p>
            <a href={site.instagram}>Instagram @quracouture</a>
            <br />
            <a href={site.facebook}>Facebook</a>
            <br />
            <a href={whatsappLink("Assalamualaikum Qura,")}>WhatsApp</a>
          </p>
        </div>
      </div>
      <p className={`wrap ${s.about}`}>
        Custom baju nikah, wedding gowns and matching Baju Melayu, made to measure for the bride and groom at our private
        bridal atelier in Selangor, with appointments in Johor Bahru. Welcoming couples from Kuala Lumpur, Cyberjaya, Johor and Singapore.
      </p>
      <div className={`wrap ${s.base}`}>
        <span>© Qura Couture</span>
        <span>Est. 2015 · Mersing · Johor Bahru · Selangor</span>
      </div>
    </footer>
  );
}
