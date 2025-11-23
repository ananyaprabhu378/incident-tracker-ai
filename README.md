DEMO VIDEO (MUST WATCH):
https://drive.google.com/file/d/18y1Rdzr3Q6qSDp05nuxujXrf-QTc-ulI/view?usp=sharing

LIVE LINK:
https://ananyaprabhu378.github.io/incident-tracker-ai/
🚀 Smart Campus Incident Tracker – AI & ML Enabled
A unified web platform to report, assign & resolve campus infrastructure incidents in real-time.
🌟 Project Overview

Smart Campus Incident Tracker is a full-stack web application enabling students, technicians, and administrators to streamline the reporting and resolution of real-world campus problems such as electricity failure, broken furniture, water leakage, Wi-Fi issues, etc.

It provides:

Real-time collaboration between reporters, technicians, and admins

Automatic prioritization using ML-based intelligent prediction

Performance monitoring, SLA tracking, and resolution workflow visibility

Heatmap-based risk detection for repeated issues

The system ensures transparency and faster maintenance outcomes inside educational campuses.

✨ Key Features
Feature	Description
📝 Incident Reporting	Students can report issues instantly with hostel/room details
🎯 Smart Priority	Auto-priority prediction based on category, frequency & severity
🎧 Technician Workflow	Assign, accept, start & resolve task with SLA alerts
🔔 Notifications	Real-time update alerts for admins & reporters
📈 Analytics & Insights	Dashboard with workload metrics & performance stats
🗺 Incident Heatmap (ML)	Displays hotspot locations from repeated reports
🧠 Prediction Model	Recommends high-risk categories for future prevention
🛡 Authentication	Role-based login (Reporter/Admin/Technician)
💾 Persistent Storage	MongoDB cloud database backend
📍 GPS Support	Attach location coordinates for field incidents
🧠 Tech Stack
Frontend

React.js + Vite

TailwindCSS / Custom CSS

Framer Motions animations

Backend

Node.js + Express.js REST API

MongoDB Atlas (Cloud Database)

Mongoose for Schema & Data modeling

DevOps / Hosting

Render (Backend deployment)

GitHub Pages / Vercel (Frontend deployment)

Postman (API testing)

🏛 System Architecture
Reporter / Technician / Admin UI (React)
              |
              v
        REST API (Express.js / Node)
              |
              v
         MongoDB Database
              |
              v
     Analytics + Prediction Engine

🔄 Workflow
User registers/login → choose role → open dashboard
↓
Reporter submits incident → stored in DB
↓
Admin monitors panel & assigns task
↓
Technician receives, starts & resolves
↓
Notifications delivered to all stakeholders
↓
Data stored for analytics & heatmap ML model

📁 Project Structure
incident-tracker-ai/
│── frontend/
│   ├── public/
│   ├── src/
│   │   ├── pages/
│   │   ├── context/
│   │   ├── services/
│   │   └── components/
│   └── package.json
│
└── backend/
    ├── models/
    ├── routes/
    ├── controllers/
    ├── server.js
    └── package.json

🛠 Installation & Setup
Clone project
git clone https://github.com/ananyaprabhu378/incident-tracker-ai.git
cd incident-tracker-ai

Install frontend
cd frontend
npm install
npm run dev

Install backend
cd backend
npm install
npm start

🗄 Database Models (MongoDB/Mongoose)
Incident Model
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

User Model
{
  name: String,
  email: String,
  password: String,
  role: String
}

🌐 REST API Endpoints
Method	Endpoint	Description
POST	/api/incidents	Create new incident
GET	/api/incidents	Get all incidents
PUT	/api/incidents/:id	Update status/assignment
DELETE	/api/incidents/:id	Remove incident
POST	/api/auth/register	Register user
POST	/api/auth/login	User login
🧪 Testing

Tested using Postman for API calls

Tested with two devices for independent logins & syncing

MongoDB verified for real-time updates

🎖 Hackathon Ready Statement

This project solves a real campus problem by providing a production-ready scalable architecture, reliable backend, analytics, and smart decision-making capability using ML.

🏁 Conclusion

Smart Campus Incident Tracker transforms traditional manual reporting into a fast, transparent & data-intelligent digital process — reducing downtime, improving communication, and increasing student satisfaction.
