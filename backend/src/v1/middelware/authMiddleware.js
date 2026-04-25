const jwt = require('jsonwebtoken');
const SECRET_KEY = process.env.SESSION_JWT_SECRET;

// Verifies the session JWT sent as `Authorization: Bearer <token>`.
// On success, sets req.user = { userId, username, role } from the payload.
function authenticateToken(req, res, next) {
  const token = req.cookies?.session;
  if (!token) return res.status(401).json({ error: 'not_authenticated' });

  jwt.verify(token, SECRET_KEY, (err, user) => {
    if (err) return res.status(401).json({ error: 'not_authenticated' });
    req.user = user;
    next();
  });
}

// Usage: authorizeRoles('admin', 'manager')
function authorizeRoles(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Access denied' });
    }
    next();
  };
}

module.exports = { authenticateToken, authorizeRoles };
