# 🚀 ReimburseIQ: Smart Reimbursement Management System

A high-performance, enterprise-grade expense reimbursement platform designed to eliminate manual workflows and introduce intelligent automation through OCR, dynamic approval engines, and real-time financial insights.

---

## 📌 Overview

ReimburseIQ transforms traditional reimbursement systems by introducing a **smart, scalable, and automated workflow engine**. It enables organizations to manage employee expenses efficiently while ensuring transparency, compliance, and speed.

---

## 🎯 Core Highlights

### 📸 Magic Scan (OCR)

* Automatically extracts key data from receipts
* Reduces manual entry effort
* Improves accuracy and speed of submissions

---

### ⚖️ Intelligent Approval Engine (Key Feature)

A flexible and dynamic system designed for real-world enterprise workflows:

* **Sequential Approvals**

  * Multi-level hierarchy (Manager → Finance → Director)

* **Percentage-Based Approval**

  * Approval triggered when a threshold (e.g., 60%) is met

* **Specific Approver Override**

  * Critical approvers (e.g., CFO) can auto-approve expenses

* **Hybrid Rules**

  * Combination of percentage and specific approver logic

---

### 🌍 Real-Time Currency Conversion

* Supports multi-currency expense submission
* Automatically converts to company’s base currency
* Ensures financial consistency across regions

---

### 🔐 Role-Based Access Control (RBAC)

| Role         | Capabilities                                                   |
| ------------ | -------------------------------------------------------------- |
| **Admin**    | Manage users, configure approval rules, full system visibility |
| **Manager**  | Approve/reject expenses, manage team submissions               |
| **Employee** | Submit expenses, upload receipts, track status                 |

---

### 💸 Expense Management

* Submit expenses with:

  * Amount, Category, Currency, Description
  * Receipt upload (Image/PDF)
* Track lifecycle:

  * **Draft → Submitted → Approved/Rejected**

---

### 📊 Dashboard & Insights

* Centralized dashboard for all roles
* Real-time expense tracking
* Manager approval queue
* Clean and intuitive UI

---

### 🎨 Premium UI/UX

* Modern dark theme interface
* Glassmorphism design elements
* Smooth interactions and transitions
* Optimized for usability and clarity

---

## 🛠️ Technology Stack

### Frontend

* React (Vite)
* TypeScript
* Tailwind CSS
* Custom UI components

### Backend

* Node.js
* Express.js

### Database

* PostgreSQL / MySQL (via Prisma ORM)

### Additional Tools

* JWT Authentication (secure access)
* Multer (file uploads)
* OCR integration (receipt scanning)

---

## 🏗️ System Architecture

```id="ak9y4m"
Client (React)  →  Backend (Express API)  →  Database (Prisma + SQL)
                        ↓
                  File Storage (Receipts)
```

---

## 🔐 Security & Data Handling

* JWT-based authentication system
* Secure password handling
* Controlled role-based access
* Receipt files stored securely with path references in database

---

## 💡 Design Philosophy

ReimburseIQ is built with:

* **Scalability** → Modular architecture for future expansion
* **Flexibility** → Dynamic rule engine instead of hardcoded workflows
* **Usability** → Simple UI for complex backend logic
* **Performance** → Optimized database and API interactions

---

## 🚀 Innovation & Differentiation

Unlike traditional systems, ReimburseIQ introduces:

* Dynamic approval logic instead of fixed workflows
* OCR-powered automation for faster submissions
* Intelligent decision-making via rule-based engine
* Enterprise-ready architecture in a hackathon build

---

## 📈 Future Scope

* Advanced analytics dashboard (spending insights)
* Fraud detection (duplicate or abnormal expenses)
* Integration with ERP systems like Odoo
* Export reports (PDF/Excel)
* Multi-company & multi-tenant support

---

## 🏆 Hackathon Context

Developed as part of the **VIT-Odoo Hackathon**, this project demonstrates:

* Real-world problem-solving
* Scalable system design
* Clean full-stack implementation
* Advanced feature integration beyond MVP

---

## 👩‍💻 Author

**Kajal Jain**
B.Tech Computer Science


If you find this project valuable, consider giving it a ⭐ on GitHub.
