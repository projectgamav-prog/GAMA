(() => {
    const existingContext = window.APP_CONTEXT || {};
    window.APP_CONTEXT = {
        ...existingContext,
        mode: "admin",
    };
})();
