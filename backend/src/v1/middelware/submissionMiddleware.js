// Gate for endpoints that must be UNLINKABLE to the user.
// The client sends a short-lived submission token (issued by
// /api/v1/submission-token) in the `X-Submission-Token` header.
// The token is an HS256 JWT signed with SUBMISSION_HMAC_KEY and
// carries a random nonce. We hash the nonce, store it in
// used_nonce to prevent replay, then let the request through.
// The submission token DOES NOT carry the user id on purpose -
// the report itself stays anonymous.

const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const nonceRepo = require('../repositories/nonceRepository');

const HMAC_KEY = process.env.SUBMISSION_HMAC_KEY;

async function verifySubmissionToken(req, res, next) {
  try {
    const token = req.headers['x-submission-token'];
    if (!token) return res.status(401).json({ error: 'invalid_token' });

    let payload;
    try {
      payload = jwt.verify(token, HMAC_KEY, { algorithms: ['HS256'] });
    } catch {
      return res.status(401).json({ error: 'invalid_token' });
    }

    if (!payload || !payload.nonce) {
      return res.status(401).json({ error: 'invalid_token' });
    }

    const nonceHash = crypto.createHash('sha256').update(payload.nonce).digest('hex');

    const already = await nonceRepo.isUsed(nonceHash);
    if (already) {
      return res.status(409).json({ error: 'token_already_used' });
    }

    await nonceRepo.markUsed(nonceHash);
    next();
  } catch (err) {
    next(err);
  }
}

module.exports = { verifySubmissionToken };
