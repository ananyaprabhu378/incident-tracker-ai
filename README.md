DEMO VIDEO (MUST WATCH):
https://drive.google.com/file/d/18y1Rdzr3Q6qSDp05nuxujXrf-QTc-ulI/view?usp=sharing

LIVE LINK:
https://ananyaprabhu378.github.io/incident-tracker-ai/ (if taking input in reporter glitching then render might be misbehaving please refer demo video for that particular block)
# 🚀 Smart Campus Incident Tracker – AI & ML Enabled
### A unified platform to report, assign & resolve campus infrastructure incidents in real time

---

## 🌟 Project Overview
**Smart Campus Incident Tracker** is a full-stack web platform enabling students, technicians and administrators to manage and resolve campus issues such as electricity failure, water leakage, damaged furniture and Wi-Fi breakdown.

It provides:
- **Real-time collaboration**
- **ML-based smart priority prediction**
- **Transparent workflow & SLA monitoring**
- **Heatmap analytics for prevention**

---

## ✨ Key Features
| Feature | Description |
|--------|------------|
| **Incident Reporting** | Raise complaints with hostel & room details |
| **Smart Priority Prediction** | AI-based auto-priority calculation |
| **Technician Workflow** | Assign, start, resolve tasks |
| **Notifications** | Alerts for reporter & admin |
| **Analytics Dashboard** | Issue frequency & SLA risk insights |
| **Heatmap Analysis** | Hotspot detection |
| **Role-based Login** | Reporter / Admin / Technician |
| **MongoDB Cloud Database** | Centralized secure storage |
| **GPS Location Tagging** | Exact campus location |

---

## 🧠 Tech Stack

### Frontend
- React.js (Vite)
- Tailwind CSS

### Backend
- Node.js + Express.js
- MongoDB Atlas + Mongoose

### Tools & Hosting
- GitHub Pages
- Render / Railway
- Postman

---

## 🏛 System Architecture
```
React Frontend
        ↓
Node + Express REST API
        ↓
MongoDB Atlas (Cloud DB)
        ↓
ML Priority Model + Heatmap Analytics
```

---

## 🔄 Workflow
```
Reporter logs issue → Stored in DB
        ↓
Admin assigns technician
        ↓
Technician updates status
        ↓
Dashboards & notifications update
        ↓
ML model predicts priority + hotspots
```

---

## 📁 Project Structure
```
incident-tracker-ai/
│── frontend/
│   ├── src/
│   │   ├── pages/
│   │   ├── context/
│   │   └── services/
│   └── package.json
│
└── backend/
    ├── models/
    ├── routes/
    ├── controllers/
    ├── server.js
    └── package.json
```

---

## 🛠 Installation & Setup

### Clone Repository
```bash
git clone https://github.com/ananyaprabhu378/incident-tracker-ai.git
cd incident-tracker-ai
```

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

---

## 🗄 Database Models

### Incident Schema
```js
{
  title: String,
  category: String,
  description: String,
  hostel: String,
  room: String,
  priority: String,
  status: String,
  reporterEmail: String,
  assignedTo: String,
  assignedName: String,
  createdAt: Date,
  resolvedAt: Date
}
```

### User Schema
```js
{
  name: String,
  email: String,
  password: String,
  role: String
}
```

---

## 🌐 REST API Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/incidents | Create new incident |
| GET | /api/incidents | Get all incidents |
| PUT | /api/incidents/:id | Update incident |
| POST | /api/auth/register | Register user |
| POST | /api/auth/login | Login authentication |

---

## 🧪 Testing
- Tested using **Postman**
- Verified **MongoDB read/write**
- Multi-device and multi-role testing

---

## 🎯 ML & Analytics Highlights
- Frequency-based heatmap
- Automated incident priority prediction
- Predictive alerts to prevent repeated failures

---

## 🎖 Hackathon Statement
This project solves a real-world campus problem with:
- **Full-stack architecture**
- **AI-powered automation**
- **Scalable backend**
- **Real-time workflow & analytics**

---

## 👨‍💻 Team
**Ananya G P**  
**buchupalli deepthi**  
**sneha mudgal**  
AIML – BMSIT

---

## ⭐ Support
If you like this project, please ⭐ the repository

---

## 🙌 Thank You
Transforming campus maintenance through technology
