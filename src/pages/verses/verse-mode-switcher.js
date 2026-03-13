import { normalizeVerseMode } from "../../core/config/route-registry.js";

export function initializeVerseModeSwitcher(routes = window.APP_ROUTES) {
    const select = document.getElementById("verseModeSelect");
    if (!select || !routes) return;

    const modeToRoute = {
        "sanskrit-english": routes.verses.index,
        "sanskrit-hindi": routes.verses.sanskritHindi,
        "english-only": routes.verses.englishOnly,
        "hindi-only": routes.verses.hindiOnly,
    };
    const currentMode = normalizeVerseMode(new URLSearchParams(window.location.search).get("mode"));
    const normalizedCurrentPath = modeToRoute[currentMode] || routes.verses.index;
    select.value = normalizedCurrentPath;

    select.addEventListener("change", () => {
        const nextPage = select.value;
        if (!nextPage || nextPage === normalizedCurrentPath) return;

        try {
            const url = new URL(nextPage, window.location.origin);
            const currentParams = new URLSearchParams(window.location.search);
            currentParams.forEach((value, key) => {
                url.searchParams.set(key, value);
            });
            window.location.href = `${url.pathname}${url.search}`;
        } catch {
            window.location.href = nextPage;
        }
    });
}
