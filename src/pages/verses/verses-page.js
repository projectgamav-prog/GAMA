import {
    DEFAULT_BOOK_SLUG,
    resolveVersesPageContext,
} from "../../content/books/page-context.js";
import { renderChapterVersesPreview } from "../../content/renderers/verses-renderer.js";
import { getVersePageModel } from "../../content/services/page-models.js";
import { normalizeVerseMode } from "../../core/config/route-registry.js";
import { createSharedPageDefinition } from "../shared-page.js";
import { initializeVerseModeSwitcher } from "./verse-mode-switcher.js";

function getCurrentContext() {
    return resolveVersesPageContext();
}

function getDisplayMode() {
    const params = new URLSearchParams(window.location.search);
    return normalizeVerseMode(params.get("mode") || document.body.dataset.verseMode || "sanskrit-english");
}

function initializeVersesPage({ routeResolver, routes }) {
    const context = getCurrentContext();
    const main = document.querySelector(".verse-main");
    if (!context || !main) return;

    const { book, chapter, highlightedVerseNumber } = context;
    const pageModel = getVersePageModel(book.slug, chapter.slug, highlightedVerseNumber, {
        includeDraft: document.body.dataset.pageMode === "admin",
        includeHidden: document.body.dataset.pageMode === "admin",
    });
    if (!pageModel) return;

    const mode = getDisplayMode();
    document.body.dataset.verseMode = mode;
    document.body.dataset.educationItem = book.slug === DEFAULT_BOOK_SLUG ? "books-gita" : "books-all";
    window.sharedLayout?.syncEducationNavigation?.();

    document.title = `${book.title} | Chapter ${chapter.chapter_number}`;

    const sectionContainer = main.querySelector(".verse-section");
    if (!sectionContainer) return;

    renderChapterVersesPreview({
        pageModel,
        container: sectionContainer,
        routeResolver,
        mode,
        highlightedVerseNumber,
        breadcrumbElement: main.querySelector(".verse-breadcrumb"),
        chapterLabelElement: main.querySelector(".verse-chapter-label"),
        chapterNameElement: main.querySelector(".verse-chapter-name"),
    });

    initializeVerseModeSwitcher(routes);
}

export const VERSES_PAGE_DEFINITION = createSharedPageDefinition({
    id: "verses",
    title: "Bhagavad Gita | Verse",
    bodyClasses: ["verse-page"],
    bodyDataset: {
        verseMode: "sanskrit-english",
        navSection: "education",
        educationItem: "books-gita",
        footerVariant: "verse",
        headerSearch: "true",
    },
    shellClassName: "verse-shell",
    render() {
        return `
            <main class="verse-main">
                <p class="verse-breadcrumb">Bhagavad Gita &#8250; Chapter &#8250; Verse</p>
                <div class="verse-context">
                    <span class="lotus-large verse-lotus" aria-hidden="true"></span>
                    <p class="verse-chapter-label">Chapter</p>
                    <p class="verse-chapter-name">Loading chapter...</p>
                </div>

                <div class="verse-mode-bar">
                    <label class="verse-mode-label" for="verseModeSelect">Verse Display</label>
                    <select id="verseModeSelect" class="verse-mode-select" aria-label="Verse display mode">
                        <option value="" data-route="verses.index">Sanskrit - English</option>
                        <option value="" data-route="verses.sanskritHindi">Sanskrit - Hindi</option>
                        <option value="" data-route="verses.englishOnly">English Only</option>
                        <option value="" data-route="verses.hindiOnly">Hindi Only</option>
                    </select>
                </div>

                <section class="verse-section"></section>
                <div class="verse-divider" aria-hidden="true"></div>
            </main>
        `;
    },
    init: initializeVersesPage,
});

export { VERSES_PAGE_DEFINITION as PAGE_DEFINITION };
