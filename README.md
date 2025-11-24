# DEMO VIDEO (MUST WATCH):
https://drive.google.com/file/d/18y1Rdzr3Q6qSDp05nuxujXrf-QTc-ulI/view?usp=sharing

# LIVE LINK:
https://ananyaprabhu378.github.io/incident-tracker-ai/ 


for all the files check this repo:https://github.com/ananyaprabhu378/Incident-Tracker1.git

# 🚀 Smart Campus Incident Tracker – AI & ML Enabled

A full-stack platform to report, assign & resolve campus infrastructure issues in real-time.

---

## 🌟 **Project Overview**
Smart Campus Incident Tracker enables students, technicians, and administrators to efficiently handle problems such as power outages, water leakage, broken equipment, internet failure, etc.

### It provides
- Real-time collaboration
- AI-based smart priority prediction
- Transparent workflow & SLA monitoring
- Hotspot & frequency analytics
- Technician assignment & status workflow
- GPS-based incident tracking

---

## ✨ **Key Features**

| Feature | Description |
|--------|------------|
| Incident Reporting | Submit issue with title, hostel, room, description & image |
| Smart Priority Prediction (AI/ML) | Auto-priority based on keywords & frequency |
| Technician Workflow | Assign, start work, resolve, release |
| Notifications | Local alerts for reporter, admin & technician |
| Heatmap Analytics | Hostel & category-based hotspot predictions |
| Role-based Login | Reporter / Technician / Admin |
| GPS Location Tagging | Exact latitude & longitude capture |
| Multi-Device Support | Same data visible across all devices |

---

## 🧠 **Tech Stack**

### **Frontend**
- React.js (Vite)
- Tailwind CSS
- LocalStorage Notifications

### **Backend**
- Node.js + Express.js
- File-based JSON storage (`incidents.json`)
- REST API hosted on Render

### **Deployment**
| Service | Link |
|--------|-------|
| Backend (Render) | https://incident-tracker1.onrender.com |
| Frontend (GitHub Pages) | https://ananyaprabhu378.github.io/Incident-Tracker1 |

---

## 🏛 **System Architecture**

```
React Frontend (GitHub Pages)
          ↓
Node + Express REST API  (Render)
          ↓
JSON Persistent Storage (incidents.json)
          ↓
ML priority + hotspot frequency analytics
```

---

## 🔄 **Workflow**
```
Reporter logs issue  → Issue stored in backend
                     ↓
Admin/Technician views & assigns
                     ↓
Technician updates progress & resolves
                     ↓
Dashboard updates with risk heatmap + SLA alerts
```

---

## 📁 **Project Structure**

```
Incident-Tracker1/
│── frontend/
│   ├── src/
│   │   ├── pages/
│   │   ├── context/
│   │   └── services/
│   └── package.json
│
└── backend/
    ├── data/incidents.json
    ├── server.js
    └── package.json
```

---

## 🛠 **Installation & Setup**

### Clone Repository
```bash
git clone https://github.com/ananyaprabhu378/Incident-Tracker1.git
cd Incident-Tracker1
```

### Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

### Backend Setup
```bash
cd backend
npm install
npm start
```

---

## 🌐 **REST API Endpoints**

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/incidents` | Get all incidents |
| POST | `/api/incidents` | Create new incident |
| PATCH | `/api/incidents/:id` | Update incident |
| DELETE | `/api/incidents/:id` | Delete incident |

---

## 🧠 **AI & Analytics**
- Auto-priority prediction
- Frequency-based risk score (hostel/category)
- Hotspot predictions for repeated failures
- GPS enabled incident mapping
- SLA failure indicators

---

## 🧪 **Testing**
- Tested using Postman
- Verified multi-device access
- Deployed & tested live on Render + GitHub Pages

---

## 🎖 **Hackathon Statement**
> This project solves a real campus maintenance problem with AI-enhanced automation, real-time workflow management, and predictive risk analytics to reduce repeated failures and improve campus safety.

---

## 👨‍💻 **Team**
- **Ananya G P**
- **Buchupalli Deepthi**
- **Sneha Mudgal**
- AIML – BMSIT

---

## ⭐ **Support**
If you like this project, please ⭐ the repository!

---

## 🙌 **Thank You**
Transforming campus maintenance with technology 💡
You
Transforming campus maintenance through technology
