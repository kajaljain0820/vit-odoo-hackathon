---
phase: 1
plan: 1
wave: 1
---

# Plan 1.1: Monorepo & UI Scaffolding

## Objective
Build the foundational structure for the React frontend and Node backend.

## Context
- .gsd/SPEC.md
- .gsd/DECISIONS.md
- .gsd/phases/1/RESEARCH.md

## Tasks

<task type="auto">
  <name>Initialize Frontend</name>
  <files>client/</files>
  <action>
    - Scaffold a new Vite project in the `client` directory using the `react-ts` template.
    - Install tailwindcss, postcss, and autoprefixer.
    - Configure tailwind config and reset CSS.
    - Initialize shadcn/ui with base configurations (`new-york` style, `zinc` color).
  </action>
  <verify>cd client && npm run build</verify>
  <done>Vite build completes successfully and tailwind is properly configured.</done>
</task>

<task type="auto">
  <name>Initialize Backend & Prisma</name>
  <files>server/</files>
  <action>
    - Scaffold a new npm project in the `server` directory.
    - Install `express`, `cors`, `dotenv`, and `@prisma/client`.
    - Install `nodemon`, `typescript`, `ts-node`, `prisma`, and `@types/*` as devDependencies.
    - Run `npx prisma init` inside the server directory.
    - Set up a basic Express `index.ts` entry point that listens on port 5000.
  </action>
  <verify>cd server && npx tsc --noEmit</verify>
  <done>Express server entry point has no typescript errors and Prisma folder is created.</done>
</task>

<task type="auto">
  <name>Configure Monorepo Runner</name>
  <files>package.json</files>
  <action>
    - Create a root `package.json`.
    - Install `concurrently` as a dev dependency.
    - Add a `dev` script that runs both the client and server concurrently.
  </action>
  <verify>npm run dev (manually check)</verify>
  <done>Root `npm run dev` starts both services without errors.</done>
</task>

## Success Criteria
- [ ] Both frontend and backend folders exist and are appropriately initialized.
- [ ] Root `package.json` successfully starts both services with `concurrently`.
