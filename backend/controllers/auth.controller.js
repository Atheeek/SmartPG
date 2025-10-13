import Owner from '../models/owner.model.js';
import bcrypt from 'bcryptjs';
import generateToken from '../utils/generateToken.js';

// @desc    Register a new owner
// @route   POST /api/auth/register
// @access  Public
// In backend/controllers/auth.controller.js

export const registerOwner = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const ownerExists = await Owner.findOne({ email });
    if (ownerExists) {
      return res.status(400).json({ message: 'Owner with this email already exists' });
    }

    // --- THIS IS THE FIX ---
    // We REMOVED the manual hashing from here.
    // We now pass the plain-text password directly to the model,
    // and the pre-save hook in owner.model.js will handle hashing it correctly.
    const owner = await Owner.create({
      name,
      email,
      password, // Pass the plain password
    });

    if (owner) {
      const token = generateToken(res, owner._id);
      res.status(201).json({
        _id: owner._id,
        name: owner.name,
        email: owner.email,
        role: owner.role,
        token,
      });
    } else {
      res.status(400).json({ message: 'Invalid owner data' });
    }
  } catch (error) {
    res.status(500).json({ message: `Server Error: ${error.message}` });
  }
};

// @desc    Authenticate/login an owner
// @route   POST /api/auth/login
// @access  Public
// In backend/controllers/auth.controller.js

// Replace your existing loginOwner function with this one
export const loginOwner = async (req, res) => {
  try {
    const { email, password } = req.body;

    const owner = await Owner.findOne({ email });

      if (owner && owner.status === 'Inactive') {
    return res.status(403).json({ message: 'Your account has been deactivated. Please contact support.' });
  }

    // The 'matchPassword' method is now on the model, let's use it
    if (owner && (await owner.matchPassword(password))) {
      const token = generateToken(res, owner._id);
      
      // --- THIS IS THE CORRECTED PART ---
      res.json({
        _id: owner._id,
        name: owner.name,
        email: owner.email,
        role: owner.role, // <-- THE FIX IS HERE
        token,
      });
      // --- END OF FIX ---

    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    res.status(500).json({ message: `Server Error: ${error.message}` });
  }
};