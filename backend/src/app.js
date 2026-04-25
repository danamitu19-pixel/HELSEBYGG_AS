// Entry point. Run with:  node src/app.js
// Loads .env, wires middleware, mounts routers, starts HTTP server.

require('dotenv').config();

const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const rateLimit = require('express-rate-limit');

const { pingPools } = require('./v1/data/db');

const authRoutes = require('./v1/routes/authRoutes');
const tokenRoutes = require('./v1/routes/tokenRoutes');
const reportRoutes = require('./v1/routes/reportRoutes');
const noteRoutes = require('./v1/routes/noteRoutes');

const app = express();

// When the app runs behind IIS / a reverse proxy on Windows Server,
// trust one hop so req.ip and rate-limit use the real client address.
app.set('trust proxy', 1);

// Security / parsing middleware
app.use(helmet());
app.use(cors({
  origin: process.env.CORS_ORIGIN,
  credentials: true,
}));
app.use(express.json({ limit: '32kb' }));
app.use(cookieParser());

// Global, loose rate limit. Tighter limits live on specific routes.
app.use(rateLimit({
  windowMs: 60 * 1000,
  max: 120,
  standardHeaders: true,
  legacyHeaders: false,
}));

// Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1', tokenRoutes);
app.use('/api/v1/reports', reportRoutes);
app.use('/api/v1/reports/:reportId(\\d+)/notes', noteRoutes);

// Health check
app.get('/api/v1/health', async (_req, res) => {
  try {
    await pingPools();
    res.json({ ok: true });
  } catch {
    res.status(503).json({ ok: false });
  }
});

// Swallow error details before sending to client.
app.use((err, _req, res, _next) => {
  console.error('[error]', err);
  res.status(500).json({ error: 'internal_error' });
});

const PORT = Number(process.env.PORT) || 3000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`helsebygg-api listening on 0.0.0.0:${PORT}`);
});
