import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../api.js';

const STATUSES = [
    ['new',          'Ny'],
    ['in_review',    'Under vurdering'],
    ['action_taken', 'Tiltak iverksatt'],
    ['closed',       'Lukket'],
    ['rejected',     'Avvist'],
];

export default function ReportDetail() {
    const { id } = useParams();
    const [report, setReport] = useState(null);
    const [notes,  setNotes]  = useState([]);
    const [newNote, setNewNote] = useState('');
    const [err, setErr] = useState(null);
    const [busy, setBusy] = useState(false);

    async function refresh() {
        try {
            const [r, n] = await Promise.all([
                api.getReport(id),
                api.listNotes(id),
            ]);
            setReport(r);
            setNotes(n);
        } catch {
            setErr('Kunne ikke laste avvik.');
        }
    }

    useEffect(() => { refresh(); }, [id]);

    async function changeStatus(status) {
        setBusy(true);
        try {
            await api.setStatus(id, status);
            await refresh();
        } catch {
            setErr('Klarte ikke å oppdatere status.');
        } finally { setBusy(false); }
    }

    async function addNote(e) {
        e.preventDefault();
        if (!newNote.trim()) return;
        setBusy(true);
        try {
            await api.addNote(id, newNote.trim());
            setNewNote('');
            await refresh();
        } catch {
            setErr('Klarte ikke å legge til notat.');
        } finally { setBusy(false); }
    }

    if (err && !report) return <div className="error">{err}</div>;
    if (!report)        return <p>Laster…</p>;

    return (
        <>
            <p><Link to="/dashboard">&larr; Tilbake til alle avvik</Link></p>

            {err && <div className="error">{err}</div>}

            <div className="card">
                <h2>Avvik #{report.report_id}</h2>

                <p style={{ fontSize: '0.9rem', color: '#6b7280' }}>
                    Mottatt {report.created_at} · {report.category} · alvorlighet {report.severity}
                </p>

                <p style={{ whiteSpace: 'pre-wrap' }}>{report.description}</p>

                <label style={{ marginTop: '1.5rem' }}>
                    <span>Status</span>
                    <select
                        value={report.status}
                        disabled={busy}
                        onChange={(e) => changeStatus(e.target.value)}
                    >
                        {STATUSES.map(([v, l]) =>
                            <option key={v} value={v}>{l}</option>)}
                    </select>
                </label>
            </div>

            <div className="card">
                <h2>Saksnotater</h2>

                <div className="notes">
                    {notes.length === 0 && <p style={{ color: '#6b7280' }}>Ingen notater ennå.</p>}
                    {notes.map((n) => (
                        <div key={n.note_id} className="note">
                            <div style={{ whiteSpace: 'pre-wrap' }}>{n.note_text}</div>
                            <time>{new Date(n.created_at).toLocaleString('nb')}</time>
                        </div>
                    ))}
                </div>

                <form onSubmit={addNote} style={{ marginTop: '1rem' }}>
                    <label>
                        <span>Legg til notat</span>
                        <textarea
                            value={newNote}
                            onChange={(e) => setNewNote(e.target.value)}
                            placeholder="Internt notat om saksgang."
                        />
                    </label>
                    <button
                        className="primary"
                        type="submit"
                        disabled={busy || !newNote.trim()}
                    >
                        Lagre notat
                    </button>
                </form>
            </div>
        </>
    );
}
