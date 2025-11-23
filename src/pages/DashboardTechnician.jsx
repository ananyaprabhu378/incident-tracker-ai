// src/pages/DashboardTechnician.jsx
import { useEffect, useMemo, useState } from "react";
import useAuth from "../hooks/useauth.jsx";
import {
  fetchIncidents,
  updateIncident,
} from "../services/incidentsApi"; // ✅ Node backend

// small helpers
function formatAge(createdAt) {
  if (!createdAt) return "-";
  const now = Date.now();
  const ts = new Date(createdAt).getTime();
  const diffMin = Math.max(0, Math.round((now - ts) / (1000 * 60)));
  if (diffMin < 60) return `${diffMin} min`;
  const hours = diffMin / 60;
  if (hours < 24) return `${hours.toFixed(1)} h`;
  const days = hours / 24;
  return `${days.toFixed(1)} d`;
}

function isSlaBreached(createdAt) {
  if (!createdAt) return false;
  const now = Date.now();
  const ts = new Date(createdAt).getTime();
  const diffMin = (now - ts) / (1000 * 60);
  return diffMin > 30;
}

function DashboardTechnician() {
  const { user } = useAuth();
  const [incidents, setIncidents] = useState([]);
  const [filterPriority, setFilterPriority] = useState("all");
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [selectedIncident, setSelectedIncident] = useState(null);

  const technicianId = user?.email || "tech";

  // 🔄 Load incidents from Node backend (instead of Firestore subscribe)
  const loadIncidents = async () => {
    try {
      const data = await fetchIncidents();
      setIncidents(data || []);
    } catch (err) {
      console.error("Failed to fetch incidents", err);
      setError("Could not load incidents from server.");
    }
  };

  useEffect(() => {
    loadIncidents();
  }, []);

  const metrics = useMemo(() => {
    const assignedToMe = incidents.filter(
      (i) => i.assignedTo === technicianId && i.status !== "Resolved"
    );
    const inProgress = assignedToMe.filter((i) => i.status === "In Progress");
    const slaRisk = assignedToMe.filter((i) => isSlaBreached(i.createdAt));
    return {
      assignedCount: assignedToMe.length,
      inProgressCount: inProgress.length,
      slaRiskCount: slaRisk.length,
    };
  }, [incidents, technicianId]);

  const visibleIncidents = useMemo(() => {
    let list = incidents.filter((i) => i.status !== "Resolved");
    if (filterPriority !== "all") {
      list = list.filter((i) => i.priority === filterPriority);
    }

    const priorityOrder = { High: 0, Medium: 1, Low: 2 };
    return [...list].sort((a, b) => {
      const aSla = isSlaBreached(a.createdAt);
      const bSla = isSlaBreached(b.createdAt);
      if (aSla && !bSla) return -1;
      if (!aSla && bSla) return 1;
      const pa = priorityOrder[a.priority] ?? 3;
      const pb = priorityOrder[b.priority] ?? 3;
      if (pa !== pb) return pa - pb;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }, [incidents, filterPriority]);

  // ---------- ACTION HANDLERS USING NODE BACKEND ----------

  const handleAssignToMe = async (incident) => {
    if (metrics.assignedCount >= 1) {
      setError(
        "You already have an assigned incident. Resolve or release it before taking another."
      );
      return;
    }

    try {
      setSelectedIncident(incident);
      await updateIncident(incident.id, {
        assignedTo: technicianId,
        assignedName: user?.name || "Technician",
        assignedAt: new Date().toISOString(),
      });
      setInfo("Incident assigned to you.");
      await loadIncidents(); // refresh from backend
    } catch (err) {
      console.error(err);
      setError("Failed to assign incident.");
    }
  };

  const handleStartWork = async (incident) => {
    try {
      setSelectedIncident(incident);
      await updateIncident(incident.id, {
        status: "In Progress",
        startedAt: new Date().toISOString(),
      });
      setInfo("Work started.");
      await loadIncidents();
    } catch (err) {
      console.error(err);
      setError("Failed to start work.");
    }
  };

  const handleResolve = async (incident) => {
    try {
      setSelectedIncident(incident);
      await updateIncident(incident.id, {
        status: "Resolved",
        resolvedAt: new Date().toISOString(),
      });
      setInfo("Incident marked resolved.");
      await loadIncidents();
    } catch (err) {
      console.error(err);
      setError("Failed to resolve incident.");
    }
  };

  const handleRelease = async (incident) => {
    try {
      setSelectedIncident(incident);
      await updateIncident(incident.id, {
        assignedTo: null,
        assignedName: null,
        assignedAt: null,
        startedAt: null,
        status: "New",
      });
      setInfo("Incident released.");
      await loadIncidents();
    } catch (err) {
      console.error(err);
      setError("Failed to release incident.");
    }
  };

  const renderLocationDisplay = (i) => {
    if (i.location) return i.location;
    const parts = [];
    if (i.hostel) parts.push(i.hostel);
    if (i.room) parts.push(`Room ${i.room}`);
    return parts.join(" - ") || "Unknown location";
  };

  return (
    <div style={{ display: "grid", gap: 20 }}>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "minmax(0, 2fr) minmax(0, 1.2fr)",
          gap: 16,
        }}
      >
        <div>
          <h2 style={{ fontSize: "1.3rem", fontWeight: 600, marginBottom: 4 }}>
            Technician workload
          </h2>
          <p style={{ fontSize: "0.9rem", color: "#6b7280" }}>
            Take ownership of incidents and resolve them in priority order.
          </p>
        </div>

        <div
          style={{
            padding: "10px 12px",
            borderRadius: 14,
            background: "white",
            boxShadow: "0 10px 26px rgba(15,23,42,0.08)",
            display: "flex",
            justifyContent: "space-between",
            fontSize: "0.85rem",
          }}
        >
          <div>
            <p style={{ color: "#6b7280" }}>Assigned to you</p>
            <p style={{ fontWeight: 600 }}>{metrics.assignedCount}</p>
          </div>
          <div>
            <p style={{ color: "#6b7280" }}>In progress</p>
            <p style={{ fontWeight: 600 }}>{metrics.inProgressCount}</p>
          </div>
          <div>
            <p style={{ color: "#6b7280" }}>SLA risks (&gt; 30 min)</p>
            <p
              style={{
                fontWeight: 600,
                color: metrics.slaRiskCount > 0 ? "#b91c1c" : "#16a34a",
              }}
            >
              {metrics.slaRiskCount}
            </p>
          </div>
        </div>
      </div>

      {error && (
        <div
          style={{
            marginBottom: 8,
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
      {info && (
        <div
          style={{
            marginBottom: 8,
            padding: "8px 10px",
            borderRadius: 8,
            background: "#e0f2fe",
            color: "#075985",
            fontSize: "0.85rem",
          }}
        >
          {info}
        </div>
      )}

      <div
        style={{
          padding: "16px 18px",
          borderRadius: 16,
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
          <h3 style={{ fontSize: "1.05rem", fontWeight: 600 }}>
            Open incidents
          </h3>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <span style={{ fontSize: "0.8rem", color: "#6b7280" }}>
              Filter by priority:
            </span>
            <select
              value={filterPriority}
              onChange={(e) => setFilterPriority(e.target.value)}
              style={{
                fontSize: "0.8rem",
                padding: "4px 8px",
                borderRadius: 999,
                border: "1px solid #d1d5db",
                background: "#f9fafb",
              }}
            >
              <option value="all">All</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>
          </div>
        </div>

        {visibleIncidents.length === 0 ? (
          <p style={{ fontSize: "0.9rem", color: "#6b7280" }}>
            No open incidents right now.
          </p>
        ) : (
          <div style={{ display: "grid", gap: 10 }}>
            {visibleIncidents.map((i) => {
              const sla = isSlaBreached(i.createdAt);
              const ageLabel = formatAge(i.createdAt);
              const isMine = i.assignedTo === technicianId;

              let statusBadgeBg = "#e0f2fe";
              let statusBadgeColor = "#0369a1";
              if (i.status === "In Progress") {
                statusBadgeBg = "#fef3c7";
                statusBadgeColor = "#92400e";
              }

              const locationDisplay = renderLocationDisplay(i);

              return (
                <div
                  key={i.id} /* ✅ use backend id instead of _docId */
                  style={{
                    padding: "10px 12px",
                    borderRadius: 12,
                    border: "1px solid #e5e7eb",
                    background: sla ? "#fef2f2" : "#f9fafb",
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
                      marginBottom: 2,
                    }}
                  >
                    {i.category} · {locationDisplay}
                  </p>

                  {i.latitude && i.longitude && (
                    <p
                      style={{
                        fontSize: "0.75rem",
                        color: "#6b7280",
                        marginBottom: 4,
                      }}
                    >
                      GPS:
                      <a
                        href={`https://www.google.com/maps?q=${i.latitude},${i.longitude}`}
                        target="_blank"
                        rel="noreferrer"
                        style={{
                          textDecoration: "underline",
                          color: "#2563eb",
                        }}
                      >
                        {i.latitude.toFixed(4)}, {i.longitude.toFixed(4)}
                      </a>
                    </p>
                  )}

                  <p
                    style={{
                      fontSize: "0.8rem",
                      color: "#6b7280",
                      marginBottom: 6,
                    }}
                  >
                    {i.description}
                  </p>

                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginBottom: 8,
                    }}
                  >
                    <div
                      style={{ display: "flex", gap: 6, alignItems: "center" }}
                    >
                      <span
                        style={{
                          fontSize: "0.75rem",
                          padding: "2px 8px",
                          borderRadius: 999,
                          background: statusBadgeBg,
                          color: statusBadgeColor,
                        }}
                      >
                        {i.status}
                      </span>
                      {i.assignedTo && (
                        <span
                          style={{
                            fontSize: "0.75rem",
                            color: isMine ? "#16a34a" : "#6b7280",
                          }}
                        >
                          Assigned to{" "}
                          {isMine ? "you" : i.assignedName || "technician"}
                        </span>
                      )}
                      {sla && (
                        <span
                          style={{
                            fontSize: "0.75rem",
                            padding: "2px 8px",
                            borderRadius: 999,
                            background: "#fee2e2",
                            color: "#b91c1c",
                          }}
                        >
                          SLA &gt; 30 min
                        </span>
                      )}
                    </div>

                    <div
                      style={{
                        fontSize: "0.75rem",
                        color: "#6b7280",
                        textAlign: "right",
                      }}
                    >
                      <div>Age: {ageLabel}</div>
                    </div>
                  </div>

                  {/* Action buttons */}
                  <div
                    style={{
                      display: "flex",
                      gap: 8,
                      flexWrap: "wrap",
                      alignItems: "center",
                    }}
                  >
                    <button
                      type="button"
                      onClick={() => setSelectedIncident(i)}
                      style={{
                        fontSize: "0.8rem",
                        padding: "4px 9px",
                        borderRadius: 999,
                        border: "1px solid #93c5fd",
                        background: "#eff6ff",
                        color: "#1d4ed8",
                        cursor: "pointer",
                      }}
                    >
                      View full details
                    </button>

                    {!i.assignedTo && (
                      <button
                        type="button"
                        onClick={() => handleAssignToMe(i)}
                        style={{
                          fontSize: "0.8rem",
                          padding: "5px 10px",
                          borderRadius: 999,
                          border: "1px solid #22c55e",
                          background: "#ecfdf5",
                          color: "#15803d",
                          cursor: "pointer",
                        }}
                      >
                        Assign to me
                      </button>
                    )}

                    {isMine && i.status === "New" && (
                      <>
                        <button
                          type="button"
                          onClick={() => handleStartWork(i)}
                          style={{
                            fontSize: "0.8rem",
                            padding: "5px 10px",
                            borderRadius: 999,
                            border: "1px solid #f97316",
                            background: "#fff7ed",
                            color: "#c2410c",
                            cursor: "pointer",
                          }}
                        >
                          Start work
                        </button>
                        <button
                          type="button"
                          onClick={() => handleRelease(i)}
                          style={{
                            fontSize: "0.8rem",
                            padding: "5px 10px",
                            borderRadius: 999,
                            border: "1px solid #d1d5db",
                            background: "white",
                            color: "#4b5563",
                            cursor: "pointer",
                          }}
                        >
                          Release
                        </button>
                      </>
                    )}

                    {isMine && i.status === "In Progress" && (
                      <>
                        <button
                          type="button"
                          onClick={() => handleResolve(i)}
                          style={{
                            fontSize: "0.8rem",
                            padding: "5px 10px",
                            borderRadius: 999,
                            border: "1px solid #22c55e",
                            background: "#ecfdf5",
                            color: "#15803d",
                            cursor: "pointer",
                          }}
                        >
                          Resolve
                        </button>
                        <button
                          type="button"
                          onClick={() => handleRelease(i)}
                          style={{
                            fontSize: "0.8rem",
                            padding: "5px 10px",
                            borderRadius: 999,
                            border: "1px solid #d1d5db",
                            background: "white",
                            color: "#4b5563",
                            cursor: "pointer",
                          }}
                        >
                          Release
                        </button>
                      </>
                    )}
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

export default DashboardTechnician;
