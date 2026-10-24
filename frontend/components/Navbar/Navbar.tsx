
"use client";

import { useEffect, useState } from "react";
import Container from "react-bootstrap/Container";
import Nav from "react-bootstrap/Nav";
import Navbar from "react-bootstrap/Navbar";
import "./Navbar.css";

type Language = "EN" | "AR";

export default function KKNavbar() {
  const [scrolled, setScrolled] = useState(false);
  const [language, setLanguage] = useState<Language>("EN");

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 35);
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, {
      passive: true,
    });

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const isArabic = language === "AR";

  const links = isArabic
    ? [
        { label: "الرئيسية", href: "#home" },
        { label: "السياحة العلاجية", href: "#medical" },
        { label: "جولات كيرالا", href: "#tours" },
        { label: "قصتنا", href: "#about" },
      ]
    : [
        { label: "HOME", href: "#home" },
        { label: "MEDICAL TOURISM", href: "#medical" },
        { label: "KERALA TOURS", href: "#tours" },
        { label: "OUR STORY", href: "#about" },
      ];

  return (
    <Navbar
      expand="lg"
      variant="dark"
      className={`kk-navbar ${
        scrolled ? "kk-navbar-scrolled" : ""
      }`}
      dir={isArabic ? "rtl" : "ltr"}
    >
      <Container fluid className="kk-navbar-container">
        <Navbar.Brand href="#home" className="kk-brand">
          <span className="kk-brand-mark" aria-hidden="true">
            <span>KK</span>
          </span>

          <span className="kk-brand-copy">
            <strong>KK TRAVELS</strong>
            <small>
              {isArabic
                ? "رحلتك، رعايتنا"
                : "YOUR JOURNEY, OUR CARE"}
            </small>
          </span>
        </Navbar.Brand>

        <Navbar.Toggle
          aria-controls="kk-navbar-collapse"
          className="kk-toggler"
          aria-label="Toggle navigation"
        />

        <Navbar.Collapse id="kk-navbar-collapse">
          <Nav className="kk-nav-links mx-auto">
            {links.map((link, index) => (
              <Nav.Link
                key={link.href}
                href={link.href}
                className="kk-nav-link"
              >
                <span className="kk-link-index">
                  0{index + 1}
                </span>
                {link.label}
              </Nav.Link>
            ))}
          </Nav>

          <div className="kk-nav-actions">
            <div
              className="kk-language-switch"
              aria-label="Choose language"
            >
              <button
                type="button"
                className={!isArabic ? "active" : ""}
                aria-pressed={!isArabic}
                onClick={() => setLanguage("EN")}
              >
                EN
              </button>

              <span className="kk-language-divider" />

              <button
                type="button"
                className={isArabic ? "active" : ""}
                aria-pressed={isArabic}
                onClick={() => setLanguage("AR")}
              >
                عربي
              </button>
            </div>

            <a
              className="kk-contact-button"
              href="https://wa.me/"
              target="_blank"
              rel="noopener noreferrer"
            >
              <span className="kk-contact-copy">
                <small>
                  {isArabic ? "هل تخطط لرحلتك؟" : "PLAN YOUR JOURNEY"}
                </small>
                <strong>
                  {isArabic ? "تواصل معنا" : "LET'S TALK"}
                </strong>
              </span>

              <span className="kk-contact-arrow" aria-hidden="true">
                ↗
              </span>
            </a>
          </div>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}
