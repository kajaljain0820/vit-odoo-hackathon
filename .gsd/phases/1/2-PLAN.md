---
phase: 1
plan: 2
wave: 2
---

# Plan 1.2: Database Schema & Authentication

## Objective
Establish the PostgreSQL database schema and secure endpoints with JWT.

## Context
- .gsd/DECISIONS.md
- server/prisma/schema.prisma

## Tasks

<task type="auto">
  <name>Prisma Schema Generation</name>
  <files>server/prisma/schema.prisma</files>
  <action>
    - Define the `Role` enum (`EMPLOYEE`, `MANAGER`, `ADMIN`).
    - Define the `User` model, including fields for name, email, password, and role.
    - Define the `managerId` field as a self-relation.
    - Format and validate the schema.
  </action>
  <verify>cd server && npx prisma validate</verify>
  <done>Prisma schema validates successfully.</done>
</task>

<task type="auto">
  <name>Setup Auth Endpoints & JWT</name>
  <files>server/src/controllers/auth.ts, server/src/routes/auth.ts, server/src/middleware/auth.ts</files>
  <action>
    - Create a simple `/api/auth/register` and `/api/auth/login` set of endpoints.
    - Use `bcryptjs` to hash passwords before saving.
    - Use `jsonwebtoken` to sign a JWT upon successful login or registration.
    - Create a verify auth middleware to protect future routes.
  </action>
  <verify>cd server && npx tsc --noEmit</verify>
  <done>Auth controllers and middleware build without TS errors.</done>
</task>

## Success Criteria
- [ ] User database schema supports Role and Manager relations.
- [ ] `/api/auth/login` and `/api/auth/register` are built for JWT Auth.
