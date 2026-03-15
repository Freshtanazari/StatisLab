import React, { useEffect, useState } from "react";

const FEATURE_CARDS = [
  { num: "01", title: "Fast CSV intake", description: "Upload a dataset, keep the session alive, and move straight into inspection without redoing work." },
  { num: "02", title: "Guided analysis", description: "Pick statistical tests and visualization flows from a structured workspace instead of juggling notebooks." },
  { num: "03", title: "Report-ready output", description: "Keep your findings, charts, and summaries organized so the final report is ready to export and review." },
];

function LandingPage({ steps = [], onEnterWorkspace }) {
  const [isMobile, setIsMobile] = useState(() => window.innerWidth <= 900);

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth <= 900);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  return (
    <main style={{ fontFamily: "Inter, sans-serif", background: "linear-gradient(160deg, #f6fbfa 0%, #f8fafc 55%, #eef6f3 100%)", color: "#1f2937", minHeight: "100vh" }}>


      {/* Hero */}
      <section
        style={{
          display: "grid",
          gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr",
          gap: isMobile ? "1.25rem" : "2.5rem",
          padding: isMobile ? "2rem 1rem" : "5rem 3rem",
          alignItems: "center",
        }}
      >
        <div>
          <span style={{ display: "inline-block", fontSize: 11, fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: "#0f766e", background: "#dff5ee", padding: "4px 12px", borderRadius: 100, marginBottom: "1.25rem" }}>
            Statistical analysis
          </span>
          <h1 style={{ fontSize: "clamp(1.9rem, 3vw, 2.75rem)", fontWeight: 600, lineHeight: 1.2, letterSpacing: "-0.03em", color: "#1f2937", margin: "0 0 1.25rem" }}>
            Turn raw datasets into{" "}
            <span style={{ color: "#0f766e" }}>cleaned outputs,</span>{" "}
            tests, and reports.
          </h1>
          <p style={{ fontSize: isMobile ? 14 : 15, lineHeight: 1.75, color: "#475569", margin: "0 0 2rem", maxWidth: "46ch" }}>
            A structured flow for upload, validation, preprocessing, statistical analysis, and reporting — from one workspace, without setup friction.
          </p>
          <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
            <button
              type="button"
              onClick={onEnterWorkspace}
              style={{ background: "#0f766e", color: "#fff", border: "none", padding: "11px 22px", borderRadius: 8, fontFamily: "Inter, sans-serif", fontSize: 14, fontWeight: 500, cursor: "pointer" }}
            >
              Enter Workspace
            </button>
            <a href="#landing-flow" style={{ fontSize: 14, color: "#0f766e", textDecoration: "none", fontWeight: 500 }}>
              See the workflow →
            </a>
          </div>
        </div>

        {/* Hero card */}
        <div style={{ background: "linear-gradient(145deg, #ffffff, #f4fbf8)", border: "1px solid rgba(15,118,110,0.16)", borderRadius: 16, padding: isMobile ? "1.25rem" : "2rem" }}>
          <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: "#0f766e", margin: "0 0 1.25rem" }}>
            Who can use this project
          </p>
          <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: "1rem" }}>
            {[
              "Students learning statistics and data analysis",
              "Researchers preparing quick, reproducible statistical reports",
              "Beginner analysts who want a guided no-code workflow",
            ].map((item) => (
              <li key={item} style={{ display: "flex", alignItems: "flex-start", gap: 10, fontSize: 14, color: "#1f2937", lineHeight: 1.55 }}>
                <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#0f766e", marginTop: 5, flexShrink: 0, opacity: 0.7 }} />
                {item}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Features */}
      <section
        style={{
          display: "grid",
          gridTemplateColumns: isMobile ? "1fr" : "repeat(3, 1fr)",
          gap: "1.25rem",
          padding: isMobile ? "0 1rem 2rem" : "0 3rem 4rem",
        }}
      >
        {FEATURE_CARDS.map((card) => (
          <article key={card.title} style={{ background: "#fff", border: "1px solid rgba(15,118,110,0.12)", borderRadius: 12, padding: "1.75rem" }}>
            <p style={{ fontSize: 11, fontWeight: 600, color: "#0f766e", letterSpacing: "0.08em", margin: "0 0 1rem" }}>{card.num}</p>
            <h2 style={{ fontSize: 15, fontWeight: 600, color: "#1f2937", margin: "0 0 0.6rem", letterSpacing: "-0.01em" }}>{card.title}</h2>
            <p style={{ fontSize: 13, lineHeight: 1.7, color: "#475569", margin: 0 }}>{card.description}</p>
          </article>
        ))}
      </section>

      {/* Workflow */}
      <section id="landing-flow" style={{ padding: isMobile ? "2rem 1rem" : "4rem 3rem", background: "#fff", borderTop: "1px solid rgba(15,118,110,0.12)" }}>
        <div style={{ marginBottom: "2.5rem" }}>
          <span style={{ display: "inline-block", fontSize: 11, fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: "#0f766e", background: "#dff5ee", padding: "4px 12px", borderRadius: 100, marginBottom: "0.75rem" }}>
            Workflow preview
          </span>
          <h2 style={{ fontSize: "1.4rem", fontWeight: 600, color: "#1f2937", margin: 0, letterSpacing: "-0.02em" }}>
            The existing lab flow stays intact behind the landing page.
          </h2>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(auto-fill, minmax(175px, 1fr))", gap: "1.5rem" }}>
          {steps.map((step) => (
            <div key={step.number} style={{ padding: "1.25rem", background: "linear-gradient(145deg, #f6fbfa, #fff)", border: "1px solid rgba(15,118,110,0.12)", borderRadius: 10 }}>
              <p style={{ fontSize: 11, fontWeight: 600, color: "#0f766e", letterSpacing: "0.08em", margin: "0 0 0.6rem" }}>0{step.number}</p>
              <h3 style={{ fontSize: 13, fontWeight: 600, margin: "0 0 0.35rem", color: "#1f2937" }}>{step.label}</h3>
              <p style={{ fontSize: 12, lineHeight: 1.6, color: "#475569", margin: 0 }}>{step.hint}</p>
            </div>
          ))}
        </div>
      </section>

    </main>
  );
}

export default LandingPage;