import {
    DEFAULT_ROLE_PERMISSION_MAP,
    PERMISSION_DEFINITIONS,
    ROLE_DEFINITIONS,
} from "./keys.js";

export function createDefaultPermissionRecords() {
    return PERMISSION_DEFINITIONS.map((permission) => ({
        key: permission.key,
        label: permission.label,
        description: permission.description,
    }));
}

export function createDefaultRoleRecords() {
    return ROLE_DEFINITIONS.map((role) => ({
        id: role.id,
        label: role.label,
        description: role.description,
    }));
}

export function createDefaultRolePermissionRecords() {
    return ROLE_DEFINITIONS.flatMap((role) =>
        (DEFAULT_ROLE_PERMISSION_MAP[role.id] || []).map((permissionKey) => ({
            role_id: role.id,
            permission_key: permissionKey,
        }))
    );
}
