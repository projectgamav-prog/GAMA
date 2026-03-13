import crypto from "node:crypto";
import fs from "node:fs/promises";
import { systemDataDirectory } from "../core/paths.js";
import {
    createDefaultPermissionRecords,
    createDefaultRolePermissionRecords,
    createDefaultRoleRecords,
} from "../../src/permissions/defaults.js";
import { createPermissionContext, resolvePermissionKeys } from "../../src/permissions/access.js";
import { DEFAULT_ADMIN_ACCOUNT, PERMISSION_KEYS, ROLE_DEFINITIONS } from "../../src/permissions/keys.js";

const SYSTEM_FILE_MAP = Object.freeze({
    users: "users.json",
    roles: "roles.json",
    permissions: "permissions.json",
    role_permissions: "role_permissions.json",
    user_roles: "user_roles.json",
    user_permission_overrides: "user_permission_overrides.json",
    sessions: "sessions.json",
});

function getSystemFilePath(collectionName) {
    const fileName = SYSTEM_FILE_MAP[collectionName];
    if (!fileName) {
        throw new Error(`Unknown auth collection "${collectionName}".`);
    }

    return `${systemDataDirectory}/${fileName}`;
}

async function ensureCollectionFile(collectionName, defaultValue = []) {
    await fs.mkdir(systemDataDirectory, { recursive: true });
    const filePath = getSystemFilePath(collectionName);

    try {
        await fs.access(filePath);
    } catch {
        await fs.writeFile(filePath, `${JSON.stringify(defaultValue, null, 2)}\n`, "utf8");
    }

    return filePath;
}

async function readCollection(collectionName, defaultValue = []) {
    const filePath = await ensureCollectionFile(collectionName, defaultValue);
    const raw = await fs.readFile(filePath, "utf8");
    if (!raw.trim()) return Array.isArray(defaultValue) ? [...defaultValue] : defaultValue;

    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
        throw new Error(`Collection "${collectionName}" must contain a JSON array.`);
    }

    return parsed;
}

async function writeCollection(collectionName, rows) {
    if (!Array.isArray(rows)) {
        throw new Error(`Collection "${collectionName}" must be written as a JSON array.`);
    }

    const filePath = await ensureCollectionFile(collectionName, []);
    await fs.writeFile(filePath, `${JSON.stringify(rows, null, 2)}\n`, "utf8");
    return rows;
}

function randomId(prefix) {
    return `${prefix}-${crypto.randomUUID()}`;
}

function normalizeEmail(email = "") {
    return String(email).trim().toLowerCase();
}

function normalizeUsername(username = "") {
    return String(username).trim().toLowerCase();
}

function hashPassword(password, salt = crypto.randomBytes(16).toString("hex")) {
    const derived = crypto.scryptSync(password, salt, 64).toString("hex");
    return `${salt}:${derived}`;
}

function verifyPassword(password, passwordHash) {
    if (!passwordHash || !passwordHash.includes(":")) return false;
    const [salt, expectedHash] = passwordHash.split(":");
    const actualHash = crypto.scryptSync(password, salt, 64).toString("hex");
    return crypto.timingSafeEqual(Buffer.from(actualHash, "hex"), Buffer.from(expectedHash, "hex"));
}

function sanitizeUser(user) {
    if (!user) return null;
    return {
        id: user.id,
        fullName: user.fullName,
        username: user.username,
        email: user.email,
        interests: Array.isArray(user.interests) ? [...user.interests] : [],
        createdAt: user.createdAt,
    };
}

function uniqueStrings(values) {
    return [...new Set((values || []).map((value) => String(value || "").trim()).filter(Boolean))];
}

export async function ensureAuthDataSeeded() {
    const defaults = {
        roles: createDefaultRoleRecords(),
        permissions: createDefaultPermissionRecords(),
        role_permissions: createDefaultRolePermissionRecords(),
        users: [],
        user_roles: [],
        user_permission_overrides: [],
        sessions: [],
    };

    const [
        existingRoles,
        existingPermissions,
        existingRolePermissions,
        existingUsers,
        existingUserRoles,
    ] = await Promise.all([
        readCollection("roles", defaults.roles),
        readCollection("permissions", defaults.permissions),
        readCollection("role_permissions", defaults.role_permissions),
        readCollection("users", defaults.users),
        readCollection("user_roles", defaults.user_roles),
    ]);

    if (!existingRoles.length) {
        await writeCollection("roles", defaults.roles);
    }

    if (!existingPermissions.length) {
        await writeCollection("permissions", defaults.permissions);
    }

    if (!existingRolePermissions.length) {
        await writeCollection("role_permissions", defaults.role_permissions);
    }

    let users = existingUsers;
    let userRoles = existingUserRoles;
    const adminEmail = normalizeEmail(DEFAULT_ADMIN_ACCOUNT.email);
    let adminUser = users.find((user) => normalizeEmail(user.email) === adminEmail);

    if (!adminUser) {
        adminUser = {
            id: randomId("user"),
            fullName: DEFAULT_ADMIN_ACCOUNT.fullName,
            username: DEFAULT_ADMIN_ACCOUNT.username,
            email: adminEmail,
            interests: ["Books", "Characters", "Topics", "Places"],
            passwordHash: hashPassword(DEFAULT_ADMIN_ACCOUNT.password),
            createdAt: new Date().toISOString(),
        };
        users = [...users, adminUser];
        await writeCollection("users", users);
    }

    const hasAdminRole = userRoles.some((assignment) => assignment.user_id === adminUser.id && assignment.role_id === "admin");
    if (!hasAdminRole) {
        userRoles = [...userRoles, { user_id: adminUser.id, role_id: "admin" }];
        await writeCollection("user_roles", userRoles);
    }

    await Promise.all([
        ensureCollectionFile("user_permission_overrides", defaults.user_permission_overrides),
        ensureCollectionFile("sessions", defaults.sessions),
    ]);
}

export async function readAuthState() {
    await ensureAuthDataSeeded();

    const [
        users,
        roles,
        permissions,
        rolePermissions,
        userRoles,
        userPermissionOverrides,
        sessions,
    ] = await Promise.all([
        readCollection("users"),
        readCollection("roles"),
        readCollection("permissions"),
        readCollection("role_permissions"),
        readCollection("user_roles"),
        readCollection("user_permission_overrides"),
        readCollection("sessions"),
    ]);

    return {
        users,
        roles,
        permissions,
        rolePermissions,
        userRoles,
        userPermissionOverrides,
        sessions,
    };
}

function buildUserContext(user, session, authState) {
    const roleIds = authState.userRoles
        .filter((assignment) => assignment.user_id === user.id)
        .map((assignment) => assignment.role_id);
    const userOverrides = authState.userPermissionOverrides.filter((override) => override.user_id === user.id);
    const permissionKeys = resolvePermissionKeys({
        roleIds,
        rolePermissions: authState.rolePermissions,
        userOverrides,
    });

    return {
        user: sanitizeUser(user),
        session: session ? { id: session.id, loggedInAt: session.loggedInAt } : null,
        roleIds,
        permissionKeys,
        permissionContext: createPermissionContext({
            user: sanitizeUser(user),
            roleIds,
            permissionKeys,
        }),
    };
}

export async function buildGuestContext() {
    const authState = await readAuthState();
    const roleIds = ["guest"];
    const permissionKeys = resolvePermissionKeys({
        roleIds,
        rolePermissions: authState.rolePermissions,
        userOverrides: [],
    });

    return {
        user: null,
        session: null,
        roleIds,
        permissionKeys,
        permissionContext: createPermissionContext({
            user: null,
            roleIds,
            permissionKeys,
        }),
    };
}

export async function getSessionContext(sessionId) {
    if (!sessionId) {
        return buildGuestContext();
    }

    const authState = await readAuthState();
    const session = authState.sessions.find((candidate) => candidate.id === sessionId);
    if (!session) {
        return buildGuestContext();
    }

    const user = authState.users.find((candidate) => candidate.id === session.user_id);
    if (!user) {
        return buildGuestContext();
    }

    return buildUserContext(user, session, authState);
}

export async function registerUser({ fullName, username, email, password, interests = [] }) {
    const authState = await readAuthState();
    const normalizedEmail = normalizeEmail(email);
    const normalizedUsername = normalizeUsername(username);

    if (!fullName?.trim()) throw new Error("Full name is required.");
    if (!normalizedUsername) throw new Error("Username is required.");
    if (!normalizedEmail) throw new Error("Email is required.");
    if (!password || password.length < 8) throw new Error("Password must be at least 8 characters.");

    if (authState.users.some((user) => normalizeEmail(user.email) === normalizedEmail)) {
        throw new Error("That email is already registered.");
    }

    if (authState.users.some((user) => normalizeUsername(user.username) === normalizedUsername)) {
        throw new Error("That username is already in use.");
    }

    const user = {
        id: randomId("user"),
        fullName: fullName.trim(),
        username: username.trim(),
        email: normalizedEmail,
        interests: uniqueStrings(interests),
        passwordHash: hashPassword(password),
        createdAt: new Date().toISOString(),
    };

    await writeCollection("users", [...authState.users, user]);
    await writeCollection("user_roles", [...authState.userRoles, { user_id: user.id, role_id: "member" }]);
    return sanitizeUser(user);
}

export async function authenticateUser({ email, password }) {
    const authState = await readAuthState();
    const normalizedEmail = normalizeEmail(email);
    const user = authState.users.find((candidate) => normalizeEmail(candidate.email) === normalizedEmail);
    if (!user || !verifyPassword(password, user.passwordHash)) {
        throw new Error("Email or password is incorrect.");
    }

    const session = {
        id: randomId("session"),
        user_id: user.id,
        loggedInAt: new Date().toISOString(),
    };

    await writeCollection("sessions", [...authState.sessions, session]);

    return buildUserContext(user, session, authState);
}

export async function destroySession(sessionId) {
    if (!sessionId) return;
    const authState = await readAuthState();
    const nextSessions = authState.sessions.filter((session) => session.id !== sessionId);
    await writeCollection("sessions", nextSessions);
}

export async function getAccessSnapshot() {
    const authState = await readAuthState();
    return {
        users: authState.users.map(sanitizeUser),
        roles: authState.roles,
        permissions: authState.permissions,
        rolePermissions: authState.rolePermissions,
        userRoles: authState.userRoles,
        userPermissionOverrides: authState.userPermissionOverrides,
    };
}

export async function updateUserRoles(userId, roleIds = []) {
    const authState = await readAuthState();
    const user = authState.users.find((candidate) => candidate.id === userId);
    if (!user) {
        throw new Error(`User "${userId}" not found.`);
    }

    const validRoleIds = new Set(authState.roles.map((role) => role.id));
    const uniqueRoleIds = uniqueStrings(roleIds);
    uniqueRoleIds.forEach((roleId) => {
        if (!validRoleIds.has(roleId)) {
            throw new Error(`Unknown role "${roleId}".`);
        }
    });

    const preserved = authState.userRoles.filter((assignment) => assignment.user_id !== userId);
    const nextAssignments = [
        ...preserved,
        ...uniqueRoleIds.map((roleId) => ({ user_id: userId, role_id: roleId })),
    ];
    await writeCollection("user_roles", nextAssignments);
    return nextAssignments.filter((assignment) => assignment.user_id === userId);
}

export async function updateRolePermissions(roleId, permissionKeys = []) {
    const authState = await readAuthState();
    if (!ROLE_DEFINITIONS.some((role) => role.id === roleId) && !authState.roles.some((role) => role.id === roleId)) {
        throw new Error(`Unknown role "${roleId}".`);
    }

    const validPermissionKeys = new Set(PERMISSION_KEYS);
    const uniquePermissionKeys = uniqueStrings(permissionKeys);
    uniquePermissionKeys.forEach((permissionKey) => {
        if (!validPermissionKeys.has(permissionKey)) {
            throw new Error(`Unknown permission "${permissionKey}".`);
        }
    });

    const preserved = authState.rolePermissions.filter((assignment) => assignment.role_id !== roleId);
    const nextAssignments = [
        ...preserved,
        ...uniquePermissionKeys.map((permissionKey) => ({
            role_id: roleId,
            permission_key: permissionKey,
        })),
    ];
    await writeCollection("role_permissions", nextAssignments);
    return nextAssignments.filter((assignment) => assignment.role_id === roleId);
}

export async function updateUserPermissionOverrides(userId, overrides = []) {
    const authState = await readAuthState();
    const user = authState.users.find((candidate) => candidate.id === userId);
    if (!user) {
        throw new Error(`User "${userId}" not found.`);
    }

    const validPermissionKeys = new Set(PERMISSION_KEYS);
    const normalizedOverrides = uniqueStrings(
        overrides.map((override) => `${override.permission_key}:${override.effect}`)
    ).map((value) => {
        const [permissionKey, effect] = value.split(":");
        const normalizedEffect = String(effect || "").trim().toLowerCase();
        if (!validPermissionKeys.has(permissionKey)) {
            throw new Error(`Unknown permission "${permissionKey}".`);
        }
        if (normalizedEffect !== "allow" && normalizedEffect !== "deny") {
            throw new Error(`Unsupported override effect "${effect}".`);
        }
        return {
            user_id: userId,
            permission_key: permissionKey,
            effect: normalizedEffect,
        };
    });

    const preserved = authState.userPermissionOverrides.filter((override) => override.user_id !== userId);
    const nextOverrides = [...preserved, ...normalizedOverrides];
    await writeCollection("user_permission_overrides", nextOverrides);
    return nextOverrides.filter((override) => override.user_id === userId);
}
