import Image from "next/image";
import Link from "next/link";

type KKNavbarProps = {
  isHome?: boolean;
};

export default function KKNavbar({ isHome = false }: KKNavbarProps) {
  const homeHref = isHome ? "#home" : "/#home";
  const aboutHref = isHome ? "#about" : "/#about";
  const medicalHref = isHome ? "#medical" : "/#medical";
  const toursHref = isHome ? "#tours" : "/#tours";
  const processHref = isHome ? "#how-it-works" : "/#how-it-works";

  return (
    <header className="site-header">
      <Link className="site-brand" href={homeHref} aria-label="KK Travels home">
        <Image
          className="brand-logo"
          src="/logo/KK Travels — Logo.svg"
          alt=""
          width={40}
          height={31}
          aria-hidden="true"
        />
        <span>KK Travels</span>
      </Link>

      <nav className="desktop-nav" aria-label="Main navigation">
        <Link href={aboutHref}>About</Link>
        <Link href={medicalHref}>Medical travel</Link>
        <Link href={toursHref}>Kerala tourism</Link>
      </nav>

      <div className="header-actions">
        <Link className="nav-contact-link" href="/contact">
          Plan your journey <span aria-hidden="true">↗</span>
        </Link>
        <details className="menu-details">
          <summary aria-label="Toggle navigation menu">
            <span />
            <span />
          </summary>
          <nav className="menu-panel" aria-label="More navigation">
            <Link href={aboutHref}>Our story</Link>
            <Link href={processHref}>Our process</Link>
            <Link href={toursHref}>Kerala journeys</Link>
            <Link href={medicalHref}>Medical services</Link>
            <Link href="/contact">Contact</Link>
          </nav>
        </details>
      </div>
    </header>
  );
}
