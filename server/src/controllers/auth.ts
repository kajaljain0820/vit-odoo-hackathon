import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret';

const getCurrencyForCountry = async (countryCode: string): Promise<string> => {
  try {
    const apiRes = await fetch(`https://restcountries.com/v3.1/alpha/${countryCode}?fields=currencies`);
    if (apiRes.ok) {
      const data = await apiRes.json();
      const currencies = data.currencies ? Object.keys(data.currencies) : [];
      return currencies[0] || 'USD';
    }
  } catch (_) { /* fallback */ }
  return 'USD';
};

export const register = async (req: Request, res: Response) => {
  try {
    const { name, email, password, country, companyName } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email and password are required' });
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const userCount = await prisma.user.count();
    const isFirstUser = userCount === 0;

    // First user is Admin (Role ID 1), others are Employee (Role ID 3)
    const roleId = isFirstUser ? 1 : 3;

    let companyId: number | undefined;

    if (isFirstUser) {
      const countryCode = country || 'US';
      const defaultCurrency = await getCurrencyForCountry(countryCode);

      const company = await prisma.company.create({
        data: {
          name: companyName || `${name}'s Company`,
          country: countryCode,
          defaultCurrency
        }
      });
      companyId = company.id;
    } else {
      const company = await prisma.company.findFirst();
      companyId = company?.id;
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        roleId,
        companyId
      },
      include: { role: true }
    });

    const token = jwt.sign({ id: user.id, role: user.role.name }, JWT_SECRET, { expiresIn: '1d' });
    return res.status(201).json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role.name,
        companyId: user.companyId
      }
    });
  } catch (error: any) {
    console.error('Register error:', error);
    return res.status(500).json({ message: 'Internal server error', detail: error?.message });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const user = await prisma.user.findUnique({
      where: { email },
      include: { 
        role: true,
        company: { select: { defaultCurrency: true, name: true } } 
      }
    });

    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign({ id: user.id, role: user.role.name }, JWT_SECRET, { expiresIn: '1d' });
    return res.status(200).json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role.name,
        companyId: user.companyId,
        company: user.company
      }
    });
  } catch (error: any) {
    console.error('Login error:', error);
    return res.status(500).json({ message: 'Internal server error', detail: error?.message });
  }
};
