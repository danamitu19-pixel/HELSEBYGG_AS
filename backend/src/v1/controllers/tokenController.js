// Submission-token issuer.
// A logged-in user asks for a short-lived, single-use token. The
// token carries only a random nonce - NOT the user id - so the
// report it will later be used to post cannot be linked back.
// We increment the per-user daily quota BEFORE handing the token
// out, so bursting across multiple tokens is still limited.

const crypto = require('crypto');
const jwt = require('jsonwebtoken');

const quotaRepo = require('../repositories/quotaRepository');

const HMAC_KEY = process.env.SUBMISSION_HMAC_KEY;
const DAILY_LIMIT = Number(process.env.DAILY_SUBMISSION_LIMIT) || 5;
const SUBMISSION_TTL_MINUTES = Number(process.env.SUBMISSION_TTL_MINUTES) || 15;

// POST /api/v1/submission-token  (session-auth required)
// Returns { submission_token, expires_in_minutes }
const issueSubmissionToken = async (req, res) => {
  try {
    const { userId } = req.user;

    const count = await quotaRepo.getTodayCount(userId);
    if (count >= DAILY_LIMIT) {
      return res.status(429).json({ error: 'daily_limit_reached' });
    }

    const nonce = crypto.randomBytes(16).toString('hex');

    // IMPORTANT: payload intentionally contains no user identifier.
    const token = jwt.sign(
      { nonce },
      HMAC_KEY,
      { expiresIn: `${SUBMISSION_TTL_MINUTES}m`, algorithm: 'HS256' }
    );

    // Count the quota against issuance, not redemption, so a user
    // cannot farm tokens and redeem them all later.
    await quotaRepo.incrementToday(userId);

    res.status(200).json({
      submission_token: token,
      expires_in_minutes: SUBMISSION_TTL_MINUTES,
    });
  } catch (error) {
    console.error('[tokenController.issueSubmissionToken]', error);
    res.status(500).json({ message: 'Error issuing submission token' });
  }
};

module.exports = { issueSubmissionToken };
