import { BOOKS_QUERY_API } from "../../content/books/queries.js";
import { renderBooksCollection } from "../../content/renderers/books-renderer.js";

function renderBooksPage() {
    const grid = document.getElementById("bookGrid");
    if (!grid) return;

    renderBooksCollection({
        container: grid,
        queryApi: BOOKS_QUERY_API,
        routeResolver: window.resolveAppRoute,
    });
}

renderBooksPage();
