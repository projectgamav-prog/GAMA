import { PERMISSIONS_CONTENT_DATABASE } from "../permissions/database.js";

export function listRoles() {
    return PERMISSIONS_CONTENT_DATABASE.roles;
}

export function listRoleCapabilities() {
    return PERMISSIONS_CONTENT_DATABASE.roleCapabilities;
}

export function listUserRoleAssignments() {
    return PERMISSIONS_CONTENT_DATABASE.userRoleAssignments;
}

export function getRoleById(roleId) {
    return PERMISSIONS_CONTENT_DATABASE.indexes.rolesById[roleId] || null;
}

export function listCapabilitiesForRole(roleId) {
    return PERMISSIONS_CONTENT_DATABASE.indexes.roleCapabilitiesByRoleId[roleId] || [];
}

export function listRolesForUser(userId) {
    return PERMISSIONS_CONTENT_DATABASE.indexes.userRoleAssignmentsByUserId[userId] || [];
}
