DEMO VIDEO (MUST WATCH):
https://drive.google.com/file/d/18y1Rdzr3Q6qSDp05nuxujXrf-QTc-ulI/view?usp=sharing

LIVE LINK:
https://ananyaprabhu378.github.io/incident-tracker-ai/ (if taking input in reporter glitching then render might might be misbehaving please refer demo cideo for that particular block)
# 🚀 Smart Campus Incident Tracker – AI & ML Enabled
### A unified web platform to report, assign & resolve campus infrastructure incidents in real-time.

---

## 🌟 **Project Overview**
Smart Campus Incident Tracker is a full-stack web application enabling students, technicians, and administrators to streamline the reporting and resolution of real-world campus problems such as **electricity failure, water leakage, damaged furniture, Wi-Fi issue**, etc.

It provides:
- Real-time collaboration between stakeholders
- **ML-based smart priority prediction**
- Transparent incident tracking & SLA monitoring
- Heatmap to prevent recurring issues

---

## ✨ **Key Features**
| Feature | Description |
|--------|------------|
| 📝 Incident Reporting | Students can raise complaints with hostel & room details |
| 🎯 Smart Priority | Auto-prioritizes incidents (AI Model) |
| 🎧 Technician Workflow | Assign, Start, Resolve tasks with SLA alerts |
| 🔔 Notifications | Reporter + Admin notifications |
| 📈 Analytics Dashboard | Insights on frequency & SLA risk |
| 🗺 Heatmap Prediction | Hotspot areas detection |
| 🛡 Role Based Login | Reporter / Admin / Technician |
| 💾 MongoDB Cloud DB | All data stored securely & centrally |
| 📍 GPS Support | Exact location using geolocation |

---

## 🧠 **Tech Stack**
### **Frontend**
- React.js (Vite)
- TailwindCSS / Custom CSS

### **Backend**
- Node.js + Express.js
- MongoDB Atlas + Mongoose

### **Tools & Hosting**
- GitHub Pages (Frontend)
- Render / Railway (Backend)
- Postman (API Testing)

---

## 🏛 **System Architecture**
React Frontend
⬇
REST API (Node + Express)
⬇
MongoDB (Cloud)
⬇

---

## 🔄 **Workflow**
Reporter logs issue → stored in DB
↓
Admin assigns to technician
↓
Technician updates progress
↓
Notification & dashboard updates for everyone
↓
Data used for ML prediction & heatmap


---

## 📁 **Project Structure**
incident-tracker-ai/
│── frontend/
│ ├── src/
│ │ ├── pages/
│ │ ├── context/
│ │ └── services/
│ └── package.json
│
└── backend/
├── models/
├── routes/
├── controllers/
├── server.js
└── package.json


---

## 🛠 **Installation & Setup**

### Clone repository
```bash
git clone https://github.com/ananyaprabhu378/incident-tracker-ai.git
cd incident-tracker-ai

Frontend Install
cd frontend
npm install
npm run dev

Backend Install
cd backend
npm install
npm start

🗄 Database Models
Incident Schema
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

User Schema
{
  name: String,
  email: String,
  password: String,
  role: String
}

🌐 REST API Endpoints
Method	Endpoint	Description
POST	/api/incidents	Create new incident
GET	/api/incidents	Fetch all incidents
PUT	/api/incidents/:id	Update status / assignment
POST	/api/auth/register	User registration
POST	/api/auth/login	Login authentication
🧪 Testing

Postman used for backend API testing

Multiple devices tested for real-time sync

Verified MongoDB writes & updates

🎯 ML & Analytics Highlights

Frequency-based hotspot detection

AI priority assignment

Prevent repeated breakdowns using predictive alerts

🎖 Hackathon Ready Statement

This project solves a real-world campus problem with a:
✔ Full stack architecture
✔ AI-powered automation
✔ Centralized backend with analytics
✔ Scalable deployment

👩‍💻 Team

Ananya G P
buchupalli deepthi
sneha mudgal
BMSIT — AIML


---

✅ ALL Styles will show perfectly in GitHub  
❌ No white background color issues  
✔ Markdown tested
incident-tracker-ai/
│── frontend/
│ ├── src/
│ │ ├── pages/
│ │ ├── context/
│ │ └── services/
│ └── package.json
│
└── backend/
├── models/
├── routes/
├── controllers/
├── server.js
└── package.json


---

## 🛠 **Installation & Setup**

### Clone repository
```bash
git clone https://github.com/ananyaprabhu378/incident-tracker-ai.git
cd incident-tracker-ai

Frontend Install
cd frontend
npm install
npm run dev

Backend Install
cd backend
npm install
npm start

🗄 Database Models
Incident Schema
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

User Schema
{
  name: String,
  email: String,
  password: String,
  role: String
}

🌐 REST API Endpoints
Method	Endpoint	Description
POST	/api/incidents	Create new incident
GET	/api/incidents	Fetch all incidents
PUT	/api/incidents/:id	Update status / assignment
POST	/api/auth/register	User registration
POST	/api/auth/login	Login authentication
🧪 Testing

Postman used for backend API testing

Multiple devices tested for real-time sync

Verified MongoDB writes & updates

🎯 ML & Analytics Highlights

Frequency-based hotspot detection

AI priority assignment

Prevent repeated breakdowns using predictive alerts

🎖 Hackathon Ready Statement

This project solves a real-world campus problem with a:
✔ Full stack architecture
✔ AI-powered automation
✔ Centralized backend with analytics
✔ Scalable deployment

👩‍💻 Team

Ananya G P
BMSIT — AIML


---

✅ ALL Styles will show perfectly in GitHub  
❌ No white background color issues  
✔ Markdown tested



<img width="1536" height="1024" alt="12d63fa0-7a47-422b-8503-a28469ff6e9f" src="https://github.com/user-attachments/assets/e8bce9bd-355a-4233-bbca-649fcfb95e74" />



