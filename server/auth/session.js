import { destroySession, getSessionContext } from "./store.js";

export const AUTH_COOKIE_NAME = "bg_session";

function parseCookies(headerValue = "") {
    return headerValue
        .split(";")
        .map((cookie) => cookie.trim())
        .filter(Boolean)
        .reduce((cookies, entry) => {
            const separatorIndex = entry.indexOf("=");
            if (separatorIndex === -1) return cookies;
            const key = entry.slice(0, separatorIndex).trim();
            const value = entry.slice(separatorIndex + 1).trim();
            cookies[key] = decodeURIComponent(value);
            return cookies;
        }, {});
}

function serializeCookie(name, value, { maxAgeSeconds = null, expires = null } = {}) {
    const parts = [`${name}=${encodeURIComponent(value)}`, "Path=/", "HttpOnly", "SameSite=Lax"];
    if (maxAgeSeconds != null) {
        parts.push(`Max-Age=${maxAgeSeconds}`);
    }
    if (expires instanceof Date) {
        parts.push(`Expires=${expires.toUTCString()}`);
    }
    return parts.join("; ");
}

export async function attachSessionContext(req, _res, next) {
    try {
        const cookies = parseCookies(req.headers.cookie || "");
        req.auth = await getSessionContext(cookies[AUTH_COOKIE_NAME] || "");
        next();
    } catch (error) {
        next(error);
    }
}

export function setSessionCookie(res, sessionId) {
    res.setHeader("Set-Cookie", serializeCookie(AUTH_COOKIE_NAME, sessionId, {
        maxAgeSeconds: 60 * 60 * 24 * 30,
    }));
}

export async function clearSessionCookie(req, res) {
    const cookies = parseCookies(req.headers.cookie || "");
    if (cookies[AUTH_COOKIE_NAME]) {
        await destroySession(cookies[AUTH_COOKIE_NAME]);
    }
    res.setHeader("Set-Cookie", serializeCookie(AUTH_COOKIE_NAME, "", {
        expires: new Date(0),
        maxAgeSeconds: 0,
    }));
}
