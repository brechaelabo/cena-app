
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { prisma, logger } from '../app';
import { Role } from '@prisma/client';

interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    roles: Role[];
    currentRole: Role;
  };
}

export const authenticateToken = async (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ success: false, error: 'Access token required' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
    
    // Get fresh user data from database
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      include: { roles: true }
    });

    if (!user) {
      return res.status(401).json({ success: false, error: 'User not found' });
    }

    req.user = {
      id: user.id,
      email: user.email,
      roles: user.roles.map(r => r.role),
      currentRole: user.currentRole
    };

    next();
  } catch (error) {
    logger.error('Token verification failed:', error);
    return res.status(403).json({ success: false, error: 'Invalid token' });
  }
};

export const requireRole = (roles: Role[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ success: false, error: 'Authentication required' });
    }

    const hasRole = roles.some(role => req.user!.roles.includes(role)) || 
                   roles.includes(req.user.currentRole);

    if (!hasRole) {
      return res.status(403).json({ 
        success: false, 
        error: 'Insufficient permissions' 
      });
    }

    next();
  };
};

export const requireAdmin = requireRole([Role.ADMIN]);
export const requireTutor = requireRole([Role.ADMIN, Role.TUTOR]);
export const requireActor = requireRole([Role.ADMIN, Role.ACTOR]);

export { AuthRequest };
