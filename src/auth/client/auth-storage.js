import { canAccessAdmin, createPermissionContext, hasPermission } from "../../permissions/access.js";

const AUTH_STATE_EVENT = "auth:statechange";

function createGuestState() {
    const permissionContext = createPermissionContext({
        user: null,
        roleIds: ["guest"],
        permissionKeys: [],
    });

    return {
        user: null,
        session: null,
        roleIds: ["guest"],
        permissionKeys: [],
        permissionContext,
    };
}

const state = createGuestState();

function dispatchAuthStateChange() {
    window.dispatchEvent(
        new CustomEvent(AUTH_STATE_EVENT, {
            detail: {
                user: state.user,
                session: state.session,
                roleIds: [...state.roleIds],
                permissionKeys: [...state.permissionKeys],
                canAccessAdmin: canAccessAdmin(state.permissionContext),
            },
        })
    );
}

function applyAuthState(payload = {}) {
    state.user = payload.user || null;
    state.session = payload.session || null;
    state.roleIds = Array.isArray(payload.roleIds) && payload.roleIds.length ? [...payload.roleIds] : ["guest"];
    state.permissionKeys = Array.isArray(payload.permissionKeys) ? [...payload.permissionKeys] : [];
    state.permissionContext = createPermissionContext({
        user: state.user,
        roleIds: state.roleIds,
        permissionKeys: state.permissionKeys,
    });
    dispatchAuthStateChange();
}

async function apiRequest(path, options = {}) {
    const response = await fetch(path, {
        method: options.method || "GET",
        headers: {
            "Content-Type": "application/json",
            ...(options.headers || {}),
        },
        credentials: "include",
        body: options.body,
    });

    const payload = await response.json().catch(() => ({
        success: false,
        error: `Request failed with status ${response.status}.`,
    }));

    if (!response.ok || payload.success === false) {
        throw new Error(payload.error || `Request failed with status ${response.status}.`);
    }

    return payload.data;
}

async function refreshSession() {
    try {
        const nextState = await apiRequest("/api/auth/session");
        applyAuthState(nextState);
        return nextState;
    } catch {
        applyAuthState(createGuestState());
        return createGuestState();
    }
}

const ready = refreshSession();

async function login(credentials) {
    const authState = await apiRequest("/api/auth/login", {
        method: "POST",
        body: JSON.stringify(credentials),
    });
    applyAuthState(authState);
    return authState;
}

async function register(registration) {
    const authState = await apiRequest("/api/auth/register", {
        method: "POST",
        body: JSON.stringify(registration),
    });
    applyAuthState(authState);
    return authState;
}

async function logout() {
    const authState = await apiRequest("/api/auth/logout", {
        method: "POST",
    });
    applyAuthState(authState);
    return authState;
}

window.authStorage = {
    ready,
    refreshSession,
    login,
    register,
    logout,
    getCurrentUser() {
        return state.user;
    },
    getSession() {
        return state.session;
    },
    getRoleIds() {
        return [...state.roleIds];
    },
    getPermissionKeys() {
        return [...state.permissionKeys];
    },
    getPermissionContext() {
        return state.permissionContext;
    },
    hasPermission(permissionKey) {
        return hasPermission(state.permissionContext, permissionKey);
    },
    canAccessAdmin() {
        return canAccessAdmin(state.permissionContext);
    },
    toPublicUser(user) {
        return user ? { ...user } : null;
    },
    AUTH_STATE_EVENT,
};
