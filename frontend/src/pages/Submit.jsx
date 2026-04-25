import { useState } from 'react';
import { api } from '../api.js';

const CATEGORIES = [
    ['patient_safety',    'Pasientsikkerhet'],
    ['hms',               'HMS / Arbeidsmiljø'],
    ['data_security',     'Datasikkerhet'],
    ['medication',        'Medisinering'],
    ['procedure_breach',  'Brudd på prosedyre'],
    ['other',             'Annet'],
];

const SEVERITIES = [
    ['low',      'Lav'],
    ['medium',   'Middels'],
    ['high',     'Høy'],
    ['critical', 'Kritisk'],
];

const MESSAGES = {
    daily_limit_reached: 'Du har nådd grensen for antall avvik per dag.',
    token_already_used:  'Skjemaet ble allerede sendt. Last siden på nytt.',
    invalid_token:       'Sesjonstoken er ugyldig eller utløpt. Last siden på nytt.',
};

export default function Submit() {
    const [category,    setCategory]    = useState('hms');
    const [severity,    setSeverity]    = useState('medium');
    const [description, setDescription] = useState('');
    const [busy,    setBusy]    = useState(false);
    const [err,     setErr]     = useState(null);
    const [sent,    setSent]    = useState(false);

    async function onSubmit(e) {
        e.preventDefault();
        setErr(null);
        setBusy(true);
        try {
            // Step 1: ask for a one-shot submission token. This is the
            // ONLY step that uses the session cookie. The token that
            // comes back does not contain any user identifier.
            const { submission_token } = await api.mintToken();

            // Step 2: send the report using the token. No session
            // context survives into this request – the backend
            // doesn't know who wrote it.
            await api.submitReport({ submission_token, category, severity, description });

            setSent(true);
            setDescription('');
            setCategory('hms');
            setSeverity('medium');
        } catch (e) {
            setErr(MESSAGES[e.message] || 'Kunne ikke sende avvik. Prøv igjen.');
        } finally {
            setBusy(false);
        }
    }

    if (sent) {
        return (
            <div className="card">
                <h2>Takk – avviket er sendt.</h2>
                <p>
                    Meldingen er nå hos ledelsen. Den inneholder ingen
                    spor av hvem som sendte den.
                </p>
                <button className="primary" onClick={() => setSent(false)}>
                    Meld et nytt avvik
                </button>
            </div>
        );
    }

    return (
        <div className="card">
            <h2>Meld avvik</h2>
            <p style={{ color: '#6b7280', fontSize: '0.9rem', marginTop: '-0.5rem' }}>
                Meldingen sendes anonymt. Den kan ikke spores tilbake
                til deg, heller ikke i databasen.
            </p>

            {err && <div className="error">{err}</div>}

            <form onSubmit={onSubmit}>
                <div className="row">
                    <label>
                        <span>Kategori</span>
                        <select value={category} onChange={(e) => setCategory(e.target.value)}>
                            {CATEGORIES.map(([v, l]) =>
                                <option key={v} value={v}>{l}</option>)}
                        </select>
                    </label>
                    <label>
                        <span>Alvorlighet</span>
                        <select value={severity} onChange={(e) => setSeverity(e.target.value)}>
                            {SEVERITIES.map(([v, l]) =>
                                <option key={v} value={v}>{l}</option>)}
                        </select>
                    </label>
                </div>

                <label>
                    <span>Beskrivelse</span>
                    <textarea
                        required
                        minLength={10}
                        maxLength={5000}
                        placeholder="Beskriv hva som skjedde. Unngå å nevne ditt eget eller andres navn hvis du ønsker å forbli anonym."
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                    />
                </label>

                <button type="submit" className="primary" disabled={busy || description.trim().length < 10}>
                    {busy ? 'Sender…' : 'Send anonymt'}
                </button>
            </form>
        </div>
    );
}
