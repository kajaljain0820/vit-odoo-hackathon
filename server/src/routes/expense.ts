import { Router } from 'express';
import { createExpense, getMyExpenses, getTeamExpenses, approveExpense, rejectExpense, scanExpense } from '../controllers/expense';
import { authenticate } from '../middleware/auth';
import { upload } from '../middleware/upload';

const router = Router();

router.post('/', authenticate, upload.single('receipt'), createExpense);
router.get('/me', authenticate, getMyExpenses);
router.get('/team', authenticate, getTeamExpenses);
router.post('/:id/approve', authenticate, approveExpense);
router.post('/:id/reject', authenticate, rejectExpense);
router.post('/scan', authenticate, upload.single('receipt'), scanExpense);

export default router;
