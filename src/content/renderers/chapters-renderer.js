import {
    DEFAULT_INSIGHT_MEDIA,
    createRouteHref,
} from "./renderer-utils.js";
import { initializeContentInteractions } from "../ui/content-interactions.js";
import { renderRegion } from "../../render/layout/region-renderer.js";

function formatBookTitle(book) {
    return book.short_title === "Bhagavad Gita" ? book.short_title : book.title;
}

function formatVerseCount(count) {
    return `${count} Verse${count === 1 ? "" : "s"}`;
}

function formatSectionRange(chapters) {
    if (!chapters.length) return "Chapters";

    const first = chapters[0].chapter_number;
    const last = chapters[chapters.length - 1].chapter_number;

    if (first === last) {
        return `Chapter ${first}`;
    }

    return `Chapters ${first}-${last}`;
}

function appendInsightRegion(parent, blocks, renderOptions) {
    const host = document.createElement("div");
    renderRegion(host, blocks, {
        renderOptions,
    });

    if (host.childElementCount) {
        parent.append(...Array.from(host.children));
    }
}

function createChapterCard(book, chapterEntry, indexSeed, queryApi, routeResolver) {
    const chapter = chapterEntry.record;
    const article = document.createElement("article");
    article.className = "chapter-list-item";
    article.setAttribute("role", "listitem");
    article.dataset.adminEntity = "chapters";
    article.dataset.adminId = chapter.id;
    article.dataset.adminParentEntity = "books";
    article.dataset.adminParentId = book.id;
    article.dataset.adminSourceBookId = chapter.source_book_id;

    const main = document.createElement("div");
    main.className = "chapter-list-main";

    const left = document.createElement("div");
    left.className = "chapter-list-left";

    const lotus = document.createElement("span");
    lotus.className = "chapter-row-lotus";
    lotus.setAttribute("aria-hidden", "true");

    const text = document.createElement("div");
    text.className = "chapter-row-text";

    const chapterIndex = document.createElement("p");
    chapterIndex.className = "chapter-row-index";
    chapterIndex.textContent = `Chapter ${chapter.chapter_number}`;

    const chapterTitle = document.createElement("p");
    chapterTitle.className = "chapter-row-title";
    chapterTitle.textContent = chapter.title;

    const verseCount = document.createElement("p");
    verseCount.className = "chapter-row-verses";
    verseCount.textContent = formatVerseCount(queryApi.getChapterVerseCount(chapter.id));

    text.append(chapterIndex, chapterTitle, verseCount);
    left.append(lotus, text);

    const actions = document.createElement("div");
    actions.className = "chapter-row-actions";

    const openLink = document.createElement("a");
    openLink.className = "chapter-open-btn";
    openLink.href = createRouteHref(routeResolver, "verses.index", {
        book: book.slug,
        chapter: chapter.slug,
    });
    openLink.textContent = "Open Chapter";

    const explanationLink = document.createElement("a");
    explanationLink.className = "chapter-explain-btn";
    explanationLink.href = createRouteHref(routeResolver, "explanations.index", {
        book: book.slug,
        chapter: chapter.slug,
    });
    explanationLink.textContent = "Explanation";

    actions.append(openLink, explanationLink);
    main.append(left, actions);

    article.append(main);
    appendInsightRegion(article, chapterEntry.regions.insight, {
        presentation: "insight-dropdown",
        wrapperClassName: "chapter-row-insight",
        buttonId: `chapterInsightToggle${indexSeed}`,
        panelId: `chapterInsightPanel${indexSeed}`,
        buttonClassName: "chapter-insight-btn",
        headingTag: "h3",
        fallbackTitle: chapter.title,
        alt: `${chapter.title} insight thumbnail`,
        fallbackMedia: DEFAULT_INSIGHT_MEDIA,
    });

    return article;
}

function createSectionCard(book, sectionEntry, sectionIndex, queryApi, routeResolver) {
    const section = sectionEntry.record;
    const chapters = sectionEntry.chapters;
    const details = document.createElement("details");
    details.className = "chapter-group-card";
    details.dataset.adminEntity = "book_sections";
    details.dataset.adminId = section.id;
    details.dataset.adminParentEntity = "books";
    details.dataset.adminParentId = book.id;
    details.dataset.adminSourceBookId = section.source_book_id;
    if (sectionIndex === 1) {
        details.open = true;
    }

    const summary = document.createElement("summary");
    summary.className = "chapter-group-summary";

    const meta = document.createElement("span");
    meta.className = "chapter-group-meta";
    meta.textContent = `Book Section ${sectionIndex}`;

    const name = document.createElement("span");
    name.className = "chapter-group-name";
    name.textContent = section.title;

    const range = document.createElement("span");
    range.className = "chapter-group-range";
    range.textContent = formatSectionRange(chapters);

    summary.append(meta, name, range);

    const body = document.createElement("div");
    body.className = "chapter-group-body";

    const copy = document.createElement("p");
    copy.className = "chapter-group-copy";
    copy.textContent = section.summary;

    const chapterList = document.createElement("div");
    chapterList.className = "chapter-list";
    chapterList.setAttribute("role", "list");

    chapters.forEach((chapterEntry, chapterIndex) => {
        chapterList.appendChild(createChapterCard(book, chapterEntry, sectionIndex * 100 + chapterIndex + 1, queryApi, routeResolver));
    });

    body.append(copy);
    appendInsightRegion(body, sectionEntry.regions.insight, {
        presentation: "insight-dropdown",
        wrapperClassName: "chapter-section-insight",
        buttonId: `chapterSectionInsightToggle${sectionIndex}`,
        panelId: `chapterSectionInsightPanel${sectionIndex}`,
        buttonClassName: "section-insight-btn",
        headingTag: "h3",
        fallbackTitle: section.title,
        alt: `${section.title} insight thumbnail`,
        fallbackMedia: DEFAULT_INSIGHT_MEDIA,
    });
    body.append(chapterList);

    details.append(summary, body);
    return details;
}

export function renderBookChaptersPreview({
    pageModel,
    container,
    queryApi,
    routeResolver,
    titleElement = null,
    subtitleElement = null,
    introElement = null,
    ctaElement = null,
}) {
    if (!pageModel || !container || !queryApi) return;

    const book = pageModel.book;
    const bookSections = pageModel.sections;
    const bookCounts = queryApi.getBookCounts(book.id);
    const heroTitle = formatBookTitle(book);
    const firstChapter = pageModel.firstChapter;

    if (titleElement) {
        titleElement.textContent = heroTitle;
        const heroSection = titleElement.closest(".chapter-hero");
        if (heroSection instanceof HTMLElement) {
            heroSection.dataset.adminEntity = "books";
            heroSection.dataset.adminId = book.id;
            heroSection.dataset.adminSlug = book.slug;
        }
    }

    if (subtitleElement) {
        subtitleElement.textContent = book.description;
    }

    if (introElement) {
        introElement.textContent = `${book.title} is organized into ${bookSections.length} book section${bookSections.length === 1 ? "" : "s"}, connecting ${bookCounts.chapter_count} chapter${bookCounts.chapter_count === 1 ? "" : "s"} and ${bookCounts.verse_count} verses through a visible teaching hierarchy.`;
    }

    if (ctaElement) {
        ctaElement.href = firstChapter
            ? createRouteHref(routeResolver, "verses.index", { book: book.slug, chapter: firstChapter.slug })
            : "#";
        ctaElement.textContent = firstChapter ? "Begin Reading" : "Explore Books";
    }

    container.innerHTML = "";

    bookSections.forEach((sectionEntry, sectionIndex) => {
        container.appendChild(createSectionCard(book, sectionEntry, sectionIndex + 1, queryApi, routeResolver));
    });

    initializeContentInteractions(container);
}
