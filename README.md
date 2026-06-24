# SentinelIQ: AI-Powered Engineering Intelligence Platform

**SentinelIQ** (formerly PulseAI) is an enterprise-grade, production-ready SaaS dashboard designed to help software teams monitor project health, forecast sprint delays, track bug severity, and execute agile workflows through an intelligent Kanban engine.

## 🚀 Features

*   **Intelligence Hub:** Real-time analytics, sprint velocity tracking, and Recharts KPI widgets.
*   **Predictive AI Reporting:** Automated risk analysis evaluating sprint progression to detect bottlenecks.
*   **Interactive Kanban Board:** Butter-smooth drag-and-drop powered by `@dnd-kit`, synced in real-time.
*   **Defect Management:** Sophisticated bug tracking with severity-based UI color coding.
*   **System Administration:** Mockup telemetry interface tracking user actions and active roles.
*   **Enterprise Security:** Secured via JWT stateless authentication, BCrypt, and Spring Security.

## 🛠️ Technology Stack

*   **Frontend:** React 19, Vite, Tailwind CSS v4, Zustand, React Router DOM, Recharts, dnd-kit.
*   **Backend:** Java 21, Spring Boot 3.4, Spring Data JPA, Spring Security, JWT.
*   **Database:** MySQL 8 (Production) / H2 (Development).
*   **DevOps:** Docker, Docker Compose.

## 🐳 Running with Docker (Production Mode)

The entire application can be orchestrated instantly using Docker Compose.

1. Ensure Docker Desktop is running.
2. From the root directory, execute:
   ```bash
   docker-compose up --build -d
   ```
3. The platform will be available at:
   * **Frontend Application:** `http://localhost:80`
   * **Backend API API:** `http://localhost:8080/api`

## 💻 Running Locally (Development Mode)

If you wish to run the applications independently in development mode:

### 1. Backend (Spring Boot)
1. Navigate to the `backend` directory.
2. The system uses an in-memory H2 database by default. Run the application:
   ```bash
   ./mvnw spring-boot:run
   ```
3. The backend will start on `http://localhost:8080`.

### 2. Frontend (React / Vite)
1. Navigate to the `frontend` directory.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the Vite development server:
   ```bash
   npm run dev
   ```
4. The frontend will be available at `http://localhost:5173`.

## 🔑 Default Authentication

The database seeder automatically provisions the following default accounts to explore the dashboard:

| Role | Username | Password |
| :--- | :--- | :--- |
| **Admin** | `admin` | `admin123` |
| **Project Manager** | `manager` | `manager123` |
| **Developer** | `sarah_dev` | `dev123` |

---
*Built for engineering teams who demand clarity, velocity, and delivery excellence.*

## 🌐 Live Demo

Experience SentinelIQ in action:

**Live Application:** https://sentinal-iq.vercel.app/

### Demo Credentials

| Role                | Username    | Password     |
| :------------------ | :---------- | :----------- |
| **Admin**           | `admin`     | `admin123`   |
| **Project Manager** | `manager`   | `manager123` |
| **Developer**       | `sarah_dev` | `dev123`     |

> Feel free to explore the dashboard, Kanban board, project management features, bug tracking system, and AI-powered risk analysis engine.

