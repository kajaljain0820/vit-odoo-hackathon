---
phase: 2
plan: 1
wave: 1
---

# Plan 2.1: Expense Schema & Backend APIs

## Objective
Define the Expense database schema and implement the REST APIs with file upload support.

## Context
- .gsd/ROADMAP.md
- server/prisma/schema.prisma
- server/src/index.ts

## Tasks

<task type="auto">
  <name>Prisma Model Generation</name>
  <files>server/prisma/schema.prisma</files>
  <action>
    - Define the `ExpenseStatus` enum (`DRAFT`, `PENDING_APPROVAL`, `APPROVED`, `REJECTED`).
    - Define the `Expense` model containing fields string `id`, float `amount`, string `currency`, string `category`, string `description` (optional), datetime `date`, string `receiptUrl` (optional), and an `ExpenseStatus` enum `status`.
    - Create a relation from `Expense` back to `User` using `userId`.
  </action>
  <verify>cd server && npx prisma validate</verify>
  <done>Prisma validation step completes without any syntax or relation errors.</done>
</task>

<task type="auto">
  <name>Multer Middleware Configuration</name>
  <files>server/src/middleware/upload.ts, server/src/index.ts</files>
  <action>
    - Install `multer` and `@types/multer` into the `server` folder.
    - Create an intuitive configuration in `upload.ts` utilizing `multer.diskStorage` that restricts uploads to `.jpg`, `.jpeg`, `.png`, and `.pdf`, saving outputs to `server/uploads/`.
    - Configure Express to statically serve the `/uploads` directory in `index.ts`.
  </action>
  <verify>cd server && npx tsc --noEmit</verify>
  <done>Multer setup compiles cleanly, and Express config captures static files securely.</done>
</task>

<task type="auto">
  <name>Expense Endpoints Creation</name>
  <files>server/src/controllers/expense.ts, server/src/routes/expense.ts, server/src/index.ts</files>
  <action>
    - Build `POST /api/expenses` route receiving parsing formData, logging file uploads via multer, and creating records in Prisma.
    - Build `GET /api/expenses/me` utilizing the Auth middleware `req.user.id` to return historical submissions.
    - Build `GET /api/expenses/team` returning expenses belonging to users whose `managerId` matches the authenticated `req.user.id`.
    - Inject the router into the main Express application.
  </action>
  <verify>cd server && npx tsc --noEmit</verify>
  <done>All REST functionality handles database actions safely, properly compiling without type issues.</done>
</task>

## Success Criteria
- [ ] Prisma accurately reflects the system requirements for relational status.
- [ ] Multer processes incoming receipts properly onto local disk storage.
- [ ] Expense CRUD queries properly segment data through RBAC patterns.
