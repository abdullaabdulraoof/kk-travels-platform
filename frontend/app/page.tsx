import {
  ClipboardList,
  Hotel,
  Languages,
  MapPinned,
  Plane,
  Puzzle,
} from "lucide-react";
import Link from "next/link";
import CircularCarousel from "@/components/CircularCarousel";
import CircularGallery from "@/components/CircularGallery";
import KKNavbar from "@/components/Navbar/Navbar";
import PixelCard from "@/components/PixelCard";
import SiteFooter from "@/components/SiteFooter";
import "./home.css";

const storyImages = [
  {
    src: "/story/story-1.webp",
    alt: "A palm-lined road through Kerala backwaters",
    title: "Along the backwaters",
    subtitle: "Kerala",
  },
  {
    src: "/story/story-2.webp",
    alt: "A traditional houseboat on a shaded Kerala canal",
    title: "A slower pace",
    subtitle: "Backwater journeys",
  },
  {
    src: "/story/story-3.webp",
    alt: "Chinese fishing nets along the Kerala coast",
    title: "By the water",
    subtitle: "Kerala coast",
  },
  {
    src: "/story/story-4.webp",
    alt: "A winding road through green tea plantations",
    title: "Into the hills",
    subtitle: "Munnar",
  },
  {
    src: "/story/story-5.webp",
    alt: "A traditional Kerala temple framed by trees",
    title: "A sense of place",
    subtitle: "Kerala heritage",
  },
  {
    src: "/story/story-6.webp",
    alt: "Palm trees and waterways in the Kerala countryside",
    title: "Tropical quiet",
    subtitle: "Kerala",
  },
  {
    src: "/story/story-7.webp",
    alt: "A lone tree beside a misty Kerala lake",
    title: "Still waters",
    subtitle: "Kerala",
  },
  {
    src: "/story/story-8.webp",
    alt: "A waterfall cascading over rocks in the hills",
    title: "Water in motion",
    subtitle: "Kerala",
  },
  {
    src: "/story/story-9.webp",
    alt: "A temple reflected in the water",
    title: "Heritage by the water",
    subtitle: "Kerala",
  },
  {
    src: "/story/story-10.webp",
    alt: "Tea pickers among green tea fields in the hills",
    title: "The tea gardens",
    subtitle: "Munnar",
  },
  {
    src: "/story/story-11.webp",
    alt: "A quiet lake framed by tree trunks",
    title: "Reflections",
    subtitle: "Kerala",
  },
];

const steps = [
  {
    icon: MapPinned,
    title: "Tell Us Your Needs",
    description:
      "Share your medical travel requirements or the Kerala experience you want to discover.",
  },
  {
    icon: Puzzle,
    title: "Get Personal Guidance",
    description:
      "We help coordinate suitable hospital appointments, accommodation, transport, and travel arrangements.",
  },
  {
    icon: ClipboardList,
    title: "Plan Your Journey",
    description:
      "Organize the details with personalized assistance, local guidance, and translation support when needed.",
  },
  {
    icon: Plane,
    title: "Arrive with Confidence",
    description:
      "Receive coordinated support throughout your visit to Kerala, from arrival to departure.",
  },
];

const services = [
  {
    icon: Hotel,
    title: "Hotel booking & accommodation coordination",
    description:
      "We help coordinate comfortable stays near treatment locations, with options that suit your style and travel logistics.",
  },
  {
    icon: Languages,
    title: "Interpreter / translation assistance",
    description:
      "We arrange language support to help make conversations between patients, doctors, and care teams clearer.",
  },
  {
    icon: ClipboardList,
    title: "Hospital referrals & appointment coordination",
    description:
      "We help coordinate referrals and appointment requests through established partners, streamlining the planning process.",
  },
];

const hospitalImages = [
  {
    text: "Aster Medcity",
    alt: "Aster Medcity hospital in Kerala",
    description: "Aster Medcity",
    image: "/hospital/hospital-1.webp",
  },
  {
    text: "Amrita",
    alt: "Amrita hospital in Kerala",
    description: "Amrita",
    image: "/hospital/hospital-2.avif",
  },
  {
    text: "Renai Medicity",
    alt: "Renai Medicity hospital in Kerala",
    description: "Renai Medicity",
    image: "/hospital/hospital-3.png",
  },
];

export default function Home() {
  return (
    <main className="travel-home">
      <section className="hero" id="home">
        <video
          className="hero-video"
          src="/kerala.mp4"
          poster="/kerala-ticket.jpg"
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          aria-hidden="true"
        />
        <div className="hero-shade" aria-hidden="true" />

        <KKNavbar isHome />

        <div className="hero-copy">
          <p className="hero-kicker">Care, comfort & Kerala</p>
          <h1>
            Medical travel
            <br />
            coordination &amp; Kerala
            <br />
            leisure journeys
          </h1>
          <p className="hero-description">
            KK Travels helps GCC customers coordinate medical appointments in
            India and plan customized Kerala tours. From trusted partners to
            thoughtful details, we make your journey feel easier from the
            moment you arrive.
          </p>
          <a className="text-link hero-link" href="#medical">
            Explore how we can help <span aria-hidden="true">↗</span>
          </a>
        </div>

        <a className="hero-scroll" href="#about">
          <span className="scroll-line" />
          Scroll to explore
        </a>
      </section>

      <section className="story-section dark-section" id="about">
        <div className="section-heading story-heading">
          <p className="eyebrow">A little about us</p>
          <h2>Our Story</h2>
          <p>
            KK Travels helps customers across the GCC coordinate medical
            appointments and customized Kerala journeys. Through established
            partners, we help arrange appointments, accommodation, transport
            and language assistance around your needs.
          </p>
          <a className="text-link" href="#how-it-works">
            Learn more about our process <span aria-hidden="true">→</span>
          </a>
        </div>

        <div
          className="story-carousel"
          role="region"
          aria-label="A glimpse of our journeys"
        >
          <CircularCarousel
            items={storyImages}
            preset="cylinder"
            intro="rise"
            cardWidth={320}
            aspectRatio={1}
            speed={14}
            captions={false}
            gap={25}
            tilt={-5}
            curve={1}
            perspective={2500}
            autoplay="drift"
            interval={3}
            direction="left"
            momentum={0.6}
            snap
            pauseOnHover
            focusOnClick
            draggable
            parallax={0.3}
            stretch={0.5}
            fadeColor="#000000"
            depthFade={0.55}
            innerShade={0.6}
            cornerRadius={12}
          />
        </div>

        <div className="story-stats">
          <article>
            <strong>7+ Years</strong>
            <h3>Travel Assistance Experience</h3>
            <p>
              Personalized guidance and support for international travellers
              visiting India.
            </p>
          </article>
          <article>
            <strong>5+ Languages</strong>
            <h3>Multilingual Assistance</h3>
            <p>
              Communication support to help international visitors navigate
              their journey.
            </p>
          </article>
          <article>
            <strong>5+ Hospitals</strong>
            <h3>Hospital Network</h3>
            <p>
              Connections with established hospitals to help coordinate
              medical appointments and treatment visits.
            </p>
          </article>
        </div>
      </section>

      <section className="process-section" id="how-it-works">
        <div className="process-heading section-heading">
          <p className="eyebrow">Your journey, coordinated</p>
          <h2>How KK Travels Works</h2>
        </div>

        <div className="process-grid">
          {steps.map(({ icon: Icon, title, description }, index) => (
            <article className="process-step" key={title}>
              <div className="process-icon">
                <Icon size={23} strokeWidth={1.35} aria-hidden="true" />
                <span>0{index + 1}</span>
              </div>
              <h3>{title}</h3>
              <p>{description}</p>
            </article>
          ))}
        </div>

        <div
          className="process-landscape"
          role="img"
          aria-label="Misty mountains and tea plantations in Kerala"
        />
      </section>

      <section className="medical-section" id="medical">
        <div className="section-heading medical-heading">
          <p className="eyebrow">Medical tourism coordination</p>
          <h2>Medical tourism services</h2>
          <p>
            We coordinate practical support around your medical travel journey,
            from accommodation and transport to language assistance and
            appointment coordination through established partners.
          </p>
        </div>
        <div className="medical-grid">
          {services.map(({ icon: Icon, title, description }) => (
            <PixelCard
              key={title}
              className="medical-pixel-card"
              colors={["#f8fafc", "#f1f5f9", "#cbd5e1"]}
              glowColor="#cbd5e1"
              shape="square"
              origin="center"
              gap={5}
              pixelSize={2}
              speed={35}
              revealDuration={600}
              spotlight={0.5}
              glow={0.5}
              opacity={0.35}
              fade={0.7}
              trigger="hover"
              radius={24}
              clickPulse
              intro
              theme="dark"
            >
              <article className="medical-card">
                <span className="medical-icon">
                  <Icon size={17} strokeWidth={1.6} aria-hidden="true" />
                </span>
                <h3>{title}</h3>
                <p>{description}</p>
              </article>
            </PixelCard>
          ))}
        </div>
      </section>

      <section className="hospital-section" aria-labelledby="hospital-title">
        <div className="section-heading hospital-heading">
          <p className="eyebrow">Hospital experience</p>
          <h2 id="hospital-title">Hospitals in Kerala</h2>
          <p>
            Explore healthcare facilities in Kerala. KK Travels can help
            coordinate appointments with providers suited to your journey.
          </p>
        </div>
        <div className="hospital-gallery">
          <CircularGallery
            items={hospitalImages}
            bend={2}
            textColor="#ffffff"
            borderRadius={0.05}
            scrollEase={0.05}
            itemSize={0.82}
            itemAspect={0.78}
            gap={0.26}
            wave={1}
            fadeEdges={0.12}
            shadow={0.25}
            scrollSpeed={2}
            autoScroll={0}
            snap
            grayscale={false}
            showTitles
            openOnClick
            intro
            font="bold 30px Arial"
          />
        </div>
      </section>

      <section className="home-contact-cta" aria-labelledby="home-contact-title">
        <p className="eyebrow">Personal guidance for your next step</p>
        <h2 id="home-contact-title">Let’s plan your journey together.</h2>
        <p>
          Share your plans with us and get help coordinating the details.
        </p>
        <Link className="home-contact-cta-link" href="/contact">
          Plan your journey <span aria-hidden="true">↗</span>
        </Link>
      </section>

      <SiteFooter isHome />
    </main>
  );
}
