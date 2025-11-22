import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import useAuth from "../hooks/useauth.jsx";

const NOTIF_KEY = "notifications_v1";

function loadNotifications() {
  try {
    const raw = localStorage.getItem(NOTIF_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function Notifications() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    const all = loadNotifications();
    const mine = all.filter((n) => {
      if (n.targetRole && n.targetRole !== user?.role) return false;
      if (n.targetEmail && n.targetEmail !== user?.email) return false;
      return true;
    });
    mine.sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    setNotifications(mine);
  }, [user]);

  const backLink =
    user?.role === "admin"
      ? "/admin/dashboard"
      : user?.role === "technician"
      ? "/technician/dashboard"
      : "/reporter/dashboard";

  return (
    <div style={{ display: "grid", gap: 16 }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <div>
          <h2 style={{ fontSize: "1.2rem", fontWeight: 600 }}>
            Notifications
          </h2>
          <p style={{ fontSize: "0.9rem", color: "#6b7280" }}>
            Smart alerts for new incidents, status changes and risk patterns.
          </p>
        </div>
        <Link
          to={backLink}
          style={{ fontSize: "0.85rem", color: "#2563eb", textDecoration: "none" }}
        >
          ← Back to dashboard
        </Link>
      </div>

      {notifications.length === 0 ? (
        <p style={{ fontSize: "0.9rem", color: "#6b7280" }}>
          No notifications yet. As you create and update incidents, alerts will
          appear here.
        </p>
      ) : (
        <div
          style={{
            display: "grid",
            gap: 10,
            padding: 12,
            borderRadius: 16,
            background: "white",
            boxShadow: "0 12px 26px rgba(15,23,42,0.08)",
          }}
        >
          {notifications.map((n) => (
            <div
              key={n.id}
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
                <span
                  style={{
                    fontSize: "0.8rem",
                    fontWeight: 600,
                    color: "#0f172a",
                  }}
                >
                  {n.title || "System alert"}
                </span>
                <span
                  style={{ fontSize: "0.75rem", color: "#9ca3af" }}
                >
                  {new Date(n.createdAt).toLocaleString(undefined, {
                    dateStyle: "short",
                    timeStyle: "short",
                  })}
                </span>
              </div>
              <p
                style={{
                  fontSize: "0.85rem",
                  color: "#4b5563",
                }}
              >
                {n.message}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Notifications;
