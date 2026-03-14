import { getContentEntityConfig } from "./content-config.js";
import { getAdminEntityApiPath } from "./entity-api-paths.js";

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

function buildQueryString(filters = {}) {
    const params = new URLSearchParams();
    Object.entries(filters || {}).forEach(([key, value]) => {
        if (value == null || value === "") {
            return;
        }

        params.set(key, String(value));
    });

    const query = params.toString();
    return query ? `?${query}` : "";
}

export function createAdminApi() {
    function getEntityPath(entity) {
        const config = getContentEntityConfig(entity);
        if (!config) {
            throw new Error(`Unsupported admin entity "${entity}".`);
        }

        const path = getAdminEntityApiPath(entity);
        if (!path) {
            throw new Error(`Unsupported admin entity "${entity}".`);
        }

        return path;
    }

    return {
        request: apiRequest,
        async listRecords(entity, filters = {}) {
            return apiRequest(`${getEntityPath(entity)}${buildQueryString(filters)}`);
        },
        async getRecord(entity, recordId) {
            return apiRequest(`${getEntityPath(entity)}/${encodeURIComponent(recordId)}`);
        },
        async createRecord(entity, payload) {
            return apiRequest(getEntityPath(entity), {
                method: "POST",
                body: JSON.stringify(payload),
            });
        },
        async updateRecord(entity, recordId, payload) {
            return apiRequest(`${getEntityPath(entity)}/${encodeURIComponent(recordId)}`, {
                method: "PUT",
                body: JSON.stringify(payload),
            });
        },
        async deleteRecord(entity, recordId) {
            return apiRequest(`${getEntityPath(entity)}/${encodeURIComponent(recordId)}`, {
                method: "DELETE",
            });
        },
        async getAccessSnapshot() {
            return apiRequest("/api/admin/access");
        },
        async updateUserRoles(userId, roleIds) {
            return apiRequest(`/api/admin/users/${encodeURIComponent(userId)}/roles`, {
                method: "PUT",
                body: JSON.stringify({ roleIds }),
            });
        },
        async updateUserPermissionOverrides(userId, overrides) {
            return apiRequest(`/api/admin/users/${encodeURIComponent(userId)}/permission-overrides`, {
                method: "PUT",
                body: JSON.stringify({ overrides }),
            });
        },
        async updateRolePermissions(roleId, permissionKeys) {
            return apiRequest(`/api/admin/roles/${encodeURIComponent(roleId)}/permissions`, {
                method: "PUT",
                body: JSON.stringify({ permissionKeys }),
            });
        },
    };
}
