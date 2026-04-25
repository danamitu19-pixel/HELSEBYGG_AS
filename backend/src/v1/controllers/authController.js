const argon2 = require('argon2');
const jwt = require('jsonwebtoken');

const userRepo = require('../repositories/userRepository');
const employeeRepo = require('../repositories/employeeRepository');

const SECRET_KEY = process.env.SESSION_JWT_SECRET;
const SESSION_TTL_MINUTES = Number(process.env.SESSION_TTL_MINUTES) || 60;

// POST /api/v1/auth/register  (admin-only; wired in the route file)
// Body: { first_name, last_name, email, department, username, password, role? }
// Creates an employee row AND a user_account row linked to it.
const register = async (req, res) => {
  try {
    const {
      first_name, last_name, email, department,
      username, password, role,
    } = req.body;

    if (!first_name || !last_name || !email || !department || !username || !password) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // One account per employee: reject duplicates up front for a clean error.
    const existingEmp = await employeeRepo.getEmployeeByEmail(email);
    if (existingEmp) {
      return res.status(409).json({ message: 'Employee with this email already exists' });
    }

    const existingUser = await userRepo.findByUsername(username);
    if (existingUser) {
      return res.status(409).json({ message: 'Username already taken' });
    }

    const employee_id = await employeeRepo.createEmployee({
      first_name, last_name, email, department,
    });

    const password_hash = await argon2.hash(password);

    const useraccount_id = await userRepo.createUserAccount({
      employee_id,
      username,
      password_hash,
      role: role || 'employee',
    });

    res.status(201).json({
      useraccount_id,
      employee_id,
      username,
      role: role || 'employee',
    });
  } catch (error) {
    console.error('[authController.register]', error);
    res.status(500).json({ message: 'Error registering user' });
  }
};

// POST /api/v1/auth/login  (public)
// Body: { username, password }
// Returns { token } - HS256 session JWT valid for SESSION_TTL_MINUTES.
const login = async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ message: 'Missing username or password' });
    }

    const user = await userRepo.findByUsername(username);
    if (!user || !user.is_active) {
      return res.status(401).json({ error: 'invalid_credentials' });
    }

    const valid = await argon2.verify(user.password_hash, password);
    if (!valid) {
      return res.status(401).json({ error: 'invalid_credentials' });
    }

    await userRepo.updateLastLogin(user.useraccount_id);

    const token = jwt.sign(
      {
        userId: user.useraccount_id,
        username: user.username,
        role: user.role,
      },
      SECRET_KEY,
      { expiresIn: `${SESSION_TTL_MINUTES}m` }
    );

    res.cookie('session', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: SESSION_TTL_MINUTES * 60 * 1000,
    });

    res.status(200).json({ role: user.role });
  } catch (error) {
    console.error('[authController.login]', error);
    res.status(500).json({ error: 'internal_error' });
  }
};

const logout = (_req, res) => {
  res.clearCookie('session');
  res.status(200).json({ ok: true });
};

module.exports = { register, login, logout };
