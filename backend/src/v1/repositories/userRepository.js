// helsebygg_auth.user_account
const { authPool } = require('../data/db');

const findByUsername = async (username) => {
  const [rows] = await authPool.query(
    `SELECT useraccount_id, employee_id, username, password_hash, role, is_active, last_login
       FROM user_account
      WHERE username = ?`,
    [username]
  );
  return rows[0];
};

const createUserAccount = async ({ employee_id, username, password_hash, role }) => {
  const [result] = await authPool.query(
    `INSERT INTO user_account (employee_id, username, password_hash, role)
     VALUES (?, ?, ?, ?)`,
    [employee_id, username, password_hash, role || 'employee']
  );
  return result.insertId;
};

const updateLastLogin = async (useraccount_id) => {
  await authPool.query(
    `UPDATE user_account SET last_login = NOW() WHERE useraccount_id = ?`,
    [useraccount_id]
  );
};

module.exports = { findByUsername, createUserAccount, updateLastLogin };
