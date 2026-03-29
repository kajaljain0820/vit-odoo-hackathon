# ROADMAP.md

> **Current Phase**: Not started
> **Milestone**: v1.0

## Must-Haves (from SPEC)
- [ ] Employees can successfully submit expenses with receipts and track their real-time state.
- [ ] Admins can create and edit dynamic custom approval rules.
- [ ] Expenses automatically route through the configured rule engine, progressing states correctly when criteria are met.
- [ ] The system correctly handles and records comments for every approval/rejection event.

## Phases

### Phase 1: Authentication & Core Architecture
**Status**: ✅ Complete
**Objective**: Set up React + Node.js/Express, database schemas (PostgreSQL), and role-based access control.
**Requirements**: REQ-01, REQ-10

### Phase 2: Expense Submissions & Basic Management
**Status**: ⬜ Not Started
**Objective**: Build the core employee journey for uploading/submitting expenses, and basic listing views for managers.
**Requirements**: REQ-02, REQ-03, REQ-04

### Phase 3: The Dynamic Rule Engine
**Status**: ⬜ Not Started
**Objective**: Develop the node-based or structured rule engine evaluating workflows, sequential logic, percentages, and overrides.
**Requirements**: REQ-06, REQ-07, REQ-08, REQ-09

### Phase 4: Admin Controls & Polishing
**Status**: ⬜ Not Started
**Objective**: Build out the admin interface for wiring the rule engine blocks together, plus required commenting and deployment prep.
**Requirements**: REQ-05
