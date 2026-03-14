import {
    DEFAULT_INSIGHT_MEDIA,
    createRouteHref,
} from "./renderer-utils.js";
import { initializeContentInteractions } from "../ui/content-interactions.js";
import { renderRegion } from "../../render/layout/region-renderer.js";

function appendInsightRegion(parent, blocks, renderOptions) {
    const host = document.createElement("div");
    renderRegion(host, blocks, {
        renderOptions,
    });

    if (host.childElementCount) {
        parent.append(...Array.from(host.children));
    }
}

function createBookCard(pageModel, index, queryApi, routeResolver) {
    const book = pageModel.book;
    const counts = queryApi.getBookCounts(book.id);
    const card = document.createElement("article");
    card.className = "book-card";
    card.setAttribute("role", "listitem");
    card.dataset.adminEntity = "books";
    card.dataset.adminId = book.id;
    card.dataset.adminSlug = book.slug;

    const main = document.createElement("div");
    main.className = "book-card-main";

    const left = document.createElement("div");
    left.className = "book-card-left";

    const lotus = document.createElement("span");
    lotus.className = "book-row-lotus";
    lotus.setAttribute("aria-hidden", "true");

    const text = document.createElement("div");
    text.className = "book-row-text";

    const indexLine = document.createElement("p");
    indexLine.className = "book-row-index";
    indexLine.textContent = `Book ${index}`;

    const title = document.createElement("p");
    title.className = "book-row-title";
    title.textContent = book.title;

    const meta = document.createElement("p");
    meta.className = "book-row-meta";
    meta.textContent = book.description;

    text.append(indexLine, title, meta);
    left.append(lotus, text);

    const actions = document.createElement("div");
    actions.className = "book-row-actions";

    const statLine = document.createElement("p");
    statLine.className = "book-stat-line";
    statLine.textContent = `${counts.chapter_count} Chapters - ${counts.verse_count} Verses`;

    const openLink = document.createElement("a");
    openLink.className = "book-open-btn";
    openLink.href = createRouteHref(routeResolver, "chapters.index", { book: book.slug });
    openLink.textContent = "Open Book";

    actions.append(statLine, openLink);
    main.append(left, actions);
    card.append(main);

    appendInsightRegion(card, pageModel.regions.insight, {
        presentation: "insight-dropdown",
        wrapperClassName: "book-row-insight",
        buttonId: `bookInsightToggle${index}`,
        panelId: `bookInsightPanel${index}`,
        buttonClassName: "book-insight-btn",
        headingTag: "h3",
        fallbackTitle: book.title,
        alt: `${book.title} thumbnail`,
        fallbackMedia: DEFAULT_INSIGHT_MEDIA,
    });

    return card;
}

export function renderBooksCollection({
    container,
    queryApi,
    routeResolver,
    pageModels = [],
}) {
    if (!container || !queryApi) return;

    container.innerHTML = "";

    pageModels.forEach((pageModel, index) => {
        container.appendChild(createBookCard(pageModel, index + 1, queryApi, routeResolver));
    });

    initializeContentInteractions(container);
}
