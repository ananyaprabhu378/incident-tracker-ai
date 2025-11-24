# DEMO VIDEO (MUST WATCH):
https://drive.google.com/file/d/18y1Rdzr3Q6qSDp05nuxujXrf-QTc-ulI/view?usp=sharing

# LIVE LINK:
https://ananyaprabhu378.github.io/incident-tracker-ai/ 


for all the files check this repo:https://github.com/ananyaprabhu378/Incident-Tracker1.git

backend url:https://incident-tracker1.onrender.com

# 🚀 Smart Campus Incident Tracker — AI & ML Powered

A real-time campus infrastructure maintenance system that **predicts failures**, prevents repeated breakdowns, and **optimizes technician workload** using AI.

🌍 Live Demo  
Frontend: https://ananyaprabhu378.github.io/Incident-Tracker1  
Backend API: https://incident-tracker1.onrender.com/api/incidents  

---

## ⭐ Why This Project?
Campus maintenance often suffers from:
- Repeated failures in the same hostel/rooms 🚨
- Delayed technician response ⏳
- No clarity on assignment or status ❓
- Safety-critical issues unnoticed ⚡💧

📌 This platform solves that by:
✔ Preventing recurring issues  
✔ Predicting failures before they occur  
✔ Monitoring entire campus efficiently  
✔ Optimizing technician workload  
✔ Ensuring SLA compliance (⚠ 30 mins rule)

---

## 🌟 Key Features (Mapped to Evaluation Criteria)

| Category | Feature | Status |
|---------|---------|-------|
| **Incident Logic & Prediction (30%)** | Smart AI-based priority prediction | ✅ |
| | Frequency-based ML hotspot analytics | ✅ |
| | SLA aging warnings | ✅ |
| **Dashboard & Heatmap (25%)** | Admin + Technician Dashboards | ✅ |
| | Risk-based hotspot insights | ⚙ In Dashboard |
| **Technician Scheduling (20%)** | Auto-assignment restrictions (no overlap) | ✅ |
| | Status transitions: New → In Progress → Resolved | ✅ |
| **Code Quality & Architecture (15%)** | REST API with Render deployment | ✅ |
| | Modular services & hooks structure | ✅ |
| **UI/UX & Presentation (10%)** | Modern responsive UI + Accessible | ✅ |

---

## 🧠 Our ML Model (Explained Simply — Judge Friendly)

### 🔹 Smart Priority Prediction  
Based on **incident keywords** + **severity**:

| Keyword Example | Auto Priority |
|----------------|---------------|
| "Fire", "Leak", "Shock", "Burst" | 🔴 High |
| "Not working", "Broken" | 🟡 Medium |
| Minor issues | 🟢 Low |

> Score fed to sigmoid activation to mimic probability scaling.

---

### 🔹 Predictive Hotspots (Frequency + Recency Model)

We group incidents by:  
**(Hostel + Category)** → assign risk score based on:

| Factor | Weight |
|--------|--------|
| Total incidents | 0.35 |
| High priority count | 0.8 |
| New issues in last 24h | 1.1 |
| Currently open issues | 0.9 |
| Aging of oldest open issue | 1.1 |

📌 Output → **Probability of next failure**  
📌 Helps admin pre-alert technicians

---

## 🔄 Workflow Flow

```
Reporter creates incident (GPS optional)
            ↓
ML predicts priority + updates heatmap risk
            ↓
Technician/admin assigns & updates progress
            ↓
Dashboards update with SLA & hotspot signals
```

📌 Ensures **no technician is overloaded** (one active assignment)

---

## 🏛 System Architecture

```
React Frontend (GitHub Pages)
        ⇅ REST
Node + Express Backend (Render)
        ⇅
JSON Persistent Storage (incidents.json)
        ⇅
AI Analytics Engine
```

🔗 Full-stack — central DB ensures **multi-device visibility**

---

## 📁 Project Structure

```
Incident-Tracker1/
│── frontend/ (React + Vite)
│   └── src/pages, components, services
│
└── backend/ (Node + Express)
    ├── data/incidents.json
    └── server.js (REST API)
```

---

## 🧪 Testing (Demonstrated live)

✔ Multi-role login  
✔ Technician SLA (30 min risk warnings)  
✔ GPS tracking and location mapping  
✔ AI Probability > 3 incidents → hotspot warning  
✔ Local & cloud testing via Postman  

---

## 📌 Installation (Local Setup)

### Frontend
```bash
cd frontend
npm install
npm run dev
```

### Backend
```bash
cd backend
npm install
npm start
```

API Root → `http://localhost:5000/api/incidents`

---

## 🌐 Deployments

| Service | Platform | Status |
|--------|----------|------|
| Backend | Render | ✔ Stable |
| Frontend | GitHub Pages | ✔ Live |

---

## 📌 Final Hackathon Deliverables

| Deliverable | Status |
|------------|--------|
| Working Application/API | ✔ Completed |
| AI Prediction Logic Documentation | ✔ Included |
| Technician Scheduling Flow | ✔ Implemented |
| 3–5 min Video Demo | 🎥 (Will be shown during presentation) |
| GitHub Repository | ✔ Linked |

---

## 🛡 SLA & Safety Rules
- SLA alert when issue age > **30 mins**
- High-priority alerts → technician notifications

---

## 👨‍💻 Team Members

| Ananya G P
| Buchupalli Deepthi 
| Sneha Mudgal 
| AIML – BMSIT |

---

## ⭐ Support Us
If this project impressed you 🔥 —  
please **⭐ star the repo** and encourage innovation 🌟

---

## 🙌 Thank You!
Making campuses safer, smarter & failure-proof with AI 💡
