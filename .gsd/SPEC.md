# SPEC.md — Project Specification

> **Status**: `FINALIZED`

## Vision
Transform the manual, inefficient expense reimbursement process into a smart, structured, and highly automated workflow. Acting as a lightweight ERP module similar to Odoo, this system will rely on a robust, dynamic rule engine to evaluate approvals, ensuring scalability, clarity, and ease of use for all employees and management tiers.

## Goals
1. Develop a scalable core expense submission and user role system (Employee, Manager, Admin).
2. Implement a dynamic, multi-tier approval workflow powered by a smart rule engine (handling sequential, percentage-based, and specific approver logic).
3. Build a modular clean architecture (React, Node.js/Express, PostgreSQL/SQLite) that allows for safe expansion into advanced features like OCR, AI fraud detection, and multi-currency integration.

## Non-Goals (Out of Scope for MVP)
- Advanced OCR-based receipt scanning (deferred to future phases).
- Live currency conversion via external APIs (deferred).
- Complex ML-based fraud detection (deferred).
- Native mobile applications.

## Users
- **Employee**: Submits reimbursements, uploads receipts, and tracks the status of their requests (draft → submitted → approved/rejected).
- **Manager (Approvers)**: Reviews assigned or pool-based expenses, approving or rejecting with mandatory comments according to their tier in the workflow.
- **Admin**: Configures the dynamic approval rules/workflows, manages users and roles, and monitors system-wide analytics.

## Constraints
- **Technical**: Must follow clean architecture principles, acting as a modular, scalable foundation. Tech stack locked to React (Frontend) and Node.js/Express with PostgreSQL/SQLite (Backend).
- **Phasing**: MVP must aggressively focus on the core user journey and the dynamic rule engine logic before layering on third-party APIs or AI features.

## Success Criteria
- [ ] Employees can successfully submit expenses with receipts and track their real-time state.
- [ ] Admins can create and edit dynamic custom approval rules (sequential multi-level, percentage-based, or specific approver bypass) through a configuration interface.
- [ ] Expenses automatically route through the configured rule engine, progressing states correctly when criteria are met.
- [ ] The system correctly handles and records comments for every approval/rejection event.
