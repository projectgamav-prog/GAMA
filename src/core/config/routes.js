import {
    CANONICAL_PUBLIC_PATHS,
    buildPathWithQuery,
    normalizeVerseMode,
} from "./route-registry.js";

(function () {
    const existingContext = window.APP_CONTEXT || {};
    const mode = existingContext.mode === "admin" ? "admin" : "public";
    const routeBase = mode === "admin" ? "/admin" : "";
    const withBase = (path, query = {}) => buildPathWithQuery(`${routeBase}${path}`, query);

    const routes = {
        home: withBase(CANONICAL_PUBLIC_PATHS.home),
        books: {
            index: withBase(CANONICAL_PUBLIC_PATHS.books),
            gita: withBase(CANONICAL_PUBLIC_PATHS.chapters),
        },
        chapters: {
            index: withBase(CANONICAL_PUBLIC_PATHS.chapters),
        },
        verses: {
            index: withBase(CANONICAL_PUBLIC_PATHS.verses),
            sanskritEnglish: withBase(CANONICAL_PUBLIC_PATHS.verses),
            sanskritHindi: withBase(CANONICAL_PUBLIC_PATHS.verses, { mode: "sanskrit-hindi" }),
            englishOnly: withBase(CANONICAL_PUBLIC_PATHS.verses, { mode: "english-only" }),
            hindiOnly: withBase(CANONICAL_PUBLIC_PATHS.verses, { mode: "hindi-only" }),
            byMode(modeName) {
                const normalizedMode = normalizeVerseMode(modeName);
                return normalizedMode === "sanskrit-english"
                    ? this.index
                    : withBase(CANONICAL_PUBLIC_PATHS.verses, { mode: normalizedMode });
            },
        },
        explanations: {
            index: withBase(CANONICAL_PUBLIC_PATHS.explanations),
        },
        characters: {
            index: withBase(CANONICAL_PUBLIC_PATHS.characters),
            bySlug(slug) {
                return withBase(CANONICAL_PUBLIC_PATHS.characters, { slug });
            },
        },
        topics: {
            index: withBase(CANONICAL_PUBLIC_PATHS.topics),
        },
        places: {
            index: withBase(CANONICAL_PUBLIC_PATHS.places),
        },
        profile: {
            index: withBase(CANONICAL_PUBLIC_PATHS.profile),
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
