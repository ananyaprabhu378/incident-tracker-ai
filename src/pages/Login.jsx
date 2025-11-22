import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import useAuth from "../hooks/useauth.jsx";

const USERS_KEY = "users_v1";

function loadUsers() {
  try {
    const raw = localStorage.getItem(USERS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    email: "",
    password: "",
    role: "reporter",
  });
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");

    if (!form.email || !form.password) {
      setError("Please fill in email and password.");
      return;
    }

    const users = loadUsers();
    const user = users.find(
      (u) =>
        u.email.toLowerCase() === form.email.toLowerCase() &&
        u.password === form.password &&
        u.role === form.role
    );

    if (!user) {
      setError("No account found for this email / password / role.");
      return;
    }

    const { password, ...safeUser } = user;
    login(safeUser);

    if (user.role === "reporter") navigate("/reporter/dashboard");
    else if (user.role === "admin") navigate("/admin/dashboard");
    else navigate("/technician/dashboard");
  };

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "minmax(0, 1.4fr) minmax(0, 1fr)",
        gap: 32,
        alignItems: "center",
      }}
    >
      {/* Left hero */}
      <div>
        <div
          style={{
            padding: "22px 24px",
            borderRadius: 24,
            background:
              "radial-gradient(circle at top left,#22c55e,#2563eb 45%,#0f172a 90%)",
            color: "white",
            boxShadow: "0 25px 55px rgba(15,23,42,0.55)",
            minHeight: 220,
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
          }}
        >
          <div>
            <p
              style={{
                fontSize: "0.8rem",
                textTransform: "uppercase",
                letterSpacing: 1,
                opacity: 0.85,
              }}
            >
              Smart campus · Incident intelligence
            </p>
            <h2
              style={{
                fontSize: "1.8rem",
                fontWeight: 700,
                marginTop: 8,
                marginBottom: 6,
              }}
            >
              Track, predict and resolve campus issues in real-time.
            </h2>
            <p style={{ fontSize: "0.95rem", opacity: 0.92 }}>
              Our system combines incident logs with intelligent risk scoring to
              highlight hotspots before they turn into failures.
            </p>
          </div>

          <div
            style={{
              marginTop: 18,
              paddingTop: 12,
              borderTop: "1px solid rgba(248,250,252,0.18)",
              display: "grid",
              gridTemplateColumns: "repeat(3, minmax(0,1fr))",
              gap: 10,
              fontSize: "0.78rem",
            }}
          >
            <div>
              <p style={{ opacity: 0.7 }}>Roles</p>
              <p style={{ fontWeight: 600 }}>Reporter · Admin · Tech</p>
            </div>
            <div>
              <p style={{ opacity: 0.7 }}>Smartness</p>
              <p style={{ fontWeight: 600 }}>Auto-priority & risk score</p>
            </div>
            <div>
              <p style={{ opacity: 0.7 }}>Insights</p>
              <p style={{ fontWeight: 600 }}>Hotspots · SLA alerts</p>
            </div>
          </div>
        </div>

        <p
          style={{
            marginTop: 14,
            fontSize: "0.85rem",
            color: "#6b7280",
          }}
        >
          Try logging in with different roles to see how the experience changes
          for reporters, admins and technicians.
        </p>
      </div>

      {/* Right login card */}
      <div
        style={{
          maxWidth: 420,
          marginLeft: "auto",
          padding: 24,
          background: "white",
          borderRadius: 16,
          boxShadow: "0 14px 38px rgba(15,23,42,0.14)",
        }}
      >
        <h2 style={{ fontSize: "1.3rem", fontWeight: 600, marginBottom: 4 }}>
          Sign in
        </h2>
        <p style={{ fontSize: "0.9rem", color: "#6b7280", marginBottom: 16 }}>
          Choose your role and explore the live dashboards.
        </p>

        {error && (
          <div
            style={{
              marginBottom: 12,
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

        <form
          onSubmit={handleSubmit}
          style={{ display: "grid", gap: 12, marginTop: 4 }}
        >
          <div>
            <label style={{ fontSize: "0.8rem", color: "#6b7280" }}>
              Email
            </label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="you@campus.edu"
              style={{
                width: "100%",
                padding: "8px 10px",
                borderRadius: 10,
                border: "1px solid #d1d5db",
                marginTop: 4,
                fontSize: "0.9rem",
              }}
            />
          </div>

          <div>
            <label style={{ fontSize: "0.8rem", color: "#6b7280" }}>
              Password
            </label>
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              placeholder="••••••••"
              style={{
                width: "100%",
                padding: "8px 10px",
                borderRadius: 10,
                border: "1px solid #d1d5db",
                marginTop: 4,
                fontSize: "0.9rem",
              }}
            />
          </div>

          <div>
            <label style={{ fontSize: "0.8rem", color: "#6b7280" }}>
              Login as
            </label>
            <select
              name="role"
              value={form.role}
              onChange={handleChange}
              style={{
                width: "100%",
                padding: "8px 10px",
                borderRadius: 10,
                border: "1px solid #d1d5db",
                marginTop: 4,
                fontSize: "0.9rem",
              }}
            >
              <option value="reporter">Reporter</option>
              <option value="admin">Admin</option>
              <option value="technician">Technician</option>
            </select>
          </div>

          <button
            type="submit"
            style={{
              marginTop: 8,
              padding: "10px 14px",
              borderRadius: 999,
              border: "none",
              fontWeight: 600,
              fontSize: "0.95rem",
              background: "linear-gradient(135deg, #2563eb, #4f46e5)",
              color: "white",
              cursor: "pointer",
            }}
          >
            Continue
          </button>
        </form>

        <p
          style={{
            marginTop: 12,
            fontSize: "0.8rem",
            color: "#9ca3af",
          }}
        >
          New here?{" "}
          <Link to="/register" style={{ color: "#2563eb", textDecoration: "none" }}>
            Create an account
          </Link>
        </p>
      </div>
    </div>
  );
}

export default Login;
