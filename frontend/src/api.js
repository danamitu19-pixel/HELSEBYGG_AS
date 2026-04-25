// Thin fetch wrapper. Every call sends cookies so the session cookie
// set by /api/auth/login actually rides along.
//
// Responses:
//   - parses JSON when present
//   - throws Error(<errorCode>) on non-2xx, e.g. 'invalid_credentials'

async function request(path, { method = 'GET', body, headers } = {}) {
    const res = await fetch(path, {
        method,
        credentials: 'include',
        headers: {
            ...(body ? { 'Content-Type': 'application/json' } : {}),
            ...headers,
        },
        body: body ? JSON.stringify(body) : undefined,
    });

    const text = await res.text();
    const data = text ? safeParse(text) : null;

    if (!res.ok) {
        const code = data?.error || `http_${res.status}`;
        const err = new Error(code);
        err.status = res.status;
        throw err;
    }
    return data;
}

function safeParse(s) {
    try { return JSON.parse(s); } catch { return null; }
}

export const api = {
    // auth
    login:  (username, password) => request('/api/v1/auth/login',  { method: 'POST', body: { username, password } }),
    logout: ()                   => request('/api/v1/auth/logout', { method: 'POST' }),

    // submission
    mintToken: () => request('/api/v1/submission-token', { method: 'POST' }),
    submitReport: ({ submission_token, ...body }) => request('/api/v1/reports', {
        method: 'POST',
        body,
        headers: { 'X-Submission-Token': submission_token },
    }),

    // management
    listReports: ()              => request('/api/v1/reports'),
    getReport:   (id)            => request(`/api/v1/reports/${id}`),
    setStatus:   (id, status)    => request(`/api/v1/reports/${id}`, { method: 'PUT', body: { status } }),
    listNotes:   (id)            => request(`/api/v1/reports/${id}/notes`),
    addNote:     (id, note_text) => request(`/api/v1/reports/${id}/notes`, { method: 'POST', body: { note_text } }),
};
