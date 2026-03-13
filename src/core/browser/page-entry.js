import "../config/routes.js";
import { resolveSharedPageRoute } from "../config/route-registry.js";
import { getSharedPageDefinition } from "../../pages/index.js";

initializeSharedPage().catch((error) => {
    console.error("Failed to boot the shared page runtime.", error);
    renderRuntimeError(error.message || "Unknown error.");
});

async function initializeSharedPage() {
    const route = resolveSharedPageRoute(window.location.pathname, new URLSearchParams(window.location.search));
    const page = route ? getSharedPageDefinition(route.id) : null;

    if (!route || !page) {
        throw new Error(`No shared page is registered for ${window.location.pathname}.`);
    }

    const pageContext = createPageContext(route);
    window.APP_PAGE_CONTEXT = pageContext;
    applyPageDocumentState(page, route.mode);
    document.body.innerHTML = page.render(pageContext);
    document.title = page.title;

    await import("./public-shell.js");
    await page.init(pageContext);

    if (route.mode === "admin") {
        await import("../../admin/admin-controller.js");
    }
}

function createPageContext(route) {
    return Object.freeze({
        mode: route.mode,
        route,
        routes: window.APP_ROUTES,
        routeResolver: window.resolveAppRoute,
    });
}

function applyPageDocumentState(page, mode) {
    const body = document.body;
    if (!body) return;

    body.className = page.bodyClasses.join(" ");

    Object.keys(body.dataset).forEach((key) => {
        delete body.dataset[key];
    });

    body.dataset.pageId = page.id;
    body.dataset.pageMode = mode;

    Object.entries(page.bodyDataset).forEach(([key, value]) => {
        body.dataset[key] = value;
    });
}

function renderRuntimeError(message) {
    document.title = "Bhagavad Gita | Page Unavailable";
    document.body.className = "";
    document.body.innerHTML = `
        <main style="min-height:100vh;display:grid;place-items:center;padding:24px;font-family:Georgia,serif;background:#f5efe2;color:#2d2418;">
            <section style="max-width:560px;padding:24px 28px;border:1px solid rgba(96,72,38,0.16);border-radius:24px;background:rgba(255,251,244,0.96);box-shadow:0 24px 60px rgba(37,24,10,0.12);">
                <p style="margin:0 0 8px;font-size:0.76rem;letter-spacing:0.14em;text-transform:uppercase;opacity:0.7;">Shared Page Runtime</p>
                <h1 style="margin:0;font-size:1.35rem;">Unable to render this page</h1>
                <p style="margin:12px 0 0;line-height:1.6;">${escapeHtml(message)}</p>
            </section>
        </main>
    `;
}

function escapeHtml(value) {
    return String(value ?? "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#39;");
}
