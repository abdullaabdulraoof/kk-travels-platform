
"use client";

import { useState } from "react";
import TearTicket from "@/components/TearTicket/TearTicket";

export default function TicketDemo() {
  const [used, setUsed] = useState(false);

  return (
    <main
      style={{
        minHeight: "100vh",
        display: "grid",
        placeItems: "center",
        padding: "40px 20px",
        background: "#f4f1eb",
      }}
    >
      <TearTicket
        image="/spectrum.jpg"
        imageAlt="Visitors in a walkway of coloured glass"
        stub={
          <div>
            <h3>{used ? "Ticket used" : "Admit one"}</h3>
            <p>Kerala experience · By appointment</p>
            <span>No. 284619</span>
          </div>
        }
        orientation="horizontal"
        scrim
        imageRadius={8}
        onTear={() => setUsed(true)}
        width={460}
        height={250}
        stubSize={150}
        radius={16}
        holes={12}
        holeSize={6}
        notch={3}
        roughness={0}
        tearAngle={30}
        stretch={30}
        resistance={0.45}
        rotate={4}
        tilt
        tiltMax={9}
        tiltReach={260}
        parallax={6}
        perspective={1000}
        background="#27272a"
        color="#f5f5f5"
        border
        borderWidth={1}
        recenter
      >
        <span>KK Travels</span>
      </TearTicket>

      {used && <p style={{ color: "#27272a" }}>Ticket marked as used.</p>}
    </main>
  );
}
