import { Response, Request } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../middleware/auth';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient() as any;

const roleMap: Record<string, number> = {
  'ADMIN': 1,
  'MANAGER': 2,
  'EMPLOYEE': 3
};

export const getUsers = async (req: AuthRequest, res: Response) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        roleId: true,
        role: { select: { name: true } },
        managerId: true,
        companyId: true,
        manager: { select: { id: true, name: true } }
      }
    } as any) as any;
    
    const formattedUsers = users.map((u: any) => ({
      ...u,
      role: u.role?.name || 'EMPLOYEE'
    }));
    
    res.json(formattedUsers);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

export const createUser = async (req: AuthRequest, res: Response) => {
  try {
    const { name, email, password, role, managerId } = req.body;

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) return res.status(400).json({ message: 'User already exists' });

    const adminUser = (req as any).user;
    const admin = await prisma.user.findUnique({ where: { id: adminUser?.id || 0 } }) as any;
    const hashedPassword = await bcrypt.hash(password || 'Welcome@123', 10);

    const targetRoleId = roleMap[role as string] || 3;

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        roleId: targetRoleId,
        managerId: managerId ? parseInt(managerId as string) : null,
        companyId: admin?.companyId || null
      } as any,
      include: { role: true } as any
    }) as any;

    res.status(201).json({ id: user.id, name: user.name, email: user.email, role: (user as any).role?.name });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

export const updateUserRole = async (req: AuthRequest, res: Response) => {
  try {
    const rawId = req.params.id;
    const id = parseInt(Array.isArray(rawId) ? rawId[0] : (rawId as string));
    if (isNaN(id)) return res.status(400).json({ message: 'Invalid ID' });

    const roleName = req.body.role as string;
    const targetRoleId = roleMap[roleName] || 3;

    const user = await prisma.user.update({ 
      where: { id }, 
      data: { roleId: targetRoleId } as any,
      include: { role: true } as any
    }) as any;
    
    res.json({ id: user.id, role: (user as any).role?.name });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

export const updateUserManager = async (req: AuthRequest, res: Response) => {
  try {
    const rawId = req.params.id;
    const id = parseInt(Array.isArray(rawId) ? rawId[0] : (rawId as string));
    if (isNaN(id)) return res.status(400).json({ message: 'Invalid ID' });
    
    const managerId = req.body.managerId;
    
    const user = await prisma.user.update({ 
      where: { id }, 
      data: { managerId: managerId ? parseInt(managerId as string) : null } as any
    } as any) as any;
    
    res.json({ id: user.id, managerId: user.managerId });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

export const getRules = async (req: AuthRequest, res: Response) => {
  try {
    const rules = await prisma.workflowRule.findMany({ 
      orderBy: [
        { evaluationOrder: 'asc' } as any,
        { active: 'desc' } as any
      ]
    } as any) as any;
    res.json(rules);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

export const createRule = async (req: AuthRequest, res: Response) => {
  try {
    const { name, rulesConfig, isManagerApprover, specificApproverId, evaluationOrder } = req.body;

    // Use evaluationOrder if provided, otherwise append to end
    const lastRule = await prisma.workflowRule.findFirst({ orderBy: { evaluationOrder: 'desc' } as any }) as any;
    const nextOrder = evaluationOrder !== undefined ? parseInt(evaluationOrder as string) : (lastRule?.evaluationOrder || 0) + 1;

    const rule = await prisma.workflowRule.create({
      data: {
        name,
        rulesConfig,
        active: true,
        isManagerApprover: isManagerApprover !== false,
        specificApproverId: specificApproverId ? parseInt(specificApproverId as string) : null,
        evaluationOrder: nextOrder
      } as any
    } as any) as any;

    res.status(201).json(rule);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

export const resetPassword = async (req: AuthRequest, res: Response) => {
  try {
    const rawId = req.params.id;
    const id = parseInt(Array.isArray(rawId) ? rawId[0] : (rawId as string));
    
    // Authorization: Admin can reset anyone. User can reset self.
    const currentUser = (req as any).user;
    const isAdmin = currentUser?.role === 'ADMIN';
    if (!isAdmin && currentUser?.id !== id) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    const { password } = req.body;
    const hashedPassword = await bcrypt.hash(password || 'Welcome@123', 10);
    
    await prisma.user.update({
      where: { id },
      data: { password: hashedPassword } as any
    } as any);
    
    res.json({ message: password ? 'Password updated successfully' : 'Password reset to Welcome@123' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

export const getCompany = async (req: AuthRequest, res: Response) => {
  try {
    const adminUser = (req as any).user;
    const user = await prisma.user.findUnique({
      where: { id: adminUser?.id || 0 },
      include: { company: true } as any
    }) as any;
    res.json((user as any)?.company || null);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};
