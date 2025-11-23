// src/services/incidentsApi.js

// change this to your deployed backend URL after you host it
const API_BASE =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:4000/api";

export async function fetchIncidents() {
  const res = await fetch(`${API_BASE}/incidents`);
  if (!res.ok) {
    throw new Error("Failed to fetch incidents");
  }
  return res.json();
}

export async function createIncident(incident) {
  const res = await fetch(`${API_BASE}/incidents`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(incident),
  });
  if (!res.ok) {
    throw new Error("Failed to create incident");
  }
  return res.json();
}

export async function updateIncident(id, partial) {
  const res = await fetch(`${API_BASE}/incidents/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(partial),
  });
  if (!res.ok) {
    throw new Error("Failed to update incident");
  }
  return res.json();
}
