import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import useAuth from "../hooks/useauth.jsx";
import {
  fetchIncidents,
  createIncident,
} from "../services/incidentsApi"; // ✅ Node backend

const NOTIF_KEY = "notifications_v1";

// Notifications still local (per device)
function loadNotifications() {
  try {
    const raw = localStorage.getItem(NOTIF_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveNotifications(list) {
  localStorage.setItem(NOTIF_KEY, JSON.stringify(list));
}

function pushNotification(notification) {
  const all = loadNotifications();
  all.unshift(notification);
  saveNotifications(all);
}

// Auto priority for standard categories
function autoPriority(category, description) {
  const text = (category + " " + description).toLowerCase();
  if (
    text.includes("fire") ||
    text.includes("shock") ||
    text.includes("leak") ||
    text.includes("burst") ||
    text.includes("short circuit") ||
    category.toLowerCase() === "electricity"
  ) {
    return "High";
  }
  if (text.includes("slow") || text.includes("minor") || text.includes("low")) {
    return "Low";
  }
  return "Medium";
}

// logistic for probability-like score
function sigmoid(x) {
  return 1 / (1 + Math.exp(-x));
}

function DashboardReporter() {
  const { user } = useAuth();
  const [incidents, setIncidents] = useState([]);
  const [form, setForm] = useState({
    title: "",
    category: "Electricity",
    description: "",
    hostel: "",
    room: "",
    imageUrl: "",
    manualPriority: "Medium", // used when category === "Other"
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // GPS state
  const [gps, setGps] = useState({
    lat: null,
    lng: null,
    loading: false,
    error: "",
  });

  // 🔄 Load incidents from Node backend
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

  const reloadIncidents = async () => {
    try {
      const all = await fetchIncidents();
      setIncidents(all || []);
    } catch (err) {
      console.error("Failed to reload incidents", err);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleGetLocation = () => {
    setGps((g) => ({ ...g, loading: true, error: "" }));
    if (!navigator.geolocation) {
      setGps({
        lat: null,
        lng: null,
        loading: false,
        error: "Geolocation not supported in this browser.",
      });
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setGps({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          loading: false,
          error: "",
        });
      },
      () => {
        setGps({
          lat: null,
          lng: null,
          loading: false,
          error: "Unable to fetch location (permission denied or error).",
        });
      }
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!form.title || !form.description || !form.hostel || !form.room) {
      setError("Please fill title, description, hostel and room.");
      return;
    }

    const reporterEmail = user?.email || "anonymous";

    // anti-spam: max 5 active incidents per user
    const myOpen = incidents.filter(
      (i) => i.reporterEmail === reporterEmail && i.status !== "Resolved"
    );
    if (myOpen.length >= 5) {
      setError(
        "You already have 5 active incidents. Please wait for some to be resolved before creating more."
      );
      return;
    }

    // prevent duplicate open incidents of same problem IN SAME HOSTEL + SAME ROOM
    const duplicate = incidents.find((i) => {
      const sameCategory =
        (i.category || "").toLowerCase() === form.category.toLowerCase();
      const sameHostel =
        (i.hostel || "").trim().toLowerCase() ===
        form.hostel.trim().toLowerCase();
      const sameRoom =
        (i.room || "").trim().toLowerCase() === form.room.trim().toLowerCase();
      const stillOpen = i.status !== "Resolved";
      return sameCategory && sameHostel && sameRoom && stillOpen;
    });

    if (duplicate) {
      setError(
        "There is already an open incident for this problem in this exact hostel & room. Others from this room should follow that ticket instead of creating a new one."
      );
      return;
    }

    const priority =
      form.category === "Other"
        ? form.manualPriority || "Medium"
        : autoPriority(form.category, form.description);

    const nowIso = new Date().toISOString();
    const locationDisplay = `${form.hostel} - Room ${form.room}`;

    const newIncident = {
      title: form.title,
      category: form.category,
      description: form.description,
      hostel: form.hostel,
      room: form.room,
      location: locationDisplay,
      imageUrl: form.imageUrl,
      priority,
      status: "New",
      reporterEmail,
      createdAt: nowIso,
      latitude: gps.lat,
      longitude: gps.lng,
    };

    try {
      await createIncident(newIncident);
      await reloadIncidents();

      // local notifications only
      pushNotification({
        id: Date.now() + 1,
        targetRole: "reporter",
        targetEmail: reporterEmail,
        title: "Incident recorded",
        message: `Your ${priority} priority ${form.category} issue in ${locationDisplay} has been logged.`,
        createdAt: nowIso,
      });

      pushNotification({
        id: Date.now() + 2,
        targetRole: "admin",
        targetEmail: null,
        title: "New campus incident",
        message: `${priority} priority ${form.category} issue reported in ${locationDisplay}.`,
        createdAt: nowIso,
      });

      if (priority === "High") {
        pushNotification({
          id: Date.now() + 3,
          targetRole: "technician",
          targetEmail: null,
          title: "High priority incident",
          message: `High priority ${form.category} issue in ${locationDisplay} requires quick attention.`,
          createdAt: nowIso,
        });
      }

      setSuccess("Incident created successfully with priority: " + priority);
      setForm((prev) => ({
        ...prev,
        title: "",
        description: "",
        imageUrl: "",
      }));
    } catch (err) {
      console.error("Failed to create incident", err);
      setError("Could not create incident. Please try again.");
    }
  };

  // Simple frequency-based prediction (repeating patterns by hostel)
  const predictionMessages = [];
  const freqMap = {};
  incidents.forEach((i) => {
    const hostelKey = i.hostel || i.location || "Unknown";
    const key = `${i.category}__${hostelKey}`;
    freqMap[key] = (freqMap[key] || 0) + 1;
  });
  Object.entries(freqMap).forEach(([key, count]) => {
    if (count >= 3) {
      const [cat, loc] = key.split("__");
      predictionMessages.push(
        `High chance of more ${cat} issues in ${loc} (reported ${count} times).`
      );
    }
  });

  const recent = incidents
    .filter((i) => i.reporterEmail === (user?.email || "anonymous"))
    .slice(0, 4);

  // 🔮 Stronger prediction model reused (per hostel+category)
  const advancedPrediction = useMemo(() => {
    if (!incidents.length) {
      return { currentPair: null, topForHostel: [] };
    }

    const now = Date.now();
    const byHostelCat = {};

    incidents.forEach((i) => {
      const hostel = (i.hostel || i.location || "Unknown").trim();
      const cat = i.category || "Other";
      const key = `${hostel.toLowerCase()}__${cat}`;
      const ts = i.createdAt ? new Date(i.createdAt).getTime() : null;

      if (!byHostelCat[key]) {
        byHostelCat[key] = {
          hostel,
          category: cat,
          total: 0,
          high: 0,
          recent24h: 0,
          openCount: 0,
          oldestOpenTs: null,
        };
      }
      const bucket = byHostelCat[key];

      bucket.total += 1;
      if (i.priority === "High") bucket.high += 1;

      if (ts !== null && now - ts <= 24 * 60 * 60 * 1000) {
        bucket.recent24h += 1;
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

    const riskPairs = Object.values(byHostelCat).map((bucket) => {
      const { hostel, category, total, high, recent24h, openCount } = bucket;

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
        0.9 * openCount +
        1.1 * agingScore;

      const prob = sigmoid(rawScore / 3.5);
      const probability = Math.round(prob * 100);

      return {
        hostel,
        category,
        total,
        high,
        recent24h,
        openCount,
        probability,
      };
    });

    riskPairs.sort((a, b) => b.probability - a.probability);

    const baseHostel = (form.hostel || "").trim().toLowerCase();

    let currentPair = null;
    let topForHostel = [];

    if (baseHostel) {
      topForHostel = riskPairs
        .filter((r) => r.hostel.toLowerCase() === baseHostel)
        .slice(0, 3);

      currentPair =
        topForHostel.find((r) => r.category === form.category) || null;
    }

    return { currentPair, topForHostel };
  }, [incidents, form.hostel, form.category]);

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "minmax(0, 3fr) minmax(0, 2fr)",
        gap: "24px",
      }}
    >
      {/* Left: hero + form + AI prediction */}
      <div>
        <div
          style={{
            marginBottom: "18px",
            padding: "16px 18px",
            borderRadius: "16px",
            background: "linear-gradient(135deg, #1d4ed8, #6366f1)",
            color: "white",
            boxShadow: "0 18px 35px rgba(37,99,235,0.35)",
          }}
        >
          <p style={{ fontSize: "0.85rem", opacity: 0.9 }}>
            Reporter · Smart Campus
          </p>
          <h2 style={{ fontSize: "1.4rem", fontWeight: 600, marginTop: 4 }}>
            Hi {user?.name || "Reporter"}, log an issue in seconds.
          </h2>
          <p style={{ fontSize: "0.9rem", marginTop: 6, opacity: 0.95 }}>
            As you report, our model updates risk scores for each hostel and
            problem type to prevent repeated breakdowns.
          </p>
        </div>

        <div
          style={{
            padding: "18px 20px",
            borderRadius: "16px",
            background: "white",
            boxShadow: "0 12px 30px rgba(15,23,42,0.08)",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginBottom: 10,
              alignItems: "center",
            }}
          >
            <h3 style={{ fontSize: "1.1rem", fontWeight: 600 }}>
              Create New Incident
            </h3>
            <Link
              to="/reporter/incidents"
              style={{
                fontSize: "0.85rem",
                color: "#2563eb",
                textDecoration: "none",
              }}
            >
              View my incidents →
            </Link>
          </div>

          {error && (
            <div
              style={{
                marginBottom: 10,
                padding: "8px 10px",
                borderRadius: 8,
                background: "#fee2e2",
                color: "#b91c1c",
                fontSize: "0.85rem",
              }}
            >
              {error}
            </div>
          )}

          {success && (
            <div
              style={{
                marginBottom: 10,
                padding: "8px 10px",
                borderRadius: 8,
                background: "#dcfce7",
                color: "#166534",
                fontSize: "0.85rem",
              }}
            >
              {success}
            </div>
          )}

          <form
            onSubmit={handleSubmit}
            style={{ display: "grid", gap: "10px", marginTop: 4 }}
          >
            <div>
              <label
                style={{
                  display: "block",
                  fontSize: "0.8rem",
                  marginBottom: 4,
                  color: "#4b5563",
                }}
              >
                Title
              </label>
              <input
                name="title"
                value={form.title}
                onChange={handleChange}
                placeholder="Short summary (e.g., Power outage in Hostel A - Room 101)"
                style={{
                  width: "100%",
                  padding: "8px 10px",
                  borderRadius: 10,
                  border: "1px solid #d1d5db",
                  fontSize: "0.9rem",
                }}
              />
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns:
                  form.category === "Other"
                    ? "1.2fr 1.2fr 1.2fr 1.3fr"
                    : "1.2fr 1.2fr 1.2fr",
                gap: 10,
              }}
            >
              <div>
                <label
                  style={{
                    display: "block",
                    fontSize: "0.8rem",
                    marginBottom: 4,
                    color: "#4b5563",
                  }}
                >
                  Category
                </label>
                <select
                  name="category"
                  value={form.category}
                  onChange={handleChange}
                  style={{
                    width: "100%",
                    padding: "8px 10px",
                    borderRadius: 10,
                    border: "1px solid #d1d5db",
                    fontSize: "0.9rem",
                  }}
                >
                  <option>Electricity</option>
                  <option>Water</option>
                  <option>Internet</option>
                  <option>Hostel</option>
                  <option>Equipment</option>
                  <option>Other</option>
                </select>
              </div>

              <div>
                <label
                  style={{
                    display: "block",
                    fontSize: "0.8rem",
                    marginBottom: 4,
                    color: "#4b5563",
                  }}
                >
                  Hostel / Block
                </label>
                <input
                  name="hostel"
                  value={form.hostel}
                  onChange={handleChange}
                  placeholder="e.g., Hostel A"
                  style={{
                    width: "100%",
                    padding: "8px 10px",
                    borderRadius: 10,
                    border: "1px solid #d1d5db",
                    fontSize: "0.9rem",
                  }}
                />
                <div
                  style={{
                    fontSize: "0.75rem",
                    color: "#6b7280",
                    marginTop: 2,
                  }}
                >
                  Use the same name (e.g., "Hostel A") so all reports from that
                  hostel are grouped correctly.
                </div>
              </div>

              <div>
                <label
                  style={{
                    display: "block",
                    fontSize: "0.8rem",
                    marginBottom: 4,
                    color: "#4b5563",
                  }}
                >
                  Room / Spot
                </label>
                <input
                  name="room"
                  value={form.room}
                  onChange={handleChange}
                  placeholder="e.g., 101, Ground floor lobby"
                  style={{
                    width: "100%",
                    padding: "8px 10px",
                    borderRadius: 10,
                    border: "1px solid #d1d5db",
                    fontSize: "0.9rem",
                  }}
                />
              </div>

              {form.category === "Other" && (
                <div>
                  <label
                    style={{
                      display: "block",
                      fontSize: "0.8rem",
                      marginBottom: 4,
                      color: "#4b5563",
                    }}
                  >
                    Priority (for "Other")
                  </label>
                  <select
                    name="manualPriority"
                    value={form.manualPriority}
                    onChange={handleChange}
                    style={{
                      width: "100%",
                      padding: "8px 10px",
                      borderRadius: 10,
                      border: "1px solid #d1d5db",
                      fontSize: "0.9rem",
                    }}
                  >
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                  </select>
                </div>
              )}
            </div>

            {/* GPS helper */}
            <div style={{ marginTop: 2 }}>
              <button
                type="button"
                onClick={handleGetLocation}
                style={{
                  fontSize: "0.75rem",
                  padding: "4px 8px",
                  borderRadius: 999,
                  border: "1px dashed #9ca3af",
                  background: "#f9fafb",
                  cursor: "pointer",
                }}
              >
                {gps.loading ? "Capturing GPS..." : "Use my GPS (beta)"}
              </button>
              {gps.lat && gps.lng && (
                <span
                  style={{
                    marginLeft: 8,
                    fontSize: "0.75rem",
                    color: "#6b7280",
                  }}
                >
                  Captured: {gps.lat.toFixed(4)}, {gps.lng.toFixed(4)}
                </span>
              )}
              {gps.error && (
                <div
                  style={{
                    fontSize: "0.75rem",
                    color: "#b91c1c",
                    marginTop: 2,
                  }}
                >
                  {gps.error}
                </div>
              )}
            </div>

            {/* Live AI prediction for this hostel + category */}
            {advancedPrediction.currentPair && (
              <div
                style={{
                  marginTop: 4,
                  padding: "8px 10px",
                  borderRadius: 10,
                  background: "#eff6ff",
                  border: "1px dashed #bfdbfe",
                  fontSize: "0.8rem",
                  color: "#1d4ed8",
                }}
              >
                <strong>
                  AI prediction for {advancedPrediction.currentPair.hostel} ·{" "}
                  {advancedPrediction.currentPair.category}:
                </strong>{" "}
                ~{advancedPrediction.currentPair.probability}% chance of another{" "}
                {advancedPrediction.currentPair.category.toLowerCase()} issue
                soon, based on{" "}
                {advancedPrediction.currentPair.total} past incidents (
                {advancedPrediction.currentPair.high} high priority,{" "}
                {advancedPrediction.currentPair.recent24h} in last 24h,{" "}
                {advancedPrediction.currentPair.openCount} currently open).
              </div>
            )}

            <div>
              <label
                style={{
                  display: "block",
                  fontSize: "0.8rem",
                  marginBottom: 4,
                  color: "#4b5563",
                }}
              >
                Description
              </label>
              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                rows={4}
                placeholder="Describe the issue, how long it has been happening, any safety concerns, etc."
                style={{
                  width: "100%",
                  padding: "8px 10px",
                  borderRadius: 10,
                  border: "1px solid #d1d5db",
                  fontSize: "0.9rem",
                  resize: "vertical",
                }}
              />
            </div>

            <div>
              <label
                style={{
                  display: "block",
                  fontSize: "0.8rem",
                  marginBottom: 4,
                  color: "#4b5563",
                }}
              >
                Image URL (optional)
              </label>
              <input
                name="imageUrl"
                value={form.imageUrl}
                onChange={handleChange}
                placeholder="Paste a hosted image link if available"
                style={{
                  width: "100%",
                  padding: "8px 10px",
                  borderRadius: 10,
                  border: "1px solid #d1d5db",
                  fontSize: "0.9rem",
                }}
              />
            </div>

            <button
              type="submit"
              style={{
                marginTop: 6,
                padding: "10px 14px",
                borderRadius: "999px",
                border: "none",
                fontWeight: 600,
                fontSize: "0.95rem",
                background: "linear-gradient(135deg, #10b981, #22c55e)",
                color: "white",
                cursor: "pointer",
                justifySelf: "flex-start",
              }}
            >
              Submit incident
            </button>
          </form>

          {/* Global prediction messages (frequency-based) */}
          {predictionMessages.length > 0 && (
            <div
              style={{
                marginTop: 16,
                padding: "10px 14px",
                borderRadius: 12,
                background: "#ecfdf5",
                border: "1px dashed #6ee7b7",
                fontSize: "0.85rem",
                color: "#065f46",
              }}
            >
              <strong>Prediction insights:</strong>
              <ul style={{ marginTop: 6, paddingLeft: "18px" }}>
                {predictionMessages.map((msg, idx) => (
                  <li key={idx}>{msg}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Top risky problems for this hostel */}
          {advancedPrediction.topForHostel.length > 0 && (
            <div
              style={{
                marginTop: 12,
                padding: "10px 14px",
                borderRadius: 12,
                background: "#f9fafb",
                border: "1px solid #e5e7eb",
                fontSize: "0.8rem",
                color: "#4b5563",
              }}
            >
              <strong>
                Hotspots in {advancedPrediction.topForHostel[0].hostel} (by
                model):
              </strong>
              <ul style={{ marginTop: 6, paddingLeft: 18 }}>
                {advancedPrediction.topForHostel.slice(0, 2).map((r) => (
                  <li key={r.category}>
                    {r.category} – {r.probability}% risk · {r.total} incidents (
                    {r.high} high, {r.recent24h} in last 24h)
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>

      {/* Right: recent incidents */}
      <div>
        <div
          style={{
            padding: "16px 18px",
            borderRadius: "16px",
            background: "white",
            boxShadow: "0 12px 30px rgba(15,23,42,0.08)",
          }}
        >
          <h3 style={{ fontSize: "1.05rem", fontWeight: 600, marginBottom: 10 }}>
            Recent incidents by you
          </h3>
          {recent.length === 0 && (
            <p style={{ fontSize: "0.9rem", color: "#6b7280" }}>
              You haven't logged any incidents yet. Your last 4 incidents will
              appear here once you submit.
            </p>
          )}

          <div style={{ display: "grid", gap: 10 }}>
            {recent.map((i) => (
              <div
                key={i.id}
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
                  }}
                >
                  <div
                    style={{
                      fontSize: "0.95rem",
                      fontWeight: 600,
                      color: "#111827",
                    }}
                  >
                    {i.title}
                  </div>
                  <span
                    style={{
                      fontSize: "0.7rem",
                      padding: "2px 8px",
                      borderRadius: 999,
                      background:
                        i.priority === "High"
                          ? "#fee2e2"
                          : i.priority === "Medium"
                          ? "#fef3c7"
                          : "#dcfce7",
                      color:
                        i.priority === "High"
                          ? "#b91c1c"
                          : i.priority === "Medium"
                          ? "#92400e"
                          : "#166534",
                    }}
                  >
                    {i.priority} priority
                  </span>
                </div>
                <p
                  style={{
                    fontSize: "0.8rem",
                    color: "#4b5563",
                    marginBottom: 4,
                  }}
                >
                  {i.category} · {i.location || `${i.hostel} - Room ${i.room}`}
                </p>
                <p
                  style={{
                    fontSize: "0.8rem",
                    color: "#6b7280",
                    maxHeight: 40,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  {i.description}
                </p>
                <div
                  style={{
                    marginTop: 6,
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <span
                    style={{
                      fontSize: "0.75rem",
                      padding: "2px 8px",
                      borderRadius: 999,
                      background: "#e0f2fe",
                      color: "#0369a1",
                    }}
                  >
                    {i.status}
                  </span>
                  <span
                    style={{
                      fontSize: "0.75rem",
                      color: "#9ca3af",
                    }}
                  >
                    {i.createdAt
                      ? new Date(i.createdAt).toLocaleString(undefined, {
                          dateStyle: "short",
                          timeStyle: "short",
                        })
                      : "-"}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {recent.length > 0 && (
            <div style={{ marginTop: 10 }}>
              <Link
                to="/reporter/incidents"
                style={{
                  fontSize: "0.85rem",
                  color: "#2563eb",
                  textDecoration: "none",
                }}
              >
                See full incident history →
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default DashboardReporter;
