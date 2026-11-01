# 📚 LUMORA — Library Management System (Backend API)
> **"Your Digital Library."**

[![Spring Boot](https://img.shields.io/badge/Spring%20Boot-4.1.1-6DB33F?style=for-the-badge&logo=springboot&logoColor=white)](https://spring.io/projects/spring-boot)
[![Java](https://img.shields.io/badge/Java-21-ED8B00?style=for-the-badge&logo=openjdk&logoColor=white)](https://www.oracle.com/java/)
[![MySQL](https://img.shields.io/badge/MySQL-8.0-4479A1?style=for-the-badge&logo=mysql&logoColor=white)](https://www.mysql.com/)
[![Security](https://img.shields.io/badge/Spring%20Security-JWT-000000?style=for-the-badge&logo=jsonwebtokens&logoColor=white)](https://jwt.io/)

---

## 📖 Project Overview

**LUMORA Backend** is an enterprise-grade RESTful API service built with **Java 21** and **Spring Boot 4.1.1**. It powers the **LUMORA Library Management System**, delivering complete automation for cataloguing, stock concurrency, multi-role user governance (Admin, Librarian, Member), and book circulation state machines.

---

## 🏛️ System Architecture

```
┌────────────────────────────────────────────────────────┐
│            Frontend Single Page App (React 19)         │
└───────────────────────────┬────────────────────────────┘
                            │  HTTP REST JSON
                            │  Bearer JWT + HttpOnly Cookie
┌───────────────────────────▼────────────────────────────┐
│          Spring Boot 4 Application (Port 8081)         │
│  ├── Security Filter Chain (JwtAuthenticationFilter)   │
│  ├── Role-Based Access Control (RBAC Guards)           │
│  ├── REST Controllers (Auth, Book, Circulation, User)  │
│  ├── Service Layer (Business Logic & Concurrency Safe) │
│  └── Repositories (Spring Data JPA / Hibernate)        │
└───────────────────────────┬────────────────────────────┘
                            │  JDBC Connection / ACID
┌───────────────────────────▼────────────────────────────┐
│                    MySQL 8.0 Database                  │
│       Users | Books | BorrowRequests | BorrowRecords   │
└────────────────────────────────────────────────────────┘
```

---

## ⚙️ Step-by-Step Setup Guide

### 1. Prerequisites
- **Java Development Kit (JDK):** Version 21 LTS ([Download JDK 21](https://www.oracle.com/java/technologies/downloads/#java21)) *(Strict compilation target is `--release 21`)*
- **MySQL Server:** Version 8.0+ ([Download MySQL](https://dev.mysql.com/downloads/installer/))
- **Maven:** Version 3.8+ (or use the included `mvnw` wrapper)

---

### 2. MySQL Database Setup

1. **Start the MySQL service**:
   ```cmd
   net start MySQL80
   ```

2. **Log into MySQL CLI**:
   ```bash
   mysql -u root -p
   ```

3. **Create the Database**:
   ```sql
   CREATE DATABASE IF NOT EXISTS library_management 
   CHARACTER SET utf8mb4 
   COLLATE utf8mb4_unicode_ci;
   ```

4. **Verify Database Creation**:
   ```sql
   SHOW DATABASES;
   EXIT;
   ```

> ℹ️ **Automatic Tables:** Hibernate is configured with `spring.jpa.hibernate.ddl-auto=update`. Tables will be created automatically on startup.

---

### 3. Environment & Security Configuration

LUMORA enforces production-grade security and **never stores hardcoded credentials or JWT signing secrets** in the repository.

#### A. Generate a Cryptographically Secure JWT Secret
HMAC-SHA256 requires a secret key derived from at least **32 cryptographically random bytes** (256 bits of entropy).
> ⚠️ **Cryptographic Note:** 32 arbitrary alphanumeric ASCII characters provide only $\approx 190.5\text{ bits}$ of entropy ($\log_2(62^{32})$), NOT 256 bits. To guarantee true 256-bit entropy, generate 32 raw random bytes and encode them as **Base64** (44 characters) or **Hex** (64 characters). Both formats pass `JwtService`'s 32-byte length validation.

Generate 32 cryptographically random bytes via your terminal:
- **Linux / macOS (Base64 — 44 characters):**
  ```bash
  openssl rand -base64 32
  ```
- **Linux / macOS (Hex — 64 characters):**
  ```bash
  openssl rand -hex 32
  ```
- **Windows (PowerShell — Base64):**
  ```powershell
  $b = New-Object byte[] 32; [System.Security.Cryptography.RandomNumberGenerator]::Create().GetBytes($b); [Convert]::ToBase64String($b)
  ```

#### B. Set Environment Variables
Before running the application, provide your `JWT_SECRET` and `DB_PASSWORD` (or create a local `.env` file using `.env.example` as a template):

- **Windows PowerShell:**
  ```powershell
  $env:JWT_SECRET="YOUR_GENERATED_BASE64_OR_HEX_SECRET"
  $env:DB_PASSWORD="YOUR_MYSQL_ROOT_PASSWORD"
  ```
- **Windows Command Prompt (cmd):**
  ```cmd
  set JWT_SECRET=YOUR_GENERATED_BASE64_OR_HEX_SECRET
  set DB_PASSWORD=YOUR_MYSQL_ROOT_PASSWORD
  ```
- **Linux / macOS (Bash / Zsh):**
  ```bash
  export JWT_SECRET="YOUR_GENERATED_BASE64_OR_HEX_SECRET"
  export DB_PASSWORD="YOUR_MYSQL_ROOT_PASSWORD"
  ```

> ⚠️ **Fail-Safe Startup:** If `JWT_SECRET` is missing or resolves to fewer than 32 UTF-8 bytes, the application will refuse to start and abort with a descriptive `IllegalStateException`.

---

### 4. Running the Backend Application

Once environment variables are set:

- **Windows:**
  ```cmd
  .\mvnw.cmd clean spring-boot:run
  ```
- **Linux / macOS:**
  ```bash
  chmod +x mvnw
  ./mvnw clean spring-boot:run
  ```

#### Confirm API Health:
The backend starts on port `8081`:
```text
Started LibraryManagementSystemApplication in X.XXX seconds
```

---

## 🔐 First-Time System Setup & Account Provisioning

To prevent unauthorized access and protect production safety, LUMORA does not seed default hardcoded credentials. User onboarding follows a cryptographic bootstrap workflow:

### 1. Generating the Initial Administrator
1. On initial server startup, `SetupInitializer` automatically generates a single-use setup token printed directly to the server terminal:
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
2. Call the bootstrap endpoint with your setup token in the `X-Setup-Token` HTTP header:
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
3. Once created, the setup token is invalidated, permanently preventing any additional administrators from being bootstrapped through this endpoint. The endpoint is thread-synchronized to prevent race conditions during concurrent provisioning.

> 💡 **Token Recovery:** If you misplace your initial setup token prior to creating an admin, restart the backend with environment variable `APP_SETUP_REGENERATE_TOKEN=true` to generate a fresh token.

---

### 2. Provisioning Members & Staff
- **Members (Students/Faculty):** Self-register directly via the public endpoint `POST /api/auth/register` (or the frontend `/register` page).
- **Librarians & Staff:** The Administrator logs in and promotes any registered member to the **Librarian** or **Admin** role through the User Governance portal (`/admin/users`).

---

## 🔒 Security Architecture Highlights

1. **Stateless JWT + Refresh Token Rotation**:
   - Short-lived Access Token in `Authorization: Bearer <token>` header.
   - Long-lived Refresh Token in secure **`HttpOnly` Cookie** (XSS protected).
2. **Password Hashing**:
   - Encrypted with **BCrypt** with dynamic salt.
3. **Role-Based Authorization**:
   - Method-level `@PreAuthorize("hasRole('ADMIN')")` & Spring Security filter chain.
4. **Environment-First Configuration**:
   - Zero hardcoded database credentials or token secrets in the repository.

---

## 📄 License
This project is developed for academic, institutional, and educational purposes.  
**LUMORA — Your Digital Library © 2026. All rights reserved.**
