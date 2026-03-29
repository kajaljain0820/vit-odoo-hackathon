# DECISIONS.md

> **Log of Architecture Decision Records (ADR)**

## Phase 1 Decisions

**Date:** 2026-03-29

### Scope
- **Authentication**: JWT (JSON Web Tokens). Backend generates tokens; frontend stores them (localStorage/cookie) and sends via headers.
- **RBAC**: Hybrid Approach. Start with Enum roles (`EMPLOYEE`, `MANAGER`, `ADMIN`). User schema will include a `manager_id` self-reference, which is critical for the approval engine later.

### Approach
- **Database / ORM**: PostgreSQL via Prisma. Chosen for type-safety, clean schemas, and faster migration flows compared to raw pg or Sequelize.
- **Architecture**: Monorepo structure (`client/` for React, `server/` for Express, `prisma/` at the root/server). Shared configuration and easier development.
- **Frontend UI**: TailwindCSS + shadcn/ui for fast UI building, clean modern design, and customizability.

### Constraints & Concerns
- **Rule Engine Expansion**: Approval flow logic must remain decoupled from core user logic to allow for dynamic rule evaluation later.
- **User Schema Mapping**: 
  ```prisma
  model User {
    id        String   @id @default(uuid())
    name      String
    email     String   @unique
    password  String
    role      Role
    managerId String?
    manager   User?    @relation("ManagerRelation", fields: [managerId], references: [id])
    employees User[]   @relation("ManagerRelation")
  }
  ```
