// helsebygg_auth.used_nonce
// One row per consumed submission-token nonce. No user id stored.
const { authPool } = require('../data/db');

const isUsed = async (nonceHash) => {
  const [rows] = await authPool.query(
    `SELECT 1 FROM used_nonce WHERE nonce_hash = ? LIMIT 1`,
    [nonceHash]
  );
  return rows.length > 0;
};

const markUsed = async (nonceHash) => {
  await authPool.query(
    `INSERT IGNORE INTO used_nonce (nonce_hash) VALUES (?)`,
    [nonceHash]
  );
};

module.exports = { isUsed, markUsed };
