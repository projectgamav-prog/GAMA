import { createSharedPageDefinition } from "../shared-page.js";

const PLACES = Object.freeze([
    Object.freeze({
        index: "Place 1",
        title: "Kurukshetra",
        meta: "The battlefield setting where crisis, duty, and revelation are brought into one decisive moment.",
        stats: "1 Epic Setting - 18 Chapters",
        cta: "Open Place",
        imageAlt: "Kurukshetra place insight thumbnail",
        caption: "Kurukshetra is both an outer battlefield and a symbolic field of moral conflict, decision, and spiritual insight.",
    }),
    Object.freeze({
        index: "Place 2",
        title: "Vrindavan",
        meta: "A sacred setting of intimacy, devotion, joy, and living divine presence.",
        stats: "1 Sacred Region - 3 Themes",
        cta: "Open Place",
        imageAlt: "Vrindavan place insight thumbnail",
        caption: "Vrindavan represents devotional atmosphere itself, where place, memory, and love become inseparable.",
    }),
]);

function createPlaceCard(place, index) {
    const article = document.createElement("article");
    article.className = "book-card";
    article.setAttribute("role", "listitem");

    article.innerHTML = `
        <div class="book-card-main">
            <div class="book-card-left">
                <span class="book-row-lotus" aria-hidden="true"></span>
                <div class="book-row-text">
                    <p class="book-row-index">${place.index}</p>
                    <p class="book-row-title">${place.title}</p>
                    <p class="book-row-meta">${place.meta}</p>
                </div>
            </div>
            <div class="book-row-actions">
                <p class="book-stat-line">${place.stats}</p>
                <a class="book-open-btn" href="#">${place.cta}</a>
            </div>
        </div>
        <div class="book-row-insight">
            <button class="insight-btn book-insight-btn" id="placeInsightToggle${index}" type="button" aria-expanded="false" aria-controls="placeInsightPanel${index}">
                <span class="insight-btn-icon" aria-hidden="true">&#9662;</span>
                <span>Key Insight</span>
            </button>
            <section class="key-insight-dropdown book-insight-dropdown" id="placeInsightPanel${index}" aria-labelledby="placeInsightToggle${index}">
                <div class="video-player-card">
                    <h3 class="section-title">Place Insight</h3>
                    <div class="video-player">
                        <img src="/assets/images/image.png" alt="${place.imageAlt}">
                        <button class="play-button" type="button" aria-label="Play place insight video"></button>
                    </div>
                    <p class="video-caption">${place.caption}</p>
                </div>
            </section>
        </div>
    `;

    return article;
}

function initializePlacesPage() {
    const grid = document.getElementById("placeGrid");
    if (!grid) return;

    grid.innerHTML = "";
    PLACES.forEach((place, index) => {
        grid.appendChild(createPlaceCard(place, index + 1));
    });
}

export const PLACES_PAGE_DEFINITION = createSharedPageDefinition({
    id: "places",
    title: "Bhagavad Gita | Places",
    bodyClasses: ["book-page", "collection-page"],
    bodyDataset: {
        navSection: "education",
        educationItem: "places-all",
        footerVariant: "places",
    },
    shellClassName: "book-shell",
    render() {
        return `
            <main class="book-page-main">
                <section class="book-hero">
                    <span class="lotus-large" aria-hidden="true"></span>
                    <h1>Place Library</h1>
                    <p class="subtitle">Collect sacred locations, symbolic settings, and cultural places into browsable learning collections.</p>
                    <a class="btn btn-primary" href="#" data-route="chapters.index">Explore Gita</a>
                </section>

                <section class="book-list-section">
                    <h2 class="section-title">Places</h2>
                    <p class="book-intro">These place cards can later gather chapters, stories, and media around locations that matter to the teachings and their context.</p>

                    <div class="book-grid" id="placeGrid" role="list"></div>
                </section>
            </main>
        `;
    },
    init: initializePlacesPage,
});

export { PLACES_PAGE_DEFINITION as PAGE_DEFINITION };
