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

function saveUsers(list) {
  localStorage.setItem(USERS_KEY, JSON.stringify(list));
}

function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "reporter",
    location: "",
    skills: "",
  });
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");

    if (!form.name || !form.email || !form.password) {
      setError("Please fill name, email and password.");
      return;
    }
    if (form.role === "reporter" && !form.location) {
      setError("Please enter your hostel/block location.");
      return;
    }

    const users = loadUsers();
    const already = users.find(
      (u) => u.email.toLowerCase() === form.email.toLowerCase()
    );
    if (already) {
      setError("An account with this email already exists.");
      return;
    }

    const userData = {
      name: form.name,
      email: form.email,
      password: form.password, // stored for simple demo login
      role: form.role,
      location: form.role === "reporter" ? form.location : "",
      skills:
        form.role === "technician"
          ? form.skills
              .split(",")
              .map((s) => s.trim())
              .filter(Boolean)
          : [],
    };

    const updated = [...users, userData];
    saveUsers(updated);

    // login current user (without password)
    const { password, ...safeUser } = userData;
    register(safeUser);

    if (form.role === "reporter") navigate("/reporter/dashboard");
    else if (form.role === "admin") navigate("/admin/dashboard");
    else navigate("/technician/dashboard");
  };

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "minmax(0, 1.2fr) minmax(0, 1fr)",
        gap: 32,
        alignItems: "center",
      }}
    >
      {/* Left explainer */}
      <div>
        <div
          style={{
            padding: "22px 24px",
            borderRadius: 24,
            background: "white",
            boxShadow: "0 18px 40px rgba(15,23,42,0.12)",
            border: "1px solid #e5e7eb",
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
            Create your workspace identity
          </p>
          <h2
            style={{
              fontSize: "1.7rem",
              fontWeight: 700,
              marginTop: 8,
              marginBottom: 10,
              color: "#0f172a",
            }}
          >
            Different roles, one connected incident pipeline.
          </h2>
          <p style={{ fontSize: "0.95rem", color: "#4b5563" }}>
            Reporters raise issues in hostels and labs, admins see patterns and
            SLAs, and technicians get a focused queue of tasks. Your role
            defines what you see in the system.
          </p>

          <div
            style={{
              marginTop: 18,
              display: "grid",
              gridTemplateColumns: "repeat(3, minmax(0,1fr))",
              gap: 12,
              fontSize: "0.8rem",
            }}
          >
            <div
              style={{
                padding: "8px 10px",
                borderRadius: 12,
                background: "#eff6ff",
              }}
            >
              <p style={{ fontWeight: 600, color: "#1d4ed8" }}>Reporter</p>
              <p style={{ color: "#4b5563" }}>
                Students/staff log incidents with context like hostel, block
                and category.
              </p>
            </div>
            <div
              style={{
                padding: "8px 10px",
                borderRadius: 12,
                background: "#ecfdf5",
              }}
            >
              <p style={{ fontWeight: 600, color: "#15803d" }}>Admin</p>
              <p style={{ color: "#4b5563" }}>
                Sees analytics, risk prediction per location & category, and SLA
                risks.
              </p>
            </div>
            <div
              style={{
                padding: "8px 10px",
                borderRadius: 12,
                background: "#fefce8",
              }}
            >
              <p style={{ fontWeight: 600, color: "#92400e" }}>Technician</p>
              <p style={{ color: "#4b5563" }}>
                Gets a prioritized queue and updates status to keep everyone in
                sync.
              </p>
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
          You can register once for each role to demo all three journeys during
          evaluation.
        </p>
      </div>

      {/* Right register card */}
      <div
        style={{
          maxWidth: 440,
          marginLeft: "auto",
          padding: 24,
          background: "white",
          borderRadius: 16,
          boxShadow: "0 14px 38px rgba(15,23,42,0.14)",
        }}
      >
        <h2 style={{ fontSize: "1.3rem", fontWeight: 600, marginBottom: 4 }}>
          Create an account
        </h2>
        <p style={{ fontSize: "0.9rem", color: "#6b7280", marginBottom: 16 }}>
          Pick how you’ll use the system: as a reporter, admin or technician.
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
            <label style={{ fontSize: "0.8rem", color: "#6b7280" }}>Name</label>
            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="Your full name"
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
            <label style={{ fontSize: "0.8rem", color: "#6b7280" }}>Email</label>
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
              placeholder="Set a password"
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
            <label style={{ fontSize: "0.8rem", color: "#6b7280" }}>Role</label>
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

          {form.role === "reporter" && (
            <div>
              <label style={{ fontSize: "0.8rem", color: "#6b7280" }}>
                Location (Hostel / Block)
              </label>
              <input
                name="location"
                value={form.location}
                onChange={handleChange}
                placeholder="e.g., Hostel A, Block 3"
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
          )}

          {form.role === "technician" && (
            <div>
              <label style={{ fontSize: "0.8rem", color: "#6b7280" }}>
                Skills (comma separated)
              </label>
              <input
                name="skills"
                value={form.skills}
                onChange={handleChange}
                placeholder="Electricity, Water, Internet"
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
          )}

          <button
            type="submit"
            style={{
              marginTop: 8,
              padding: "10px 14px",
              borderRadius: 999,
              border: "none",
              fontWeight: 600,
              fontSize: "0.95rem",
              background: "linear-gradient(135deg, #22c55e, #16a34a)",
              color: "white",
              cursor: "pointer",
            }}
          >
            Create account
          </button>
        </form>

        <p
          style={{
            marginTop: 12,
            fontSize: "0.8rem",
            color: "#9ca3af",
          }}
        >
          Already registered?{" "}
          <Link to="/login" style={{ color: "#2563eb", textDecoration: "none" }}>
            Back to login
          </Link>
        </p>
      </div>
    </div>
  );
}

export default Register;
