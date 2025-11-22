import { useEffect, useState } from "react";
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

function DashboardTechnician() {
  const { user } = useAuth();
  const [incidents, setIncidents] = useState([]);

  useEffect(() => {
    const all = loadIncidents();
    const mine = all.filter((i) =>
      ["High", "Medium"].includes(i.priority)
    );
    setIncidents(mine);
  }, []);

  const updateStatus = (id, status) => {
    const all = loadIncidents();
    const updatedAll = all.map((i) =>
      i.id === id ? { ...i, status } : i
    );
    saveIncidents(updatedAll);

    const updatedIncident = updatedAll.find((i) => i.id === id);
    const nowIso = new Date().toISOString();

    if (status === "In Progress") {
      pushNotification({
        id: Date.now() + 10,
        targetRole: "admin",
        targetEmail: null,
        title: "Technician started work",
        message: `${updatedIncident.category} issue in ${updatedIncident.location} is now In Progress.`,
        createdAt: nowIso,
      });
      pushNotification({
        id: Date.now() + 11,
        targetRole: "reporter",
        targetEmail: updatedIncident.reporterEmail || null,
        title: "Technician assigned",
        message: `A technician has started working on your ${updatedIncident.category} issue in ${updatedIncident.location}.`,
        createdAt: nowIso,
      });
    }

    if (status === "Resolved") {
      pushNotification({
        id: Date.now() + 12,
        targetRole: "admin",
        targetEmail: null,
        title: "Incident resolved",
        message: `${updatedIncident.category} issue in ${updatedIncident.location} has been resolved.`,
        createdAt: nowIso,
      });
      pushNotification({
        id: Date.now() + 13,
        targetRole: "reporter",
        targetEmail: updatedIncident.reporterEmail || null,
        title: "Issue closed",
        message: `Your ${updatedIncident.category} issue in ${updatedIncident.location} was marked as Resolved.`,
        createdAt: nowIso,
      });
    }

    const updatedMine = updatedAll.filter((i) =>
      ["High", "Medium"].includes(i.priority)
    );
    setIncidents(updatedMine);
  };

  return (
    <div style={{ display: "grid", gap: 16 }}>
      <div>
        <h2 style={{ fontSize: "1.3rem", fontWeight: 600 }}>
          Technician Workspace
        </h2>
        <p style={{ fontSize: "0.9rem", color: "#6b7280" }}>
          View and update high-priority incidents.
        </p>
        <p style={{ fontSize: "0.8rem", color: "#9ca3af", marginTop: 4 }}>
          (Future version: auto-assignment based on skills & workload. For this
          demo, you see all High / Medium priority incidents.)
        </p>
      </div>

      {incidents.length === 0 ? (
        <p style={{ fontSize: "0.9rem", color: "#6b7280" }}>
          No incidents yet. Ask a reporter to create some high priority issues.
        </p>
      ) : (
        <div
          style={{
            borderRadius: 12,
            border: "1px solid #e5e7eb",
            background: "white",
            boxShadow: "0 10px 26px rgba(15,23,42,0.06)",
            overflow: "hidden",
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
              <tr style={{ background: "#f9fafb", textAlign: "left" }}>
                {["Title", "Category", "Location", "Priority", "Status", "Actions"].map(
                  (h) => (
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
                  )
                )}
              </tr>
            </thead>
            <tbody>
              {incidents.map((i) => (
                <tr key={i.id}>
                  <td
                    style={{
                      padding: "9px 12px",
                      borderBottom: "1px solid #f3f4f6",
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
                        background:
                          i.priority === "High" ? "#fee2e2" : "#fef3c7",
                        color:
                          i.priority === "High" ? "#b91c1c" : "#92400e",
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
                        background:
                          i.status === "Resolved"
                            ? "#dcfce7"
                            : i.status === "In Progress"
                            ? "#e0f2fe"
                            : "#f3f4f6",
                        color:
                          i.status === "Resolved"
                            ? "#15803d"
                            : i.status === "In Progress"
                            ? "#0369a1"
                            : "#374151",
                      }}
                    >
                      {i.status}
                    </span>
                  </td>
                  <td
                    style={{
                      padding: "9px 12px",
                      borderBottom: "1px solid #f3f4f6",
                    }}
                  >
                    <div style={{ display: "flex", gap: 6 }}>
                      <button
                        onClick={() => updateStatus(i.id, "In Progress")}
                        style={{
                          fontSize: "0.75rem",
                          padding: "4px 8px",
                          borderRadius: 999,
                          border: "none",
                          background: "#e0f2fe",
                          color: "#0369a1",
                          cursor: "pointer",
                        }}
                      >
                        Mark In Progress
                      </button>
                      <button
                        onClick={() => updateStatus(i.id, "Resolved")}
                        style={{
                          fontSize: "0.75rem",
                          padding: "4px 8px",
                          borderRadius: 999,
                          border: "none",
                          background: "#dcfce7",
                          color: "#15803d",
                          cursor: "pointer",
                        }}
                      >
                        Resolve
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default DashboardTechnician;
