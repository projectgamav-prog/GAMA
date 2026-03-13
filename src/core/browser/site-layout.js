(() => {
    const body = document.body;
    if (!body) return;
    const routes = window.APP_ROUTES;
    if (!routes) return;

    const NAV_ITEMS = {
        books: [
            { label: "All Books", href: routes.books.index, item: "books-all" },
            { label: "Bhagavad Gita", href: routes.books.gita, item: "books-gita" },
        ],
        characters: [
            { label: "All Characters", href: routes.characters.index, item: "characters-all" },
            { label: "Krishna", href: routes.characters.bySlug("krishna"), item: "character-krishna" },
            { label: "Jesus", href: routes.characters.bySlug("jesus"), item: "character-jesus" },
            { label: "Buddha", href: routes.characters.bySlug("buddha"), item: "character-buddha" },
            { label: "Shankar", href: routes.characters.bySlug("shankar"), item: "character-shankar" },
            { label: "Nanakdev", href: routes.characters.bySlug("nanakdev"), item: "character-nanakdev" },
        ],
        topics: [
            { label: "All Topics", href: routes.topics.index, item: "topics-all" },
            { label: "Topic 1", href: "#", item: "topic-1" },
            { label: "Topic 2", href: "#", item: "topic-2" },
            { label: "Topic 3", href: "#", item: "topic-3" },
        ],
        places: [
            { label: "All Places", href: routes.places.index, item: "places-all" },
            { label: "Place 1", href: "#", item: "place-1" },
            { label: "Place 2", href: "#", item: "place-2" },
            { label: "Place 3", href: "#", item: "place-3" },
        ],
    };

    const FOOTER_VARIANTS = {
        home: {
            wrapperClass: "",
            links: [
                { label: "About", href: "#" },
                { label: "Facebook", href: "#", aria: "Facebook", short: "f" },
                { label: "Twitter", href: "#", aria: "Twitter", short: "t" },
                { label: "Instagram", href: "#", aria: "Instagram", short: "o" },
            ],
            copyright: true,
        },
        books: {
            wrapperClass: "",
            links: [
                { label: "Books", href: routes.books.index },
                { label: "Daily Verse", href: routes.verses.index },
                { label: "About", href: "#" },
            ],
            social: true,
        },
        chapter: {
            wrapperClass: "chapter-footer",
            links: [
                { label: "About", href: "#" },
                { label: "Daily Verse", href: routes.verses.index },
                { label: "Contact", href: "#" },
            ],
            social: true,
            copyright: true,
        },
        verse: {
            wrapperClass: "verse-footer",
            links: [
                { label: "Chapters", href: routes.chapters.index },
                { label: "Daily Verse", href: routes.verses.index },
                { label: "About", href: "#" },
                { label: "Contact", href: "#" },
            ],
            social: true,
        },
        explanation: {
            wrapperClass: "explanation-footer",
            links: [
                { label: "Chapters", href: routes.chapters.index },
                { label: "Daily Verse", href: routes.verses.index },
                { label: "About", href: "#" },
                { label: "Contact", href: "#" },
            ],
            social: true,
            copyright: true,
        },
        characters: {
            wrapperClass: "",
            links: [
                { label: "Books", href: routes.books.index },
                { label: "Characters", href: routes.characters.index },
                { label: "About", href: "#" },
            ],
            social: true,
        },
        topics: {
            wrapperClass: "",
            links: [
                { label: "Books", href: routes.books.index },
                { label: "Topics", href: routes.topics.index },
                { label: "About", href: "#" },
            ],
            social: true,
        },
        places: {
            wrapperClass: "",
            links: [
                { label: "Books", href: routes.books.index },
                { label: "Places", href: routes.places.index },
                { label: "About", href: "#" },
            ],
            social: true,
        },
        profile: {
            wrapperClass: "",
            links: [
                { label: "Books", href: routes.books.index },
                { label: "Characters", href: routes.characters.index },
                { label: "About", href: "#" },
            ],
            social: true,
        },
    };

    function renderNavGroup(title, key, activeItem) {
        const links = NAV_ITEMS[key]
            .map((link) => {
                const activeClass = activeItem === link.item ? " class=\"active\"" : "";
                const aria = link.aria ? ` aria-label="${link.aria}"` : "";
                return `<a href="${link.href}"${activeClass}${aria}>${link.label}</a>`;
            })
            .join("");

        return `
            <section class="mega-menu-group" aria-labelledby="mega${title}Title">
                <p class="mega-menu-title" id="mega${title}Title">${title}</p>
                ${links}
            </section>
        `;
    }

    function getActiveEducationItem() {
        const explicitItem = body.dataset.educationItem;
        if (explicitItem) return explicitItem;

        const currentPath = window.location.pathname.replace(/\/$/, "");
        const canonicalCharacterPath = routes.characters.index.replace(/\/index\.html$/, "");
        if (currentPath === routes.characters.index || currentPath === canonicalCharacterPath) {
            const slug = new URLSearchParams(window.location.search).get("slug");
            if (slug && NAV_ITEMS.characters.some((link) => link.item === `character-${slug}`)) {
                return `character-${slug}`;
            }
            return "characters-all";
        }

        return "";
    }

    function renderHeader() {
        const headerMount = document.querySelector("[data-shared-header]");
        if (!headerMount) return;

        const navSection = body.dataset.navSection || "";
        const activeEducationItem = getActiveEducationItem();
        const hasSearchButton = body.dataset.headerSearch === "true";
        const educationActiveClass = navSection === "education" ? " active" : "";
        const homeActiveClass = navSection === "home" ? " class=\"active\"" : "";

        headerMount.outerHTML = `
            <header class="topbar">
                <div class="brand">
                    <span class="brand-mark" aria-hidden="true"></span>
                    <span class="brand-name">Bhagavad Gita</span>
                </div>
                <div class="topbar-actions">
                    <nav aria-label="Primary">
                        <a href="${routes.home}"${homeActiveClass}>Home</a>
                        <div class="nav-group education-group">
                            <button class="nav-dropdown-toggle${educationActiveClass}" type="button" aria-expanded="false" aria-controls="educationNavMenu">
                                <span>Education</span>
                                <span class="nav-caret" aria-hidden="true"></span>
                            </button>
                            <div class="nav-dropdown-menu mega-menu" id="educationNavMenu">
                                ${renderNavGroup("Books", "books", activeEducationItem)}
                                ${renderNavGroup("Characters", "characters", activeEducationItem)}
                                ${renderNavGroup("Topics", "topics", activeEducationItem)}
                                ${renderNavGroup("Places", "places", activeEducationItem)}
                            </div>
                        </div>
                    </nav>
                    <div class="auth-shell" data-auth-shell></div>
                    <button id="themeToggle" class="theme-toggle" type="button" aria-pressed="false" aria-label="Switch to dark theme">
                        <span class="theme-toggle-track" aria-hidden="true">
                            <span class="theme-toggle-thumb"></span>
                        </span>
                        <span class="theme-toggle-label">Dark</span>
                    </button>
                    ${hasSearchButton ? '<button class="search-btn" type="button" aria-label="Search">&#128269;</button>' : ""}
                </div>
            </header>
        `;
    }

    function renderFooterLinks(links) {
        return links
            .map((link) => {
                const label = link.short || link.label;
                const aria = link.aria ? ` aria-label="${link.aria}"` : "";
                return `<a href="${link.href}"${aria}>${label}</a>`;
            })
            .join("");
    }

    function renderFooter() {
        const footerMount = document.querySelector("[data-shared-footer]");
        if (!footerMount) return;

        const variantKey = body.dataset.footerVariant || "home";
        const variant = FOOTER_VARIANTS[variantKey] || FOOTER_VARIANTS.home;
        const footerClass = variant.wrapperClass ? `site-footer ${variant.wrapperClass}` : "site-footer";

        footerMount.outerHTML = `
            <footer class="${footerClass}">
                <div class="footer-divider" aria-hidden="true"></div>
                <span class="footer-lotus" aria-hidden="true"></span>
                <p class="footer-title">Bhagavad Gita</p>
                <nav class="footer-links" aria-label="Footer">
                    ${renderFooterLinks(variant.links)}
                </nav>
                ${variant.social ? `
                    <nav class="footer-links social-links" aria-label="Social links">
                        <a href="#" aria-label="Facebook">f</a>
                        <a href="#" aria-label="Twitter">t</a>
                        <a href="#" aria-label="Instagram">o</a>
                    </nav>
                ` : ""}
                ${variant.copyright ? '<p class="copyright">&copy; 2026 Bhagavad Gita</p>' : ""}
            </footer>
        `;
    }

    function ensureSharedAuthMount() {
        if (document.querySelector("[data-auth-modal-root]")) return;
        const modalRoot = document.createElement("div");
        modalRoot.setAttribute("data-auth-modal-root", "");
        document.body.appendChild(modalRoot);
    }

    function syncEducationNavigation() {
        const activeEducationItem = getActiveEducationItem();
        const educationLinks = Array.from(document.querySelectorAll(".mega-menu-group a"));

        educationLinks.forEach((link) => {
            const navItem = Object.values(NAV_ITEMS)
                .flat()
                .find((item) => item.href === link.getAttribute("href"));
            const isActive = Boolean(navItem && navItem.item === activeEducationItem);
            link.classList.toggle("active", isActive);
        });
    }

    renderHeader();
    renderFooter();
    ensureSharedAuthMount();

    window.sharedLayout = {
        ...(window.sharedLayout || {}),
        syncEducationNavigation,
    };
})();
