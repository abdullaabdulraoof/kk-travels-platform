import Image from "next/image";
import Link from "next/link";
import { contactDetails } from "@/lib/contact-config";

type SiteFooterProps = {
  isHome?: boolean;
};

export default function SiteFooter({ isHome = false }: SiteFooterProps) {
  const aboutHref = isHome ? "#about" : "/#about";
  const processHref = isHome ? "#how-it-works" : "/#how-it-works";
  const medicalHref = isHome ? "#medical" : "/#medical";
  const toursHref = isHome ? "#tours" : "/#tours";

  return (
    <footer className="site-footer" id={isHome ? "footer" : undefined}>
      <div className="footer-main">
        <div className="footer-about">
          <Link className="footer-brand" href={isHome ? "#home" : "/#home"}>
            <Image
              className="brand-logo"
              src="/logo/KK Travels — Logo.svg"
              alt=""
              width={30}
              height={24}
              aria-hidden="true"
            />
            <span>KK Travels</span>
          </Link>
          <p>
            Your trusted partner for medical travel and tourism coordination
            between the GCC and India.
          </p>
        </div>

        <div className="footer-column">
          <h2>Company</h2>
          <Link href={aboutHref}>About us</Link>
          <Link href={processHref}>Our process</Link>
          <Link href="/contact">Contact us</Link>
        </div>

        <div className="footer-column">
          <h2>Services</h2>
          <Link href={medicalHref}>Medical travel</Link>
          <Link href={toursHref}>Kerala tourism</Link>
          <Link href={toursHref}>Custom journeys</Link>
        </div>

        <div className="footer-column footer-contact">
          <h2>Contact</h2>
          {contactDetails.email ? (
            <a href={`mailto:${contactDetails.email}`}>{contactDetails.email}</a>
          ) : (
            <p>Business email not configured</p>
          )}
          {contactDetails.phone ? (
            <a href={`tel:${contactDetails.phone}`}>{contactDetails.phone}</a>
          ) : (
            <p>Business phone not configured</p>
          )}
          <span>Kerala, India</span>
        </div>
      </div>

      <div className="footer-bottom">
        <p>© KK Travels. All rights reserved.</p>
        <div>
          <Link href={isHome ? "#footer" : "/#footer"}>Privacy policy</Link>
          <Link href={isHome ? "#footer" : "/#footer"}>Terms of service</Link>
        </div>
      </div>
    </footer>
  );
}
