

import crypto from 'node:crypto';

const key = () => Buffer.from(process.env.SUBMISSION_HMAC_KEY, 'hex');

function b64url(buf) {
    return Buffer.from(buf).toString('base64url');
}

function fromB64url(str) {
    return Buffer.from(str, 'base64url');
}

export function mintSubmissionToken() {
    const nonce = crypto.randomBytes(32);                       // 256 bits
    const ttlMin = Number(process.env.SUBMISSION_TTL_MINUTES) || 15;
    const exp    = Date.now() + ttlMin * 60 * 1000;
    const expBuf = Buffer.from(String(exp));

    const mac = crypto.createHmac('sha256', key())
        .update(nonce).update('.').update(expBuf).digest();

    return `${b64url(nonce)}.${b64url(expBuf)}.${b64url(mac)}`;
}

export function verifySubmissionToken(token) {
    if (typeof token !== 'string') return null;
    const parts = token.split('.');
    if (parts.length !== 3) return null;

    const [nonceB64, expB64, macB64] = parts;
    let nonce, expBuf, mac;
    try {
        nonce  = fromB64url(nonceB64);
        expBuf = fromB64url(expB64);
        mac    = fromB64url(macB64);
    } catch { return null; }

    const expected = crypto.createHmac('sha256', key())
        .update(nonce).update('.').update(expBuf).digest();

    if (mac.length !== expected.length) return null;
    if (!crypto.timingSafeEqual(mac, expected)) return null;

    const exp = Number(expBuf.toString());
    if (!Number.isFinite(exp) || Date.now() > exp) return null;

    return {
        nonceHash: crypto.createHash('sha256').update(nonce).digest('hex'),
        exp,
    };
}
