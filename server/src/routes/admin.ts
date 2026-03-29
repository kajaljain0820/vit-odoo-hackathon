import { Router } from 'express';
import { getUsers, createUser, updateUserRole, updateUserManager, getRules, createRule, getCompany, resetPassword } from '../controllers/admin';
import { authenticate, authorizeAdmin } from '../middleware/auth';

const router = Router();

// Company
router.get('/company', authenticate, getCompany);

// User management
router.get('/users', authenticate, authorizeAdmin, getUsers);
router.post('/users', authenticate, authorizeAdmin, createUser);
router.put('/users/:id/role', authenticate, authorizeAdmin, updateUserRole);
router.put('/users/:id/manager', authenticate, authorizeAdmin, updateUserManager);
router.put('/users/:id/reset-password', authenticate, authorizeAdmin, resetPassword);

// Rule management
router.get('/rules', authenticate, authorizeAdmin, getRules);
router.post('/rules', authenticate, authorizeAdmin, createRule);

export default router;
