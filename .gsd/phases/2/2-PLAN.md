---
phase: 2
plan: 2
wave: 2
---

# Plan 2.2: Frontend Interface & Forms

## Objective
Construct a professional React UI for form handling and dashboard listing.

## Context
- .gsd/ROADMAP.md
- client/package.json
- client/src/App.tsx

## Tasks

<task type="auto">
  <name>Install Frontend Form Modules</name>
  <files>client/package.json, client/components.json</files>
  <action>
    - Install `react-hook-form`, `zod`, and `@hookform/resolvers` locally in the client workspace.
    - Use the shadcn-ui CLI (`npx shadcn-ui@latest add`) to inject `form`, `input`, `button`, `select`, and `table` primitive elements into the React application.
  </action>
  <verify>cd client && npm run build</verify>
  <done>Core elements compile efficiently without errors.</done>
</task>

<task type="auto">
  <name>Expense Submission UI Component</name>
  <files>client/src/components/SubmitExpenseForm.tsx</files>
  <action>
    - Create a polished `<SubmitExpenseForm />` strictly utilizing `react-hook-form` coupled to a `Zod` validation schema (Amount required, specific string fields required).
    - Parse raw files attached for receipts into JavaScript `FormData` streams.
    - Connect the submission event natively to the localized Express `/api/expenses` endpoint using `fetch`.
  </action>
  <verify>cd client && npm run build</verify>
  <done>Component compiles perfectly and visually tracks all relevant inputs with standard form practices.</done>
</task>

<task type="auto">
  <name>Dashboard Display Layout</name>
  <files>client/src/pages/Dashboard.tsx</files>
  <action>
    - Use a professional top navigation bar for system traversal.
    - Fetch historical expenses via `/api/expenses/me` displaying a `shadcn/ui` based table capturing Status mappings.
    - Generate a toggle/tab exclusively for administrative queries executing the `/api/expenses/team` route if the user possesses Manager-level privileges.
  </action>
  <verify>cd client && npm run build</verify>
  <done>Dashboard renders conditional React components cleanly representing the core Phase 2 requirement structure.</done>
</task>

## Success Criteria
- [ ] The submission form executes flawlessly utilizing Zod validation strategies.
- [ ] Employees dynamically render contextual visual graphs/tables reflecting database state.
