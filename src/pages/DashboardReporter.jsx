import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import useAuth from "../hooks/useauth.jsx";

const INCIDENT_STORAGE_KEY = "incidents_v1";
const NOTIF_KEY = "notifications_v1";

function loadIncidents() {
  try {
    const raw = localStorage.getItem(INCIDENT_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveIncidents(list) {
  localStorage.setItem(INCIDENT_STORAGE_KEY, JSON.stringify(list));
}

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

// Auto-priority for known categories
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

function DashboardReporter() {
  const { user } = useAuth();
  const [incidents, setIncidents] = useState([]);
  const [form, setForm] = useState({
    title: "",
    category: "Electricity",
    description: "",
    location: user?.location || "",
    imageUrl: "",
    manualPriority: "Medium", // used when category === "Other"
  });
  const [gps, setGps] = useState({
    lat: null,
    lng: null,
    loading: false,
    error: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    setIncidents(loadIncidents());
  }, []);

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

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!form.title || !form.description || !form.location) {
      setError("Please fill title, description and location.");
      return;
    }

    // anti-spam: limit open incidents per user
    const myOpen = incidents.filter(
      (i) =>
        i.reporterEmail === (user?.email || "anonymous") &&
        i.status !== "Resolved"
    );
    if (myOpen.length >= 5) {
      setError(
        "You already have 5 active incidents. Please wait for some to be resolved before creating more."
      );
      return;
    }

    // prevent duplicate open incidents of same category + location
    const duplicate = incidents.find(
      (i) =>
        i.category === form.category &&
        i.location.toLowerCase() === form.location.toLowerCase() &&
        i.status !== "Resolved"
    );
    if (duplicate) {
      setError(
        "A similar incident for this category and location is already open."
      );
      return;
    }

    // Choose priority:
    // - For Other → use manualPriority chosen by user
    // - For all others → autoPriority
    const priority =
      form.category === "Other"
        ? form.manualPriority || "Medium"
        : autoPriority(form.category, form.description);

    const nowIso = new Date().toISOString();

    const newIncident = {
      id: Date.now(),
      title: form.title,
      category: form.category,
      description: form.description,
      location: form.location,
      imageUrl: form.imageUrl,
      priority,
      status: "New",
      reporterEmail: user?.email || "anonymous",
      createdAt: nowIso,
      latitude: gps.lat,
      longitude: gps.lng,
    };

    const updated = [newIncident, ...incidents];
    setIncidents(updated);
    saveIncidents(updated);

    // 🔔 Notifications
    // Reporter
    pushNotification({
      id: Date.now() + 1,
      targetRole: "reporter",
      targetEmail: user?.email || null,
      title: "Incident recorded",
      message: `Your ${priority} priority ${form.category} issue in ${form.location} has been logged.`,
      createdAt: nowIso,
    });

    // Admin
    pushNotification({
      id: Date.now() + 2,
      targetRole: "admin",
      targetEmail: null,
      title: "New campus incident",
      message: `${priority} priority ${form.category} issue reported in ${form.location}.`,
      createdAt: nowIso,
    });

    // Technicians if High
    if (priority === "High") {
      pushNotification({
        id: Date.now() + 3,
        targetRole: "technician",
        targetEmail: null,
        title: "High priority incident",
        message: `High priority ${form.category} issue in ${form.location} requires quick attention.`,
        createdAt: nowIso,
      });
    }

    setSuccess("Incident created successfully with priority: " + priority);
    setForm((prev) => ({
      ...prev,
      title: "",
      description: "",
      imageUrl: "",
      // keep category, location, manualPriority as-is
    }));
  };

  // simple "prediction": if >=3 incidents same category+location
  const predictionMessages = [];
  const byKey = {};
  incidents.forEach((i) => {
    const key = `${i.category}__${i.location}`;
    byKey[key] = (byKey[key] || 0) + 1;
  });
  Object.entries(byKey).forEach(([key, count]) => {
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

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "minmax(0, 3fr) minmax(0, 2fr)",
        gap: "24px",
      }}
    >
      {/* Left: welcome + form */}
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
            Reporter · {user?.location || "Campus"}
          </p>
          <h2 style={{ fontSize: "1.4rem", fontWeight: 600, marginTop: 4 }}>
            Hi {user?.name || "Reporter"}, log an issue in seconds.
          </h2>
          <p style={{ fontSize: "0.9rem", marginTop: 6, opacity: 0.95 }}>
            Your issues help us detect patterns and prevent future failures.
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
                placeholder="Short summary (e.g., Power outage in Hostel A)"
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
                  form.category === "Other" ? "1.2fr 1.2fr 1.3fr" : "1.3fr 1.7fr",
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
                  Location
                </label>
                <input
                  name="location"
                  value={form.location}
                  onChange={handleChange}
                  placeholder="e.g., Hostel A, Block 2"
                  style={{
                    width: "100%",
                    padding: "8px 10px",
                    borderRadius: 10,
                    border: "1px solid #d1d5db",
                    fontSize: "0.9rem",
                  }}
                />
                {/* GPS button + info */}
                <div style={{ marginTop: 4 }}>
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
        </div>

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
                  {i.category} · {i.location}
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
                    {new Date(i.createdAt).toLocaleString(undefined, {
                      dateStyle: "short",
                      timeStyle: "short",
                    })}
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
