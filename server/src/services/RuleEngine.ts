import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const evaluateExpense = async (expenseId: number) => {
  const expense = await prisma.expense.findUnique({
    where: { id: expenseId },
    include: {
      user: {
        include: { role: true }
      },
      approvals: {
        include: { 
          user: { 
            include: { role: true } 
          } 
        }
      }
    }
  }) as any;

  if (!expense || expense.status === 'REJECTED' || expense.status === 'APPROVED') {
    return expense;
  }

  // Any rejection = immediately reject the expense
  if (expense.approvals && expense.approvals.some((a: any) => a.status === 'REJECTED')) {
    return await prisma.expense.update({
      where: { id: expenseId },
      data: { status: 'REJECTED' }
    });
  }

  // Get active rules ordered by evaluationOrder
  const rules = await prisma.workflowRule.findMany({
    where: { active: true },
    orderBy: { evaluationOrder: 'asc' }
  });

  // Default fallback if no rules
  if (rules.length === 0) {
    if (expense.approvals && expense.approvals.some((a: any) => a.status === 'APPROVED')) {
      return await prisma.expense.update({
        where: { id: expenseId },
        data: { status: 'APPROVED' }
      });
    }
    return expense;
  }

  const approvals = expense.approvals ? expense.approvals.filter((a: any) => a.status === 'APPROVED') : [];
  const approverIds = approvals.map((a: any) => a.userId);

  // Evaluate each rule in order
  for (const rule of rules) {
    const config = rule.rulesConfig as any;

    // ─── IS_MANAGER_APPROVER gate ──────────────────────────────────────────────
    if (rule.isManagerApprover && expense.user?.managerId) {
      const managerHasApproved = approverIds.includes(expense.user.managerId);
      if (!managerHasApproved) {
        // Stop here, still pending manager
        continue; 
      }
    }

    // ─── SPECIFIC APPROVER override ───────────────────────────────────────────
    if (rule.specificApproverId && approverIds.includes(rule.specificApproverId)) {
      return await prisma.expense.update({
        where: { id: expenseId },
        data: { status: 'APPROVED' }
      });
    }

    // ─── SEQUENCE logic ───────────────────────────────────────────────────────
    if (config.type === 'SEQUENCE' && Array.isArray(config.roles)) {
      const sequence = config.roles as string[];
      const approvedRoleNames = approvals.map((a: any) => a.user?.role?.name);

      const allStepsApproved = sequence.every((requiredRole: string) =>
        approvedRoleNames.some((r: any) => r === requiredRole)
      );

      if (allStepsApproved) {
        return await prisma.expense.update({
          where: { id: expenseId },
          data: { status: 'APPROVED' }
        });
      }
    }

    // ─── PERCENTAGE / COUNT logic ─────────────────────────────────────────────
    // Screenshot mentions "Minimum percentage"
    if (config.type === 'PERCENTAGE' || config.type === 'THRESHOLD') {
      const requiredCount = config.requiredCount || 1;
      const totalPossibleApprovers = config.totalPossibleApprovers || 3; // Fallback
      
      // If percentage is defined, calculate count
      let threshold = requiredCount;
      if (config.minPercentage) {
        threshold = Math.ceil((config.minPercentage / 100) * totalPossibleApprovers);
      }

      if (approvals.length >= threshold) {
        return await prisma.expense.update({
          where: { id: expenseId },
          data: { status: 'APPROVED' }
        });
      }
    }

    // ─── HYBRID logic ────────────────────────────────────────────────────────
    if (config.type === 'HYBRID') {
      const countMet = approvals.length >= (config.requiredCount || 1);
      const specificMet = rule.specificApproverId && approverIds.includes(rule.specificApproverId);

      if (countMet || specificMet) {
        return await prisma.expense.update({
          where: { id: expenseId },
          data: { status: 'APPROVED' }
        });
      }
    }
  }

  // If no rules were satisfied, it remains PENDING_APPROVAL
  return await prisma.expense.update({
    where: { id: expenseId },
    data: { status: 'PENDING_APPROVAL' }
  });
};
