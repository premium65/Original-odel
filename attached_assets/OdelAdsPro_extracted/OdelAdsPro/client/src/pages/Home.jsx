import React, { useEffect, useState } from "react";
import bgImage from "../assets/bg-home.jpg";

export default function Home() {
  const [offset, setOffset] = useState(0);

  // Parallax effect
  useEffect(() => {
    const handleScroll = () => setOffset(window.scrollY * 0.5);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="home-container" style={{ overflowX: "hidden" }}>
      {/* HERO SECTION */}
      <section
        className="hero-section"
        style={{
          height: "100vh",
          width: "100%",
          backgroundImage: `url(${bgImage})`,
          backgroundSize: "cover",
          backgroundPosition: `center ${offset}px`,
          backgroundRepeat: "no-repeat",
          position: "relative",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {/* DARK OVERLAY */}
        <div
          className="hero-overlay"
          style={{
            position: "absolute",
            inset: 0,
            background: "rgba(0,0,0,0.55)",
            backdropFilter: "blur(4px)",
          }}
        ></div>

        {/* CONTENT */}
        <div
          className="hero-content"
          style={{
            position: "relative",
            textAlign: "center",
            color: "white",
            padding: "20px",
          }}
        >
          {/* MAIN HEADING */}
          <h1
            style={{
              fontSize: "64px",
              fontWeight: "900",
              textShadow: "0px 4px 20px rgba(0,0,0,0.6)",
              animation: "fadeInScale 1.2s ease forwards",
              opacity: 0,
            }}
          >
            Welcome to Rating - Ads
          </h1>

          {/* SUBTITLE */}
          <p
            style={{
              fontSize: "22px",
              marginTop: "20px",
              opacity: 0,
              animation: "fadeIn 1.2s ease forwards",
              animationDelay: "0.4s",
            }}
          >
            Earn money by rating ads and building your reputation
          </p>

          {/* CTA BUTTONS */}
          <div style={{ marginTop: "35px", display: "flex", gap: "20px", justifyContent: "center" }}>
            <button
              className="home-btn primary"
              onClick={() => (window.location.href = "/login")}
            >
              Login
            </button>

            <button
              className="home-btn secondary"
              onClick={() => (window.location.href = "/register")}
            >
              Register
            </button>
          </div>

          {/* SCROLL ARROW */}
          <div
            style={{
              marginTop: "60px",
              fontSize: "32px",
              animation: "bounce 1.7s infinite",
              opacity: 0.9,
            }}
          >
            ↓
          </div>
        </div>
      </section>
    </div>
  );
}
