(function () {
    const existingContext = window.APP_CONTEXT || {};
    const mode = existingContext.mode === "admin" ? "admin" : "public";
    const routeBase = mode === "admin" ? "/admin" : "";
    const withBase = (path) => `${routeBase}${path}`;

    const routes = {
        home: withBase("/index.html"),
        books: {
            index: withBase("/books/index.html"),
            gita: withBase("/chapters/index.html"),
        },
        chapters: {
            index: withBase("/chapters/index.html"),
        },
        verses: {
            index: withBase("/verses/index.html"),
            sanskritEnglish: withBase("/verses/index.html"),
            sanskritEnglishExplicit: withBase("/verses/sanskrit-english.html"),
            sanskritHindi: withBase("/verses/sanskrit-hindi.html"),
            englishOnly: withBase("/verses/english-only.html"),
            hindiOnly: withBase("/verses/hindi-only.html"),
        },
        explanations: {
            index: withBase("/explanations/index.html"),
        },
        characters: {
            index: withBase("/characters/index.html"),
            detailBase: withBase("/characters/detail.html"),
            bySlug(slug) {
                return `${this.detailBase}?slug=${encodeURIComponent(slug)}`;
            },
        },
        topics: {
            index: withBase("/topics/index.html"),
        },
        places: {
            index: withBase("/places/index.html"),
        },
        profile: {
            index: withBase("/profile/index.html"),
        },
        admin: {
            permissions: mode === "admin" ? withBase("/permissions/index.html") : "/admin/permissions/index.html",
        },
    };

    function resolveRoute(path, params = {}) {
        if (!path) return "";

        const segments = path.split(".");
        let value = routes;

        for (const segment of segments) {
            value = value?.[segment];
        }

        if (typeof value === "function") {
            return value(params.slug ?? "");
        }

        return typeof value === "string" ? value : "";
    }

    window.APP_CONTEXT = Object.freeze({
        ...existingContext,
        mode,
    });
    window.APP_ROUTES = routes;
    window.resolveAppRoute = resolveRoute;
})();
