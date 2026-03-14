import crypto from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";
import { getTablePath, systemDataDirectory } from "../core/paths.js";
import {
    createDefaultPermissionRecords,
    createDefaultRolePermissionRecords,
    createDefaultRoleRecords,
} from "../../src/permissions/defaults.js";
import { createDevAdminAuthState, isDevAdminModeEnabled } from "../../src/auth/dev-admin-mode.js";
import { createPermissionContext, resolvePermissionKeys } from "../../src/permissions/access.js";
import { DEFAULT_ADMIN_ACCOUNT, PERMISSION_KEYS, ROLE_DEFINITIONS } from "../../src/permissions/keys.js";

const SYSTEM_FILE_MAP = Object.freeze({
    users: "users.json",
    permissions: "permissions.json",
    user_permission_overrides: "user_permission_overrides.json",
    sessions: "sessions.json",
});

const LEGACY_SYSTEM_FILE_MAP = Object.freeze({
    roles: "roles.json",
    role_permissions: "role_permissions.json",
    user_roles: "user_roles.json",
});

const CONTENT_AUTH_COLLECTIONS = new Set(["roles", "role_capabilities", "user_role_assignments"]);

function getSystemFilePath(collectionName) {
    const fileName = SYSTEM_FILE_MAP[collectionName];
    if (!fileName) {
        throw new Error(`Unknown auth system collection "${collectionName}".`);
    }

    return path.join(systemDataDirectory, fileName);
}

function getLegacySystemFilePath(collectionName) {
    const fileName = LEGACY_SYSTEM_FILE_MAP[collectionName];
    if (!fileName) {
        throw new Error(`Unknown legacy auth collection "${collectionName}".`);
    }

    return path.join(systemDataDirectory, fileName);
}

function getCollectionFilePath(collectionName) {
    if (SYSTEM_FILE_MAP[collectionName]) {
        return getSystemFilePath(collectionName);
    }

    if (CONTENT_AUTH_COLLECTIONS.has(collectionName)) {
        return getTablePath(collectionName);
    }

    throw new Error(`Unknown auth collection "${collectionName}".`);
}

function cloneArray(rows) {
    return Array.isArray(rows) ? [...rows] : [];
}

async function ensureCollectionFile(collectionName, defaultValue = []) {
    const filePath = getCollectionFilePath(collectionName);
    await fs.mkdir(path.dirname(filePath), { recursive: true });

    try {
        await fs.access(filePath);
    } catch {
        await fs.writeFile(filePath, `${JSON.stringify(defaultValue, null, 2)}\n`, "utf8");
    }

    return filePath;
}

async function readJsonArray(filePath, defaultValue = []) {
    try {
        const raw = await fs.readFile(filePath, "utf8");
        if (!raw.trim()) return cloneArray(defaultValue);

        const parsed = JSON.parse(raw);
        if (!Array.isArray(parsed)) {
            throw new Error(`File "${filePath}" must contain a JSON array.`);
        }

        return parsed;
    } catch (error) {
        if (error?.code === "ENOENT") {
            return cloneArray(defaultValue);
        }
        throw error;
    }
}

async function readCollection(collectionName, defaultValue = []) {
    const filePath = await ensureCollectionFile(collectionName, defaultValue);
    return readJsonArray(filePath, defaultValue);
}

async function readLegacyCollection(collectionName, defaultValue = []) {
    const filePath = getLegacySystemFilePath(collectionName);
    return readJsonArray(filePath, defaultValue);
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

function normalizeToken(value = "") {
    return String(value).trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

function createRoleCapabilityId(roleId, capabilityKey) {
    return `role-capability-${normalizeToken(roleId)}-${normalizeToken(capabilityKey)}`;
}

function createUserRoleAssignmentId(userId, roleId) {
    return `user-role-assignment-${normalizeToken(userId)}-${normalizeToken(roleId)}`;
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

function dedupeRows(rows, getKey) {
    const seen = new Set();

    return rows.filter((row) => {
        const key = getKey(row);
        if (!key || seen.has(key)) {
            return false;
        }

        seen.add(key);
        return true;
    });
}

function createDefaultRoleCapabilityRecords() {
    return createDefaultRolePermissionRecords().map((assignment) => ({
        id: createRoleCapabilityId(assignment.role_id, assignment.permission_key),
        role_id: assignment.role_id,
        capability_key: assignment.permission_key,
    }));
}

function toLegacyRolePermission(record) {
    return {
        role_id: record.role_id,
        permission_key: record.capability_key,
    };
}

function toLegacyUserRole(record) {
    return {
        user_id: record.user_id,
        role_id: record.role_id,
    };
}

function mapRoleCapabilitiesToLegacy(roleCapabilities = []) {
    return roleCapabilities.map(toLegacyRolePermission);
}

function mapUserRoleAssignmentsToLegacy(userRoleAssignments = []) {
    return userRoleAssignments.map(toLegacyUserRole);
}

async function getSeedRows(collectionName, defaultRows = []) {
    if (collectionName === "roles") {
        const legacyRoles = await readLegacyCollection("roles", []);
        return legacyRoles.length ? legacyRoles : cloneArray(defaultRows);
    }

    if (collectionName === "role_capabilities") {
        const legacyRolePermissions = await readLegacyCollection("role_permissions", []);
        if (!legacyRolePermissions.length) {
            return cloneArray(defaultRows);
        }

        return dedupeRows(
            legacyRolePermissions
                .map((assignment) => {
                    const roleId = String(assignment.role_id || "").trim();
                    const permissionKey = String(assignment.permission_key || "").trim();
                    if (!roleId || !permissionKey) return null;

                    return {
                        id: createRoleCapabilityId(roleId, permissionKey),
                        role_id: roleId,
                        capability_key: permissionKey,
                    };
                })
                .filter(Boolean),
            (row) => `${row.role_id}:${row.capability_key}`
        );
    }

    if (collectionName === "user_role_assignments") {
        const legacyUserRoles = await readLegacyCollection("user_roles", []);
        if (!legacyUserRoles.length) {
            return cloneArray(defaultRows);
        }

        return dedupeRows(
            legacyUserRoles
                .map((assignment) => {
                    const userId = String(assignment.user_id || "").trim();
                    const roleId = String(assignment.role_id || "").trim();
                    if (!userId || !roleId) return null;

                    return {
                        id: createUserRoleAssignmentId(userId, roleId),
                        user_id: userId,
                        role_id: roleId,
                    };
                })
                .filter(Boolean),
            (row) => `${row.user_id}:${row.role_id}`
        );
    }

    return cloneArray(defaultRows);
}

export async function ensureAuthDataSeeded() {
    const defaults = {
        roles: createDefaultRoleRecords(),
        permissions: createDefaultPermissionRecords(),
        role_capabilities: createDefaultRoleCapabilityRecords(),
        users: [],
        user_role_assignments: [],
        user_permission_overrides: [],
        sessions: [],
    };

    const [
        existingRoles,
        existingPermissions,
        existingRoleCapabilities,
        existingUsers,
        existingUserRoleAssignments,
    ] = await Promise.all([
        readCollection("roles", []),
        readCollection("permissions", []),
        readCollection("role_capabilities", []),
        readCollection("users", []),
        readCollection("user_role_assignments", []),
    ]);

    let roles = existingRoles;
    let roleCapabilities = existingRoleCapabilities;
    let users = existingUsers;
    let userRoleAssignments = existingUserRoleAssignments;

    if (!roles.length) {
        roles = await getSeedRows("roles", defaults.roles);
        await writeCollection("roles", roles);
    }

    if (!existingPermissions.length) {
        await writeCollection("permissions", defaults.permissions);
    }

    if (!roleCapabilities.length) {
        roleCapabilities = await getSeedRows("role_capabilities", defaults.role_capabilities);
        await writeCollection("role_capabilities", roleCapabilities);
    }

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

    const hasAdminRole = userRoleAssignments.some(
        (assignment) => assignment.user_id === adminUser.id && assignment.role_id === "admin"
    );

    if (!hasAdminRole) {
        userRoleAssignments = [
            ...userRoleAssignments,
            {
                id: createUserRoleAssignmentId(adminUser.id, "admin"),
                user_id: adminUser.id,
                role_id: "admin",
            },
        ];
        await writeCollection("user_role_assignments", userRoleAssignments);
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
        roleCapabilities,
        userRoleAssignments,
        userPermissionOverrides,
        sessions,
    ] = await Promise.all([
        readCollection("users"),
        readCollection("roles"),
        readCollection("permissions"),
        readCollection("role_capabilities"),
        readCollection("user_role_assignments"),
        readCollection("user_permission_overrides"),
        readCollection("sessions"),
    ]);

    return {
        users,
        roles,
        permissions,
        roleCapabilities,
        userRoleAssignments,
        rolePermissions: mapRoleCapabilitiesToLegacy(roleCapabilities),
        userRoles: mapUserRoleAssignmentsToLegacy(userRoleAssignments),
        userPermissionOverrides,
        sessions,
    };
}

function buildUserContext(user, session, authState) {
    const roleIds = authState.userRoleAssignments
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

export function buildDevAdminContext() {
    const devAuthState = createDevAdminAuthState();
    return {
        user: devAuthState.user,
        session: devAuthState.session,
        roleIds: [...devAuthState.roleIds],
        permissionKeys: [...devAuthState.permissionKeys],
        permissionContext: createPermissionContext({
            user: devAuthState.user,
            roleIds: devAuthState.roleIds,
            permissionKeys: devAuthState.permissionKeys,
        }),
    };
}

export async function buildGuestContext() {
    if (isDevAdminModeEnabled()) {
        return buildDevAdminContext();
    }

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
    if (isDevAdminModeEnabled()) {
        return buildDevAdminContext();
    }

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

    const nextUsers = [...authState.users, user];
    const nextUserRoleAssignments = [
        ...authState.userRoleAssignments,
        {
            id: createUserRoleAssignmentId(user.id, "member"),
            user_id: user.id,
            role_id: "member",
        },
    ];

    await writeCollection("users", nextUsers);
    await writeCollection("user_role_assignments", nextUserRoleAssignments);

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
        roleCapabilities: authState.roleCapabilities,
        userRoleAssignments: authState.userRoleAssignments,
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

    const preserved = authState.userRoleAssignments.filter((assignment) => assignment.user_id !== userId);
    const nextAssignments = [
        ...preserved,
        ...uniqueRoleIds.map((roleId) => ({
            id: createUserRoleAssignmentId(userId, roleId),
            user_id: userId,
            role_id: roleId,
        })),
    ];

    await writeCollection("user_role_assignments", nextAssignments);
    return mapUserRoleAssignmentsToLegacy(nextAssignments.filter((assignment) => assignment.user_id === userId));
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

    const preserved = authState.roleCapabilities.filter((assignment) => assignment.role_id !== roleId);
    const nextAssignments = [
        ...preserved,
        ...uniquePermissionKeys.map((permissionKey) => ({
            id: createRoleCapabilityId(roleId, permissionKey),
            role_id: roleId,
            capability_key: permissionKey,
        })),
    ];

    await writeCollection("role_capabilities", nextAssignments);
    return mapRoleCapabilitiesToLegacy(nextAssignments.filter((assignment) => assignment.role_id === roleId));
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
