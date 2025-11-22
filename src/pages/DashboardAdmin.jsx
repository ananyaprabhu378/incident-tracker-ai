import { useEffect, useMemo, useState } from "react";

const INCIDENT_STORAGE_KEY = "incidents_v1";

function loadIncidents() {
  try {
    const raw = localStorage.getItem(INCIDENT_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function sigmoid(x) {
  return 1 / (1 + Math.exp(-x));
}

function DashboardAdmin() {
  const [incidents, setIncidents] = useState([]);

  useEffect(() => {
    setIncidents(loadIncidents());
  }, []);

  const stats = useMemo(() => {
    const total = incidents.length;
    const open = incidents.filter((i) => i.status !== "Resolved").length;
    const resolved = incidents.filter((i) => i.status === "Resolved").length;
    const highPriority = incidents.filter((i) => i.priority === "High").length;

    const now = Date.now();
    const thirtyMin = 30 * 60 * 1000;
    const slaBreached = incidents.filter((i) => {
      if (i.status === "Resolved") return false;
      const created = new Date(i.createdAt).getTime();
      return now - created > thirtyMin;
    }).length;

    // 1) Heatmap per location (for total incidents)
    const byLocation = {};
    // 2) Risk per (location, category) pair
    const byLocCat = {};

    incidents.forEach((i) => {
      const loc = i.location || "Unknown";
      const cat = i.category || "Other";

      // heatmap aggregate per location
      if (!byLocation[loc]) {
        byLocation[loc] = { total: 0, high: 0 };
      }
      byLocation[loc].total += 1;
      if (i.priority === "High") byLocation[loc].high += 1;

      // risk aggregate per (location, category)
      const key = `${loc}__${cat}`;
      if (!byLocCat[key]) {
        byLocCat[key] = {
          location: loc,
          category: cat,
          total: 0,
          high: 0,
          recent24h: 0,
          lastIncidentTs: 0,
        };
      }
      const bucket = byLocCat[key];
      bucket.total += 1;
      if (i.priority === "High") bucket.high += 1;

      const ts = new Date(i.createdAt).getTime();
      bucket.lastIncidentTs = Math.max(bucket.lastIncidentTs, ts);

      if (now - ts <= 24 * 60 * 60 * 1000) {
        bucket.recent24h += 1;
      }
    });

    const heatmap = Object.entries(byLocation).map(([loc, data]) => ({
      location: loc,
      total: data.total,
      high: data.high,
    }));

    const maxTotal = heatmap.reduce(
      (max, item) => (item.total > max ? item.total : max),
      0
    );

    // Build risk items per (location, category)
    const riskPairs = Object.values(byLocCat).map((bucket) => {
      const hoursSinceLast = bucket.lastIncidentTs
        ? (now - bucket.lastIncidentTs) / (1000 * 60 * 60)
        : null;

      let recencyBoost = 0;
      if (hoursSinceLast !== null) {
        const capped = Math.min(hoursSinceLast, 72);
        recencyBoost = 1 - capped / 72; // 1 when very recent, 0 when >3 days
      }

      const rawScore =
        0.4 * bucket.total +
        0.8 * bucket.high +
        1.0 * bucket.recent24h +
        1.2 * recencyBoost;

      const prob = sigmoid(rawScore / 3); // 0–1
      const probabilityPercent = Math.round(prob * 100);

      return {
        location: bucket.location,
        category: bucket.category,
        total: bucket.total,
        high: bucket.high,
        recent24h: bucket.recent24h,
        riskScore: rawScore,
        probability: probabilityPercent,
      };
    });

    // Sort so that highest risk appears first
    riskPairs.sort((a, b) => b.probability - a.probability);

    return {
      total,
      open,
      resolved,
      highPriority,
      slaBreached,
      heatmap,
      maxTotal,
      riskPairs,
    };
  }, [incidents]);

  const topRisks = stats.riskPairs.slice(0, 3);

  return (
    <div style={{ display: "grid", gap: 20 }}>
      <div>
        <h2 style={{ fontSize: "1.3rem", fontWeight: 600, marginBottom: 4 }}>
          Admin Control Centre
        </h2>
        <p style={{ fontSize: "0.9rem", color: "#6b7280" }}>
          Live overview of incidents, SLA risks and AI-based hotspot prediction
          across campus.
        </p>
      </div>

      {/* Stat cards */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
          gap: 16,
        }}
      >
        {[
          {
            label: "Total incidents",
            value: stats.total,
            accent: "rgba(59,130,246,0.1)",
            border: "#3b82f6",
          },
          {
            label: "Open incidents",
            value: stats.open,
            accent: "rgba(249,115,22,0.12)",
            border: "#f97316",
          },
          {
            label: "Resolved",
            value: stats.resolved,
            accent: "rgba(34,197,94,0.12)",
            border: "#22c55e",
          },
          {
            label: "High priority",
            value: stats.highPriority,
            accent: "rgba(239,68,68,0.12)",
            border: "#ef4444",
          },
          {
            label: "SLA risks (30+ mins)",
            value: stats.slaBreached,
            accent: "rgba(248,250,252,1)",
            border: "#0f172a",
          },
        ].map((card) => (
          <div
            key={card.label}
            style={{
              padding: "14px 16px",
              borderRadius: 16,
              border: `1px solid ${card.border}`,
              background: card.accent,
            }}
          >
            <p
              style={{
                fontSize: "0.8rem",
                color: "#6b7280",
                marginBottom: 4,
              }}
            >
              {card.label}
            </p>
            <p style={{ fontSize: "1.4rem", fontWeight: 700, color: "#0f172a" }}>
              {card.value}
            </p>
          </div>
        ))}
      </div>

      {/* AI Risk per (location, category) */}
      <div
        style={{
          padding: "16px 18px",
          borderRadius: 16,
          background: "white",
          boxShadow: "0 12px 30px rgba(15,23,42,0.08)",
          display: "grid",
          gap: 12,
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "baseline",
          }}
        >
          <div>
            <h3
              style={{
                fontSize: "1.05rem",
                fontWeight: 600,
                marginBottom: 4,
              }}
            >
              AI risk prediction – top risky problems by hostel
            </h3>
            <p style={{ fontSize: "0.8rem", color: "#6b7280" }}>
              For each (location, category) pair – for example,{" "}
              <strong>Hostel A · Water</strong> – we compute a qualitative risk
              score using: total incidents, high priority incidents, activity in
              the last 24 hours and recency of the last issue. Then we pass this
              score through a logistic (sigmoid) function to estimate the
              probability of seeing another incident soon.
            </p>
          </div>
        </div>

        {topRisks.length === 0 ? (
          <p style={{ fontSize: "0.9rem", color: "#6b7280" }}>
            No incidents yet. Once reports start coming in, this panel will
            highlight high-risk problem types per hostel/block.
          </p>
        ) : (
          <div
            style={{
              display: "grid",
              gap: 10,
            }}
          >
            {topRisks.map((item) => (
              <div
                key={`${item.location}__${item.category}`}
                style={{
                  padding: "10px 12px",
                  borderRadius: 12,
                  border: "1px solid #e5e7eb",
                  background: "#f9fafb",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginBottom: 4,
                    alignItems: "center",
                  }}
                >
                  <div>
                    <div
                      style={{
                        fontSize: "0.95rem",
                        fontWeight: 600,
                        color: "#0f172a",
                      }}
                    >
                      {item.location} · {item.category}
                    </div>
                    <div
                      style={{
                        fontSize: "0.8rem",
                        color: "#6b7280",
                      }}
                    >
                      {item.total} incidents · {item.high} high ·{" "}
                      {item.recent24h} in last 24h
                    </div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div
                      style={{
                        fontSize: "0.8rem",
                        color: "#6b7280",
                      }}
                    >
                      Risk of another {item.category} issue here
                    </div>
                    <div
                      style={{
                        fontSize: "1.1rem",
                        fontWeight: 700,
                        color:
                          item.probability >= 75
                            ? "#b91c1c"
                            : item.probability >= 50
                            ? "#92400e"
                            : "#166534",
                      }}
                    >
                      {item.probability}%
                    </div>
                  </div>
                </div>

                <div
                  style={{
                    marginTop: 6,
                    height: 8,
                    borderRadius: 999,
                    background: "#e5e7eb",
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      width: `${item.probability}%`,
                      height: "100%",
                      background:
                        item.probability >= 75
                          ? "linear-gradient(90deg,#ef4444,#f97316)"
                          : item.probability >= 50
                          ? "linear-gradient(90deg,#f97316,#eab308)"
                          : "linear-gradient(90deg,#22c55e,#16a34a)",
                    }}
                  />
                </div>

                <p
                  style={{
                    marginTop: 4,
                    fontSize: "0.78rem",
                    color: "#6b7280",
                  }}
                >
                  Model intuition: higher counts of{" "}
                  <strong>{item.category}</strong> incidents in{" "}
                  <strong>{item.location}</strong>, especially if they are high
                  priority and recent, push the risk probability up. Admins can
                  use this to proactively schedule checks before the next
                  breakdown.
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Heatmap per location */}
      <div
        style={{
          padding: "16px 18px",
          borderRadius: 16,
          background: "white",
          boxShadow: "0 12px 30px rgba(15,23,42,0.08)",
        }}
      >
        <h3 style={{ fontSize: "1.05rem", fontWeight: 600, marginBottom: 8 }}>
          Location heatmap
        </h3>
        <p style={{ fontSize: "0.85rem", color: "#6b7280", marginBottom: 14 }}>
          Visual distribution of incidents by hostel/block. Combine this with
          the AI risk panel above to decide where to send technicians first.
        </p>

        {stats.heatmap.length === 0 ? (
          <p style={{ fontSize: "0.9rem", color: "#6b7280" }}>
            No incidents yet. Ask a reporter to create a few for the demo.
          </p>
        ) : (
          <div style={{ display: "grid", gap: 10 }}>
            {stats.heatmap.map((item) => {
              const widthPct =
                stats.maxTotal > 0
                  ? 20 + (item.total / stats.maxTotal) * 80
                  : 0;
              return (
                <div key={item.location}>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      fontSize: "0.85rem",
                      marginBottom: 4,
                    }}
                  >
                    <span style={{ fontWeight: 500 }}>{item.location}</span>
                    <span style={{ color: "#6b7280" }}>
                      {item.total} incidents · {item.high} high
                    </span>
                  </div>
                  <div
                    style={{
                      height: 10,
                      borderRadius: 999,
                      background: "#e5e7eb",
                      overflow: "hidden",
                    }}
                  >
                    <div
                      style={{
                        width: `${widthPct}%`,
                        height: "100%",
                        background:
                          item.high > 0
                            ? "linear-gradient(90deg,#ef4444,#f97316)"
                            : "linear-gradient(90deg,#60a5fa,#22c55e)",
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default DashboardAdmin;
