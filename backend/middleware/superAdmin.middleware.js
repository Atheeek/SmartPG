import jwt from 'jsonwebtoken';
import Owner from '../models/owner.model.js';

// This middleware checks two things:
// 1. Is the user logged in (same as 'protect')?
// 2. Is the logged-in user a SuperAdmin?
const superAdminProtect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.owner = await Owner.findById(decoded.ownerId).select('-password');
      
      // The new, crucial check
      if (req.owner && req.owner.role === 'SuperAdmin') {
        next(); // User is a Super Admin, proceed.
      } else {
        res.status(403).json({ message: 'Not authorized as a Super Admin' }); // 403 Forbidden
      }

    } catch (error) {
      res.status(401).json({ message: 'Not authorized, token failed' });
    }
  }

  if (!token) {
    res.status(401).json({ message: 'Not authorized, no token' });
  }
};

export { superAdminProtect };
