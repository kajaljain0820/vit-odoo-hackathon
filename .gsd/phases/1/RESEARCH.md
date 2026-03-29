---
phase: 1
level: 1
researched_at: 2026-03-29
---

# Phase 1 Research

## Questions Investigated
1. How should a `client`/`server`/`prisma` monorepo be structured effectively for a hackathon?
2. What is the correct Prisma syntax for a User self-relation (Employee-Manager)?
3. What is the optimal command configuration to initialize Shadcn/UI with Vite + React + Tailwind?

## Findings

### 1. Monorepo Structure
The cleanest approach without requiring a complex workspace manager (like Turborepo) for a hackathon is a simple root `package.json` that serves as a task runner (using `concurrently`), with independent `client` and `server` directories. Prisma should reside in the `server` directory or at the root to easily generate the client for the backend. Placing it in the `server` directory is more isolated for Express.

**Recommendation:** 
```text
project-root/
 ├── client/         (Vite React app)
 ├── server/         (Express node app)
 │    ├── prisma/    (Schema and migrations)
 │    └── src/
 └── package.json    (Root runner)
```

### 2. Prisma Self-Relation
The Prisma self-relation syntax discussed is perfectly valid for a 1-to-many relationship where one manager can have many employees, but an employee has only one manager.

```prisma
model User {
  id        String   @id @default(uuid())
  ...
  managerId String?
  manager   User?    @relation("ManagerRelation", fields: [managerId], references: [id])
  employees User[]   @relation("ManagerRelation")
}
```
**Recommendation:** Proceed with the discussed schema. Ensure `managerId` is optional (`String?`) to allow top-level Admins or Directors to have no manager.

### 3. Shadcn/UI Initialization
The recommended modern setup for Shadcn with Vite is to first scaffold with `npm create vite@latest client -- --template react-ts`, configure Tailwind, then run `npx shadcn-ui@latest init` to handle path aliases (`@/components`).

**Recommendation:** Follow the official Shadcn/UI Vite installation guide.

## Decisions Made
| Decision | Choice | Rationale |
|----------|--------|-----------|
| Folder Structure | `server/prisma` | Keeps DB logic contained within the backend while the root just acts as a runner. |
| Vite Template | `react-ts` | TypeScript is heavily recommended for Prisma and Shadcn to leverage type safety. |

## Patterns to Follow
- Use `concurrently` in the root `package.json` to start both `client` and `server` dev servers with one command.
- Use path aliases (`@/*`) in the React frontend.

## Anti-Patterns to Avoid
- Putting `prisma/` at the very root if there's no shared TS types workspace—it complicates the `prisma generate` step for the server.

## Dependencies Identified
| Package | Version | Purpose |
|---------|---------|---------|
| typescript | latest | Shared type-safety |
| concurrently | latest | Root dev runner |
| prisma | latest | ORM |
| @prisma/client | latest | DB Access |
| jsonwebtoken | latest | JWT Auth |

## Ready for Planning
- [x] Questions answered
- [x] Approach selected
- [x] Dependencies identified
