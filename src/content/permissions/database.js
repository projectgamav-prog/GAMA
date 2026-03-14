import { createPermissionsContentDatabase } from "../schema/permissions-schema.js";

const EMPTY_TABLES = Object.freeze({
    roles: [],
    role_capabilities: [],
    user_role_assignments: [],
});

async function readJson(relativePath) {
    const response = await fetch(relativePath, {
        cache: "no-store",
        headers: {
            Accept: "application/json",
        },
    });

    if (!response.ok) {
        throw new Error(`Failed to load ${relativePath}: ${response.status}`);
    }

    const payload = await response.json();
    if (!Array.isArray(payload)) {
        throw new Error(`${relativePath} must contain a JSON array.`);
    }

    return payload;
}

async function loadRawTables() {
    try {
        const [roles, role_capabilities, user_role_assignments] = await Promise.all([
            readJson("/content/data/roles.json"),
            readJson("/content/data/role_capabilities.json"),
            readJson("/content/data/user_role_assignments.json"),
        ]);

        return {
            roles,
            role_capabilities,
            user_role_assignments,
        };
    } catch (error) {
        console.error("Failed to load permissions content tables.", error);
        return { ...EMPTY_TABLES };
    }
}

export const RAW_PERMISSIONS_CONTENT_TABLES = Object.freeze(await loadRawTables());

function createSafeDatabase(rawTables) {
    try {
        return createPermissionsContentDatabase(rawTables);
    } catch (error) {
        console.error("Failed to build permissions content database from JSON tables.", error);
        return createPermissionsContentDatabase({ ...EMPTY_TABLES });
    }
}

export const PERMISSIONS_CONTENT_DATABASE = createSafeDatabase(RAW_PERMISSIONS_CONTENT_TABLES);
