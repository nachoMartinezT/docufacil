const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET || 'default-secret-key';

// Get users from environment variables
const getUsers = () => {
  const users = [];

  // Check for user Nacho
  if (process.env.USER_NACHO_PASSWORD_HASH) {
    users.push({
      username: 'Nacho',
      passwordHash: process.env.USER_NACHO_PASSWORD_HASH
    });
  }

  // Check for user Pancho
  if (process.env.USER_PANCHO_PASSWORD_HASH) {
    users.push({
      username: 'Pancho',
      passwordHash: process.env.USER_PANCHO_PASSWORD_HASH
    });
  }

  // Fallback for development
  if (users.length === 0) {
    console.warn('WARNING: No users configured in environment. Using default credentials.');
    // Default password: "password"
    users.push({
      username: 'Nacho',
      passwordHash: '$2a$10$YourHashedPasswordHere'
    });
  }

  return users;
};

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' });
    }
    
    const users = getUsers();
    const user = users.find(u => u.username === username);
    
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    // Special handling for plain text passwords during setup
    let isValidPassword = false;
    if (user.passwordHash.startsWith('$2')) {
      // Bcrypt hash
      isValidPassword = await bcrypt.compare(password, user.passwordHash);
    } else {
      // Plain text (for initial setup only)
      isValidPassword = password === user.passwordHash;
    }
    
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    // Generate JWT token
    const token = jwt.sign(
      { username: user.username },
      JWT_SECRET,
      { expiresIn: '24h' }
    );
    
    res.json({
      token,
      user: {
        username: user.username
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Server error during login' });
  }
});

module.exports = router;
