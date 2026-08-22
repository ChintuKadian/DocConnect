# 🏥 DocConnect - Hospital & Appointment Platform

DocConnect is a secure, full-stack hospital appointment management platform featuring role-based workflows for **patients**, **doctors**, and **administrators**. Powered by **Node.js, Express, MySQL (Sequelize ORM), React, and Tailwind CSS**, the platform incorporates AI-driven symptom evaluation, calendar synchronization, and automated email reminder scheduling.

---

## 📖 Table of Contents
- [Project Architecture](#-project-architecture)
- [Database Schema (MySQL / Sequelize)](#-database-schema-mysql--sequelize)
- [LLM Integration & Prompts](#-llm-integration--prompts)
- [API Documentation](#-api-documentation)
- [Google Calendar OAuth 2.0 Setup Steps](#-google-calendar-oauth-20-setup-steps)
- [Setup & Installation Guide](#-setup--installation-guide)
- [Background Scheduler & Reminders](#-background-scheduler--reminders)

---

## 🏗 Project Architecture

DocConnect is engineered as a decoupled, multi-tier system with three core applications communicating with a single database engine:

### 1. File Structure Tree
```text
DocConnect/
├── Backend/                       # REST API & Worker Engine (Express + Sequelize)
│   ├── config/                    
│   │   ├── cloudinary.js          # Cloudinary Media Storage configuration
│   │   ├── emailService.js        # Nodemailer connection & dispatch helper
│   │   ├── gemini.js              # Groq & Gemini generative AI client wrappers
│   │   ├── googleCalendar.js      # Google Calendar Event integration services
│   │   ├── reminderWorker.js      # Background medication scheduler & email processor
│   │   └── sequelize.js           # MySQL connection pool & Sequelize instance
│   ├── controllers/               
│   │   ├── adminController.js     # Admin dashboards, doctor updates & deletions
│   │   ├── doctorController.js    # Provider notes, appointments & dashboard statistics
│   │   └── userController.js      # Patient registration, booking, and profile actions
│   ├── middleware/                
│   │   ├── authAdmin.js           # Guard validating Admin JWT
│   │   ├── authDoctor.js          # Guard validating Doctor JWT
│   │   ├── authUser.js            # Guard validating Patient JWT
│   │   └── multer.js              # Multipart/form-data upload handler
│   ├── models/                    
│   │   ├── userModel.js           # Patient table schema
│   │   ├── doctorModel.js         # Doctor table schema
│   │   ├── appointmentModel.js    # Appointment table schema
│   │   └── emailQueueModel.js     # Transactional email outbox table schema
│   ├── routes/                    
│   │   ├── adminRoute.js          # Express admin endpoints
│   │   ├── doctorRoute.js         # Express doctor endpoints
│   │   └── userRoute.js           # Express patient endpoints
│   └── server.js                  # Primary entry point (ports, syncing, workers)
│
├── frontend/                      # Patient Portal Interface (Vite + React)
│   ├── src/
│   │   ├── assets/                # Design assets and illustrations
│   │   ├── components/            # Shared components (Header, Banner, Navbar, Footer)
│   │   ├── context/               # Global AppContext managing state
│   │   ├── pages/                 
│   │   │   ├── Home.jsx           # Landing interface
│   │   │   ├── Doctors.jsx        # Speciality searches & lists
│   │   │   ├── Appointment.jsx    # Slots booking & symptom forms
│   │   │   ├── Login.jsx          # Secure user registration/sign-in
│   │   │   ├── MyAppointments.jsx # Booking history & AI assessments
│   │   │   └── MyProfile.jsx      # Patient profile adjustments
│   │   └── App.jsx                # Patient routing
│
└── admin/                         # Operations Portal for Admins & Doctors (Vite + React)
    ├── src/
    │   ├── components/            # Sidebar navigation & Top-Bar headers
    │   ├── context/               
    │   │   ├── AdminContext.jsx   # Global Admin operations (Add/Delete Doctor, stats)
    │   │   └── DoctorContext.jsx  # Global Doctor operations (Accept/Cancel, notes)
    │   └── pages/                 
    │       ├── Login.jsx          # Consolidated portal auth screen
    │       ├── Admin/             
    │       │   ├── AddDoctor.jsx  # Doctor creation form
    │       │   ├── Dashboard.jsx  # Operational dashboards
    │       │   ├── DoctorsList.jsx# Profile updates & custom deletion overlays
    │       │   └── AllAppointments.jsx # Operations wide monitoring
    │       └── Doctor/            
    │           ├── DoctorAppointment.jsx # Clinical queue management
    │           ├── DoctorDashboard.jsx   # Practice summaries & earnings
    │           └── DoctorProfile.jsx     # Office configurations
```

---

### 2. Tiered Components
*   **Database Tier:** Governed by **Sequelize ORM** mapping definitions to a MySQL engine. Enforces data integrity through foreign relations and atomic locking mechanics.
*   **Application Server Tier:** Run on **Express.js**, acting as an API gateway. Coordinates request validations, executes transactional service scripts, and schedules background cron routines.
*   **Client Presentation Tier:** Contains two separate **React Single Page Applications** compiled with Vite and styled using custom CSS and Tailwind utility layers:
    *   **Patient Website (`/frontend`):** Focuses on user-friendly specialist filtering, booking forms, profile editing, and AI clinical report rendering.
    *   **Operations Portal (`/admin`):** Dynamically mounts specific layouts depending on login role (Admin vs Doctor) to protect access control limits.

---

### 3. Integrated System Lifecycles & Data Flow

#### A. Appointment Booking & LLM Evaluation
```text
[Patient Client] -> submits slot selection & symptom description
      │
      ▼
[Express Router] -> triggers `authUser` verification guard
      │
      ▼
[User Controller] -> executes Database transaction (concurrency locked)
      │
      ├─► [Groq/Gemini Client] -> analyzes symptoms & urgency
      ├─► [Google Calendar API] -> spawns event using patient OAuth
      └─► [Email Queue Table] -> registers patient/doctor confirmation cards
      │
      ▼
[MySQL Engine] -> updates slots_booked mappings & writes appointment details
```

#### B. Provider Leave Management & Patient Cancel Notifications
```text
[Admin Client] -> defines specific Leave Days for a doctor
      │
      ▼
[Express Router] -> verifies admin privilege guard
      │
      ▼
[Admin Controller] -> queries conflicting appointments on leave days
      │
      ├─► Cancel Appointments in DB
      ├─► Releases doctor's slots_booked parameters
      ├─► Calls Google Calendar API to delete events
      └─► Queues cancellation notification emails to patients
```

#### C. Post-Visit Prescription & Intake Scheduler
```text
[Doctor Client] -> submits clinical visit notes & drug list
      │
      ▼
[Doctor Controller] -> invokes `generatePostVisitSummary` LLM utility
      │
      ├─► Converts clinical prescriptions into simplified daily guides
      ├─► Queues visit summary email for patient
      └─► Saves notes, prescriptions, and AI summaries to DB
      │
      ▼
[Background Workers] -> polls DB every 5 minutes:
      │
      └─► Compares frequency intervals (e.g. 12hr, 8hr) and dispatches reminder cards
```

---

### 4. Role-Based Access Control & Route Guarding
Authentication tokens (JWTs) are issued with specific secret payload claims on user login. Express routers verify permissions before routing to controller scripts:
*   `authUser.js`: Inspects `token` header parameter to identify patient request details.
*   `authDoctor.js`: Inspects `dToken` header parameter validating doctor credentials.
*   `authAdmin.js`: Inspects `aToken` header parameter validating admin secret claims.

---

## 🗄 Database Schema (MySQL / Sequelize)

The platform is backed by a relational MySQL database structured using **Sequelize ORM** models:

### 1. `User` Schema
Tracks patient accounts, credentials, and Google OAuth tokens.
*   `_id` (String, Primary Key): Unique patient UUID.
*   `name` (String, Required): Full name.
*   `email` (String, Required, Unique): Email address.
*   `password` (String, Required): Hashed password.
*   `image` (Text, Optional): Cloudinary hosted profile image URL.
*   `address` (JSON, Default: `{ line1: " ", line2: " " }`): Physical address.
*   `gender` (String, Default: `"Not Selected"`): Patient gender.
*   `dob` (String, Default: `"Not Selected"`): Date of birth.
*   `phone` (String, Default: `"000000000"`): Contact number.
*   `googleTokens` (JSON, Default: `null`): Stored Google OAuth refresh and access tokens.

### 2. `Doctor` Schema
Stores provider details, slot schedules, and leave parameters.
*   `_id` (String, Primary Key): Unique doctor UUID.
*   `name` (String, Required): Professional name.
*   `email` (String, Required, Unique): Email address.
*   `password` (String, Required): Hashed password.
*   `image` (Text, Required): Cloudinary hosted profile image URL.
*   `speciality` (String, Required): Area of expertise.
*   `degree` (String, Required): Educational credentials.
*   `experience` (String, Required): Years of practice.
*   `about` (Text, Required): Professional summary.
*   `available` (Boolean, Default: `true`): Availability toggle.
*   `fees` (Double, Required): Consultation cost.
*   `address` (JSON, Required): Clinic address info.
*   `slots_booked` (JSON, Default: `{}`): Map of booked timeslots grouped by date (e.g. `{"2026_08_25": ["10:00 AM", "11:30 AM"]}`).
*   `workingHours` (JSON, Default: `{ start: "09:00", end: "17:00" }`): Operational working hours.
*   `slotDuration` (Integer, Default: `30`): Consultation slot length in minutes.
*   `leaveDays` (JSON, Default: `[]`): Array of dates when the doctor is on leave.

### 3. `Appointment` Schema
Connects patients and doctors, tracking clinical details and assessments.
*   `_id` (String, Primary Key): Unique appointment UUID.
*   `userId` (String, Required): Reference ID of the patient.
*   `docId` (String, Required): Reference ID of the doctor.
*   `slotDate` (String, Required): Scheduled date (`YYYY_MM_DD`).
*   `slotTime` (String, Required): Scheduled time (`HH:MM AM/PM`).
*   `userData` (JSON, Required): Snapshot of user details at booking.
*   `docData` (JSON, Required): Snapshot of doctor details at booking.
*   `amount` (Double, Required): Final amount charged.
*   `date` (BigInt, Required): Timestamp of booking.
*   `cancelled` (Boolean, Default: `false`): Cancellation status.
*   `payment` (Boolean, Default: `false`): Payment confirmation flag.
*   `isCompleted` (Boolean, Default: `false`): Visit completion flag.
*   `symptoms` (Text, Optional): Symptoms described by patient at booking.
*   `preVisitSummary` (JSON, Default: `null`): Stored AI pre-visit urgency assessment.
*   `notes` (Text, Optional): Notes submitted by doctor post-visit.
*   `prescription` (JSON, Default: `[]`): List of prescribed medications.
*   `postVisitSummary` (Text, Optional): Patient-friendly AI post-visit translation summary.
*   `googleCalendarEventId` (String, Default: `""`): Google Calendar event identifier.
*   `lastReminderSent` (Date, Default: `null`): Log timestamp of the last sent medication reminder.

### 4. `EmailQueue` Schema
Manages transactional outbound emails.
*   `_id` (String, Primary key): Queue identifier.
*   `to` (String, Required): Destination email.
*   `subject` (String, Required): Subject line.
*   `html` (Text, Required): Rich HTML email body.
*   `status` (Enum, Default: `"pending"`): Current state (`pending`, `sent`, `failed`).
*   `attempts` (Integer, Default: `0`): Retry attempts.
*   `lastError` (Text, Optional): Diagnostics message on failed attempts.
*   `createdAt` (Date, Default: `NOW`): Queue insertion time.

---

## 🤖 LLM Integration & Prompts

DocConnect relies on Groq and Gemini clients, built with robust try-catch fallbacks to handle rate limitings or network dropouts gracefully.

### 1. Pre-Visit Symptom Summary
*   **Trigger:** Executed during appointment booking.
*   **Goal:** Formulates a quick summary and risk-assessment for the doctor.
*   **Prompt Specification:**
    ```text
    Analyse these symptoms and return a JSON object with keys: "urgency" (Low, Medium, or High), "chiefComplaint" (a short summary string), and "suggestedQuestions" (an array of exactly 3 suggested questions for the doctor). Return ONLY valid raw JSON without markdown code fences.
    Symptoms: <symptoms>
    ```

### 2. Post-Visit Translation Summary
*   **Trigger:** Executed when doctor completes the visit.
*   **Goal:** Translates complex clinical jargon into readable directions for the patient.
*   **Prompt Specification:**
    ```text
    Convert these clinical notes and prescription into a patient-friendly summary with medication schedule and follow-up steps. Keep it warm, clear, and easy to read.
    Notes: <notes>
    Prescription details: <prescriptionStr>
    ```

---

## 📡 API Documentation

### Patient Routes (`/api/user`)
*   `POST /register` - Registers new patient accounts.
*   `POST /login` - Logs in patients, returns JWT access token.
*   `POST /book-appointment` - Allocates a slot atomically using Sequelize transactions.
*   `POST /cancel-appointment` - Cancels booking, releases the time slot immediately.
*   `GET /appointments` - List patient appointments.
*   `GET /google-auth` - Initiates Google OAuth consent screen for calendar syncing.
*   `GET /google-callback` - Handles OAuth redirect token exchange.

### Doctor Routes (`/api/doctor`)
*   `POST /login` - Doctor authentication.
*   `GET /appointments` - List bookings assigned to doctor.
*   `POST /complete-appointment` - Submits clinical notes, prescription; generates AI post-visit summary.
*   `POST /cancel-appointment` - Doctor-side cancellation.
*   `GET /dashboard` - Provider analytics and recent visits.

### Admin Routes (`/api/admin`)
*   `POST /login` - Admin authentication.
*   `POST /add-doctor` - Creates doctor profile, uploads avatar to Cloudinary.
*   `POST /update-doctor` - Modifies profile properties (schedules, leaves) and processes notifications for leave conflicts.
*   `POST /delete-doctor` - Removes doctor profile and deletes corresponding file on Cloudinary.
*   `POST /change-availability` - Toggles doctor active state.
*   `GET /appointments` - List all appointments.
*   `POST /cancel-appointment` - Admin-side cancellation.
*   `GET /dashboard` - Core platform analytics.

---

## 📅 Google Calendar OAuth 2.0 Setup Steps

1.  **Google Cloud Console Setup:**
    *   Create a project in the [Google Cloud Console](https://console.cloud.google.com/).
    *   Go to **APIs & Services > Library**, search for and enable **Google Calendar API**.
2.  **Configure OAuth Consent Screen:**
    *   Go to **OAuth Consent Screen** tab. Select **External**.
    *   Add your developer contact details.
    *   In the **Scopes** step, add `/auth/calendar.events` (Read/write access to calendar events).
    *   Under **Test Users**, add your test gmail address.
3.  **Create Credentials:**
    *   Go to **APIs & Services > Credentials** and click **Create Credentials > OAuth Client ID**.
    *   Choose **Web Application** as application type.
    *   Add **Authorized JavaScript origins**: `http://localhost:4000` (or your domain).
    *   Add **Authorized redirect URIs**: `http://localhost:4000/api/user/google-callback`.
4.  **Save Client Details:**
    *   Copy the generated `Client ID` and `Client Secret` values to your `Backend/.env` configuration.

---

## ⚙ Setup & Installation Guide

### Prerequisites
*   Node.js (v18+)
*   MySQL Server (v8.0+)
*   Cloudinary Account

### 1. Configure Databases
Create a MySQL database:
```sql
CREATE DATABASE docconnect;
```

### 2. Configure Environment Files
Create `.env` files in respective directory paths based on the `.env.example` configurations:
*   [Backend/.env.example](file:///d:/Project/Healthcare/DocConnect/Backend/.env.example)
*   [frontend/.env.example](file:///d:/Project/Healthcare/DocConnect/frontend/.env.example)
*   [admin/.env.example](file:///d:/Project/Healthcare/DocConnect/admin/.env.example)

### 3. Install & Start Applications

#### Backend Startup
```bash
cd Backend
npm install
npm run server    # Runs via nodemon (watches file modifications)
```

#### Patient Frontend Startup
```bash
cd ../frontend
npm install
npm run dev       # Launches patient portal on http://localhost:5173
```

#### Admin/Doctor Client Startup
```bash
cd ../admin
npm install
npm run dev       # Launches dashboard portal on http://localhost:5174
```

---

## ⏰ Background Scheduler & Reminders

A scheduler starts alongside the backend service via [reminderWorker.js](file:///d:/Project/Healthcare/DocConnect/Backend/config/reminderWorker.js). It registers two interval workers:

1.  **Email Dispatch Queue:** Processes unsent email payloads from the `EmailQueue` table every **30 seconds**.
2.  **Medication Intake Reminders:** Runs every **5 minutes**, querying completed prescriptions. It extracts dosage frequency instructions and emails patients reminder cards if the scheduled interval (e.g. 12 hours for twice daily, 8 hours for thrice daily) has elapsed.