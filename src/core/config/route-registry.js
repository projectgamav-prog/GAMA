export const CANONICAL_PUBLIC_PATHS = Object.freeze({
    home: "/index.html",
    books: "/books/index.html",
    chapters: "/chapters/index.html",
    verses: "/verses/index.html",
    explanations: "/explanations/index.html",
    characters: "/characters/index.html",
    topics: "/topics/index.html",
    places: "/places/index.html",
    profile: "/profile/index.html",
});

export const CANONICAL_ADMIN_PATHS = Object.freeze({
    home: "/admin/index.html",
    books: "/admin/books/index.html",
    chapters: "/admin/chapters/index.html",
    verses: "/admin/verses/index.html",
    explanations: "/admin/explanations/index.html",
    characters: "/admin/characters/index.html",
    topics: "/admin/topics/index.html",
    places: "/admin/places/index.html",
    profile: "/admin/profile/index.html",
    permissions: "/admin/permissions/index.html",
});

export const PUBLIC_ROUTE_MAP = Object.freeze([
    Object.freeze({ id: "home", label: "Home", publicPath: CANONICAL_PUBLIC_PATHS.home, adminPath: CANONICAL_ADMIN_PATHS.home }),
    Object.freeze({ id: "books", label: "Books", publicPath: CANONICAL_PUBLIC_PATHS.books, adminPath: CANONICAL_ADMIN_PATHS.books }),
    Object.freeze({ id: "chapters", label: "Chapters", publicPath: CANONICAL_PUBLIC_PATHS.chapters, adminPath: CANONICAL_ADMIN_PATHS.chapters }),
    Object.freeze({ id: "verses", label: "Verses", publicPath: CANONICAL_PUBLIC_PATHS.verses, adminPath: CANONICAL_ADMIN_PATHS.verses }),
    Object.freeze({ id: "explanations", label: "Explanations", publicPath: CANONICAL_PUBLIC_PATHS.explanations, adminPath: CANONICAL_ADMIN_PATHS.explanations }),
    Object.freeze({ id: "characters", label: "Characters", publicPath: CANONICAL_PUBLIC_PATHS.characters, adminPath: CANONICAL_ADMIN_PATHS.characters }),
    Object.freeze({ id: "topics", label: "Topics", publicPath: CANONICAL_PUBLIC_PATHS.topics, adminPath: CANONICAL_ADMIN_PATHS.topics }),
    Object.freeze({ id: "places", label: "Places", publicPath: CANONICAL_PUBLIC_PATHS.places, adminPath: CANONICAL_ADMIN_PATHS.places }),
    Object.freeze({ id: "profile", label: "Profile", publicPath: CANONICAL_PUBLIC_PATHS.profile, adminPath: CANONICAL_ADMIN_PATHS.profile }),
]);

const PUBLIC_ROUTE_LOOKUP = Object.freeze(
    Object.fromEntries(PUBLIC_ROUTE_MAP.map((route) => [route.publicPath, route]))
);

const ADMIN_ROUTE_LOOKUP = Object.freeze(
    Object.fromEntries(PUBLIC_ROUTE_MAP.map((route) => [route.adminPath, route]))
);

export const LEGACY_PUBLIC_REDIRECTS = Object.freeze([
    Object.freeze({ from: "/verses/sanskrit-english.html", to: CANONICAL_PUBLIC_PATHS.verses }),
    Object.freeze({ from: "/verses/sanskrit-hindi.html", to: CANONICAL_PUBLIC_PATHS.verses, query: Object.freeze({ mode: "sanskrit-hindi" }) }),
    Object.freeze({ from: "/verses/english-only.html", to: CANONICAL_PUBLIC_PATHS.verses, query: Object.freeze({ mode: "english-only" }) }),
    Object.freeze({ from: "/verses/hindi-only.html", to: CANONICAL_PUBLIC_PATHS.verses, query: Object.freeze({ mode: "hindi-only" }) }),
    Object.freeze({ from: "/characters/detail.html", to: CANONICAL_PUBLIC_PATHS.characters }),
]);

export const LEGACY_ADMIN_REDIRECTS = Object.freeze([
    Object.freeze({ from: "/admin/home/index.html", to: CANONICAL_ADMIN_PATHS.home }),
    Object.freeze({ from: "/admin/verses/sanskrit-english.html", to: CANONICAL_ADMIN_PATHS.verses }),
    Object.freeze({ from: "/admin/verses/sanskrit-hindi.html", to: CANONICAL_ADMIN_PATHS.verses, query: Object.freeze({ mode: "sanskrit-hindi" }) }),
    Object.freeze({ from: "/admin/verses/english-only.html", to: CANONICAL_ADMIN_PATHS.verses, query: Object.freeze({ mode: "english-only" }) }),
    Object.freeze({ from: "/admin/verses/hindi-only.html", to: CANONICAL_ADMIN_PATHS.verses, query: Object.freeze({ mode: "hindi-only" }) }),
    Object.freeze({ from: "/admin/characters/detail.html", to: CANONICAL_ADMIN_PATHS.characters }),
]);

export function normalizeVerseMode(mode) {
    const normalized = String(mode || "").trim().toLowerCase();
    if (normalized === "sanskrit-hindi" || normalized === "english-only" || normalized === "hindi-only") {
        return normalized;
    }

    return "sanskrit-english";
}

export function buildPathWithQuery(pathname, query = {}) {
    const params = new URLSearchParams();
    Object.entries(query).forEach(([key, value]) => {
        if (value == null || value === "") return;
        params.set(key, String(value));
    });

    const search = params.toString();
    return search ? `${pathname}?${search}` : pathname;
}

export function normalizeEntryPath(pathname = "/") {
    const normalizedPath = String(pathname || "/").trim() || "/";

    if (normalizedPath === "/") {
        return CANONICAL_PUBLIC_PATHS.home;
    }

    if (normalizedPath === "/admin") {
        return CANONICAL_ADMIN_PATHS.home;
    }

    if (normalizedPath.endsWith(".html")) {
        return normalizedPath;
    }

    if (normalizedPath.endsWith("/")) {
        return `${normalizedPath}index.html`;
    }

    return `${normalizedPath}/index.html`;
}

export function normalizeRouteRequest(pathname, searchParams, redirects) {
    const match = redirects.find((entry) => entry.from === pathname);
    if (!match) {
        return {
            pathname,
            searchParams: new URLSearchParams(searchParams),
        };
    }

    const nextSearch = new URLSearchParams(searchParams);
    Object.entries(match.query || {}).forEach(([key, value]) => {
        nextSearch.set(key, value);
    });

    return {
        pathname: match.to,
        searchParams: nextSearch,
    };
}

export function normalizePublicRequest(pathname, searchParams = new URLSearchParams()) {
    return normalizeRouteRequest(pathname, searchParams, LEGACY_PUBLIC_REDIRECTS);
}

export function normalizeAdminRequest(pathname, searchParams = new URLSearchParams()) {
    return normalizeRouteRequest(pathname, searchParams, LEGACY_ADMIN_REDIRECTS);
}

export function resolveSharedPageRoute(pathname, searchParams = new URLSearchParams()) {
    const mode = pathname === "/admin" || String(pathname || "").startsWith("/admin/") ? "admin" : "public";
    const normalizedPath = normalizeEntryPath(pathname);
    const normalizedRequest = mode === "admin"
        ? normalizeAdminRequest(normalizedPath, searchParams)
        : normalizePublicRequest(normalizedPath, searchParams);
    const route = mode === "admin"
        ? ADMIN_ROUTE_LOOKUP[normalizedRequest.pathname]
        : PUBLIC_ROUTE_LOOKUP[normalizedRequest.pathname];

    if (!route) {
        return null;
    }

    return Object.freeze({
        ...route,
        mode,
        pathname: normalizedRequest.pathname,
        searchParams: normalizedRequest.searchParams,
    });
}
