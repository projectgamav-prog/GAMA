function normalizeClassNames(classNames = []) {
    return Array.from(new Set((Array.isArray(classNames) ? classNames : [classNames]).filter(Boolean)));
}

function normalizeDataset(dataset = {}) {
    return Object.freeze(
        Object.entries(dataset).reduce((nextDataset, [key, value]) => {
            if (value == null || value === "") {
                return nextDataset;
            }

            nextDataset[key] = String(value);
            return nextDataset;
        }, {})
    );
}

function createNoopInit() {
    return async () => {};
}

export function createSharedPageDefinition({
    id,
    title,
    bodyClasses = [],
    bodyDataset = {},
    shellClassName = "",
    render,
    init,
}) {
    if (!id) {
        throw new Error("Shared page definitions require an id.");
    }

    if (!title) {
        throw new Error(`Shared page "${id}" requires a title.`);
    }

    if (typeof render !== "function") {
        throw new Error(`Shared page "${id}" requires a render(context) function.`);
    }

    return Object.freeze({
        id,
        title,
        bodyClasses: Object.freeze(normalizeClassNames(bodyClasses)),
        bodyDataset: normalizeDataset(bodyDataset),
        render(context = {}) {
            return renderSharedPageLayout({
                mainMarkup: String(render(context) ?? ""),
                shellClassName,
            });
        },
        init: typeof init === "function" ? init : createNoopInit(),
    });
}

export function renderSharedPageLayout({ mainMarkup, shellClassName = "" }) {
    const shellClassNames = normalizeClassNames(["page-shell", shellClassName]).join(" ");

    return `
        <div class="${shellClassNames}">
            <div data-shared-header></div>
            ${mainMarkup}
            <div data-shared-footer></div>
        </div>
    `;
}
