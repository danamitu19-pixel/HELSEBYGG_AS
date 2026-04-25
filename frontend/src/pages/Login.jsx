import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { api } from '../api.js';
import { useAuth } from '../auth.jsx';

const MESSAGES = {
    invalid_credentials: 'Feil brukernavn eller passord.',
    not_authenticated:   'Økten er utløpt. Logg inn på nytt.',
};

export default function Login() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [err, setErr]           = useState(null);
    const [busy, setBusy]         = useState(false);

    const { setRole } = useAuth();
    const navigate    = useNavigate();
    const loc         = useLocation();

    async function onSubmit(e) {
        e.preventDefault();
        setErr(null);
        setBusy(true);
        try {
            const { role } = await api.login(username, password);
            setRole(role);
            const dest = loc.state?.from
                ?? (role === 'manager' || role === 'admin' ? '/dashboard' : '/submit');
            navigate(dest, { replace: true });
        } catch (e) {
            setErr(MESSAGES[e.message] || 'Innlogging feilet.');
        } finally {
            setBusy(false);
        }
    }

    return (
        <div className="card" style={{ maxWidth: 420, margin: '4rem auto' }}>
            <h2>Logg inn</h2>
            <p style={{ color: '#6b7280', fontSize: '0.9rem', marginTop: '-0.5rem' }}>
                Bruk dine ansatt-legitimasjon. Avvik du sender kan ikke
                knyttes til deg, heller ikke teknisk.
            </p>

            {err && <div className="error">{err}</div>}

            <form onSubmit={onSubmit}>
                <label>
                    <span>Brukernavn</span>
                    <input
                        autoFocus
                        required
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                    />
                </label>
                <label>
                    <span>Passord</span>
                    <input
                        type="password"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                </label>
                <button type="submit" className="primary" disabled={busy}>
                    {busy ? 'Logger inn…' : 'Logg inn'}
                </button>
            </form>
        </div>
    );
}
