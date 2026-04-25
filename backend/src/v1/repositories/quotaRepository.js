// helsebygg_auth.submission_quota
// Stores ONLY the count per user per day. No link to any report.
const { authPool } = require('../data/db');

const getTodayCount = async (useraccount_id) => {
  const [rows] = await authPool.query(
    `SELECT count
       FROM submission_quota
      WHERE useraccount_id = ? AND window_start = CURDATE()`,
    [useraccount_id]
  );
  return rows[0]?.count ?? 0;
};

const incrementToday = async (useraccount_id) => {
  await authPool.query(
    `INSERT INTO submission_quota (useraccount_id, window_start, count)
     VALUES (?, CURDATE(), 1)
     ON DUPLICATE KEY UPDATE count = count + 1`,
    [useraccount_id]
  );
};

module.exports = { getTodayCount, incrementToday };
