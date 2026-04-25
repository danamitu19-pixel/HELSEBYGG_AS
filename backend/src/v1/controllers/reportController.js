const reportRepo = require('../repositories/reportRepository');

const VALID_CATEGORIES = [
  'patient_safety', 'hms', 'data_security',
  'medication', 'procedure_breach', 'other',
];
const VALID_SEVERITIES = ['low', 'medium', 'high', 'critical'];
const VALID_STATUSES   = ['new', 'in_review', 'action_taken', 'closed', 'rejected'];

// POST /api/v1/reports  (submission token required, NOT session)
// Body: { category, severity, description }
const createReport = async (req, res) => {
  try {
    const { category, severity, description } = req.body;

    if (!category || !severity || !description) {
      return res.status(400).json({ message: 'Missing required fields' });
    }
    if (!VALID_CATEGORIES.includes(category)) {
      return res.status(400).json({ message: 'Invalid category' });
    }
    if (!VALID_SEVERITIES.includes(severity)) {
      return res.status(400).json({ message: 'Invalid severity' });
    }
    if (typeof description !== 'string' || description.trim().length < 3) {
      return res.status(400).json({ message: 'Description too short' });
    }

    const id = await reportRepo.createReport({ category, severity, description });

    // Don't return created_at precisely, stay consistent with DATE bucketing.
    res.status(201).json({ report_id: id });
  } catch (error) {
    console.error('[reportController.createReport]', error);
    res.status(500).json({ message: 'Error creating report' });
  }
};

// GET /api/v1/reports  (manager/admin)
const getAllReports = async (_req, res) => {
  try {
    const rows = await reportRepo.getAllReports();
    res.status(200).json(rows);
  } catch (error) {
    console.error('[reportController.getAllReports]', error);
    res.status(500).json({ message: 'Error fetching reports' });
  }
};

// GET /api/v1/reports/:id  (manager/admin)
const getReportById = async (req, res) => {
  try {
    const report = await reportRepo.getReportById(req.params.id);
    if (!report) return res.status(404).json({ message: 'Report not found' });
    res.status(200).json(report);
  } catch (error) {
    console.error('[reportController.getReportById]', error);
    res.status(500).json({ message: 'Error fetching report' });
  }
};

// PUT /api/v1/reports/:id  (manager/admin)
// Body: { status }
// The only mutable field on an incident report is its status.
const updateReport = async (req, res) => {
  try {
    const { status } = req.body;
    if (!status || !VALID_STATUSES.includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }
    const affected = await reportRepo.updateReportStatus(req.params.id, status);
    if (!affected) return res.status(404).json({ message: 'Report not found' });
    res.status(200).json({ message: 'Report updated' });
  } catch (error) {
    console.error('[reportController.updateReport]', error);
    res.status(500).json({ message: 'Error updating report' });
  }
};

module.exports = { createReport, getAllReports, getReportById, updateReport };
