import { BOOKS_QUERY_API } from "../../content/books/queries.js";
import { renderBooksCollection } from "../../content/renderers/books-renderer.js";
import { getBookPageModel } from "../../content/services/page-models.js";
import { createSharedPageDefinition } from "../shared-page.js";

function initializeBooksPage({ mode, routeResolver }) {
    const grid = document.getElementById("bookGrid");
    if (!grid) return;

    const blockOptions = {
        includeDraft: mode === "admin",
        includeHidden: mode === "admin",
    };
    const books = mode === "admin" ? BOOKS_QUERY_API.listBooks() : BOOKS_QUERY_API.listPublishedBooks();
    const pageModels = books
        .map((book) => getBookPageModel(book.slug, blockOptions))
        .filter(Boolean);

    renderBooksCollection({
        container: grid,
        queryApi: BOOKS_QUERY_API,
        routeResolver,
        pageModels,
    });
}

export const BOOKS_PAGE_DEFINITION = createSharedPageDefinition({
    id: "books",
    title: "Bhagavad Gita | Books",
    bodyClasses: ["book-page"],
    bodyDataset: {
        navSection: "education",
        educationItem: "books-all",
        footerVariant: "books",
    },
    shellClassName: "book-shell",
    render() {
        return `
            <main class="book-page-main">
                <section class="book-hero">
                    <span class="lotus-large" aria-hidden="true"></span>
                    <h1>Book Library</h1>
                    <p class="subtitle">Enter the major streams of teaching through book-level groupings and their essential themes.</p>
                    <a class="btn btn-primary" href="#" data-route="chapters.index">Explore Chapters</a>
                </section>

                <section class="book-list-section">
                    <h2 class="section-title">Books</h2>
                    <p class="book-intro">Each book opens into its own teaching journey, with a quick insight panel to preview its central message before entering the chapters.</p>

                    <div class="book-grid" id="bookGrid" role="list"></div>
                </section>
            </main>
        `;
    },
    init: initializeBooksPage,
});

export { BOOKS_PAGE_DEFINITION as PAGE_DEFINITION };
