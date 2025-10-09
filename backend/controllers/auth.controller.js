import Owner from '../models/owner.model.js';
import bcrypt from 'bcryptjs';
import generateToken from '../utils/generateToken.js';

// @desc    Register a new owner
// @route   POST /api/auth/register
// @access  Public
export const registerOwner = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // 1. Check if owner already exists
    const ownerExists = await Owner.findOne({ email });
    if (ownerExists) {
      return res.status(400).json({ message: 'Owner with this email already exists' });
    }

    // 2. Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // 3. Create a new owner in the database
    const owner = await Owner.create({
      name,
      email,
      password: hashedPassword,
    });

    if (owner) {
      // 4. Generate a token and send response
      const token = generateToken(res, owner._id);
      res.status(201).json({
        _id: owner._id,
        name: owner.name,
        email: owner.email,
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
export const loginOwner = async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1. Find the owner by email
    const owner = await Owner.findOne({ email });

    // 2. Check if owner exists and if passwords match
    if (owner && (await bcrypt.compare(password, owner.password))) {
      // 3. Generate a token and send response
      const token = generateToken(res, owner._id);
      res.json({
        _id: owner._id,
        name: owner.name,
        email: owner.email,
        token,
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    res.status(500).json({ message: `Server Error: ${error.message}` });
  }
};