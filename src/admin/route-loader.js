const currentUrl = new URL(window.location.href);

loadAdminMirror().catch((error) => {
    console.error("Failed to load admin mirror.", error);
    document.body.innerHTML = `
        <main style="min-height:100vh;display:grid;place-items:center;padding:24px;font-family:Georgia,serif;background:#f5efe2;color:#2d2418;">
            <section style="max-width:560px;padding:24px 28px;border:1px solid rgba(96,72,38,0.16);border-radius:24px;background:rgba(255,251,244,0.96);box-shadow:0 24px 60px rgba(37,24,10,0.12);">
                <p style="margin:0 0 8px;font-size:0.76rem;letter-spacing:0.14em;text-transform:uppercase;opacity:0.7;">Admin Mirror</p>
                <h1 style="margin:0;font-size:1.35rem;">Unable to load the public page</h1>
                <p style="margin:12px 0 0;line-height:1.6;">${escapeHtml(error.message || "Unknown error.")}</p>
            </section>
        </main>
    `;
});

async function loadAdminMirror() {
    const sourcePath = getSourcePath(currentUrl);
    const response = await fetch(sourcePath, {
        cache: "no-store",
        headers: {
            Accept: "text/html",
        },
    });

    if (!response.ok) {
        throw new Error(`Failed to load ${sourcePath}: ${response.status}`);
    }

    const rawHtml = await response.text();
    const parser = new DOMParser();
    const sourceDocument = parser.parseFromString(rawHtml, "text/html");
    rewriteRelativeAssets(sourceDocument, sourcePath);
    injectAdminAssets(sourceDocument);

    document.open();
    document.write(`<!DOCTYPE html>\n${sourceDocument.documentElement.outerHTML}`);
    document.close();
}

function getSourcePath(url) {
    const pathname = url.pathname;
    const withoutAdmin = pathname === "/admin" ? "/" : pathname.replace(/^\/admin(?=\/|$)/, "") || "/";
    const normalizedPath = withoutAdmin === "/" ? "/index.html" : withoutAdmin.endsWith("/") ? `${withoutAdmin}index.html` : withoutAdmin;
    return `${normalizedPath}${url.search}${url.hash}`;
}

function rewriteRelativeAssets(documentNode, sourcePath) {
    const baseUrl = new URL(sourcePath, window.location.origin);
    const selectors = [
        ["script[src]", "src"],
        ["link[href]", "href"],
        ["img[src]", "src"],
        ["source[src]", "src"],
        ["form[action]", "action"],
    ];

    selectors.forEach(([selector, attribute]) => {
        documentNode.querySelectorAll(selector).forEach((element) => {
            const currentValue = element.getAttribute(attribute);
            if (!currentValue || isAbsoluteLike(currentValue)) return;
            const absoluteUrl = new URL(currentValue, baseUrl);
            element.setAttribute(attribute, `${absoluteUrl.pathname}${absoluteUrl.search}${absoluteUrl.hash}`);
        });
    });
}

function injectAdminAssets(documentNode) {
    const head = documentNode.head || documentNode.documentElement;
    const body = documentNode.body || documentNode.documentElement;

    const adminStyles = documentNode.createElement("link");
    adminStyles.rel = "stylesheet";
    adminStyles.href = "/src/admin/admin.css";
    head.appendChild(adminStyles);

    const contextScript = documentNode.createElement("script");
    contextScript.src = "/src/admin/context.js";

    const publicShellScript = Array.from(documentNode.querySelectorAll('script[src]')).find((script) => {
        const source = script.getAttribute("src") || "";
        return source.endsWith("/src/core/browser/public-shell.js");
    });

    if (publicShellScript) {
        publicShellScript.before(contextScript);
    } else {
        head.appendChild(contextScript);
    }

    const controllerScript = documentNode.createElement("script");
    controllerScript.type = "module";
    controllerScript.src = "/src/admin/admin-controller.js";
    body.appendChild(controllerScript);
}

function isAbsoluteLike(value) {
    return value.startsWith("/")
        || value.startsWith("#")
        || value.startsWith("http://")
        || value.startsWith("https://")
        || value.startsWith("data:")
        || value.startsWith("mailto:")
        || value.startsWith("tel:")
        || value.startsWith("javascript:");
}

function escapeHtml(value) {
    return String(value ?? "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#39;");
}
