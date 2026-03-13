import {
    createInsightDropdown,
    createRouteHref,
    DEFAULT_INSIGHT_MEDIA,
} from "./renderer-utils.js";
import { initializeContentInteractions } from "../ui/content-interactions.js";

function createBookCard(book, index, queryApi, routeResolver) {
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

    const insightPanel = createInsightDropdown({
        wrapperClassName: "book-row-insight",
        buttonId: `bookInsightToggle${index}`,
        panelId: `bookInsightPanel${index}`,
        buttonClassName: "book-insight-btn",
        headingTag: "h3",
        title: book.insight_title || book.title,
        image: book.insight_media,
        alt: `${book.title} thumbnail`,
        caption: book.insight_caption,
        fallbackMedia: DEFAULT_INSIGHT_MEDIA,
    });

    if (insightPanel) {
        card.append(insightPanel);
    }

    return card;
}

export function renderBooksCollection({
    container,
    queryApi,
    routeResolver,
    books = null,
}) {
    if (!container || !queryApi) return;

    const records = books || queryApi.listPublishedBooks();
    container.innerHTML = "";

    records.forEach((book, index) => {
        container.appendChild(createBookCard(book, index + 1, queryApi, routeResolver));
    });

    initializeContentInteractions(container);
}
