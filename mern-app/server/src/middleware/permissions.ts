import { Response, NextFunction } from 'express';
import { AuthRequest } from './auth';

export const checkPermission = (permission: 'read' | 'write' | 'edit' | 'delete') => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Not authorized' });
      return;
    }

    // Super admin has all permissions
    if (req.user.role === 'super-admin') {
      next();
      return;
    }

    // Check specific permission
    if (!req.user.permissions[permission]) {
      res.status(403).json({ 
        success: false, 
        message: `You don't have ${permission} permission` 
      });
      return;
    }

    next();
  };
};

export const checkRole = (...roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Not authorized' });
      return;
    }

    if (!roles.includes(req.user.role)) {
      res.status(403).json({ 
        success: false, 
        message: 'You don\'t have permission to access this resource' 
      });
      return;
    }

    next();
  };
};
