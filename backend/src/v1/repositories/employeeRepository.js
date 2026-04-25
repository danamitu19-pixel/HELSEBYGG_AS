// helsebygg_auth.employee
const { authPool } = require('../data/db');

const createEmployee = async ({ first_name, last_name, email, department, employee_status }) => {
  const [result] = await authPool.query(
    `INSERT INTO employee (first_name, last_name, email, department, employee_status)
     VALUES (?, ?, ?, ?, ?)`,
    [first_name, last_name, email, department, employee_status || 'active']
  );
  return result.insertId;
};

const getEmployeeByEmail = async (email) => {
  const [rows] = await authPool.query(
    `SELECT employee_id, first_name, last_name, email, department, employee_status, created_at
       FROM employee
      WHERE email = ?`,
    [email]
  );
  return rows[0];
};

const getEmployeeById = async (id) => {
  const [rows] = await authPool.query(
    `SELECT employee_id, first_name, last_name, email, department, employee_status, created_at
       FROM employee
      WHERE employee_id = ?`,
    [id]
  );
  return rows[0];
};

module.exports = { createEmployee, getEmployeeByEmail, getEmployeeById };
