// helsebygg_reports.incident_report
// NOTE: the reports_app DB user has only SELECT, INSERT, UPDATE
// privileges - no DELETE - so there is no deleteReport here by design.
const { reportsPool } = require('../data/db');

const createReport = async ({ category, severity, description }) => {
  const [result] = await reportsPool.query(
    `INSERT INTO incident_report (created_at, category, severity, description)
     VALUES (CURDATE(), ?, ?, ?)`,
    [category, severity, description]
  );
  return result.insertId;
};

const getAllReports = async () => {
  const [rows] = await reportsPool.query(
    `SELECT report_id, created_at, category, severity, description, status
       FROM incident_report
      ORDER BY created_at DESC, report_id DESC`
  );
  return rows;
};

const getReportById = async (id) => {
  const [rows] = await reportsPool.query(
    `SELECT report_id, created_at, category, severity, description, status
       FROM incident_report
      WHERE report_id = ?`,
    [id]
  );
  return rows[0];
};

const updateReportStatus = async (id, status) => {
  const [result] = await reportsPool.query(
    `UPDATE incident_report SET status = ? WHERE report_id = ?`,
    [status, id]
  );
  return result.affectedRows;
};

module.exports = { createReport, getAllReports, getReportById, updateReportStatus };
