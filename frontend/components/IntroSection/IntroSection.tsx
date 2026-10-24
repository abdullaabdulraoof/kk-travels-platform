
"use client";

const services = [
  {
    number: "01",
    title: "Medical Tourism",
    description:
      "Hospital appointments, treatment coordination, accommodation and personal assistance throughout your medical journey.",
    label: "CARE, WITHOUT BORDERS",
  },
  {
    number: "02",
    title: "Discover Kerala",
    description:
      "Experience peaceful backwaters, misty mountains, beautiful coastlines and the culture of God's Own Country.",
    label: "EXPERIENCES TO REMEMBER",
  },
  {
    number: "03",
    title: "Personal Assistance",
    description:
      "From airport pickup to translation and local guidance, we help make every part of your journey easier.",
    label: "HERE FOR YOUR JOURNEY",
  },
];

export default function IntroSection() {
  return (
    <section className="kk-intro-section" id="services">
      <div className="kk-intro-container">
          <div className="kk-intro-heading">
            <span className="kk-intro-eyebrow">
              MORE THAN A JOURNEY
            </span>

            <h2>
              Your well-being.
              <br />
              <span>Your Kerala story.</span>
            </h2>

            <p>
              Whether you are travelling for treatment or discovering
              somewhere new, we bring care, comfort and local expertise
              together to make your journey meaningful.
            </p>
          </div>

          <div className="kk-service-grid">
            {services.map((service) => (
              <article className="kk-service-card" key={service.number}>
                <div className="kk-service-card-top">
                  <span className="kk-service-number">
                    {service.number}
                  </span>
                  <span className="kk-service-arrow" aria-hidden="true">
                    ↗
                  </span>
                </div>

                <span className="kk-service-label">
                  {service.label}
                </span>

                <h3>{service.title}</h3>

                <p>{service.description}</p>

                <span className="kk-service-line" />
              </article>
            ))}
          </div>

          <div className="kk-intro-bottom">
            <span>YOUR JOURNEY, OUR CARE.</span>
            <a href="#about">
              GET TO KNOW US <span aria-hidden="true">↗</span>
            </a>
          </div>
      </div>
    </section>
  );
}
