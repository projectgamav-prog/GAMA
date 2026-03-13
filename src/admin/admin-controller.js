import { canAccessAdmin, hasPermission } from "../permissions/access.js";
import { resolveAdminAuthoringState } from "./action-resolver.js";
import { createAdminEditorPanel } from "./editor-panel.js";
import { resolveAdminPageContext } from "./page-context-resolver.js";

const state = {
    permissionContext: null,
    customActions: [],
    statusOverride: null,
    selection: null,
    pageContext: null,
};

const ui = {};

if (window.APP_CONTEXT?.mode === "admin") {
    initializeAdminController();
}

async function initializeAdminController() {
    await window.authStorage?.ready;
    state.permissionContext = window.authStorage?.getPermissionContext?.() || null;

    document.body.classList.add("admin-mode-page");
    mountInlineAdminChrome();
    initializeEditorPanel();
    exposeAdminChromeHooks();
    bindSelectionModel();
    refreshSelectionTargets();
    renderInlineAdminBar();

    window.addEventListener(window.authStorage?.AUTH_STATE_EVENT || "auth:statechange", () => {
        state.permissionContext = window.authStorage?.getPermissionContext?.() || null;
        if (!canAccessAdmin(state.permissionContext)) {
            ui.editor?.close();
        } else {
            ui.editor?.rerender();
        }
        renderInlineAdminBar();
    });
}

function mountInlineAdminChrome() {
    const header = document.querySelector(".topbar");
    const shell = document.querySelector(".page-shell");
    if (!(shell instanceof HTMLElement)) {
        return;
    }

    let bar = document.querySelector("[data-admin-inline-bar]");
    if (!(bar instanceof HTMLElement)) {
        bar = document.createElement("section");
        bar.className = "admin-inline-bar";
        bar.setAttribute("data-admin-inline-bar", "");
        bar.innerHTML = `
            <div class="admin-inline-bar-inner">
                <div class="admin-inline-bar-copy">
                    <p class="admin-inline-bar-label">Admin Mode</p>
                    <p class="admin-inline-bar-title" id="adminInlineBarTitle"></p>
                    <p class="admin-inline-bar-status is-muted" id="adminInlineBarStatus"></p>
                </div>
                <div class="admin-inline-bar-actions" id="adminInlineBarActions"></div>
            </div>
        `;
    }

    let panelHost = document.querySelector("[data-admin-editor-host]");
    if (!(panelHost instanceof HTMLElement)) {
        panelHost = document.createElement("section");
        panelHost.className = "admin-editor-host";
        panelHost.setAttribute("data-admin-editor-host", "");
    }

    if (header instanceof HTMLElement) {
        header.insertAdjacentElement("afterend", bar);
        bar.insertAdjacentElement("afterend", panelHost);
    } else {
        shell.prepend(panelHost);
        shell.prepend(bar);
    }

    ui.bar = bar;
    ui.title = bar.querySelector("#adminInlineBarTitle");
    ui.status = bar.querySelector("#adminInlineBarStatus");
    ui.actions = bar.querySelector("#adminInlineBarActions");
    ui.panelHost = panelHost;
}

function initializeEditorPanel() {
    if (!(ui.panelHost instanceof HTMLElement)) {
        return;
    }

    ui.editor = createAdminEditorPanel({
        host: ui.panelHost,
        getPermissionContext() {
            return state.permissionContext;
        },
        getPageContext() {
            return state.pageContext;
        },
        onStatusChange(message, tone = "muted") {
            state.statusOverride = message ? { message: String(message), tone } : null;
            renderInlineAdminBar();
        },
    });
}

function exposeAdminChromeHooks() {
    window.adminChrome = {
        setActions(actions = []) {
            state.customActions = normalizeActions(actions);
            renderInlineAdminBar();
        },
        clearActions() {
            state.customActions = [];
            renderInlineAdminBar();
        },
        setStatus(message, tone = "muted") {
            state.statusOverride = message
                ? { message: String(message), tone: tone || "muted" }
                : null;
            renderInlineAdminBar();
        },
        clearStatus() {
            state.statusOverride = null;
            renderInlineAdminBar();
        },
        openEditor(options = {}) {
            ui.editor?.open(options);
        },
        closeEditor() {
            ui.editor?.close();
        },
        clearSelection() {
            state.selection = null;
            syncSelectedTargetClass();
            renderInlineAdminBar();
        },
        refresh() {
            refreshSelectionTargets();
            renderInlineAdminBar();
        },
        getElement() {
            return ui.bar || null;
        },
        getPageContext() {
            return state.pageContext;
        },
    };
}

function bindSelectionModel() {
    document.addEventListener("click", handleSelectableInteraction, true);
    document.addEventListener("focusin", handleSelectableInteraction);
}

function handleSelectableInteraction(event) {
    const target = event.target;
    if (!(target instanceof Element)) {
        return;
    }

    if (target.closest("[data-admin-inline-bar]") || target.closest("[data-admin-editor-panel]")) {
        return;
    }

    const selectable = target.closest("[data-admin-entity][data-admin-id]");
    if (!(selectable instanceof HTMLElement)) {
        return;
    }

    const nextSelection = {
        entity: String(selectable.dataset.adminEntity || "").trim(),
        id: String(selectable.dataset.adminId || "").trim(),
        element: selectable,
    };

    if (!nextSelection.entity || !nextSelection.id) {
        return;
    }

    if (state.selection?.entity === nextSelection.entity && state.selection?.id === nextSelection.id) {
        return;
    }

    state.selection = nextSelection;
    state.statusOverride = null;
    syncSelectedTargetClass();
    renderInlineAdminBar();
}

function refreshSelectionTargets() {
    document.querySelectorAll("[data-admin-entity][data-admin-id]").forEach((element) => {
        element.classList.add("admin-content-target");
    });
    syncSelectedTargetClass();
}

function syncSelectedTargetClass() {
    document.querySelectorAll(".admin-content-target.is-admin-selected").forEach((element) => {
        element.classList.remove("is-admin-selected");
    });

    if (state.selection?.element instanceof HTMLElement && document.contains(state.selection.element)) {
        state.selection.element.classList.add("is-admin-selected");
        return;
    }

    if (state.selection?.entity && state.selection?.id) {
        const element = document.querySelector(`[data-admin-entity="${state.selection.entity}"][data-admin-id="${state.selection.id}"]`);
        if (element instanceof HTMLElement) {
            state.selection.element = element;
            element.classList.add("is-admin-selected");
        }
    }
}

function normalizeActions(actions = []) {
    return (Array.isArray(actions) ? actions : [actions])
        .map((action) => normalizeAction(action))
        .filter(Boolean);
}

function normalizeAction(action) {
    if (!action || typeof action !== "object") {
        return null;
    }

    const label = String(action.label || "").trim();
    if (!label) {
        return null;
    }

    return {
        label,
        href: action.href ? String(action.href) : "",
        variant: action.variant === "primary" ? "primary" : "secondary",
        current: Boolean(action.current),
        disabled: Boolean(action.disabled),
        onClick: typeof action.onClick === "function" ? action.onClick : null,
    };
}

function renderInlineAdminBar() {
    if (!(ui.bar instanceof HTMLElement) || !(ui.title instanceof HTMLElement) || !(ui.status instanceof HTMLElement)) {
        return;
    }

    const barState = getInlineBarState();
    ui.title.textContent = barState.title;
    ui.status.textContent = barState.status;
    ui.status.className = `admin-inline-bar-status is-${barState.tone}`;
    renderBarActions(barState.actions);
}

function getInlineBarState() {
    const currentUser = window.authStorage?.getCurrentUser?.() || null;
    const statusOverride = state.statusOverride;

    if (!currentUser) {
        return {
            title: "Inline authoring is available on this shared page.",
            status: statusOverride?.message || "Sign in from the shared header to unlock admin tools.",
            tone: statusOverride?.tone || "muted",
            actions: getBuiltInActions(),
        };
    }

    if (!canAccessAdmin(state.permissionContext)) {
        ui.editor?.close();
        return {
            title: "Inline authoring is locked for this account.",
            status: statusOverride?.message || "This account can view the route but does not currently have admin access.",
            tone: statusOverride?.tone || "muted",
            actions: getBuiltInActions(),
        };
    }

    if (isPermissionsRoute()) {
        ui.editor?.close();
        return {
            title: "Permissions management",
            status: statusOverride?.message || "Permissions management stays separate from the shared content pages.",
            tone: statusOverride?.tone || "muted",
            actions: getBuiltInActions(),
        };
    }

    state.pageContext = resolveAdminPageContext({ selection: state.selection });

    const authoringState = resolveAdminAuthoringState({
        context: state.pageContext,
        permissionContext: state.permissionContext,
        openEditor(options) {
            ui.editor?.open(options);
        },
        customActions: state.customActions,
    });

    return {
        title: authoringState.title,
        status: statusOverride?.message || authoringState.status,
        tone: statusOverride?.tone || authoringState.tone,
        actions: [
            ...authoringState.actions,
            ...getBuiltInActions(),
        ],
    };
}

function getBuiltInActions() {
    const permissionsHref = getPermissionsHref();
    const canManagePermissionsUi = hasPermission(state.permissionContext, "permissions.manage")
        || hasPermission(state.permissionContext, "users.manage");

    if (!canManagePermissionsUi) {
        return [];
    }

    if (isPermissionsRoute()) {
        return [
            {
                label: "Permissions",
                current: true,
            },
        ];
    }

    return [
        {
            label: "Permissions",
            href: permissionsHref,
            variant: "primary",
        },
    ];
}

function renderBarActions(actions = []) {
    if (!(ui.actions instanceof HTMLElement)) {
        return;
    }

    ui.actions.replaceChildren();

    actions.forEach((action) => {
        const element = createActionElement(action);
        if (element) {
            ui.actions.appendChild(element);
        }
    });
}

function createActionElement(action) {
    if (action.current) {
        const badge = document.createElement("span");
        badge.className = getActionClassName(action);
        badge.textContent = action.label;
        return badge;
    }

    if (action.href) {
        const link = document.createElement("a");
        link.className = getActionClassName(action);
        link.href = action.href;
        link.textContent = action.label;
        if (action.disabled) {
            link.setAttribute("aria-disabled", "true");
            link.tabIndex = -1;
        }
        return link;
    }

    const button = document.createElement("button");
    button.type = "button";
    button.className = getActionClassName(action);
    button.textContent = action.label;
    button.disabled = action.disabled;
    if (action.onClick) {
        button.addEventListener("click", action.onClick);
    }
    return button;
}

function getActionClassName(action) {
    const classNames = ["admin-inline-bar-link"];
    if (action.variant === "primary") {
        classNames.push("is-primary");
    }
    if (action.current) {
        classNames.push("is-current");
    }
    return classNames.join(" ");
}

function getPermissionsHref() {
    return window.APP_ROUTES?.admin?.permissions || "/admin/permissions/index.html";
}

function isPermissionsRoute() {
    const currentPath = window.location.pathname.replace(/\/$/, "");
    const permissionsPath = getPermissionsHref().replace(/\/index\.html$/, "");
    return currentPath === permissionsPath || currentPath === `${permissionsPath}/index.html`;
}
