import { normalizeVerseMode } from "../../core/config/route-registry.js";

export function initializeVerseModeSwitcher(routes = window.APP_ROUTES) {
    const select = document.getElementById("verseModeSelect");
    if (!select || !routes) return;

    const currentMode = normalizeVerseMode(new URLSearchParams(window.location.search).get("mode"));
    select.value = currentMode;

    select.addEventListener("change", () => {
        const nextMode = normalizeVerseMode(select.value);
        if (nextMode === currentMode) return;

        try {
            const url = new URL(window.location.href);
            if (nextMode === "sanskrit-english") {
                url.searchParams.delete("mode");
            } else {
                url.searchParams.set("mode", nextMode);
            }
            window.location.href = `${url.pathname}${url.search}`;
        } catch {
            const fallbackPath = routes.verses.byMode(nextMode) || routes.verses.index;
            window.location.href = fallbackPath;
        }
    });
}
