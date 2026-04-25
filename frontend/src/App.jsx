import { Routes, Route, Navigate, NavLink } from 'react-router-dom';
import Login        from './pages/Login.jsx';
import Submit       from './pages/Submit.jsx';
import Dashboard    from './pages/Dashboard.jsx';
import ReportDetail from './pages/ReportDetail.jsx';
import { useAuth, RequireAuth } from './auth.jsx';
import { api } from './api.js';
import { useNavigate } from 'react-router-dom';

export default function App() {
    const { role, loggedIn, setRole } = useAuth();
    const navigate = useNavigate();

    async function logout() {
        try { await api.logout(); } catch { /* ignore */ }
        setRole(null);
        navigate('/login');
    }

    return (
        <>
            {loggedIn && (
                <header className="topbar">
                    <h1>Helsebygg – Avvikssystem</h1>
                    <nav>
                        <NavLink to="/submit">Meld avvik</NavLink>
                        {(role === 'manager' || role === 'admin') &&
                            <NavLink to="/dashboard">Dashbord</NavLink>}
                        <button onClick={logout}>Logg ut</button>
                    </nav>
                </header>
            )}

            <main className="container">
                <Routes>
                    <Route path="/login"  element={<Login />} />
                    <Route path="/submit" element={
                        <RequireAuth><Submit /></RequireAuth>
                    } />
                    <Route path="/dashboard" element={
                        <RequireAuth roles={['manager', 'admin']}><Dashboard /></RequireAuth>
                    } />
                    <Route path="/dashboard/:id" element={
                        <RequireAuth roles={['manager', 'admin']}><ReportDetail /></RequireAuth>
                    } />
                    <Route path="*" element={<Navigate to={loggedIn ? '/submit' : '/login'} />} />
                </Routes>
            </main>
        </>
    );
}
