const modules = [
  {
    title: "CRM Command Center",
    description: "Track New, Qualified, Booked, and Closed Won leads.",
    href: "/admin",
  },
  {
    title: "PAHS Campaign",
    description: "Football sponsorship landing page, form, CTA, and lead capture.",
    href: "/pahs",
  },
  {
    title: "Client Intake",
    description: "Protection review intake for family, retirement, business, and final expense needs.",
    href: "/intake",
  },
  {
    title: "Automation Hub",
    description: "Email alerts, booking follow-ups, reminders, and lead routing.",
    href: "/automation",
  },
];

export default function Home() {
  return (
    <main
      style={{
        minHeight: "100vh",
        background:
          "radial-gradient(circle at top left, rgba(196,154,108,0.18), transparent 32%), linear-gradient(135deg, #0f1f33 0%, #1f334c 48%, #2C3E50 100%)",
        color: "white",
        padding: "32px 20px",
        fontFamily:
          "Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif",
      }}
    >
      <section
        style={{
          maxWidth: "1120px",
          margin: "0 auto",
          display: "grid",
          gap: "32px",
        }}
      >
        <header
          style={{
            display: "flex",
            justifyContent: "space-between",
            gap: "16px",
            alignItems: "center",
            flexWrap: "wrap",
          }}
        >
          <div>
            <p
              style={{
                color: "#C49A6C",
                textTransform: "uppercase",
                letterSpacing: "0.14em",
                fontWeight: 800,
                fontSize: "13px",
                marginBottom: "10px",
              }}
            >
              Latimore Life & Legacy LLC
            </p>

            <h1
              style={{
                fontSize: "clamp(38px, 8vw, 76px)",
                lineHeight: "0.95",
                fontWeight: 900,
                letterSpacing: "-0.06em",
                margin: 0,
              }}
            >
              Latimore OS
            </h1>
          </div>

          <div
            style={{
              border: "1px solid rgba(255,255,255,0.2)",
              borderRadius: "999px",
              padding: "10px 16px",
              color: "rgba(255,255,255,0.82)",
              background: "rgba(255,255,255,0.08)",
              backdropFilter: "blur(16px)",
              fontWeight: 700,
            }}
          >
            Operational Build: v2.0
          </div>
        </header>

        <section
          style={{
            background: "rgba(255,255,255,0.1)",
            border: "1px solid rgba(255,255,255,0.18)",
            borderRadius: "28px",
            padding: "clamp(24px, 5vw, 48px)",
            boxShadow: "0 24px 80px rgba(0,0,0,0.28)",
            backdropFilter: "blur(18px)",
          }}
        >
          <p
            style={{
              color: "#C49A6C",
              fontWeight: 800,
              margin: "0 0 14px",
              textTransform: "uppercase",
              letterSpacing: "0.12em",
              fontSize: "13px",
            }}
          >
            Protecting Today. Securing Tomorrow.
          </p>

          <h2
            style={{
              fontSize: "clamp(30px, 6vw, 56px)",
              lineHeight: "1",
              margin: "0 0 18px",
              letterSpacing: "-0.04em",
              maxWidth: "840px",
            }}
          >
            One operating system for leads, campaigns, client intake, and follow-up.
          </h2>

          <p
            style={{
              color: "rgba(255,255,255,0.82)",
              fontSize: "18px",
              lineHeight: "1.65",
              maxWidth: "760px",
              margin: "0 0 28px",
            }}
          >
            This is the control layer for Latimore Life & Legacy: PAHS campaign capture,
            CRM workflow, protection reviews, automation, and local trust-building.
          </p>

          <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
            <a
              href="/admin"
              style={{
                background: "#C49A6C",
                color: "#0f1f33",
                padding: "14px 20px",
                borderRadius: "999px",
                textDecoration: "none",
                fontWeight: 900,
              }}
            >
              Open Admin
            </a>

            <a
              href="/pahs"
              style={{
                border: "1px solid rgba(255,255,255,0.35)",
                color: "white",
                padding: "14px 20px",
                borderRadius: "999px",
                textDecoration: "none",
                fontWeight: 900,
              }}
            >
              View PAHS Campaign
            </a>
          </div>
        </section>

        <section
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(230px, 1fr))",
            gap: "18px",
          }}
        >
          {modules.map((module) => (
            <a
              key={module.title}
              href={module.href}
              style={{
                display: "block",
                padding: "22px",
                borderRadius: "22px",
                background: "rgba(255,255,255,0.09)",
                border: "1px solid rgba(255,255,255,0.16)",
                color: "white",
                textDecoration: "none",
              }}
            >
              <h3
                style={{
                  margin: "0 0 10px",
                  fontSize: "20px",
                  letterSpacing: "-0.02em",
                }}
              >
                {module.title}
              </h3>

              <p
                style={{
                  margin: 0,
                  color: "rgba(255,255,255,0.74)",
                  lineHeight: "1.55",
                }}
              >
                {module.description}
              </p>
            </a>
          ))}
        </section>
      </section>
    </main>
  );
}
