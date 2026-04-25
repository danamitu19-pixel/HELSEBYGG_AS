// Minimal auth context. The *real* auth state lives in the httpOnly
// session cookie on the server — React just tracks which role the
// user has, so we can show the right UI.
//
// On browser refresh, React state is lost; the user is asked to log
// in again. (The cookie might still be valid, but we don't have a
// /me endpoint to resolve it client-side without changing the API.)

import { createContext, useContext, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';

const AuthCtx = createContext(null);

export function AuthProvider({ children }) {
    // Load any previously saved role so a page refresh during the
    // session doesn't immediately boot the user back to /login if
    // the cookie is still valid.
    const [role, setRole] = useState(
        () => localStorage.getItem('role') || null
    );

    const value = {
        role,
        loggedIn: Boolean(role),
        setRole: (r) => {
            if (r) localStorage.setItem('role', r);
            else   localStorage.removeItem('role');
            setRole(r);
        },
    };

    return <AuthCtx.Provider value={value}>{children}</AuthCtx.Provider>;
}

export function useAuth() {
    return useContext(AuthCtx);
}

export function RequireAuth({ children, roles }) {
    const { role, loggedIn } = useAuth();
    const loc = useLocation();

    if (!loggedIn) {
        return <Navigate to="/login" state={{ from: loc.pathname }} replace />;
    }
    if (roles && !roles.includes(role)) {
        return <Navigate to="/submit" replace />;
    }
    return children;
}
