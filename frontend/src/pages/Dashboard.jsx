import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api.js';

const CATEGORY_LABEL = {
    patient_safety:   'Pasientsikkerhet',
    hms:              'HMS',
    data_security:    'Datasikkerhet',
    medication:       'Medisinering',
    procedure_breach: 'Prosedyrebrudd',
    other:            'Annet',
};

const STATUS_LABEL = {
    new:          'Ny',
    in_review:    'Under vurdering',
    action_taken: 'Tiltak iverksatt',
    closed:       'Lukket',
    rejected:     'Avvist',
};

const SEV_LABEL = {
    low: 'Lav', medium: 'Middels', high: 'Høy', critical: 'Kritisk',
};

export default function Dashboard() {
    const [reports, setReports] = useState(null);
    const [err,     setErr]     = useState(null);

    useEffect(() => {
        api.listReports()
           .then(setReports)
           .catch(() => setErr('Kunne ikke hente avvik.'));
    }, []);

    if (err) return <div className="error">{err}</div>;
    if (!reports) return <p>Laster…</p>;

    return (
        <div className="card">
            <h2>Avvik ({reports.length})</h2>

            {reports.length === 0
                ? <p>Ingen avvik å vise ennå.</p>
                : (
                    <table>
                        <thead>
                            <tr>
                                <th>#</th>
                                <th>Dato</th>
                                <th>Kategori</th>
                                <th>Alvor</th>
                                <th>Status</th>
                                <th>Beskrivelse</th>
                            </tr>
                        </thead>
                        <tbody>
                            {reports.map((r) => (
                                <tr key={r.report_id}>
                                    <td>
                                        <Link to={`/dashboard/${r.report_id}`}>
                                            {r.report_id}
                                        </Link>
                                    </td>
                                    <td>{r.created_at}</td>
                                    <td>{CATEGORY_LABEL[r.category] || r.category}</td>
                                    <td className={`sev-${r.severity}`}>
                                        {SEV_LABEL[r.severity]}
                                    </td>
                                    <td>
                                        <span className={`badge badge-${r.status}`}>
                                            {STATUS_LABEL[r.status]}
                                        </span>
                                    </td>
                                    <td style={{ color: '#6b7280' }}>
                                        {r.description?.slice(0, 200)}{r.description?.length >= 200 ? '…' : ''}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
        </div>
    );
}
