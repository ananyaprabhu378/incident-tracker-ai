import { Link } from "react-router-dom";

function Landing() {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "minmax(0, 1.4fr) minmax(0, 1fr)",
        gap: 28,
        alignItems: "stretch",
      }}
    >
      {/* Left: hero + unique pitch */}
      <div>
        <div
          style={{
            padding: "24px 26px",
            borderRadius: 24,
            background:
              "radial-gradient(circle at top left,#22c55e,#2563eb 45%,#0f172a 90%)",
            color: "white",
            boxShadow: "0 26px 60px rgba(15,23,42,0.6)",
            minHeight: 240,
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
          }}
        >
          <div>
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                padding: "4px 10px",
                borderRadius: 999,
                background: "rgba(15,23,42,0.5)",
                fontSize: "0.75rem",
              }}
            >
              <span
                style={{
                  width: 7,
                  height: 7,
                  borderRadius: "999px",
                  background: "#22c55e",
                }}
              />
              <span>AI-powered campus maintenance · v1.0</span>
            </div>

            <h1
              style={{
                fontSize: "2rem",
                fontWeight: 700,
                marginTop: 10,
                marginBottom: 6,
              }}
            >
              One place to report, predict and resolve hostel issues.
            </h1>
            <p style={{ fontSize: "0.95rem", opacity: 0.92 }}>
              From power cuts and water leaks to Wi-Fi and hostel complaints,
              our system turns raw incident logs into live risk scores per
              hostel and problem type – so admins know where the next failure is
              most likely to happen.
            </p>
          </div>

          <div
            style={{
              marginTop: 18,
              display: "flex",
              gap: 12,
              flexWrap: "wrap",
              alignItems: "center",
            }}
          >
            <Link
              to="/login"
              style={{
                padding: "9px 16px",
                borderRadius: 999,
                background: "white",
                color: "#111827",
                fontSize: "0.9rem",
                fontWeight: 600,
                textDecoration: "none",
              }}
            >
              Get started · Login
            </Link>
            <Link
              to="/register"
              style={{
                padding: "9px 16px",
                borderRadius: 999,
                border: "1px solid rgba(248,250,252,0.6)",
                color: "white",
                fontSize: "0.9rem",
                fontWeight: 500,
                textDecoration: "none",
              }}
            >
              Create demo accounts
            </Link>
            <span
              style={{
                fontSize: "0.75rem",
                opacity: 0.85,
              }}
            >
              Reporter · Admin · Technician dashboards included.
            </span>
          </div>
        </div>

        {/* Highlight unique features */}
        <div
          style={{
            marginTop: 18,
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
            gap: 12,
          }}
        >
          <div
            style={{
              padding: "10px 12px",
              borderRadius: 16,
              background: "white",
              boxShadow: "0 10px 28px rgba(15,23,42,0.08)",
              border: "1px solid #e5e7eb",
              fontSize: "0.8rem",
            }}
          >
            <p style={{ fontWeight: 600, color: "#1d4ed8", marginBottom: 4 }}>
              Per-hostel risk prediction
            </p>
            <p style={{ color: "#4b5563" }}>
              We compute a risk score for each hostel & problem type (e.g.,
              Hostel A · Water) using incident frequency, severity and recency.
            </p>
          </div>
          <div
            style={{
              padding: "10px 12px",
              borderRadius: 16,
              background: "white",
              boxShadow: "0 10px 28px rgba(15,23,42,0.08)",
              border: "1px solid #e5e7eb",
              fontSize: "0.8rem",
            }}
          >
            <p style={{ fontWeight: 600, color: "#15803d", marginBottom: 4 }}>
              Smart notification pipeline
            </p>
            <p style={{ color: "#4b5563" }}>
              Report → notify admin & technician → live updates back to the
              original reporter as status changes.
            </p>
          </div>
          <div
            style={{
              padding: "10px 12px",
              borderRadius: 16,
              background: "white",
              boxShadow: "0 10px 28px rgba(15,23,42,0.08)",
              border: "1px solid #e5e7eb",
              fontSize: "0.8rem",
            }}
          >
            <p style={{ fontWeight: 600, color: "#92400e", marginBottom: 4 }}>
              Flexible priority model
            </p>
            <p style={{ color: "#4b5563" }}>
              Known problems (power, water, internet) use auto-priority;
              &ldquo;Other&rdquo; issues let users manually set severity.
            </p>
          </div>
        </div>
      </div>

      {/* Right: simple “how it works” card */}
      <div
        style={{
          maxWidth: 420,
          marginLeft: "auto",
          alignSelf: "stretch",
          padding: 22,
          background: "white",
          borderRadius: 18,
          boxShadow: "0 16px 36px rgba(15,23,42,0.12)",
          border: "1px solid #e5e7eb",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          gap: 14,
        }}
      >
        <div>
          <h2 style={{ fontSize: "1.15rem", fontWeight: 600, marginBottom: 6 }}>
            How the flow works
          </h2>
          <ol
            style={{
              fontSize: "0.85rem",
              color: "#4b5563",
              paddingLeft: 18,
              marginTop: 6,
            }}
          >
            <li>
              <strong>Reporter</strong> logs an incident with hostel, category
              and description.
            </li>
            <li>
              Our logic assigns a <strong>priority</strong> and updates the{" "}
              <strong>risk score</strong> for that hostel & problem type.
            </li>
            <li>
              <strong>Admin</strong> views AI risk predictions and heatmaps.
            </li>
            <li>
              <strong>Technician</strong> gets a focused list and updates
              status, which notifies the reporter.
            </li>
          </ol>
        </div>

        <div
          style={{
            marginTop: 8,
            padding: "10px 12px",
            borderRadius: 14,
            background: "#f9fafb",
            border: "1px dashed #d1d5db",
            fontSize: "0.8rem",
            color: "#4b5563",
          }}
        >
          Tip for demo: create a few incidents for one hostel (e.g., Hostel A ·
          Water and Electricity), then log in as Admin to show how the risk
          panel ranks those combinations.
        </div>
      </div>
    </div>
  );
}

export default Landing;
