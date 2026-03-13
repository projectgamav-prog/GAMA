import { canAccessAdmin, hasPermission } from "../permissions/access.js";

const state = {
    permissionContext: null,
    customActions: [],
    statusOverride: null,
};

const ui = {};

if (window.APP_CONTEXT?.mode === "admin") {
    initializeAdminController();
}

async function initializeAdminController() {
    await window.authStorage?.ready;
    state.permissionContext = window.authStorage?.getPermissionContext?.() || null;

    document.body.classList.add("admin-mode-page");
    mountInlineAdminBar();
    exposeAdminChromeHooks();
    renderInlineAdminBar();

    window.addEventListener(window.authStorage?.AUTH_STATE_EVENT || "auth:statechange", () => {
        state.permissionContext = window.authStorage?.getPermissionContext?.() || null;
        renderInlineAdminBar();
    });
}

function mountInlineAdminBar() {
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

    if (header instanceof HTMLElement) {
        header.insertAdjacentElement("afterend", bar);
    } else {
        shell.prepend(bar);
    }

    ui.bar = bar;
    ui.title = bar.querySelector("#adminInlineBarTitle");
    ui.status = bar.querySelector("#adminInlineBarStatus");
    ui.actions = bar.querySelector("#adminInlineBarActions");
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
        refresh() {
            renderInlineAdminBar();
        },
        getElement() {
            return ui.bar || null;
        },
    };
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
    const actions = [
        ...getBuiltInActions(),
        ...state.customActions,
    ];

    if (!currentUser) {
        return {
            title: "Shared page is running in admin mode.",
            status: statusOverride?.message || "Sign in from the shared header to unlock admin tools.",
            tone: statusOverride?.tone || "muted",
            actions,
        };
    }

    const displayName = currentUser.fullName || currentUser.username || currentUser.email || "this account";

    if (!canAccessAdmin(state.permissionContext)) {
        return {
            title: `Signed in as ${displayName}.`,
            status: statusOverride?.message || "This account can view the route but does not currently have admin access.",
            tone: statusOverride?.tone || "muted",
            actions,
        };
    }

    if (isPermissionsRoute()) {
        return {
            title: `Signed in as ${displayName}.`,
            status: statusOverride?.message || "Permissions management stays separate from the shared content pages.",
            tone: statusOverride?.tone || "muted",
            actions,
        };
    }

    return {
        title: `Signed in as ${displayName}.`,
        status: statusOverride?.message || "The shared public UI is live here in admin mode. Page-specific actions can be attached later.",
        tone: statusOverride?.tone || "muted",
        actions,
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
