import { PERMISSION_KEYS } from "../permissions/keys.js";

// Temporary shared development bypass for inline admin work before real auth is finished.
// Keep this explicit and easy to remove once the real authentication flow is in place.
export const DEV_ADMIN_MODE = true;

export const DEV_ADMIN_USER = Object.freeze({
    id: "dev-admin",
    username: "dev-admin",
    email: "dev-admin@bhagavadgita.local",
    fullName: "Development Admin",
});

export const DEV_ADMIN_SESSION = Object.freeze({
    id: "dev-admin-session",
    loggedInAt: "development",
    mode: "development",
    isDevAdmin: true,
});

export function isDevAdminModeEnabled() {
    return DEV_ADMIN_MODE === true;
}

export function createDevAdminAuthState() {
    return Object.freeze({
        user: DEV_ADMIN_USER,
        session: DEV_ADMIN_SESSION,
        roleIds: Object.freeze(["admin"]),
        permissionKeys: Object.freeze([...PERMISSION_KEYS]),
    });
}
