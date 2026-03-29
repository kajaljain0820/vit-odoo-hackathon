---
phase: 2
level: 2
researched_at: 2026-03-29
---

# Phase 2 Research

## Questions Investigated
1. What is the most MVP-friendly way to handle receipt file uploads in Node.js?
2. How should the Expense model be designed in Prisma to support the future state machine and dynamic rules engine?
3. Which frontend form handling library pairs best with Shadcn UI and React?

## Findings

### 1. File Uploads
Using `multer` with local disk storage is the fastest and most reliable approach for an MVP, removing the need for external third-party API keys (like AWS S3 or Cloudinary) during a hackathon. We can serve the uploaded files statically via Express `express.static()`.

**Recommendation:** Install `multer` in the backend and configure a `/uploads` folder.

### 2. Expense Model Schema
The dynamic rule engine in Phase 3 will need an advanced status tracking mechanism. Rather than a simple boolean flag, we should use an application-level enum: `DRAFT`, `PENDING_APPROVAL`, `APPROVED`, `REJECTED`. 
We also need reference relations back to the `User` (the employee submitting it) and fields for metadata (amount, currency as String, category as String).

**Recommendation:** 
```prisma
enum ExpenseStatus {
  DRAFT
  PENDING_APPROVAL
  APPROVED
  REJECTED
}

model Expense {
  id          String        @id @default(uuid())
  amount      Float
  currency    String        @default("USD")
  category    String
  description String?
  date        DateTime      @default(now())
  receiptUrl  String?
  status      ExpenseStatus @default(DRAFT)
  userId      String
  user        User          @relation(fields: [userId], references: [id])
}
```

### 3. Frontend Forms
Shadcn/ui provides excellent primitive form wrappers around `react-hook-form` and `zod`. This is the modern standard for React, offering instant client-side validation without heavy boilerplate.

**Recommendation:** Add `@hookform/resolvers`, `react-hook-form`, and `zod` to the client.

## Decisions Made
| Decision | Choice | Rationale |
|----------|--------|-----------|
| Uploads | `multer` | Zero external configuration required, perfect for fast iteration. |
| DB Types | Float for Amount | Keeping it simple for the MVP, though production systems usually use Decimals. |
| Forms | `react-hook-form` + `zod` | Native integration with `shadcn/ui` Form components. |

## Dependencies Identified
| Package | Version | Purpose |
|---------|---------|---------|
| multer | latest | Backend file upload middleware |
| @types/multer | latest | Types for multer |
| react-hook-form | latest | Frontend forms |
| zod | latest | Schema validation |
| @hookform/resolvers | latest | Zod integration |

## Ready for Planning
- [x] Questions answered
- [x] Approach selected
- [x] Dependencies identified
