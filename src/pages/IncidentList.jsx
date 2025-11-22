import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import useAuth from "../hooks/useauth.jsx";

const INCIDENT_STORAGE_KEY = "incidents_v1";

function loadIncidents() {
  try {
    const raw = localStorage.getItem(INCIDENT_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function badgeStyle(type, value) {
  if (type === "priority") {
    if (value === "High") {
      return { bg: "#fee2e2", color: "#b91c1c" };
    } else if (value === "Medium") {
      return { bg: "#fef3c7", color: "#92400e" };
    }
    return { bg: "#dcfce7", color: "#166534" };
  }

  if (value === "Resolved") {
    return { bg: "#dcfce7", color: "#15803d" };
  }
  if (value === "In Progress" || value === "Assigned") {
    return { bg: "#e0f2fe", color: "#0369a1" };
  }
  return { bg: "#f3f4f6", color: "#374151" };
}

function IncidentList() {
  const { user } = useAuth();
  const [incidents, setIncidents] = useState([]);

  useEffect(() => {
    const all = loadIncidents();
    const mine = all.filter(
      (i) => i.reporterEmail === (user?.email || "anonymous")
    );
    setIncidents(mine);
  }, [user]);

  return (
    <div>
      <div
        style={{
          marginBottom: 16,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <div>
          <h2 style={{ fontSize: "1.2rem", fontWeight: 600 }}>
            My Incident History
          </h2>
          <p style={{ fontSize: "0.85rem", color: "#6b7280" }}>
            All incidents you have reported on campus.
          </p>
        </div>
        <Link
          to="/reporter/dashboard"
          style={{
            fontSize: "0.85rem",
            color: "#2563eb",
            textDecoration: "none",
          }}
        >
          ← Back to dashboard
        </Link>
      </div>

      {incidents.length === 0 ? (
        <p style={{ fontSize: "0.9rem", color: "#6b7280" }}>
          No incidents yet. Create your first one from the dashboard.
        </p>
      ) : (
        <div
          style={{
            overflowX: "auto",
            borderRadius: 12,
            border: "1px solid #e5e7eb",
            background: "white",
            boxShadow: "0 10px 26px rgba(15,23,42,0.06)",
          }}
        >
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              fontSize: "0.85rem",
            }}
          >
            <thead>
              <tr
                style={{
                  background: "#f9fafb",
                  textAlign: "left",
                }}
              >
                {[
                  "Title",
                  "Category",
                  "Location",
                  "Priority",
                  "Status",
                  "Created at",
                ].map((h) => (
                  <th
                    key={h}
                    style={{
                      padding: "10px 12px",
                      borderBottom: "1px solid #e5e7eb",
                      color: "#6b7280",
                      fontWeight: 500,
                    }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {incidents.map((i) => {
                const pStyle = badgeStyle("priority", i.priority);
                const sStyle = badgeStyle("status", i.status);
                return (
                  <tr key={i.id}>
                    <td
                      style={{
                        padding: "9px 12px",
                        borderBottom: "1px solid #f3f4f6",
                        maxWidth: 220,
                      }}
                    >
                      <div
                        style={{
                          fontWeight: 500,
                          color: "#111827",
                          marginBottom: 2,
                        }}
                      >
                        {i.title}
                      </div>
                      <div
                        style={{
                          fontSize: "0.75rem",
                          color: "#9ca3af",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                        title={i.description}
                      >
                        {i.description}
                      </div>
                    </td>
                    <td
                      style={{
                        padding: "9px 12px",
                        borderBottom: "1px solid #f3f4f6",
                      }}
                    >
                      {i.category}
                    </td>
                    <td
                      style={{
                        padding: "9px 12px",
                        borderBottom: "1px solid #f3f4f6",
                      }}
                    >
                      {i.location}
                    </td>
                    <td
                      style={{
                        padding: "9px 12px",
                        borderBottom: "1px solid #f3f4f6",
                      }}
                    >
                      <span
                        style={{
                          padding: "2px 8px",
                          borderRadius: 999,
                          background: pStyle.bg,
                          color: pStyle.color,
                        }}
                      >
                        {i.priority}
                      </span>
                    </td>
                    <td
                      style={{
                        padding: "9px 12px",
                        borderBottom: "1px solid #f3f4f6",
                      }}
                    >
                      <span
                        style={{
                          padding: "2px 8px",
                          borderRadius: 999,
                          background: sStyle.bg,
                          color: sStyle.color,
                        }}
                      >
                        {i.status}
                      </span>
                    </td>
                    <td
                      style={{
                        padding: "9px 12px",
                        borderBottom: "1px solid #f3f4f6",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {new Date(i.createdAt).toLocaleString(undefined, {
                        dateStyle: "short",
                        timeStyle: "short",
                      })}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default IncidentList;
