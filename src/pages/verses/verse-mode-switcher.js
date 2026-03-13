import "./verses-page.js";

(() => {
    const routes = window.APP_ROUTES;
    const select = document.getElementById("verseModeSelect");
    if (!select || !routes) return;

    const currentPath = window.location.pathname || routes.verses.index;
    const normalizedCurrentPath =
        currentPath === routes.verses.sanskritEnglishExplicit ? routes.verses.index : currentPath;
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
})();
