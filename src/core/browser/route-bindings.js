(() => {
    const resolveRoute = window.resolveAppRoute;
    if (typeof resolveRoute !== "function") return;

    function applyRoute(element) {
        const routeKey = element.dataset.route;
        if (!routeKey) return;

        const route = resolveRoute(routeKey, {
            slug: element.dataset.routeSlug,
        });

        if (!route) return;

        if (element instanceof HTMLOptionElement) {
            element.value = route;
            return;
        }

        if (element instanceof HTMLAnchorElement) {
            element.href = route;
            return;
        }

        if (element instanceof HTMLFormElement) {
            element.action = route;
        }
    }

    document.querySelectorAll("[data-route]").forEach((element) => {
        applyRoute(element);
    });
})();
