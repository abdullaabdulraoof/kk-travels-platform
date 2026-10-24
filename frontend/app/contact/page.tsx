import type { Metadata } from "next";
import Image from "next/image";
import {
  ArrowDown,
  ArrowUpRight,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
} from "lucide-react";
import ContactEnquiryForm from "@/components/ContactEnquiryForm";
import ContactReveal from "@/components/ContactReveal";
import KKNavbar from "@/components/Navbar/Navbar";
import SiteFooter from "@/components/SiteFooter";
import { contactDetails } from "@/lib/contact-config";

export const metadata: Metadata = {
  title: "Contact KK Travels | Plan your Kerala journey",
  description:
    "Talk with KK Travels about medical travel coordination or a personalized Kerala journey.",
};

const whatsappLink = contactDetails.whatsappNumber
  ? `https://wa.me/${contactDetails.whatsappNumber}?text=${encodeURIComponent(
      "Hello KK Travels, I would like to ask about planning a journey.",
    )}`
  : null;

export default function ContactPage() {
  return (
    <>
      <main className="contact-page">
        <section className="contact-hero" aria-labelledby="contact-title">
          <Image
            className="contact-hero-image"
            src="/story/story-2.webp"
            alt=""
            fill
            priority
            sizes="100vw"
          />
          <div className="contact-hero-shade" aria-hidden="true" />
          <KKNavbar />

          <div className="contact-hero-content">
            <p className="contact-eyebrow">A thoughtful first step</p>
            <h1 id="contact-title">
              Let’s plan a journey
              <br />
              that feels <em>right for you.</em>
            </h1>
            <p>
              Tell us what you need. We’ll help you explore the next steps for
              medical travel or a Kerala experience, with personal guidance
              throughout.
            </p>
            <div className="contact-hero-actions">
              <a className="contact-button contact-button--light" href="#enquiry-form">
                Share your plans <ArrowDown aria-hidden="true" size={16} />
              </a>
              {whatsappLink ? (
                <a
                  className="contact-hero-secondary"
                  href={whatsappLink}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <MessageCircle aria-hidden="true" size={16} />
                  Chat on WhatsApp
                </a>
              ) : (
                <a className="contact-hero-secondary" href="#contact-details">
                  View contact options <ArrowDown aria-hidden="true" size={16} />
                </a>
              )}
            </div>
          </div>
          <p className="contact-hero-caption">Kerala, India · Careful planning, at your pace</p>
        </section>

        <section
          className="contact-intro contact-section"
          id="contact-details"
          aria-labelledby="contact-intro-title"
        >
          <ContactReveal className="contact-intro-copy">
            <p className="contact-eyebrow contact-eyebrow--dark">We’re here to help</p>
            <h2 id="contact-intro-title">
              One conversation can make the next step clearer.
            </h2>
            <p>
              Whether you’re arranging a hospital visit or looking forward to
              discovering Kerala, share what matters to you. We’ll guide you
              through the practical details and help coordinate with our local
              network.
            </p>
          </ContactReveal>

          <div className="contact-options" aria-label="Contact options">
            <ContactReveal className="contact-option" delay={0.04}>
              <span className="contact-option-icon">
                <MessageCircle aria-hidden="true" size={19} />
              </span>
              <div>
                <h3>WhatsApp</h3>
                {whatsappLink ? (
                  <a href={whatsappLink} target="_blank" rel="noopener noreferrer">
                    Start a conversation <ArrowUpRight aria-hidden="true" size={14} />
                  </a>
                ) : (
                  <p>WhatsApp details to be configured</p>
                )}
              </div>
            </ContactReveal>

            <ContactReveal className="contact-option" delay={0.1}>
              <span className="contact-option-icon">
                <Phone aria-hidden="true" size={18} />
              </span>
              <div>
                <h3>Phone</h3>
                {contactDetails.phone ? (
                  <a href={`tel:${contactDetails.phone}`}>{contactDetails.phone}</a>
                ) : (
                  <p>Business phone to be configured</p>
                )}
              </div>
            </ContactReveal>

            <ContactReveal className="contact-option" delay={0.16}>
              <span className="contact-option-icon">
                <Mail aria-hidden="true" size={18} />
              </span>
              <div>
                <h3>Email</h3>
                {contactDetails.email ? (
                  <a href={`mailto:${contactDetails.email}`}>
                    {contactDetails.email}
                  </a>
                ) : (
                  <p>Business email to be configured</p>
                )}
              </div>
            </ContactReveal>

            <ContactReveal className="contact-option" delay={0.22}>
              <span className="contact-option-icon">
                <MapPin aria-hidden="true" size={18} />
              </span>
              <div>
                <h3>Based in</h3>
                <p>Kerala, India</p>
              </div>
            </ContactReveal>
          </div>
        </section>

        <section
          className="enquiry-section contact-section"
          id="enquiry-form"
          aria-labelledby="enquiry-title"
        >
          <ContactReveal className="enquiry-intro">
            <p className="contact-eyebrow contact-eyebrow--dark">Tell us a little</p>
            <h2 id="enquiry-title">How can we help you?</h2>
            <p>
              Choose the kind of journey you’re planning and share a few
              details. Your information stays in the form if there’s a problem.
            </p>
          </ContactReveal>

          <ContactReveal className="enquiry-form-wrap" delay={0.08}>
            <ContactEnquiryForm />
          </ContactReveal>
        </section>

        <section className="contact-final" aria-labelledby="contact-final-title">
          <ContactReveal className="contact-final-content">
            <p className="contact-eyebrow">A more supported journey</p>
            <h2 id="contact-final-title">
              Thoughtful help, from the first question onward.
            </h2>
            <p>
              Let’s talk through your plans and find a clear place to begin.
            </p>
            <a className="contact-button contact-button--light" href="#enquiry-form">
              Start an enquiry <ArrowUpRight aria-hidden="true" size={16} />
            </a>
          </ContactReveal>
          <span className="contact-final-mark" aria-hidden="true">
            KK
          </span>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
