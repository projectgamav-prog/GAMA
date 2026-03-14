import { deepFreeze } from "../../core/data/freeze.js";
import { buildGroupedLookup, buildRecordLookup } from "../../core/data/indexes.js";
import {
    assertUnique,
    createUniqueTracker,
    requireFields,
    requireIdentifier,
    requireObject,
    requireString,
} from "../../core/data/validate.js";
import { PERMISSION_KEYS } from "../../permissions/keys.js";

function defineTableSchema(fields, requiredFields) {
    return Object.freeze({
        fields: Object.freeze(fields),
        requiredFields: Object.freeze(requiredFields),
    });
}

export const PERMISSIONS_CONTENT_TABLE_SCHEMAS = Object.freeze({
    roles: defineTableSchema(
        ["id", "label", "description"],
        ["id", "label", "description"]
    ),
    role_capabilities: defineTableSchema(
        ["id", "role_id", "capability_key"],
        ["id", "role_id", "capability_key"]
    ),
    user_role_assignments: defineTableSchema(
        ["id", "user_id", "role_id"],
        ["id", "user_id", "role_id"]
    ),
});

export const PERMISSIONS_CONTENT_FIELD_CONFIGS = Object.freeze({
    roles: Object.freeze([
        { name: "id", label: "Role ID", type: "text", required: true },
        { name: "label", label: "Label", type: "text", required: true },
        { name: "description", label: "Description", type: "textarea", required: true },
    ]),
    role_capabilities: Object.freeze([
        { name: "role_id", label: "Role ID", type: "text", required: true },
        { name: "capability_key", label: "Capability Key", type: "text", required: true },
    ]),
    user_role_assignments: Object.freeze([
        { name: "user_id", label: "User ID", type: "text", required: true },
        { name: "role_id", label: "Role ID", type: "text", required: true },
    ]),
});

function normalizeRole(record, index = 0) {
    const label = `Role at index ${index}`;
    requireObject(record, label);
    requireFields(record, PERMISSIONS_CONTENT_TABLE_SCHEMAS.roles.requiredFields, label);

    return {
        id: requireIdentifier(record, "id", label),
        label: requireString(record, "label", label),
        description: requireString(record, "description", label),
    };
}

function normalizeRoleCapability(record, index, rolesById) {
    const label = `Role capability at index ${index}`;
    requireObject(record, label);
    requireFields(record, PERMISSIONS_CONTENT_TABLE_SCHEMAS.role_capabilities.requiredFields, label);

    const roleId = requireIdentifier(record, "role_id", label);
    if (!rolesById[roleId]) {
        throw new Error(`${label} references unknown role_id "${roleId}".`);
    }

    const capabilityKey = requireString(record, "capability_key", label);
    if (!PERMISSION_KEYS.includes(capabilityKey)) {
        throw new Error(`${label} references unsupported capability_key "${capabilityKey}".`);
    }

    return {
        id: requireIdentifier(record, "id", label),
        role_id: roleId,
        capability_key: capabilityKey,
    };
}

function normalizeUserRoleAssignment(record, index, rolesById) {
    const label = `User role assignment at index ${index}`;
    requireObject(record, label);
    requireFields(record, PERMISSIONS_CONTENT_TABLE_SCHEMAS.user_role_assignments.requiredFields, label);

    const roleId = requireIdentifier(record, "role_id", label);
    if (!rolesById[roleId]) {
        throw new Error(`${label} references unknown role_id "${roleId}".`);
    }

    return {
        id: requireIdentifier(record, "id", label),
        user_id: requireIdentifier(record, "user_id", label),
        role_id: roleId,
    };
}

export function createPermissionsContentDatabase(rawTables) {
    requireObject(rawTables, "Permissions content database");

    if (!Array.isArray(rawTables.roles)) {
        throw new Error('Permissions content database must provide a "roles" array.');
    }

    if (!Array.isArray(rawTables.role_capabilities)) {
        throw new Error('Permissions content database must provide a "role_capabilities" array.');
    }

    if (!Array.isArray(rawTables.user_role_assignments)) {
        throw new Error('Permissions content database must provide a "user_role_assignments" array.');
    }

    const roleTracker = createUniqueTracker();
    const roles = rawTables.roles.map((record, index) => {
        const normalized = normalizeRole(record, index);
        assertUnique(roleTracker, normalized.id, "role id");
        return normalized;
    });
    const rolesById = buildRecordLookup(roles, "id");

    const capabilityTracker = createUniqueTracker();
    const roleCapabilities = rawTables.role_capabilities.map((record, index) => {
        const normalized = normalizeRoleCapability(record, index, rolesById);
        assertUnique(capabilityTracker, normalized.id, "role capability id");
        assertUnique(capabilityTracker, `${normalized.role_id}:${normalized.capability_key}`, "role capability pair");
        return normalized;
    });

    const assignmentTracker = createUniqueTracker();
    const userRoleAssignments = rawTables.user_role_assignments.map((record, index) => {
        const normalized = normalizeUserRoleAssignment(record, index, rolesById);
        assertUnique(assignmentTracker, normalized.id, "user role assignment id");
        assertUnique(assignmentTracker, `${normalized.user_id}:${normalized.role_id}`, "user role assignment pair");
        return normalized;
    });

    const database = {
        roles: deepFreeze(roles),
        roleCapabilities: deepFreeze(roleCapabilities),
        userRoleAssignments: deepFreeze(userRoleAssignments),
    };

    database.indexes = deepFreeze({
        rolesById,
        roleCapabilitiesById: buildRecordLookup(database.roleCapabilities, "id"),
        roleCapabilitiesByRoleId: buildGroupedLookup(database.roleCapabilities, "role_id"),
        userRoleAssignmentsById: buildRecordLookup(database.userRoleAssignments, "id"),
        userRoleAssignmentsByUserId: buildGroupedLookup(database.userRoleAssignments, "user_id"),
    });

    return deepFreeze(database);
}
