const noteRepo = require('../repositories/noteRepository');
const reportRepo = require('../repositories/reportRepository');

// POST /api/v1/reports/:reportId/notes
const createNote = async (req, res) => {
  try {
    const report_id = Number(req.params.reportId);
    const { note_text } = req.body;

    if (!note_text || typeof note_text !== 'string' || !note_text.trim()) {
      return res.status(400).json({ message: 'Missing note_text' });
    }

    // Fail clearly if the parent report doesn't exist, rather than letting
    // the FK error bubble up as a generic 500.
    const parent = await reportRepo.getReportById(report_id);
    if (!parent) return res.status(404).json({ message: 'Report not found' });

    const id = await noteRepo.createNote(report_id, note_text);
    res.status(201).json({ note_id: id, report_id, note_text });
  } catch (error) {
    console.error('[noteController.createNote]', error);
    res.status(500).json({ message: 'Error creating note' });
  }
};

// GET /api/v1/reports/:reportId/notes
const getAllNotes = async (req, res) => {
  try {
    const report_id = Number(req.params.reportId);
    const rows = await noteRepo.getNotesByReport(report_id);
    res.status(200).json(rows);
  } catch (error) {
    console.error('[noteController.getAllNotes]', error);
    res.status(500).json({ message: 'Error fetching notes' });
  }
};

// GET /api/v1/reports/:reportId/notes/:id
const getNoteById = async (req, res) => {
  try {
    const report_id = Number(req.params.reportId);
    const note = await noteRepo.getNoteById(req.params.id);
    if (!note || note.report_id !== report_id) {
      return res.status(404).json({ message: 'Note not found' });
    }
    res.status(200).json(note);
  } catch (error) {
    console.error('[noteController.getNoteById]', error);
    res.status(500).json({ message: 'Error fetching note' });
  }
};

// PUT /api/v1/reports/:reportId/notes/:id
const updateNote = async (req, res) => {
  try {
    const report_id = Number(req.params.reportId);
    const { note_text } = req.body;
    if (!note_text || typeof note_text !== 'string' || !note_text.trim()) {
      return res.status(400).json({ message: 'Missing note_text' });
    }

    const existing = await noteRepo.getNoteById(req.params.id);
    if (!existing || existing.report_id !== report_id) {
      return res.status(404).json({ message: 'Note not found' });
    }

    const affected = await noteRepo.updateNote(req.params.id, note_text);
    if (!affected) return res.status(404).json({ message: 'Note not found' });
    res.status(200).json({ message: 'Note updated' });
  } catch (error) {
    console.error('[noteController.updateNote]', error);
    res.status(500).json({ message: 'Error updating note' });
  }
};

module.exports = { createNote, getAllNotes, getNoteById, updateNote };
