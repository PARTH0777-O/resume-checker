# 🚀 Smart Resume Analyzer & Job Recommendation System

> AI-powered resume analysis with ATS scoring, skill gap detection, and job recommendations.
> Built as an MCA Final Year Major Project.

---

## 📋 Table of Contents
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Installation](#installation)
- [API Endpoints](#api-endpoints)
- [MongoDB Collections](#mongodb-collections)
- [Deployment](#deployment)

---

## ✨ Features

| Feature | Description |
|---------|-------------|
| 🔐 **JWT Auth** | Register, login, logout with bcrypt password hashing |
| 📄 **Resume Upload** | PDF upload with validation (max 16MB) |
| 🤖 **AI Parsing** | Extracts name, email, phone, education, skills, projects, certifications |
| 🎯 **ATS Scoring** | Score out of 100 with section-wise breakdown |
| ⚡ **Skill Extraction** | NLP-based detection of 70+ technical skills |
| 💼 **Job Matching** | Match percentage for 12+ job roles |
| 🔍 **Skill Gap Analysis** | Identifies missing skills for target roles |
| 💡 **Suggestions** | Personalized improvement recommendations |
| 👑 **Admin Panel** | User management, analytics, job roles, skills database |

---

## 🛠 Tech Stack

**Backend:** Python · Flask · JWT · PyMongo · spaCy · NLTK · pdfplumber · PyMuPDF  
**Frontend:** React 18 · Tailwind CSS · React Router v6 · Axios · Recharts  
**Database:** MongoDB  
**AI/NLP:** spaCy (en_core_web_sm) · NLTK · Scikit-learn  

---

## 📁 Project Structure

```
smart-resume-analyzer/
├── backend/
│   ├── app.py                  # Flask entry point
│   ├── requirements.txt
│   ├── .env.example
│   ├── config/
│   │   ├── settings.py         # App config
│   │   └── database.py         # MongoDB connection
│   ├── models/
│   │   ├── schemas.py          # Document schemas
│   │   └── seed_data.py        # Initial job roles & skills
│   ├── routes/
│   │   ├── auth.py             # /api/auth/*
│   │   ├── resume.py           # /api/resume/*
│   │   ├── admin.py            # /api/admin/*
│   │   └── jobs.py             # /api/jobs/*
│   ├── middleware/
│   │   └── auth_middleware.py  # JWT decorators
│   └── utils/
│       ├── resume_parser.py    # PDF → structured data
│       ├── skill_extractor.py  # NLP skill detection
│       ├── ats_scorer.py       # ATS scoring algorithm
│       ├── job_recommender.py  # Job matching engine
│       └── helpers.py          # Utilities
│
└── frontend/
    ├── package.json
    ├── tailwind.config.js
    └── src/
        ├── App.js
        ├── index.js
        ├── index.css
        ├── context/
        │   └── AuthContext.js
        ├── utils/
        │   └── api.js
        ├── components/common/
        │   ├── Layout.jsx
        │   ├── Sidebar.jsx
        │   ├── ProtectedRoute.jsx
        │   ├── ScoreRing.jsx
        │   ├── StatCard.jsx
        │   └── SkillBadge.jsx
        └── pages/
            ├── HomePage.jsx
            ├── LoginPage.jsx
            ├── RegisterPage.jsx
            ├── DashboardPage.jsx
            ├── UploadPage.jsx
            ├── MyResumesPage.jsx
            ├── ResumeResultPage.jsx
            ├── JobsPage.jsx
            ├── ProfilePage.jsx
            └── admin/
                ├── AdminDashboardPage.jsx
                ├── AdminUsersPage.jsx
                ├── AdminResumesPage.jsx
                ├── AdminJobRolesPage.jsx
                └── AdminSkillsPage.jsx
```

---

## ⚙️ Installation

### Prerequisites
- Python 3.9+
- Node.js 16+
- MongoDB 6+ (local or Atlas)

---

### Backend Setup

```bash
cd backend

# 1. Create virtual environment
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate

# 2. Install dependencies
pip install -r requirements.txt

# 3. Download spaCy model
python -m spacy download en_core_web_sm

# 4. Download NLTK data
python -c "import nltk; nltk.download('punkt'); nltk.download('stopwords')"

# 5. Configure environment
cp .env.example .env
# Edit .env with your MongoDB URI and JWT secret

# 6. Run backend
python app.py
```

Backend runs at: **http://localhost:5000**

---

### Frontend Setup

```bash
cd frontend

# 1. Install dependencies
npm install

# 2. Start development server
npm start
```

Frontend runs at: **http://localhost:3000**

---

### Seed the Database

After starting the backend, log in as admin and click **"Seed Database"** on the Admin Dashboard.
This populates 12 job roles and 65+ skills.

**Default Admin credentials:**
```
Email:    admin@resumeanalyzer.com
Password: Admin@123
```

---

## 🌐 API Endpoints

### Auth
| Method | Endpoint                   | Description       | Auth   |
|--------|----------------------------|-------------------|--------|
| POST   | `/api/auth/register`       | Register user     | —      |
| POST   | `/api/auth/login`          | Login             | —      |
| POST   | `/api/auth/refresh`        | Refresh token     | Refresh|
| GET    | `/api/auth/profile`        | Get profile       | JWT    |
| PUT    | `/api/auth/profile`        | Update profile    | JWT    |
| POST   | `/api/auth/change-password`| Change password   | JWT    |

### Resume
| Method | Endpoint                         | Description           | Auth  |
|--------|----------------------------------|-----------------------|-------|
| POST   | `/api/resume/upload`             | Upload & analyze PDF  | JWT   |
| GET    | `/api/resume/my-resumes`         | List my resumes       | JWT   |
| GET    | `/api/resume/:id`                | Get resume details    | JWT   |
| DELETE | `/api/resume/:id`                | Delete resume         | JWT   |
| POST   | `/api/resume/:id/analyze`        | Re-analyze resume     | JWT   |
| GET    | `/api/resume/dashboard/stats`    | Dashboard stats       | JWT   |

### Jobs (Public)
| Method | Endpoint              | Description       |
|--------|-----------------------|-------------------|
| GET    | `/api/jobs/`          | List job roles    |
| GET    | `/api/jobs/categories`| List categories   |
| GET    | `/api/jobs/skills`    | List skills       |

### Admin
| Method | Endpoint                     | Description        | Auth  |
|--------|------------------------------|--------------------|-------|
| GET    | `/api/admin/analytics`       | Platform analytics | Admin |
| GET    | `/api/admin/users`           | List users         | Admin |
| PATCH  | `/api/admin/users/:id/toggle`| Toggle user status | Admin |
| GET    | `/api/admin/resumes`         | All resumes        | Admin |
| GET    | `/api/admin/job-roles`       | List job roles     | Admin |
| POST   | `/api/admin/job-roles`       | Create job role    | Admin |
| PUT    | `/api/admin/job-roles/:id`   | Update job role    | Admin |
| DELETE | `/api/admin/job-roles/:id`   | Delete job role    | Admin |
| GET    | `/api/admin/skills`          | List skills        | Admin |
| POST   | `/api/admin/skills`          | Add skill          | Admin |
| DELETE | `/api/admin/skills/:id`      | Delete skill       | Admin |
| POST   | `/api/admin/seed`            | Seed database      | Admin |

---

## 🗄 MongoDB Collections

### `users`
```json
{ "name", "email", "password" (bcrypt), "role", "profile": { "phone","location","linkedin","github","website","summary" }, "resume_count", "is_active", "created_at", "last_login" }
```

### `resumes`
```json
{ "user_id", "filename", "file_path", "status", "parsed_data": { "full_name","email","phone","education","experience","projects","skills","certifications" }, "ats_score", "score_breakdown", "recommended_jobs", "missing_skills", "improvement_suggestions", "uploaded_at" }
```

### `job_roles`
```json
{ "title", "category", "description", "required_skills" [], "preferred_skills" [], "salary_range", "is_active" }
```

### `skills`
```json
{ "name", "display_name", "category", "aliases" [], "weight", "is_active" }
```

---

## 📊 ATS Scoring Algorithm

| Section          | Max Points | Criteria                              |
|------------------|-----------|---------------------------------------|
| Skills           | 35        | Count + high-value skill bonus         |
| Experience       | 20        | # entries + description quality       |
| Projects         | 15        | # entries + tech stack listed          |
| Education        | 15        | Degree level (PhD > Masters > BE/BTech)|
| Certifications   | 10        | # certifications                       |
| Completeness     | 5         | Name, email, phone, LinkedIn, GitHub   |

---

## 🚀 Deployment

### Backend (Gunicorn + Nginx)
```bash
# Install gunicorn
pip install gunicorn

# Run with gunicorn
gunicorn -w 4 -b 0.0.0.0:5000 "app:create_app()"
```

### Frontend (Build)
```bash
cd frontend
npm run build
# Serve the build/ folder via Nginx or any static host
```

### Environment Variables (Production)
```
MONGO_URI=mongodb+srv://user:pass@cluster.mongodb.net/smart_resume_db
JWT_SECRET_KEY=<strong-random-secret-min-32-chars>
FLASK_ENV=production
FLASK_DEBUG=False
```

---

## 👨‍💻 Author

Built as an MCA Final Year Major Project  
**Stack:** Python · Flask · React · MongoDB · spaCy · NLP

---

## 📄 License

MIT License – free to use for educational and portfolio purposes.
