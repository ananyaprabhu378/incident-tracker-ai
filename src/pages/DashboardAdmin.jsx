import { useEffect, useMemo, useState } from "react";
import { fetchIncidents } from "../services/incidentsApi"; // ✅ Node backend

// logistic
function sigmoid(x) {
  return 1 / (1 + Math.exp(-x));
}

function DashboardAdmin() {
  const [incidents, setIncidents] = useState([]);

  useEffect(() => {
    async function load() {
      try {
        const all = await fetchIncidents();
        setIncidents(all || []);
      } catch (err) {
        console.error("Failed to fetch incidents", err);
      }
    }
    load();
  }, []);

  const stats = useMemo(() => {
    const total = incidents.length;
    const open = incidents.filter((i) => i.status !== "Resolved").length;
    const resolved = incidents.filter((i) => i.status === "Resolved").length;
    const highPriority = incidents.filter((i) => i.priority === "High").length;

    const now = Date.now();
    const THIRTY_MIN = 30 * 60 * 1000;

    const slaBreached = incidents.filter((i) => {
      if (!i.createdAt || i.status === "Resolved") return false;
      const ts = new Date(i.createdAt).getTime();
      return now - ts > THIRTY_MIN;
    }).length;

    const byLocation = {};
    const byLocCat = {};

    incidents.forEach((i) => {
      const hostel = (i.hostel || i.location || "Unknown").trim();
      const cat = i.category || "Other";
      const ts = i.createdAt ? new Date(i.createdAt).getTime() : null;

      if (!byLocation[hostel]) {
        byLocation[hostel] = { total: 0, high: 0 };
      }
      byLocation[hostel].total += 1;
      if (i.priority === "High") byLocation[hostel].high += 1;

      const key = `${hostel.toLowerCase()}__${cat}`;
      if (!byLocCat[key]) {
        byLocCat[key] = {
          hostel,
          category: cat,
          total: 0,
          high: 0,
          recent24h: 0,
          last7d: 0,
          openCount: 0,
          oldestOpenTs: null,
        };
      }
      const bucket = byLocCat[key];

      bucket.total += 1;
      if (i.priority === "High") bucket.high += 1;

      if (ts !== null) {
        const diff = now - ts;
        if (diff <= 24 * 60 * 60 * 1000) {
          bucket.recent24h += 1;
        }
        if (diff <= 7 * 24 * 60 * 60 * 1000) {
          bucket.last7d += 1;
        }
      }

      if (i.status !== "Resolved") {
        bucket.openCount += 1;
        if (ts !== null) {
          if (!bucket.oldestOpenTs || ts < bucket.oldestOpenTs) {
            bucket.oldestOpenTs = ts;
          }
        }
      }
    });

    const heatmap = Object.entries(byLocation).map(([hostel, data]) => ({
      location: hostel,
      total: data.total,
      high: data.high,
    }));
    const maxTotal = heatmap.reduce(
      (m, row) => (row.total > m ? row.total : m),
      0
    );

    const riskPairs = Object.values(byLocCat).map((bucket) => {
      const { hostel, category, total, high, recent24h, last7d, openCount } =
        bucket;

      const oldestAgeHours =
        bucket.oldestOpenTs !== null
          ? (now - bucket.oldestOpenTs) / (1000 * 60 * 60)
          : 0;

      let agingScore = 0;
      if (openCount > 0 && oldestAgeHours > 0) {
        const capped = Math.min(oldestAgeHours, 48);
        agingScore = capped / 48;
      }

      const rawScore =
        0.35 * total +
        0.8 * high +
        1.1 * recent24h +
        0.7 * last7d +
        0.9 * openCount +
        1.3 * agingScore;

      const prob = sigmoid(rawScore / 3.5);
      const probability = Math.round(prob * 100);

      const baseRate = recent24h || Math.max(total / 5, 0.5);
      const expectedNext24h = Math.max(
        0,
        Math.round((probability / 100) * baseRate)
      );

      let band = "Low";
      if (probability >= 75) band = "High";
      else if (probability >= 50) band = "Medium";

      return {
        hostel,
        category,
        total,
        high,
        recent24h,
        last7d,
        openCount,
        oldestAgeHours: Math.round(oldestAgeHours),
        probability,
        expectedNext24h,
        band,
      };
    });

    riskPairs.sort((a, b) => b.probability - a.probability);

    const last7Days = [];
    for (let d = 6; d >= 0; d--) {
      const dayStart = new Date(now - d * 24 * 60 * 60 * 1000);
      const key = dayStart.toISOString().slice(0, 10);
      const count = incidents.filter(
        (i) => i.createdAt && i.createdAt.slice(0, 10) === key
      ).length;

      last7Days.push({
        label: dayStart.toLocaleDateString(undefined, { weekday: "short" }),
        count,
      });
    }
    const maxDayCount = last7Days.reduce(
      (m, row) => (row.count > m ? row.count : m),
      0
    );

    const riskIndex =
      total === 0
        ? 0
        : (open + 2 * highPriority + 3 * slaBreached) / (total || 1);

    let healthScore = Math.round(100 - 22 * riskIndex);
    if (healthScore < 0) healthScore = 0;
    if (healthScore > 100) healthScore = 100;

    let healthLabel = "Healthy";
    let healthColor = "#16a34a";
    if (healthScore < 40) {
      healthLabel = "Critical";
      healthColor = "#b91c1c";
    } else if (healthScore < 70) {
      healthLabel = "Warning";
      healthColor = "#ea580c";
    }

    return {
      total,
      open,
      resolved,
      highPriority,
      slaBreached,
      heatmap,
      maxTotal,
      riskPairs,
      last7Days,
      maxDayCount,
      healthScore,
      healthLabel,
      healthColor,
    };
  }, [incidents]);

  const {
    total,
    open,
    resolved,
    highPriority,
    slaBreached,
    heatmap,
    maxTotal,
    riskPairs,
    last7Days,
    maxDayCount,
    healthScore,
    healthLabel,
    healthColor,
  } = stats;

  return (
    <div style={{ display: "grid", gap: 20 }}>
      {/* Header */}
      <div>
        <h2 style={{ fontSize: "1.3rem", fontWeight: 600, marginBottom: 4 }}>
          Admin Control Centre
        </h2>
        <p style={{ fontSize: "0.9rem", color: "#6b7280" }}>
          Live overview of all incidents across hostels, AI-based risk
          prediction for each (hostel, category) pair, campus health, and SLA
          risks.
        </p>
      </div>

      {/* Health + stats */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "minmax(0, 1.2fr) minmax(0, 2fr)",
          gap: 16,
        }}
      >
        {/* Campus health score */}
        <div
          style={{
            padding: "16px 18px",
            borderRadius: 16,
            background: "white",
            boxShadow: "0 12px 30px rgba(15,23,42,0.08)",
            display: "flex",
            flexDirection: "column",
            gap: 10,
          }}
        >
          <p
            style={{
              fontSize: "0.8rem",
              textTransform: "uppercase",
              letterSpacing: 1,
              color: "#6b7280",
            }}
          >
            Campus health score
          </p>

          <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
            <div
              style={{
                width: 80,
                height: 80,
                borderRadius: "999px",
                background:
                  "conic-gradient(" +
                  healthColor +
                  " " +
                  healthScore +
                  "%, #e5e7eb 0)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <div
                style={{
                  width: 58,
                  height: 58,
                  borderRadius: "999px",
                  background: "white",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexDirection: "column",
                }}
              >
                <span
                  style={{
                    fontSize: "1.2rem",
                    fontWeight: 700,
                    color: healthColor,
                  }}
                >
                  {healthScore}
                </span>
                <span
                  style={{
                    fontSize: "0.7rem",
                    color: "#6b7280",
                  }}
                >
                  /100
                </span>
              </div>
            </div>

            <div>
              <p
                style={{
                  fontSize: "0.95rem",
                  fontWeight: 600,
                  color: "#0f172a",
                }}
              >
                {healthLabel} campus state
              </p>
              <p
                style={{
                  fontSize: "0.8rem",
                  color: "#6b7280",
                  marginTop: 4,
                }}
              >
                This score combines open incidents, high-priority problems and
                SLA breaches. More long-lived, high-severity tickets reduce the
                score and highlight operational risk.
              </p>
            </div>
          </div>
        </div>

        {/* Stat cards */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit,minmax(150px,1fr))",
            gap: 12,
          }}
        >
          {[
            {
              label: "Total incidents",
              value: total,
              border: "#3b82f6",
              bg: "rgba(59,130,246,0.08)",
            },
            {
              label: "Open incidents",
              value: open,
              border: "#f97316",
              bg: "rgba(249,115,22,0.08)",
            },
            {
              label: "Resolved",
              value: resolved,
              border: "#22c55e",
              bg: "rgba(34,197,94,0.08)",
            },
            {
              label: "High priority",
              value: highPriority,
              border: "#ef4444",
              bg: "rgba(239,68,68,0.08)",
            },
            {
              label: "SLA risks (30+ min)",
              value: slaBreached,
              border: "#0f172a",
              bg: "rgba(15,23,42,0.04)",
            },
          ].map((c) => (
            <div
              key={c.label}
              style={{
                padding: "12px 14px",
                borderRadius: 16,
                border: `1px solid ${c.border}`,
                background: c.bg,
              }}
            >
              <p
                style={{
                  fontSize: "0.8rem",
                  color: "#6b7280",
                  marginBottom: 4,
                }}
              >
                {c.label}
              </p>
              <p
                style={{
                  fontSize: "1.3rem",
                  fontWeight: 700,
                  color: "#0f172a",
                }}
              >
                {c.value}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* AI risk predictions */}
      <div
        style={{
          padding: "16px 18px",
          borderRadius: 16,
          background: "white",
          boxShadow: "0 12px 30px rgba(15,23,42,0.08)",
        }}
      >
        <h3
          style={{
            fontSize: "1.05rem",
            fontWeight: 600,
            marginBottom: 6,
          }}
        >
          AI risk prediction – all hostel & category combinations
        </h3>
        <p
          style={{
            fontSize: "0.8rem",
            color: "#6b7280",
            marginBottom: 10,
          }}
        >
          For each <strong>(hostel, category)</strong> pair with at least one
          incident, we build a feature vector: total incidents, number of
          high-priority cases, activity in the last 24 hours and 7 days, number
          of open tickets and how long the oldest open ticket has been waiting.
          These are combined into a weighted risk score and passed through a{" "}
          <strong>logistic (sigmoid)</strong> function to obtain a probability
          of another incident in the near future.
        </p>

        {riskPairs.length === 0 ? (
          <p style={{ fontSize: "0.9rem", color: "#6b7280" }}>
            No incidents yet. As soon as reporters log issues, AI risk scores
            for each hostel & problem type will appear here.
          </p>
        ) : (
          <div
            style={{
              marginTop: 6,
              display: "grid",
              gap: 10,
            }}
          >
            {riskPairs.map((r) => (
              <div
                key={`${r.hostel}__${r.category}`}
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
                      {r.hostel} · {r.category}
                    </div>
                    <div
                      style={{
                        fontSize: "0.8rem",
                        color: "#6b7280",
                      }}
                    >
                      {r.total} incidents total · {r.high} high priority ·{" "}
                      {r.recent24h} in last 24h · {r.last7d} in last 7d
                    </div>
                    <div
                      style={{
                        fontSize: "0.78rem",
                        color: "#6b7280",
                        marginTop: 2,
                      }}
                    >
                      {r.openCount} open ticket
                      {r.openCount === 1 ? "" : "s"}
                      {r.openCount > 0 &&
                        ` · oldest open ~ ${r.oldestAgeHours}h`}
                    </div>
                  </div>

                  <div style={{ textAlign: "right" }}>
                    <div
                      style={{
                        fontSize: "0.8rem",
                        color: "#6b7280",
                      }}
                    >
                      Risk of another {r.category.toLowerCase()} issue here
                    </div>
                    <div
                      style={{
                        fontSize: "1.1rem",
                        fontWeight: 700,
                        color:
                          r.band === "High"
                            ? "#b91c1c"
                            : r.band === "Medium"
                            ? "#92400e"
                            : "#15803d",
                      }}
                    >
                      {r.probability}%
                    </div>
                    <div
                      style={{
                        fontSize: "0.75rem",
                        color: "#6b7280",
                        marginTop: 2,
                      }}
                    >
                      Band: <strong>{r.band}</strong> · Expected next 24h:{" "}
                      <strong>{r.expectedNext24h}</strong> incident
                      {r.expectedNext24h === 1 ? "" : "s"}
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
                      width: `${r.probability}%`,
                      height: "100%",
                      background:
                        r.band === "High"
                          ? "linear-gradient(90deg,#ef4444,#f97316)"
                          : r.band === "Medium"
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
                  Interpretation: frequently recurring, high-priority and
                  long-lived{" "}
                  <strong>{r.category.toLowerCase()}</strong> issues in{" "}
                  <strong>{r.hostel}</strong> push this probability upward.
                  Admins can proactively schedule checks or preventive
                  maintenance for the highest-risk pairs.
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Trend + heatmap */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "minmax(0, 1.3fr) minmax(0, 1.7fr)",
          gap: 16,
        }}
      >
        {/* 7-day trend */}
        <div
          style={{
            padding: "16px 18px",
            borderRadius: 16,
            background: "white",
            boxShadow: "0 12px 30px rgba(15,23,42,0.08)",
          }}
        >
          <h3
            style={{
              fontSize: "1.05rem",
              fontWeight: 600,
              marginBottom: 6,
            }}
          >
            Incident trend – last 7 days
          </h3>
          <p
            style={{
              fontSize: "0.85rem",
              color: "#6b7280",
              marginBottom: 12,
            }}
          >
            Shows whether incident volume on campus is trending up or down.
            This supports pattern and trend detection in the evaluation.
          </p>

          {last7Days.length === 0 ? (
            <p style={{ fontSize: "0.9rem", color: "#6b7280" }}>
              No incidents yet.
            </p>
          ) : (
            <div
              style={{
                display: "flex",
                alignItems: "flex-end",
                gap: 10,
                height: 150,
                paddingBottom: 8,
              }}
            >
              {last7Days.map((day) => {
                const h =
                  maxDayCount > 0
                    ? 20 + (day.count / maxDayCount) * 80
                    : 0;
                return (
                  <div
                    key={day.label}
                    style={{
                      flex: 1,
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "flex-end",
                      gap: 4,
                      fontSize: "0.75rem",
                    }}
                  >
                    <div
                      style={{
                        width: "70%",
                        height: `${h}%`,
                        borderRadius: 999,
                        background:
                          "linear-gradient(180deg,#2563eb,#38bdf8)",
                      }}
                    />
                    <span style={{ color: "#6b7280" }}>{day.label}</span>
                    <span style={{ color: "#111827" }}>{day.count}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Hostel heatmap */}
        <div
          style={{
            padding: "16px 18px",
            borderRadius: 16,
            background: "white",
            boxShadow: "0 12px 30px rgba(15,23,42,0.08)",
          }}
        >
          <h3
            style={{
              fontSize: "1.05rem",
              fontWeight: 600,
              marginBottom: 6,
            }}
          >
            Hostel / Block heatmap
          </h3>
          <p
            style={{
              fontSize: "0.85rem",
              color: "#6b7280",
              marginBottom: 12,
            }}
          >
            Distribution of incidents by hostel/block. Darker bars mean more
            incidents; the orange/red gradient shows locations with a high
            concentration of high-priority issues.
          </p>

          {heatmap.length === 0 ? (
            <p style={{ fontSize: "0.9rem", color: "#6b7280" }}>
              No incidents yet. Ask a reporter to create a few demo complaints.
            </p>
          ) : (
            <div style={{ display: "grid", gap: 10 }}>
              {heatmap.map((row) => {
                const widthPct =
                  maxTotal > 0 ? 20 + (row.total / maxTotal) * 80 : 0;
                const hasHigh = row.high > 0;
                return (
                  <div key={row.location}>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        fontSize: "0.85rem",
                        marginBottom: 4,
                      }}
                    >
                      <span style={{ fontWeight: 500 }}>{row.location}</span>
                      <span style={{ color: "#6b7280" }}>
                        {row.total} incidents · {row.high} high
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
                          background: hasHigh
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
    </div>
  );
}

export default DashboardAdmin;
