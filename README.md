# DEMO VIDEO (MUST WATCH):
https://drive.google.com/file/d/18y1Rdzr3Q6qSDp05nuxujXrf-QTc-ulI/view?usp=sharing

# LIVE LINK:
https://ananyaprabhu378.github.io/incident-tracker-ai/ 


for all the files please check this repo as the present repo does not have all the file : https://github.com/ananyaprabhu378/Incident-Tracker1.git

backend url:https://incident-tracker1.onrender.com

# 🚀 Smart Campus Incident Tracker — AI & ML Powered

A real-time campus infrastructure maintenance system that **predicts failures**, prevents repeated breakdowns, and **optimizes technician workload** using AI & analytics.

🌍 Live Deployment  
🔹 Frontend: https://ananyaprabhu378.github.io/Incident-Tracker1  
🔹 Backend API: https://incident-tracker1.onrender.com/api/incidents  

---

## 🌟 Project Overview
Traditional complaint handling is slow, unclear, and repetitive. This project transforms campus maintenance through an automated system that supports:

- Fast incident reporting
- Smart technician assignment
- SLA alert monitoring
- Future failure prediction
- Hotspot frequency analysis

📌 **Goal:** Prevent failures before they occur & improve response accuracy.

---

## 🧾 Key Features (Mapped to Evaluation Criteria)

| Category | Feature | Status |
|---------|---------|--------|
| Incident Logic & Prediction (30%) | ML priority + hotspot forecasting | ✅ |
| Dashboard & Heatmap (25%) | Real-time dashboards & risk visualization | ✅ |
| Technician Scheduling (20%) | No task overlap + SLA awareness | ✅ |
| Code Quality & Architecture (15%) | REST architecture + modular structure | ✅ |
| UI/UX & Presentation (10%) | Modern clean UI + responsive | ✅ |

---

## 🧠 Machine Learning & Prediction Logic

### **1. Priority Prediction**
We analyze **keywords** + **risk intent** inside issue description:

| Keyword | Example | Assigned Priority |
|---------|---------|-------------------|
| Critical / danger | fire, burst, shock, leak | 🔴 High |
| Functional issue | not working, outage | 🟡 Medium |
| Small / cosmetic | loose, minor | 🟢 Low |

```js
if(text.includes("fire") || text.includes("shock") || text.includes("leak")) priority = "High";
else if(text.includes("minor") || text.includes("slow")) priority = "Low";
else priority = "Medium";
```

### **2. Hotspot Frequency Prediction**
Grouped per **Hostel + Category**, risk score is calculated:

```
Risk Score = (0.35 × totalIncidents)
           + (0.8 × highPriority)
           + (1.1 × incidentsLast24h)
           + (0.9 × currentlyOpen)
           + (1.1 × agingOfOldestOpen)
```

Converted to probability using sigmoid:

```js
prob = 1 / (1 + Math.exp(-rawScore / 3.5));
```

📌 Output used to trigger **Preventive alerts** before failures.

---

## 🔄 Complaint Flow

```
Reporter raises issue → Saved to backend (incidents.json)
         ↓
ML assigns priority + hotspot scoring
         ↓
Admin/Technician dashboard updates live
         ↓
Technician: Assign → Start → Resolve → Release
         ↓
SLA timer & warnings update until completion
```

---

## 🧑‍🔧 Technician Scheduling Logic

| Rule | Benefit |
|------|---------|
| A technician can only take 1 open assignment | Prevents overload |
| SLA warning above 30 min | Urgent prioritization |
| Release button | Task transfer when needed |

---

## 🧱 DB Schema (JSON Based)

### `incidents.json`
```json
[
  {
    "id": "1732487881000",
    "title": "Water leakage in bathroom",
    "category": "Water",
    "description": "Severe leak",
    "hostel": "Hostel A",
    "room": "201",
    "priority": "High",
    "status": "New",
    "reporterEmail": "abc@gmail.com",
    "assignedTo": null,
    "assignedName": null,
    "latitude": 12.9345,
    "longitude": 77.5342,
    "createdAt": "2025-01-10T08:20:00Z"
  }
]
```

---

## 🏛 Full Project Structure

```
Incident-Tracker1/
│
├── frontend/ (React + Vite)
│   ├── src/
│   │   ├── pages/            # Reporter, Technician, Admin dashboards
│   │   ├── components/       # Cards, status badges, modals, tables
│   │   ├── context/          # Auth & global state
│   │   ├── services/
│   │   │   └── incidentsApi.js  # API calls to backend
│   │   └── hooks/
│   ├── public/
│   └── package.json
│
└── backend/ (Node + Express)
    ├── data/
    │   └── incidents.json     # Persistent storage
    ├── routes/
    │   └── incidents.js       # CRUD endpoints
    ├── controllers/
    │   └── incidentController.js
    ├── server.js
    └── package.json
```

---

## 🌐 REST API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/incidents` | Fetch all incidents |
| POST | `/api/incidents` | Create incident |
| PATCH | `/api/incidents/:id` | Update incident |
| DELETE | `/api/incidents/:id` | Delete incident |

---

## 🧪 Testing

### Test Coverage & Validation
✔ API tested with Postman  
✔ Multi-device testing (mobile + laptop + guests)  
✔ Technician and reporter workflow tested  
✔ Render Cloud storage persistence verified  
✔ SLA timing accuracy confirmed  

---

## 🎬 Final Deliverables (for Hackathon requirements)

| Deliverable | Status |
|------------|--------|
| Working Application/API | ✔ Done |
| Prediction Logic Documentation | ✔ Included |
| Complaint & Technician Flow | ✔ Included |
| 3–5 Min Video Demo | 🎥 Ready |
| GitHub Repository | ✔ Submitted |

---

## 👥 Team


|--------|------|
| **Ananya G P**
| **Buchupalli Deepthi**
| **Sneha Mudgal** 

---

## ⭐ Support
If you like the project, please ⭐ star the repository and support innovation.

---

## 🙏 Thank You
Building a safer & smarter campus with AI 💡
## 🙌 Thank You!
Making campuses safer, smarter & failure-proof with AI 💡
