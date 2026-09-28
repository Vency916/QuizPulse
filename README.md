# QuizPulse ⚡ — Playful Live Quiz Platform

A modern, high-energy, real-time web-based quiz platform built with **Laravel 10**, **SQLite**, **React 18**, **Vite**, and **Tailwind CSS**. Designed for classrooms, competitions, company events, and casual group quizzes.

---

## ✨ Features & Architecture Highlights

### 🎮 Participant / Guest Experience (Zero-Friction)
- **No Account Required**: Participants join directly via unique 6-character Game PIN (e.g. `QP2026`) or instant QR code scan.
- **Temporary Player Identity**: Username-only session identity with secure browser token for auto-reconnection.
- **Team / Group Competition**: Compete individually or contribute points to assigned or self-selected teams (Team Blue, Team Red, etc.).
- **Live Autorun Synchronized Timer**: Authoritative server timestamp synchronization prevents local clock tampering.
- **Interactive Question Cards**: Touch-friendly 2x2 cards with bouncy 3D press effects, supporting Multiple Choice, True/False, Multiple Select, and Short Answer.
- **Instant Server-Side Feedback**: Immediate points breakdown (Base Points + Speed Bonus), current rank, correct answer reveal, and explanations with celebratory confetti bursts.
- **Real-Time Podium Leaderboard**: Animated top 3 podium standings with live updates and group rankings.

### 🛡️ Authoritative Anti-Cheat & Security
- **Strict Server Authoritative Logic**: Correct answers (`is_correct`) and explanations are strictly hidden on server responses until questions are officially completed.
- **Server-Side Scoring Engine**: Points and speed bonuses calculated authoritative from server timestamps, with a 2-second grace period for network latency.
- **Rate-Limiting & Input Sanitization**: Duplicate submission prevention, SQL injection protection via Eloquent, and HTML script stripping.

### 👑 Super Admin & Host Control Panel
- **Sanctum Authentication**: Secure bearer token authentication for Super Admin (`admin@quizpulse.com` / `password123`).
- **Comprehensive Quiz Builder**:
  - Drag-and-drop question ordering.
  - Multi-type question support: MCQ, True/False, Multi-select, Short Answer.
  - Configurable time limits (5s–120s), base points, speed bonus toggle, and negative scoring.
  - Quiz duplication and publishing workflow (Draft -> Published -> Archived).
- **Live Game Control Engine**:
  - Live session launcher with group controls.
  - Host controls: `[Start Quiz]`, `[Next Question]`, `[Reveal Answer]`, `[Show Leaderboard]`, `[Pause / Resume]`, `[End Quiz]`.
  - Live response counter (e.g. `18 / 24 players answered`).
  - **Projector / Classroom Screen Mode**: Fullscreen presentation view with large typography, high-contrast timer, and persistent QR code for auditorium or classroom walls.
- **Deep Session Analytics**:
  - Completion rates, average score, easiest and hardest question breakdown by accuracy %.
  - Complete player results table with accuracy percentages.

---

## 🛠️ Technology Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 18, Vite, React Router 7, Tailwind CSS v4, Framer Motion, Lucide Icons, Canvas Confetti |
| **Backend** | Laravel 10 REST API, PHP 8.1+, Laravel Sanctum |
| **Database** | SQLite (No MySQL required, works out of the box) |
| **Real-Time** | Server-Sent Events (SSE) `/api/sessions/{code}/stream` + reactive polling fallback |
| **Typography** | Google Fonts: `Quicksand` (Primary UI) & `Fredoka` (Display & Game moments) |

---

## 🚀 Quick Start Guide

### 1. Requirements
- **PHP**: 8.1 or higher (with `pdo_sqlite` enabled)
- **Composer**: 2.x
- **Node.js**: 18.x or 22.x
- **NPM**: 9.x or higher

### 2. Backend Setup (Laravel & SQLite)
```bash
cd backend

# Setup environment & SQLite database
copy .env.example .env
# Ensure DB_CONNECTION=sqlite in .env

# Run database migrations
php artisan migrate --force

# Seed Super Admin and sample quizzes
php artisan db:seed --force

# Start Laravel API server (runs on http://localhost:8000)
php artisan serve --port=8000
```

### 3. Frontend Setup (React & Vite)
```bash
cd frontend

# Install dependencies
npm install

# Start Vite dev server (runs on http://localhost:5173)
npm run dev
```

### 4. Open in Browser
- **Player & Public Landing Page**: `http://localhost:5173`
- **Join Quiz**: `http://localhost:5173/join/QP2026`
- **Super Admin Portal**: `http://localhost:5173/admin/login`

---

## 🔑 Default Super Admin Credentials

- **Email**: `admin@quizpulse.com`
- **Password**: `password123`
*(A convenient "Autofill Demo Credentials" button is also present on the login screen)*

---

## 📡 API Endpoint Overview

### Public & Participant Endpoints
- `POST /api/auth/login` — Super Admin authentication
- `GET /api/quizzes/live` — Active live sessions showcase for Landing Page
- `GET /api/sessions/code/{code}` — Session details by 6-char Game PIN
- `GET /api/sessions/{code}/stream` — Real-time Server-Sent Events (SSE) live stream
- `POST /api/sessions/{code}/join` — Guest participant join (username + team)
- `GET /api/sessions/{code}/me` — Participant heartbeat & reconnect
- `POST /api/sessions/{code}/answer` — Submit answer & receive instant feedback
- `GET /api/sessions/{code}/leaderboard` — Real-time individual & team leaderboard

### Super Admin Endpoints (Protected via `auth:sanctum`)
- `GET /api/admin/stats` — Platform metrics & active sessions
- `GET /api/admin/sessions/{id}/analytics` — Session question difficulty and player results
- `GET /api/admin/quizzes` — Quiz catalog with search and filters
- `POST /api/admin/quizzes` — Create new quiz
- `GET /api/admin/quizzes/{id}` — Get quiz details with questions
- `PUT /api/admin/quizzes/{id}` — Update quiz metadata
- `DELETE /api/admin/quizzes/{id}` — Delete quiz
- `POST /api/admin/quizzes/{id}/duplicate` — Duplicate quiz
- `POST /api/admin/quizzes/{quizId}/questions` — Add question
- `PUT /api/admin/questions/{id}` — Update question
- `DELETE /api/admin/questions/{id}` — Delete question
- `POST /api/admin/quizzes/{quizId}/questions/reorder` — Reorder questions
- `POST /api/admin/quizzes/{quizId}/launch` — Launch live quiz session
- `POST /api/admin/sessions/{id}/start` — Start live quiz
- `POST /api/admin/sessions/{id}/next-question` — Move to next question or complete
- `POST /api/admin/sessions/{id}/show-answer` — Reveal correct answer
- `POST /api/admin/sessions/{id}/show-leaderboard` — Show leaderboard
- `POST /api/admin/sessions/{id}/pause` & `resume` — Pause/resume live quiz
- `POST /api/admin/sessions/{id}/end` — Finish quiz and save results

---

## 📦 Production Build
```bash
cd frontend
npm run build
```
Vite outputs the production bundle to `frontend/dist/`.
