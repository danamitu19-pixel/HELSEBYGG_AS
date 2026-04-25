// helsebygg_reports.case_note
// No author column on purpose - notes are "from management", not
// from an individual. This preserves the no-cross-schema-identity rule.
const { reportsPool } = require('../data/db');

const createNote = async (report_id, note_text) => {
  const [result] = await reportsPool.query(
    `INSERT INTO case_note (report_id, note_text) VALUES (?, ?)`,
    [report_id, note_text]
  );
  return result.insertId;
};

const getNotesByReport = async (report_id) => {
  const [rows] = await reportsPool.query(
    `SELECT note_id, report_id, note_text, created_at
       FROM case_note
      WHERE report_id = ?
      ORDER BY created_at ASC, note_id ASC`,
    [report_id]
  );
  return rows;
};

const getNoteById = async (id) => {
  const [rows] = await reportsPool.query(
    `SELECT note_id, report_id, note_text, created_at
       FROM case_note
      WHERE note_id = ?`,
    [id]
  );
  return rows[0];
};

const updateNote = async (id, note_text) => {
  const [result] = await reportsPool.query(
    `UPDATE case_note SET note_text = ? WHERE note_id = ?`,
    [note_text, id]
  );
  return result.affectedRows;
};

module.exports = { createNote, getNotesByReport, getNoteById, updateNote };
