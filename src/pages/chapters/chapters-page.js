import {
    DEFAULT_BOOK_SLUG,
    resolveChaptersPageContext,
} from "../../content/books/page-context.js";
import { BOOKS_QUERY_API } from "../../content/books/queries.js";
import { renderBookChaptersPreview } from "../../content/renderers/chapters-renderer.js";
import { getBookPageModel } from "../../content/services/page-models.js";
import { createSharedPageDefinition } from "../shared-page.js";

function getCurrentBook() {
    return resolveChaptersPageContext()?.book || null;
}

function formatBookTitle(book) {
    return book.short_title === "Bhagavad Gita" ? book.short_title : book.title;
}

function syncEducationMenu(book) {
    if (book.slug === DEFAULT_BOOK_SLUG) {
        return;
    }

    document.body.dataset.educationItem = "books-all";
    window.sharedLayout?.syncEducationNavigation?.();
}

function initializeChaptersPage({ routeResolver }) {
    const book = getCurrentBook();
    const pageModel = book
        ? getBookPageModel(book.slug, {
            includeDraft: document.body.dataset.pageMode === "admin",
            includeHidden: document.body.dataset.pageMode === "admin",
        })
        : null;
    if (!book || !pageModel) return;

    const sectionsContainer = document.getElementById("chapterSections");
    const titleElement = document.getElementById("chapterPageTitle");
    const subtitleElement = document.getElementById("chapterPageSubtitle");
    const introElement = document.getElementById("chapterPageIntro");
    const ctaElement = document.getElementById("chapterPageCta");

    if (!sectionsContainer || !titleElement || !subtitleElement || !introElement || !ctaElement) {
        return;
    }

    const heroTitle = formatBookTitle(book);

    document.title = `Bhagavad Gita | ${heroTitle}`;
    syncEducationMenu(book);

    renderBookChaptersPreview({
        pageModel,
        container: sectionsContainer,
        queryApi: BOOKS_QUERY_API,
        routeResolver,
        titleElement,
        subtitleElement,
        introElement,
        ctaElement,
    });
}

export const CHAPTERS_PAGE_DEFINITION = createSharedPageDefinition({
    id: "chapters",
    title: "Bhagavad Gita | Chapters",
    bodyClasses: ["chapter-page"],
    bodyDataset: {
        navSection: "education",
        educationItem: "books-gita",
        footerVariant: "chapter",
    },
    shellClassName: "chapter-shell",
    render() {
        return `
            <main class="chapters-page-main">
                <section class="chapter-hero">
                    <span class="lotus-large" aria-hidden="true"></span>
                    <h1 id="chapterPageTitle">Bhagavad Gita</h1>
                    <p class="subtitle" id="chapterPageSubtitle">The Eternal Wisdom for Modern Life</p>
                    <a class="btn btn-primary chapter-cta" id="chapterPageCta" href="#">Explore the Teachings</a>
                </section>

                <section class="chapter-list-section">
                    <h2 class="section-title">Book Sections</h2>
                    <p class="chapter-intro" id="chapterPageIntro">Journey through grouped movements of the Gita, where related chapters sit inside a broader teaching arc.</p>
                    <div class="chapter-sections" id="chapterSections"></div>
                </section>
            </main>
        `;
    },
    init: initializeChaptersPage,
});

export { CHAPTERS_PAGE_DEFINITION as PAGE_DEFINITION };
