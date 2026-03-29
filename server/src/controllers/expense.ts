import { Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../middleware/auth';
import { scanReceipt } from '../services/OCRService';
import { convertToCurrency } from '../services/CurrencyService';
import { evaluateExpense } from '../services/RuleEngine';

const prisma = new PrismaClient();

export const createExpense = async (req: AuthRequest, res: Response) => {
  try {
    const { amount, currency, category, description } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const amountVal = parseFloat(amount as string);
    if (isNaN(amountVal)) {
      return res.status(400).json({ message: 'Invalid amount provided' });
    }

    const receiptUrl = req.file ? `/uploads/${req.file.filename}` : undefined;

    const { convertedAmount, rate } = await convertToCurrency(amountVal, (currency as string) || 'USD');

    const expense = await prisma.expense.create({
      data: {
        amount: amountVal,
        currency: (currency as string) || 'USD',
        category: (category as string) || 'General',
        description: (description as string) || '',
        receiptUrl,
        baseAmount: convertedAmount,
        exchangeRate: rate,
        userId: userId
      }
    });

    res.status(201).json(expense);
  } catch (error: any) {
    console.error('Create Expense Error:', error);
    res.status(500).json({ message: 'Server error', detail: error.message });
  }
};

export const getMyExpenses = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });

    const expenses = await prisma.expense.findMany({
      where: { userId },
      include: {
        approvals: {
          include: { user: { select: { name: true } } }
        }
      },
      orderBy: { date: 'desc' }
    });

    res.json(expenses);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

export const getTeamExpenses = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });

    const expenses = await prisma.expense.findMany({
      where: { 
        user: { managerId: userId }
      },
      include: {
        user: { select: { name: true, email: true } },
        approvals: {
          include: { user: { select: { name: true } } }
        }
      },
      orderBy: { date: 'desc' }
    });

    res.json(expenses);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

export const approveExpense = async (req: AuthRequest, res: Response) => {
  try {
    const rawId = req.params.id;
    const id = parseInt(Array.isArray(rawId) ? rawId[0] : rawId);
    if (isNaN(id)) return res.status(400).json({ message: 'Invalid ID' });

    const comment = req.body.comment as string;
    const userId = req.user?.id;

    if (!userId) return res.status(401).json({ message: 'Unauthorized' });
    if (!comment) return res.status(400).json({ message: 'Comment required' });

    const expense = await prisma.expense.findUnique({ where: { id } });
    if (!expense) return res.status(404).json({ message: 'Not found' });

    await prisma.approvalRecord.create({
      data: {
        expenseId: id,
        userId: userId,
        status: 'APPROVED',
        comment
      }
    });

    const updatedExpense = await evaluateExpense(id);
    res.json(updatedExpense);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

export const rejectExpense = async (req: AuthRequest, res: Response) => {
  try {
    const rawId = req.params.id;
    const id = parseInt(Array.isArray(rawId) ? rawId[0] : rawId);
    if (isNaN(id)) return res.status(400).json({ message: 'Invalid ID' });

    const comment = req.body.comment as string;
    const userId = req.user?.id;

    if (!userId) return res.status(401).json({ message: 'Unauthorized' });
    if (!comment) return res.status(400).json({ message: 'Comment required' });

    await prisma.approvalRecord.create({
      data: {
        expenseId: id,
        userId: userId,
        status: 'REJECTED',
        comment
      }
    });

    const updatedExpense = await evaluateExpense(id);
    res.json(updatedExpense);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

export const scanExpense = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const { suggestedAmount, text } = await scanReceipt(req.file.path);
    
    res.json({
      amount: suggestedAmount,
      rawText: text,
      filename: req.file.filename
    });
  } catch (error) {
    res.status(500).json({ message: 'OCR Error', error });
  }
};
