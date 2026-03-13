import {
    getBookBySlug,
} from "../../content/books/queries.js";
import { BOOKS_QUERY_API } from "../../content/books/queries.js";
import { renderBookChaptersPreview } from "../../content/renderers/chapters-renderer.js";

const DEFAULT_BOOK_SLUG = "bhagavad-gita";

function getCurrentBook() {
    const params = new URLSearchParams(window.location.search);
    const requestedBookSlug = params.get("book");
    return getBookBySlug(requestedBookSlug || DEFAULT_BOOK_SLUG) || getBookBySlug(DEFAULT_BOOK_SLUG);
}

function formatBookTitle(book) {
    return book.short_title === "Bhagavad Gita" ? book.short_title : book.title;
}

function syncEducationMenu(book) {
    const activeLink = book.slug === DEFAULT_BOOK_SLUG
        ? window.resolveAppRoute?.("books.gita")
        : window.resolveAppRoute?.("books.index");

    if (!activeLink) return;

    document.querySelectorAll(".mega-menu-group a.active").forEach((link) => {
        link.classList.remove("active");
    });

    const targetLink = Array.from(document.querySelectorAll(".mega-menu-group a")).find(
        (link) => link.getAttribute("href") === activeLink
    );

    if (targetLink) {
        targetLink.classList.add("active");
    }
}

function renderChapterPage() {
    const book = getCurrentBook();
    if (!book) return;

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
    document.body.dataset.educationItem = book.slug === DEFAULT_BOOK_SLUG ? "books-gita" : "books-all";
    syncEducationMenu(book);

    renderBookChaptersPreview({
        book,
        container: sectionsContainer,
        queryApi: BOOKS_QUERY_API,
        routeResolver: window.resolveAppRoute,
        titleElement,
        subtitleElement,
        introElement,
        ctaElement,
    });
}

renderChapterPage();
