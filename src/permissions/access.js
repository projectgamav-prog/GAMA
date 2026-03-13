import {
    ADMIN_ACCESS_PERMISSIONS,
    DEFAULT_ROLE_PERMISSION_MAP,
    ENTITY_EDIT_PERMISSION_MAP,
} from "./keys.js";

function toSet(values) {
    return new Set((values || []).filter(Boolean));
}

export function resolveRolePermissionKeys({ roleIds = [], rolePermissions = [] } = {}) {
    const explicitAssignments = rolePermissions.length
        ? rolePermissions.reduce((map, assignment) => {
            const roleId = String(assignment.role_id || "").trim();
            const permissionKey = String(assignment.permission_key || "").trim();
            if (!roleId || !permissionKey) return map;

            if (!map.has(roleId)) {
                map.set(roleId, new Set());
            }
            map.get(roleId).add(permissionKey);
            return map;
        }, new Map())
        : null;

    const granted = new Set();

    (roleIds || []).forEach((roleId) => {
        if (explicitAssignments?.has(roleId)) {
            explicitAssignments.get(roleId).forEach((permissionKey) => granted.add(permissionKey));
            return;
        }

        (DEFAULT_ROLE_PERMISSION_MAP[roleId] || []).forEach((permissionKey) => granted.add(permissionKey));
    });

    return Object.freeze([...granted].sort());
}

export function resolvePermissionKeys({
    roleIds = [],
    rolePermissions = [],
    userOverrides = [],
} = {}) {
    const granted = toSet(resolveRolePermissionKeys({ roleIds, rolePermissions }));

    (userOverrides || []).forEach((override) => {
        const permissionKey = String(override.permission_key || "").trim();
        const effect = String(override.effect || "").trim().toLowerCase();
        if (!permissionKey || !effect) return;

        if (effect === "allow") {
            granted.add(permissionKey);
            return;
        }

        if (effect === "deny") {
            granted.delete(permissionKey);
        }
    });

    return Object.freeze([...granted].sort());
}

export function createPermissionContext({
    user = null,
    roleIds = [],
    permissionKeys = [],
} = {}) {
    const uniqueRoleIds = Object.freeze([...toSet(roleIds)].sort());
    const uniquePermissionKeys = Object.freeze([...toSet(permissionKeys)].sort());
    const lookup = Object.freeze(Object.fromEntries(uniquePermissionKeys.map((key) => [key, true])));

    return Object.freeze({
        user,
        roleIds: uniqueRoleIds,
        permissionKeys: uniquePermissionKeys,
        lookup,
    });
}

export function hasPermission(permissionContext, permissionKey) {
    return Boolean(permissionContext?.lookup?.[permissionKey]);
}

export function hasAnyPermission(permissionContext, permissionKeys = []) {
    return (permissionKeys || []).some((permissionKey) => hasPermission(permissionContext, permissionKey));
}

export function canAccessAdmin(permissionContext) {
    return hasAnyPermission(permissionContext, ADMIN_ACCESS_PERMISSIONS);
}

export function getEntityEditPermissionKey(entity) {
    return ENTITY_EDIT_PERMISSION_MAP[entity] || null;
}

export function canEditEntity(permissionContext, entity) {
    const permissionKey = getEntityEditPermissionKey(entity);
    return permissionKey ? hasPermission(permissionContext, permissionKey) : false;
}
