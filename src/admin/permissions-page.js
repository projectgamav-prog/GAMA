import { createAdminApi } from "./api.js";
import { hasAnyPermission } from "../permissions/access.js";
import { PERMISSION_DEFINITIONS, ROLE_DEFINITIONS } from "../permissions/keys.js";

const api = createAdminApi();

const state = {
    permissionContext: null,
    snapshot: null,
    loading: true,
    error: "",
    status: "",
    statusTone: "muted",
};

const ui = {};

initializePermissionsPage();

async function initializePermissionsPage() {
    cacheDom();

    await window.authStorage?.ready;
    state.permissionContext = window.authStorage?.getPermissionContext?.() || null;

    bindEvents();
    await refreshPage();

    window.addEventListener(window.authStorage?.AUTH_STATE_EVENT || "auth:statechange", async () => {
        state.permissionContext = window.authStorage?.getPermissionContext?.() || null;
        await refreshPage();
    });
}

function cacheDom() {
    ui.status = document.getElementById("permissionsPageStatus");
    ui.overview = document.getElementById("permissionsOverview");
    ui.roles = document.getElementById("permissionsRolesPanel");
    ui.users = document.getElementById("permissionsUsersPanel");
    ui.refreshButton = document.getElementById("permissionsRefreshButton");
}

function bindEvents() {
    ui.refreshButton?.addEventListener("click", () => {
        refreshPage();
    });

    document.addEventListener("submit", async (event) => {
        const form = event.target;
        if (!(form instanceof HTMLFormElement)) return;

        if (form.matches("[data-role-permissions-form]")) {
            event.preventDefault();
            await submitRolePermissions(form);
        }

        if (form.matches("[data-user-roles-form]")) {
            event.preventDefault();
            await submitUserRoles(form);
        }

        if (form.matches("[data-user-overrides-form]")) {
            event.preventDefault();
            await submitUserOverrides(form);
        }
    });
}

async function refreshPage(statusMessage = "", statusTone = "muted") {
    state.loading = true;
    state.error = "";
    renderPage();

    if (!hasAdminManagementAccess()) {
        state.loading = false;
        renderPage();
        return;
    }

    try {
        state.snapshot = await api.getAccessSnapshot();
        state.status = statusMessage || "Permissions snapshot is current.";
        state.statusTone = statusMessage ? statusTone : "muted";
    } catch (error) {
        state.error = error.message;
    } finally {
        state.loading = false;
        renderPage();
    }
}

function renderPage() {
    renderStatus();
    renderOverview();
    renderRoles();
    renderUsers();
}

function renderStatus() {
    if (!(ui.status instanceof HTMLElement)) return;

    if (!window.authStorage?.getCurrentUser?.()) {
        ui.status.className = "permissions-status is-muted";
        ui.status.textContent = "Sign in from the shared header to access admin management tools.";
        return;
    }

    if (!hasAdminManagementAccess()) {
        ui.status.className = "permissions-status is-error";
        ui.status.textContent = "This page requires users.manage or permissions.manage.";
        return;
    }

    if (state.loading) {
        ui.status.className = "permissions-status is-muted";
        ui.status.textContent = "Loading permissions snapshot...";
        return;
    }

    if (state.error) {
        ui.status.className = "permissions-status is-error";
        ui.status.textContent = state.error;
        return;
    }

    ui.status.className = `permissions-status is-${state.statusTone}`;
    ui.status.textContent = state.status || "Permissions snapshot is current.";
}

function renderOverview() {
    if (!(ui.overview instanceof HTMLElement)) return;

    if (!hasAdminManagementAccess() || state.loading || !state.snapshot) {
        ui.overview.innerHTML = "";
        return;
    }

    ui.overview.innerHTML = `
        <article class="permissions-stat-card">
            <h2>${state.snapshot.users.length}</h2>
            <p>Users with server-backed accounts available for role and override management.</p>
        </article>
        <article class="permissions-stat-card">
            <h2>${state.snapshot.roles.length}</h2>
            <p>Roles managed centrally through one permission map shared by public and admin.</p>
        </article>
        <article class="permissions-stat-card">
            <h2>${state.snapshot.userPermissionOverrides.length}</h2>
            <p>Per-user overrides currently stored on top of role-based access control.</p>
        </article>
    `;
}

function renderRoles() {
    if (!(ui.roles instanceof HTMLElement)) return;

    if (!window.authStorage?.getCurrentUser?.()) {
        ui.roles.innerHTML = createEmptyState("Sign in to view role permissions.");
        return;
    }

    if (!hasAdminManagementAccess()) {
        ui.roles.innerHTML = createEmptyState("You do not have permission to manage this page.");
        return;
    }

    if (state.loading) {
        ui.roles.innerHTML = createEmptyState("Loading role permissions...");
        return;
    }

    if (state.error || !state.snapshot) {
        ui.roles.innerHTML = createEmptyState(state.error || "Unable to load role permissions.");
        return;
    }

    if (!canManagePermissions()) {
        ui.roles.innerHTML = createEmptyState("This account can manage users but not role permission assignments.");
        return;
    }

    ui.roles.innerHTML = `
        <div class="permissions-panel-header">
            <p class="permissions-eyebrow">Roles</p>
            <h2>Role permission matrix</h2>
            <p class="permissions-inline-message">These assignments drive both frontend visibility and backend write enforcement.</p>
        </div>
        <div class="permissions-role-grid">
            ${ROLE_DEFINITIONS.map((role) => renderRoleCard(role)).join("")}
        </div>
    `;
}

function renderRoleCard(role) {
    const selectedPermissions = new Set(
        state.snapshot.rolePermissions
            .filter((assignment) => assignment.role_id === role.id)
            .map((assignment) => assignment.permission_key)
    );

    return `
        <section class="permissions-role-card permissions-panel">
            <div>
                <h3 class="permissions-section-title">${escapeHtml(role.label)}</h3>
                <p class="permissions-role-meta">${escapeHtml(role.description)}</p>
            </div>
            <form data-role-permissions-form data-role-id="${escapeHtml(role.id)}">
                <div class="permissions-checkbox-grid">
                    ${PERMISSION_DEFINITIONS.map((permission) => `
                        <label class="permissions-checkbox">
                            <input
                                type="checkbox"
                                name="permissionKeys"
                                value="${escapeHtml(permission.key)}"
                                ${selectedPermissions.has(permission.key) ? "checked" : ""}
                            >
                            <span>
                                <strong>${escapeHtml(permission.label)}</strong>
                                <span>${escapeHtml(permission.description)}</span>
                            </span>
                        </label>
                    `).join("")}
                </div>
                <div class="permissions-role-actions">
                    <button class="permissions-save-btn" type="submit">Save ${escapeHtml(role.label)}</button>
                </div>
            </form>
        </section>
    `;
}

function renderUsers() {
    if (!(ui.users instanceof HTMLElement)) return;

    if (!window.authStorage?.getCurrentUser?.()) {
        ui.users.innerHTML = createEmptyState("Sign in to manage users.");
        return;
    }

    if (!hasAdminManagementAccess()) {
        ui.users.innerHTML = createEmptyState("You do not have permission to manage users or overrides.");
        return;
    }

    if (state.loading) {
        ui.users.innerHTML = createEmptyState("Loading users...");
        return;
    }

    if (state.error || !state.snapshot) {
        ui.users.innerHTML = createEmptyState(state.error || "Unable to load users.");
        return;
    }

    ui.users.innerHTML = `
        <div class="permissions-panel-header">
            <p class="permissions-eyebrow">Users</p>
            <h2>User access assignments</h2>
            <p class="permissions-inline-message">Role assignment and per-user overrides stay centralized here instead of being scattered into page code.</p>
        </div>
        <div class="permissions-users">
            ${state.snapshot.users.map((user) => renderUserCard(user)).join("")}
        </div>
    `;
}

function renderUserCard(user) {
    const userRoles = new Set(
        state.snapshot.userRoles
            .filter((assignment) => assignment.user_id === user.id)
            .map((assignment) => assignment.role_id)
    );
    const overrideLookup = state.snapshot.userPermissionOverrides
        .filter((override) => override.user_id === user.id)
        .reduce((lookup, override) => {
            lookup[override.permission_key] = override.effect;
            return lookup;
        }, {});

    return `
        <article class="permissions-user-card">
            <div class="permissions-user-top">
                <div>
                    <h3>${escapeHtml(user.fullName || user.username || user.email)}</h3>
                    <p class="permissions-user-meta">@${escapeHtml(user.username || "user")} • ${escapeHtml(user.email || "")}</p>
                    <p class="permissions-user-copy">Created ${formatDate(user.createdAt)}.</p>
                </div>
                <span class="permissions-user-pill">${escapeHtml(user.id)}</span>
            </div>
            <div class="permissions-user-forms">
                ${canManageUsers() ? `
                    <form data-user-roles-form data-user-id="${escapeHtml(user.id)}">
                        <p class="permissions-form-label">Assigned roles</p>
                        <div class="permissions-checkbox-grid">
                            ${ROLE_DEFINITIONS.map((role) => `
                                <label class="permissions-checkbox">
                                    <input
                                        type="checkbox"
                                        name="roleIds"
                                        value="${escapeHtml(role.id)}"
                                        ${userRoles.has(role.id) ? "checked" : ""}
                                    >
                                    <span>
                                        <strong>${escapeHtml(role.label)}</strong>
                                        <span>${escapeHtml(role.description)}</span>
                                    </span>
                                </label>
                            `).join("")}
                        </div>
                        <div class="permissions-user-actions">
                            <button class="permissions-save-btn" type="submit">Save Roles</button>
                        </div>
                    </form>
                ` : createInlineMessage("This account cannot change user roles.")}
                ${canManagePermissions() ? `
                    <form data-user-overrides-form data-user-id="${escapeHtml(user.id)}">
                        <p class="permissions-form-label">Per-user overrides</p>
                        <div class="permissions-user-overrides">
                            ${PERMISSION_DEFINITIONS.map((permission) => `
                                <label class="permissions-override-row">
                                    <span>
                                        <strong>${escapeHtml(permission.label)}</strong>
                                        <p>${escapeHtml(permission.description)}</p>
                                    </span>
                                    <select name="override:${escapeHtml(permission.key)}">
                                        <option value="" ${!overrideLookup[permission.key] ? "selected" : ""}>Inherit role</option>
                                        <option value="allow" ${overrideLookup[permission.key] === "allow" ? "selected" : ""}>Allow</option>
                                        <option value="deny" ${overrideLookup[permission.key] === "deny" ? "selected" : ""}>Deny</option>
                                    </select>
                                </label>
                            `).join("")}
                        </div>
                        <div class="permissions-user-actions">
                            <button class="permissions-save-btn" type="submit">Save Overrides</button>
                        </div>
                    </form>
                ` : createInlineMessage("This account cannot manage per-user permission overrides.")}
            </div>
        </article>
    `;
}

async function submitRolePermissions(form) {
    if (!canManagePermissions()) return;

    const roleId = form.dataset.roleId || "";
    const permissionKeys = new FormData(form).getAll("permissionKeys").map(String);
    await runMutation(`Saved ${roleId} permissions.`, async () => {
        await api.updateRolePermissions(roleId, permissionKeys);
    });
}

async function submitUserRoles(form) {
    if (!canManageUsers()) return;

    const userId = form.dataset.userId || "";
    const roleIds = new FormData(form).getAll("roleIds").map(String);
    await runMutation("User roles updated.", async () => {
        await api.updateUserRoles(userId, roleIds);
    });
}

async function submitUserOverrides(form) {
    if (!canManagePermissions()) return;

    const userId = form.dataset.userId || "";
    const formData = new FormData(form);
    const overrides = PERMISSION_DEFINITIONS
        .map((permission) => ({
            permission_key: permission.key,
            effect: String(formData.get(`override:${permission.key}`) || "").trim(),
        }))
        .filter((override) => override.effect === "allow" || override.effect === "deny");

    await runMutation("User overrides updated.", async () => {
        await api.updateUserPermissionOverrides(userId, overrides);
    });
}

async function runMutation(successMessage, operation) {
    state.status = "Saving changes...";
    state.statusTone = "muted";
    renderStatus();

    try {
        await operation();
        await refreshPage(successMessage, "success");
    } catch (error) {
        state.status = error.message;
        state.statusTone = "error";
        renderStatus();
    }
}

function hasAdminManagementAccess() {
    return hasAnyPermission(state.permissionContext, ["users.manage", "permissions.manage"]);
}

function canManageUsers() {
    return Boolean(window.authStorage?.hasPermission?.("users.manage"));
}

function canManagePermissions() {
    return Boolean(window.authStorage?.hasPermission?.("permissions.manage"));
}

function createInlineMessage(message) {
    return `<p class="permissions-inline-message">${escapeHtml(message)}</p>`;
}

function createEmptyState(message) {
    return `
        <div class="permissions-empty-state">
            <p>${escapeHtml(message)}</p>
        </div>
    `;
}

function formatDate(value) {
    const date = value ? new Date(value) : null;
    if (!date || Number.isNaN(date.getTime())) {
        return "recently";
    }

    return date.toLocaleDateString("en-IN", {
        year: "numeric",
        month: "short",
        day: "numeric",
    });
}

function escapeHtml(value) {
    return String(value ?? "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#39;");
}
