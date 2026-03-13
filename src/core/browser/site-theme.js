(() => {
    const storageKey = "site-theme";
    const root = document.documentElement;
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)");
    const existingToggle = document.getElementById("themeToggle");
    const topbar = document.querySelector(".topbar");
    const mobileHeaderQuery = window.matchMedia("(max-width: 1024px)");

    function createToggleMarkup() {
        const button = document.createElement("button");
        button.id = "themeToggle";
        button.className = "theme-toggle";
        button.type = "button";
        button.setAttribute("aria-pressed", "false");
        button.setAttribute("aria-label", "Switch to dark theme");
        button.innerHTML = `
            <span class="theme-toggle-track" aria-hidden="true">
                <span class="theme-toggle-thumb"></span>
            </span>
            <span class="theme-toggle-label">Dark</span>
        `;
        return button;
    }

    function createMenuButton() {
        const button = document.createElement("button");
        button.className = "menu-toggle";
        button.type = "button";
        button.setAttribute("aria-expanded", "false");
        button.setAttribute("aria-label", "Open navigation menu");
        button.innerHTML = `
            <span class="menu-toggle-line" aria-hidden="true"></span>
            <span class="menu-toggle-line" aria-hidden="true"></span>
            <span class="menu-toggle-line" aria-hidden="true"></span>
        `;
        return button;
    }

    function ensureHeaderToggle() {
        if (existingToggle) return existingToggle;
        if (!topbar) return null;

        const nav = topbar.querySelector("nav");
        if (!nav) return null;

        let actions = topbar.querySelector(".topbar-actions");
        if (!actions) {
            actions = document.createElement("div");
            actions.className = "topbar-actions";
            topbar.appendChild(actions);
        }

        if (!actions.contains(nav)) {
            actions.prepend(nav);
        }

        const injectedToggle = createToggleMarkup();
        actions.appendChild(injectedToggle);
        return injectedToggle;
    }

    const toggle = ensureHeaderToggle();
    const label = toggle ? toggle.querySelector(".theme-toggle-label") : null;
    let actions = topbar ? topbar.querySelector(".topbar-actions") : null;
    let menuButton = topbar ? topbar.querySelector(".menu-toggle") : null;
    const educationGroup = topbar ? topbar.querySelector(".education-group") : null;
    const educationMenu = educationGroup ? educationGroup.querySelector(".nav-dropdown-menu") : null;

    function enhanceEducationMenu() {
        if (!educationMenu) return;

        educationMenu.querySelectorAll(".mega-menu-group").forEach((group, index) => {
            if (group.querySelector(".mega-menu-group-toggle")) return;

            const title = group.querySelector(".mega-menu-title");
            const links = Array.from(group.querySelectorAll(":scope > a"));
            if (!title || links.length === 0) return;

            const label = title.textContent.trim();
            const submenuId = `educationSubmenu${index + 1}`;
            const toggle = document.createElement("button");
            const titleSpan = document.createElement("span");
            const caret = document.createElement("span");
            const submenu = document.createElement("div");

            toggle.type = "button";
            toggle.className = "mega-menu-group-toggle";
            toggle.setAttribute("aria-expanded", "false");
            toggle.setAttribute("aria-controls", submenuId);

            titleSpan.className = "mega-menu-title";
            titleSpan.textContent = label;

            caret.className = "nav-caret";
            caret.setAttribute("aria-hidden", "true");

            toggle.append(titleSpan, caret);

            submenu.className = "mega-menu-submenu";
            submenu.id = submenuId;

            links.forEach((link) => submenu.appendChild(link));

            title.replaceWith(toggle);
            group.append(submenu);
        });
    }

    enhanceEducationMenu();

    if (topbar && actions && !menuButton) {
        menuButton = createMenuButton();
        topbar.appendChild(menuButton);
    }

    if (actions) {
        if (!actions.id) actions.id = "topbarMenu";
        actions.setAttribute("data-open", "false");
    }

    if (menuButton && actions) {
        menuButton.setAttribute("aria-controls", actions.id);
    }

    function applyTheme(theme) {
        const isDark = theme === "dark";
        root.setAttribute("data-theme", isDark ? "dark" : "light");
        if (toggle) {
            toggle.setAttribute("aria-pressed", String(isDark));
            toggle.setAttribute(
                "aria-label",
                isDark ? "Switch to light theme" : "Switch to dark theme"
            );
            if (label) label.textContent = isDark ? "Light" : "Dark";
        }
    }

    function getInitialTheme() {
        const stored = localStorage.getItem(storageKey);
        if (stored === "light" || stored === "dark") return stored;
        return prefersDark.matches ? "dark" : "light";
    }

    function closeMenu() {
        if (!topbar || !actions || !menuButton) return;
        topbar.classList.remove("menu-open");
        actions.setAttribute("data-open", "false");
        menuButton.setAttribute("aria-expanded", "false");
        menuButton.setAttribute("aria-label", "Open navigation menu");
    }

    function closeEducationMenu() {
        if (!educationGroup) return;
        if (educationMenu) {
            educationMenu.querySelectorAll(".mega-menu-group").forEach((group) => {
                group.classList.remove("is-open");
                const toggle = group.querySelector(".mega-menu-group-toggle");
                if (toggle) toggle.setAttribute("aria-expanded", "false");
            });
        }
        educationGroup.classList.remove("is-open");
        const button = educationGroup.querySelector(".nav-dropdown-toggle");
        if (button) button.setAttribute("aria-expanded", "false");
    }

    function toggleEducationMenu() {
        if (!educationGroup) return;
        const isOpen = educationGroup.classList.contains("is-open");
        closeEducationMenu();
        if (isOpen) return;
        educationGroup.classList.add("is-open");
        const button = educationGroup.querySelector(".nav-dropdown-toggle");
        if (button) button.setAttribute("aria-expanded", "true");
    }

    function openMenu() {
        if (!topbar || !actions || !menuButton) return;
        topbar.classList.add("menu-open");
        actions.setAttribute("data-open", "true");
        menuButton.setAttribute("aria-expanded", "true");
        menuButton.setAttribute("aria-label", "Close navigation menu");
    }

    function syncMenuForViewport() {
        if (!actions) return;
        if (mobileHeaderQuery.matches) {
            closeMenu();
        } else {
            if (topbar) topbar.classList.remove("menu-open");
            actions.removeAttribute("data-open");
            if (menuButton) {
                menuButton.setAttribute("aria-expanded", "false");
                menuButton.setAttribute("aria-label", "Open navigation menu");
            }
        }
        closeEducationMenu();
    }

    window.sharedLayout = {
        closeMenu,
        closeEducationMenu,
        openMenu,
    };

    applyTheme(getInitialTheme());
    syncMenuForViewport();

    if (!toggle) return;

    toggle.addEventListener("click", () => {
        const currentTheme = root.getAttribute("data-theme") === "dark" ? "dark" : "light";
        const nextTheme = currentTheme === "dark" ? "light" : "dark";
        applyTheme(nextTheme);
        localStorage.setItem(storageKey, nextTheme);
    });

    if (menuButton && actions && topbar) {
        menuButton.addEventListener("click", () => {
            const expanded = menuButton.getAttribute("aria-expanded") === "true";
            if (expanded) {
                closeMenu();
            } else {
                openMenu();
            }
        });

        actions.querySelectorAll("a, button").forEach((element) => {
            if (element === menuButton) return;
            element.addEventListener("click", () => {
                if (
                    element.classList.contains("nav-dropdown-toggle") ||
                    element.classList.contains("mega-menu-group-toggle") ||
                    element.closest(".nav-dropdown-toggle")
                ) {
                    return;
                }
                if (mobileHeaderQuery.matches) closeMenu();
                closeEducationMenu();
            });
        });
    }

    if (educationGroup) {
        const button = educationGroup.querySelector(".nav-dropdown-toggle");
        if (button) {
            button.addEventListener("click", (event) => {
                event.preventDefault();
                event.stopPropagation();
                toggleEducationMenu();
            });
        }
    }

    if (educationMenu) {
        educationMenu.querySelectorAll(".mega-menu-group").forEach((group) => {
            const toggle = group.querySelector(".mega-menu-group-toggle");
            if (!toggle) return;

            toggle.addEventListener("click", (event) => {
                if (!mobileHeaderQuery.matches) return;
                event.preventDefault();
                event.stopPropagation();
                const isOpen = group.classList.contains("is-open");
                group.classList.toggle("is-open", !isOpen);
                toggle.setAttribute("aria-expanded", String(!isOpen));
            });
        });
    }

    document.addEventListener("click", (event) => {
        if (!topbar) return;
        if (topbar.contains(event.target)) return;
        closeEducationMenu();
    });

    document.addEventListener("keydown", (event) => {
        if (event.key === "Escape") {
            closeEducationMenu();
            if (mobileHeaderQuery.matches) closeMenu();
        }
    });

    if (typeof mobileHeaderQuery.addEventListener === "function") {
        mobileHeaderQuery.addEventListener("change", syncMenuForViewport);
    } else if (typeof mobileHeaderQuery.addListener === "function") {
        mobileHeaderQuery.addListener(syncMenuForViewport);
    }
})();
