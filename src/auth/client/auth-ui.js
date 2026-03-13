(() => {
    const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const INTEREST_OPTIONS = ["Books", "Characters", "Topics", "Places"];

    const body = document.body;
    const authShell = document.querySelector("[data-auth-shell]");
    const modalRoot = document.querySelector("[data-auth-modal-root]");
    const routes = window.APP_ROUTES;
    const storage = window.authStorage;

    if (!body || !authShell || !modalRoot || !routes || !storage) return;

    let activeModal = null;
    let accountMenuOpen = false;
    let lastFocusedElement = null;

    function closeSharedMenus() {
        if (window.sharedLayout?.closeEducationMenu) {
            window.sharedLayout.closeEducationMenu();
        }
    }

    function escapeHtml(value) {
        return String(value ?? "")
            .replaceAll("&", "&amp;")
            .replaceAll("<", "&lt;")
            .replaceAll(">", "&gt;")
            .replaceAll('"', "&quot;")
            .replaceAll("'", "&#39;");
    }

    function renderInterestCheckboxes(selected) {
        const selectedSet = new Set(selected || []);
        return INTEREST_OPTIONS.map((interest) => `
            <label class="auth-interest-option">
                <input type="checkbox" name="interests" value="${escapeHtml(interest)}" ${selectedSet.has(interest) ? "checked" : ""}>
                <span>${escapeHtml(interest)}</span>
            </label>
        `).join("");
    }

    function renderFieldError(fieldName, errors) {
        const message = errors?.[fieldName];
        return message ? `<p class="auth-field-error">${escapeHtml(message)}</p>` : "";
    }

    function renderAuthShell() {
        const user = storage.getCurrentUser();
        const canOpenAdmin = storage.canAccessAdmin();
        const canManagePermissions = storage.hasPermission("permissions.manage");

        if (!user) {
            authShell.innerHTML = `
                <div class="auth-guest-actions">
                    <button class="auth-link-btn auth-login-btn" type="button" data-auth-action="open-login">Login</button>
                    <button class="auth-link-btn auth-register-btn" type="button" data-auth-action="open-register">Register</button>
                </div>
            `;
            bindAuthShellEvents();
            return;
        }

        authShell.innerHTML = `
            <div class="auth-account-menu${accountMenuOpen ? " is-open" : ""}">
                <button
                    class="auth-menu-toggle"
                    type="button"
                    data-auth-action="toggle-account-menu"
                    aria-expanded="${accountMenuOpen}"
                    aria-controls="authAccountDropdown"
                >
                    <span class="auth-avatar" aria-hidden="true">${escapeHtml((user.username || "U").slice(0, 1).toUpperCase())}</span>
                    <span class="auth-username">${escapeHtml(user.username || user.fullName || "Account")}</span>
                    <span class="auth-caret" aria-hidden="true"></span>
                </button>
                <div class="auth-account-dropdown${accountMenuOpen ? " is-open" : ""}" id="authAccountDropdown" ${accountMenuOpen ? "" : "hidden"}>
                    <button type="button" class="auth-menu-item" data-auth-action="open-profile">Profile</button>
                    ${canOpenAdmin ? '<button type="button" class="auth-menu-item" data-auth-action="open-admin">Admin</button>' : ""}
                    ${canManagePermissions ? '<button type="button" class="auth-menu-item" data-auth-action="open-permissions">Permissions</button>' : ""}
                    <button type="button" class="auth-menu-item" data-auth-action="open-saved">Saved</button>
                    <button type="button" class="auth-menu-item auth-menu-item-danger" data-auth-action="logout">Logout</button>
                </div>
            </div>
        `;

        bindAuthShellEvents();
    }

    function syncAccountMenuDom() {
        const accountMenu = authShell.querySelector(".auth-account-menu");
        const toggleButton = authShell.querySelector(".auth-menu-toggle");
        const dropdown = authShell.querySelector(".auth-account-dropdown");

        if (!accountMenu || !toggleButton || !dropdown) return;

        accountMenu.classList.toggle("is-open", accountMenuOpen);
        dropdown.classList.toggle("is-open", accountMenuOpen);
        toggleButton.setAttribute("aria-expanded", String(accountMenuOpen));
        dropdown.hidden = !accountMenuOpen;
    }

    function setAccountMenuOpen(nextState) {
        accountMenuOpen = nextState;
        syncAccountMenuDom();
    }

    function renderLoginModal(errors = {}, values = {}, submitting = false) {
        return `
            <div class="auth-modal-header">
                <div>
                    <p class="auth-modal-eyebrow">Welcome back</p>
                    <h2 id="authDialogTitle">Login</h2>
                </div>
                <button class="auth-modal-close" type="button" data-auth-action="close-modal" aria-label="Close dialog">&times;</button>
            </div>
            <p class="auth-modal-copy">Sign in to access your profile and any admin permissions assigned to your account.</p>
            ${errors.general ? `<p class="auth-form-error" role="alert">${escapeHtml(errors.general)}</p>` : ""}
            <form class="auth-form" id="authLoginForm" novalidate>
                <label class="auth-field">
                    <span>Email</span>
                    <input type="email" name="email" autocomplete="email" value="${escapeHtml(values.email || "")}" required>
                    ${renderFieldError("email", errors)}
                </label>
                <label class="auth-field">
                    <span>Password</span>
                    <input type="password" name="password" autocomplete="current-password" required>
                    ${renderFieldError("password", errors)}
                </label>
                <button class="auth-submit-btn" type="submit" ${submitting ? "disabled" : ""}>${submitting ? "Logging In..." : "Login"}</button>
            </form>
            <p class="auth-switch-copy">Need an account? <button type="button" class="auth-inline-link" data-auth-action="switch-register">Register</button></p>
        `;
    }

    function renderRegisterModal(errors = {}, values = {}, submitting = false) {
        return `
            <div class="auth-modal-header">
                <div>
                    <p class="auth-modal-eyebrow">Create account</p>
                    <h2 id="authDialogTitle">Register</h2>
                </div>
                <button class="auth-modal-close" type="button" data-auth-action="close-modal" aria-label="Close dialog">&times;</button>
            </div>
            <p class="auth-modal-copy">Create an account to get a server-backed session and future personalized features.</p>
            ${errors.general ? `<p class="auth-form-error" role="alert">${escapeHtml(errors.general)}</p>` : ""}
            <form class="auth-form" id="authRegisterForm" novalidate>
                <div class="auth-form-grid">
                    <label class="auth-field">
                        <span>Full Name</span>
                        <input type="text" name="fullName" autocomplete="name" value="${escapeHtml(values.fullName || "")}" required>
                        ${renderFieldError("fullName", errors)}
                    </label>
                    <label class="auth-field">
                        <span>Username</span>
                        <input type="text" name="username" autocomplete="username" value="${escapeHtml(values.username || "")}" required>
                        ${renderFieldError("username", errors)}
                    </label>
                </div>
                <label class="auth-field">
                    <span>Email</span>
                    <input type="email" name="email" autocomplete="email" value="${escapeHtml(values.email || "")}" required>
                    ${renderFieldError("email", errors)}
                </label>
                <div class="auth-form-grid">
                    <label class="auth-field">
                        <span>Password</span>
                        <input type="password" name="password" autocomplete="new-password" required>
                        ${renderFieldError("password", errors)}
                    </label>
                    <label class="auth-field">
                        <span>Confirm Password</span>
                        <input type="password" name="confirmPassword" autocomplete="new-password" required>
                        ${renderFieldError("confirmPassword", errors)}
                    </label>
                </div>
                <fieldset class="auth-fieldset">
                    <legend>Interests</legend>
                    <div class="auth-interest-grid">
                        ${renderInterestCheckboxes(values.interests)}
                    </div>
                </fieldset>
                <button class="auth-submit-btn" type="submit" ${submitting ? "disabled" : ""}>${submitting ? "Creating..." : "Create Account"}</button>
            </form>
            <p class="auth-switch-copy">Already have an account? <button type="button" class="auth-inline-link" data-auth-action="switch-login">Login</button></p>
        `;
    }

    function renderSavedModal() {
        return `
            <div class="auth-modal-header">
                <div>
                    <p class="auth-modal-eyebrow">Saved items</p>
                    <h2 id="authDialogTitle">Saved</h2>
                </div>
                <button class="auth-modal-close" type="button" data-auth-action="close-modal" aria-label="Close dialog">&times;</button>
            </div>
            <div class="auth-placeholder-panel">
                <h3>Saved content is still coming next</h3>
                <p>Your account is now session-backed, but saved verses, characters, topics, and places are still reserved for a later pass.</p>
            </div>
        `;
    }

    function renderModalContent() {
        if (!activeModal) {
            modalRoot.innerHTML = "";
            return;
        }

        let content = "";
        if (activeModal.view === "login") content = renderLoginModal(activeModal.errors, activeModal.values, activeModal.submitting);
        if (activeModal.view === "register") content = renderRegisterModal(activeModal.errors, activeModal.values, activeModal.submitting);
        if (activeModal.view === "saved") content = renderSavedModal();

        modalRoot.innerHTML = `
            <div class="auth-modal-overlay">
                <div class="auth-modal-dialog" role="dialog" aria-modal="true" aria-labelledby="authDialogTitle">
                    ${content}
                </div>
            </div>
        `;

        focusFirstElement();
    }

    function openModal(view, errors = {}, values = {}, submitting = false) {
        lastFocusedElement = document.activeElement instanceof HTMLElement ? document.activeElement : null;
        activeModal = { view, errors, values, submitting };
        renderModalContent();
        closeSharedMenus();
        setAccountMenuOpen(false);
    }

    function closeModal() {
        activeModal = null;
        renderModalContent();
        if (lastFocusedElement) lastFocusedElement.focus();
    }

    function getFocusableElements() {
        return Array.from(
            modalRoot.querySelectorAll(
                'button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), a[href], [tabindex]:not([tabindex="-1"])'
            )
        ).filter((element) => element.offsetParent !== null);
    }

    function focusFirstElement() {
        const focusable = getFocusableElements();
        if (focusable[0]) focusable[0].focus();
    }

    function trapFocus(event) {
        if (!activeModal || event.key !== "Tab") return;

        const focusable = getFocusableElements();
        if (!focusable.length) return;

        const first = focusable[0];
        const last = focusable[focusable.length - 1];

        if (event.shiftKey && document.activeElement === first) {
            event.preventDefault();
            last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
            event.preventDefault();
            first.focus();
        }
    }

    function bindAuthShellEvents() {
        authShell.querySelectorAll("[data-auth-action]").forEach((element) => {
            element.addEventListener("click", (event) => {
                event.preventDefault();
                event.stopPropagation();
                handleAuthAction(element.dataset.authAction || "");
            });
        });
    }

    function handleAuthAction(action) {
        if (action === "open-login" || action === "switch-login") {
            openModal("login");
            return;
        }

        if (action === "open-register" || action === "switch-register") {
            openModal("register");
            return;
        }

        if (action === "toggle-account-menu") {
            setAccountMenuOpen(!accountMenuOpen);
            return;
        }

        if (action === "close-modal") {
            closeModal();
            return;
        }

        if (action === "open-profile") {
            setAccountMenuOpen(false);
            window.location.href = routes.profile.index;
            return;
        }

        if (action === "open-admin") {
            setAccountMenuOpen(false);
            window.location.href = routes.admin?.home || "/admin/index.html";
            return;
        }

        if (action === "open-permissions") {
            setAccountMenuOpen(false);
            window.location.href = routes.admin?.permissions || "/admin/permissions/index.html";
            return;
        }

        if (action === "open-saved") {
            setAccountMenuOpen(false);
            openModal("saved");
            return;
        }

        if (action === "logout") {
            storage.logout().finally(() => {
                accountMenuOpen = false;
                renderAuthShell();
                closeSharedMenus();
            });
        }
    }

    function validateLogin(values) {
        const errors = {};
        if (!values.email) errors.email = "Email is required.";
        else if (!EMAIL_PATTERN.test(values.email)) errors.email = "Enter a valid email address.";
        if (!values.password) errors.password = "Password is required.";
        return errors;
    }

    function validateRegister(values) {
        const errors = {};
        if (!values.fullName.trim()) errors.fullName = "Full name is required.";
        if (!values.username.trim()) errors.username = "Username is required.";
        if (!values.email.trim()) errors.email = "Email is required.";
        else if (!EMAIL_PATTERN.test(values.email)) errors.email = "Enter a valid email address.";
        if (!values.password) errors.password = "Password is required.";
        else if (values.password.length < 8) errors.password = "Password must be at least 8 characters.";
        if (!values.confirmPassword) errors.confirmPassword = "Please confirm your password.";
        else if (values.confirmPassword !== values.password) errors.confirmPassword = "Passwords do not match.";
        return errors;
    }

    async function handleLoginSubmit(form) {
        const formData = new FormData(form);
        const values = {
            email: String(formData.get("email") || "").trim(),
            password: String(formData.get("password") || ""),
        };

        const errors = validateLogin(values);
        if (Object.keys(errors).length) {
            openModal("login", errors, values);
            return;
        }

        openModal("login", {}, values, true);

        try {
            await storage.login(values);
            accountMenuOpen = false;
            renderAuthShell();
            closeModal();
        } catch (error) {
            openModal("login", { general: error.message }, values);
        }
    }

    async function handleRegisterSubmit(form) {
        const formData = new FormData(form);
        const values = {
            fullName: String(formData.get("fullName") || ""),
            username: String(formData.get("username") || ""),
            email: String(formData.get("email") || ""),
            password: String(formData.get("password") || ""),
            confirmPassword: String(formData.get("confirmPassword") || ""),
            interests: formData.getAll("interests").map(String),
        };

        const errors = validateRegister(values);
        if (Object.keys(errors).length) {
            openModal("register", errors, values);
            return;
        }

        openModal("register", {}, values, true);

        try {
            await storage.register(values);
            accountMenuOpen = false;
            renderAuthShell();
            closeModal();
        } catch (error) {
            openModal("register", { general: error.message }, values);
        }
    }

    document.addEventListener("click", (event) => {
        const target = event.target;
        if (!(target instanceof HTMLElement)) return;
        if (modalRoot.contains(target)) return;
        if (authShell.contains(target)) return;
        if (!accountMenuOpen) return;
        setAccountMenuOpen(false);
    });

    document.addEventListener("submit", (event) => {
        const target = event.target;
        if (!(target instanceof HTMLFormElement)) return;

        if (target.id === "authLoginForm") {
            event.preventDefault();
            handleLoginSubmit(target);
        }

        if (target.id === "authRegisterForm") {
            event.preventDefault();
            handleRegisterSubmit(target);
        }
    });

    modalRoot.addEventListener("click", (event) => {
        if (!(event.target instanceof HTMLElement)) return;
        const actionTarget = event.target.closest("[data-auth-action]");
        if (actionTarget instanceof HTMLElement) {
            event.preventDefault();
            event.stopPropagation();
            handleAuthAction(actionTarget.dataset.authAction || "");
            return;
        }
        if (!event.target.classList.contains("auth-modal-overlay")) return;
        closeModal();
    });

    window.addEventListener(storage.AUTH_STATE_EVENT, () => {
        renderAuthShell();
    });

    document.addEventListener("keydown", (event) => {
        if (event.key === "Escape") {
            if (accountMenuOpen) {
                setAccountMenuOpen(false);
            }

            if (activeModal) {
                closeModal();
                return;
            }
        }

        trapFocus(event);
    });

    window.authUI = {
        openLoginModal: () => openModal("login"),
        openRegisterModal: () => openModal("register"),
        getCurrentUser: () => storage.toPublicUser(storage.getCurrentUser()),
    };

    storage.ready.finally(() => {
        renderAuthShell();
        renderModalContent();
    });
})();
