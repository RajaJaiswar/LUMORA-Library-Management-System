# 📚 LUMORA — Library Management System
> **"Your Digital Library."**

[![Spring Boot](https://img.shields.io/badge/Spring%20Boot-4.1.1-6DB33F?style=for-the-badge&logo=springboot&logoColor=white)](https://spring.io/projects/spring-boot)
[![Java](https://img.shields.io/badge/Java-21-ED8B00?style=for-the-badge&logo=openjdk&logoColor=white)](https://www.oracle.com/java/)
[![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-8-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-v4-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![MySQL](https://img.shields.io/badge/MySQL-8.0-4479A1?style=for-the-badge&logo=mysql&logoColor=white)](https://www.mysql.com/)
[![Security](https://img.shields.io/badge/Spring%20Security-JWT-000000?style=for-the-badge&logo=jsonwebtokens&logoColor=white)](https://jwt.io/)

---

## 📖 Project Overview

**LUMORA** is an enterprise-grade, full-stack digital library management platform built to streamline academic and institutional library operations. It replaces manual paperwork with a centralized, role-governed web application featuring automated circulation workflows, real-time book discovery, inventory tracking, and robust security.

The platform provides dedicated, role-tailored portals for **Administrators**, **Librarians**, and **Members** (students/faculty), built on a stateless Spring Boot REST backend and an ultra-responsive React + TypeScript Single Page Application (SPA).

---

## 🏛️ System Architecture

```
┌────────────────────────────────────────────────────────┐
│               Client Browser (React 19 + TS)           │
│           Outfit + Inter Typography | Tailwind v4      │
└───────────────────────────┬────────────────────────────┘
                            │
               HTTP / REST API Calls (JSON)
                            │
┌───────────────────────────▼────────────────────────────┐
│         Vite Reverse Proxy (Port 5173 -> 8081)         │
└───────────────────────────┬────────────────────────────┘
                            │  Bearer JWT + HttpOnly Refresh Cookie
┌───────────────────────────▼────────────────────────────┐
│          Spring Boot 3 Application (Port 8081)         │
│  ├── Security Filter Chain (JwtAuthenticationFilter)   │
│  ├── Role-Based Access Control (RBAC Guards)           │
│  ├── REST Controllers (Auth, Book, Circulation, User)  │
│  ├── Service Layer (Business Logic & Concurrency Safe) │
│  └── Repositories (Spring Data JPA / Hibernate)        │
└───────────────────────────┬────────────────────────────┘
                            │  ACID Transactions / JDBC
┌───────────────────────────▼────────────────────────────┐
│                    MySQL 8.0 Database                  │
│       Users | Books | BorrowRequests | BorrowRecords   │
└────────────────────────────────────────────────────────┘
```

---

## 🌟 Key Features by Role

### 1. 🛡️ Administrator Portal
- **RBAC User Directory:** View all registered users with real-time roles, membership IDs, emails, and account statuses.
- **Account Governance:** One-click account activation and deactivation (deactivated users are blocked from authentication).
- **Role Elevation:** Promote members to librarians or administrators dynamically.
- **System Metrics:** Live KPI counters for active administrators, librarians, and members.
- **Automated Bootstrapping:** Automatic super-admin provisioning on initial system launch.

### 2. 📚 Librarian Console
- **Catalogue & Inventory Management:** Add, edit, or archive books with details including Title, Author, ISBN, Category, Total Copies, and Available Copies.
- **Bulk CSV Upload:** Import hundreds of titles via CSV with instant row-by-row validation and failure reporting.
- **Borrow Requests Queue:** Review pending borrow requests from members in real time.
- **Automated Issuing:** Approving a request generates a loan record, sets the due date, and automatically deducts stock (`availableCopies - 1`).
- **Return Verification:** Process member returns and automatically restore available book stock (`availableCopies + 1`).
- **Extension Management:** Review and approve or reject due date extension requests submitted by members.

### 3. 🎓 Member Portal (Students & Faculty)
- **Live Book Discovery:** Fast catalogue search by title, author, category, or ISBN with live stock status indicators.
- **Borrow Request Submission:** Request available books with one click.
- **Active Loans Tracker:** View currently borrowed books, issue dates, and upcoming due dates.
- **Loan Extensions:** Request due date extensions on active borrowings before deadlines.
- **Return Initiation:** Initiate book returns directly from the portal.
- **Personal Borrowing History:** Complete historical record of all completed loans.
- **Profile Management:** View personal account details and update contact information.

---

## 🛠️ Technology Stack

| Domain | Technology | Description |
| :--- | :--- | :--- |
| **Frontend Framework** | **React 19** | Modern component-based UI architecture |
| **Language (Frontend)**| **TypeScript** | Strict type safety and predictable interfaces |
| **Build Tool** | **Vite 8** | Instant Hot Module Replacement (HMR) & build optimizer |
| **Styling** | **Tailwind CSS v4** | Modern utility-first design system with `@theme` tokens |
| **State & Caching** | **TanStack React Query v5** | Server-state management, automatic caching, background refetch |
| **Routing** | **React Router v7** | Client-side routing with role-based `ProtectedRoute` guards |
| **HTTP Client** | **Axios** | Request/response interceptors for automatic JWT injection |
| **Backend Framework** | **Spring Boot 4.1.1** | Enterprise RESTful web services |
| **Language (Backend)** | **Java 21 LTS** | Modern LTS Java runtime (compilation target: --release 21) |
| **Security** | **Spring Security 6** | Stateless authentication filter chain and password encryption |
| **Token Handling** | **JJWT (Java JWT)** | Dual-token authentication (Short-lived JWT + HttpOnly Cookie) |
| **Data Persistence** | **Spring Data JPA** | Hibernate ORM repository abstraction |
| **Database** | **MySQL 8.0** | Relational database with full ACID compliance |
| **Validation** | **Jakarta Validation** | Declarative DTO validation annotations |

---

## 📋 Prerequisites

Ensure the following tools are installed on your machine before setting up the project:

- **Java Development Kit (JDK):** Version 21 LTS ([Download JDK 21](https://www.oracle.com/java/technologies/downloads/#java21))
- **Node.js:** Version 18.x or 20.x ([Download Node.js](https://nodejs.org/))
- **npm:** Version 9.x or higher (bundled with Node.js)
- **MySQL Server:** Version 8.0+ ([Download MySQL](https://dev.mysql.com/downloads/installer/))
- **Git:** Version 2.x+ ([Download Git](https://git-scm.com/))

---

## ⚙️ Step-by-Step Setup Guide

Follow these three steps in order: **Database**, **Backend**, and **Frontend**.

---

### Step 1: MySQL Database Setup

1. **Start the MySQL service** on your machine.
   - On Windows (PowerShell / Command Prompt as Admin):
     ```cmd
     net start MySQL80
     ```
   - On macOS / Linux:
     ```bash
     sudo systemctl start mysql
     # or on macOS Homebrew:
     brew services start mysql
     ```

2. **Log into MySQL CLI**:
   ```bash
   mysql -u root -p
   ```

3. **Create the Database**:
   Execute the following SQL command to create the dedicated database:
   ```sql
   CREATE DATABASE IF NOT EXISTS library_management 
   CHARACTER SET utf8mb4 
   COLLATE utf8mb4_unicode_ci;
   ```

4. **Verify Database Creation**:
   ```sql
   SHOW DATABASES;
   ```
   You should see `library_management` listed. Exit the MySQL shell:
   ```sql
   EXIT;
   ```

> ℹ️ **Note on Tables:** You do **not** need to manually run `CREATE TABLE` scripts. Hibernate is configured with `spring.jpa.hibernate.ddl-auto=update`, which automatically generates all tables (`users`, `books`, `borrow_records`, `borrow_requests`, etc.) when the Spring Boot backend boots for the first time.

---

### Step 2: Backend Setup (Spring Boot)

1. **Open terminal** and navigate to the backend directory:
   ```bash
   cd library-management-system-backend
   ```

2. **Configure Environment Variables**:
   LUMORA uses environment-based configuration for database credentials and the JWT secret key. Set the variables before running:
   - **Windows PowerShell:**
     ```powershell
     $env:JWT_SECRET="YOUR_GENERATED_BASE64_OR_HEX_SECRET"
     $env:DB_PASSWORD="YOUR_MYSQL_PASSWORD"
     ```
   - **Linux / macOS:**
     ```bash
     export JWT_SECRET="YOUR_GENERATED_BASE64_OR_HEX_SECRET"
     export DB_PASSWORD="YOUR_MYSQL_PASSWORD"
     ```
   *(Generate 32 cryptographically random bytes via `openssl rand -base64 32` or PowerShell; see `backend/.env.example`)*

3. **Run the Backend Application**:
   - **Windows:**
     ```cmd
     .\mvnw.cmd clean spring-boot:run
     ```
   - **Linux / macOS:**
     ```bash
     chmod +x mvnw
     ./mvnw clean spring-boot:run
     ```

4. **Confirm Backend Health**:
   The backend will start on port `8081`. You will see log output ending with:
   ```text
   Started LibraryManagementSystemApplication in X.XXX seconds (process running for X.XXX)
   ```

---

### Step 3: Frontend Setup (React + TypeScript)

1. **Open a new terminal** and navigate to the frontend project:
   ```bash
   cd library-management-system-frontend/react-ts
   ```

2. **Configure Environment Variables**:
   Create a `.env` file from `.env.example`:
   - **Windows (Command Prompt):**
     ```cmd
     copy .env.example .env
     ```
   - **macOS / Linux / PowerShell:**
     ```bash
     cp .env.example .env
     ```

   *The default configuration uses the Vite reverse proxy:*
   ```env
   # Leave empty in development to route requests through Vite dev proxy (http://localhost:5173/api -> http://localhost:8081/api)
   VITE_API_BASE_URL=
   ```

3. **Install Dependencies**:
   ```bash
   npm install
   ```

4. **Start the Development Server**:
   ```bash
   npm run dev
   ```

5. **Open in Browser**:
   Open [http://localhost:5173](http://localhost:5173) in your web browser.

---

## 🔐 First-Time Account Setup & Role Provisioning

To prevent unauthorized access and protect production safety, LUMORA does not pre-seed static credentials into source control. User onboarding follows a secure role governance lifecycle:

### 1. Initial Administrator Setup
1. When the backend Spring Boot server boots for the first time, `SetupInitializer` automatically generates a single-use setup token printed directly to the backend console:
   ```text
   ========================================================
    LIBRARY MANAGEMENT SYSTEM - INITIAL SETUP
   ========================================================
    Initial setup is required.

    Setup Token:
    <one-time-uuid-token>

    Use this token to create the first ADMIN.
    This token can be used only once.
   ========================================================
   ```
2. Provision the first Administrator via the setup endpoint using your console token in the `X-Setup-Token` header:
   ```bash
   curl -X POST http://localhost:8081/api/setup/admin \
     -H "Content-Type: application/json" \
     -H "X-Setup-Token: YOUR_SETUP_TOKEN_HERE" \
     -d '{
       "name": "System Administrator",
       "email": "admin@lumora.local",
       "password": "YourSecurePassword123"
     }'
   ```
   *(Once used, the token is permanently invalidated, locking down the setup endpoint.)*

### 2. Member Self-Registration
- Students and Faculty can register immediately from the web interface at [http://localhost:5173/register](http://localhost:5173/register) or via `POST /api/auth/register`.
- New self-registered accounts are automatically assigned the **MEMBER** role with instant access to the book catalogue and borrowing services.

### 3. Staff & Librarian Elevation
- Log into the Administrator account at [http://localhost:5173/login](http://localhost:5173/login).
- Navigate to **User Governance** (`/admin/users`) to view all registered users.
- Click the role action button on any user to promote them to **Librarian** or **Administrator**.

---

## 📁 Repository Structure

```text
├── library-management-system-backend/
│   ├── src/main/java/com/library/librarymanagementsystem/
│   │   ├── config/              # Security, CORS, and Token configurations
│   │   ├── controller/          # REST API endpoints (Auth, Books, Circulation, Users)
│   │   ├── dto/                 # Request and Response transfer objects
│   │   ├── entity/              # JPA Hibernate entities (User, Book, BorrowRecord, etc.)
│   │   ├── exception/           # Global exception handler & custom exceptions
│   │   ├── repository/          # Spring Data JPA database interfaces
│   │   ├── security/            # JWT Filter, UserDetailsService, Token Provider
│   │   └── service/             # Business logic layer and transactional services
│   ├── src/main/resources/
│   │   └── application.properties # Server port, MySQL URL, credentials
│   ├── mvnw / mvnw.cmd          # Maven wrapper executables
│   └── pom.xml                  # Backend dependency manifest
│
└── library-management-system-frontend/react-ts/
    ├── public/                  # Brand assets (LUMORA logo, favicons, vector icons)
    ├── src/
    │   ├── api/                 # Axios clients and REST endpoint connectors
    │   ├── components/
    │   │   ├── auth/            # Sign-in, Register, and frosted-glass AuthLayout
    │   │   ├── books/           # Book cards, filter bars, CSV bulk import modal
    │   │   ├── circulation/     # Borrow queue, issue modals, loan return tables
    │   │   ├── common/          # Reusable design system primitives (Button, Modal, Input, Brand)
    │   │   ├── layout/          # Navbar, Sidebar, AppLayout
    │   │   └── users/           # Admin user directory tables and role modals
    │   ├── context/             # Global React AuthContext (JWT state & user session)
    │   ├── hooks/               # Custom hooks (useAuth, debounce, notifications)
    │   ├── pages/               # Page views (Dashboards, Catalogue, Admin, Profile)
    │   ├── types/               # TypeScript interfaces and domain models
    │   ├── App.tsx              # Application route tree and layout wrapper
    │   └── main.tsx             # Root React DOM bootstrap with React Query Provider
    ├── index.html               # Entry HTML with Outfit & Inter typography
    ├── package.json             # Frontend dependency manifest
    └── vite.config.ts           # Vite bundler config with backend proxy
```

---

## 🔒 Security Architecture Highlights

1. **Stateless JWT + Refresh Token Rotation**:
   - Short-lived Access Token (15–30 min) stored in-memory in React state for API authorization headers.
   - Long-lived Refresh Token stored inside a secured **`HttpOnly` Cookie**, mitigating Cross-Site Scripting (XSS) attacks.
   - Transparent background token refresh via Axios interceptors upon receiving HTTP `401 Unauthorized`.
2. **Password Hashing**:
   - All passwords are encrypted using **BCrypt** with automatic salt generation before persisting to the database.
3. **Role-Based Authorization**:
   - Backend controller methods guarded by `@PreAuthorize("hasRole('ADMIN')")` and Spring Security matchers.
   - Frontend route trees protected by `<ProtectedRoute allowedRoles={[...]} />`.

---

## 🧪 Code Quality & Verification

Run these commands in the frontend project to verify build integrity and type safety:

```bash
# Type check and production build
npm run build

# Code style and linting
npm run lint
```

Both checks pass with **0 errors and 0 warnings**.

---

## 📄 License

This project is developed for academic, institutional, and educational purposes.  
**LUMORA — Your Digital Library © 2026. All rights reserved.**
