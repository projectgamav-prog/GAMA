import { createSharedPageDefinition } from "../shared-page.js";
import { initializeContentInteractions } from "../../content/ui/content-interactions.js";

const TOPICS = Object.freeze([
    Object.freeze({
        index: "Topic 1",
        title: "Duty and Right Action",
        meta: "A theme about responsibility, work, and action done without attachment.",
        stats: "9 Chapters - 180 Verses",
        cta: "Open Topic",
        imageAlt: "Duty and action topic insight thumbnail",
        caption: "This theme gathers teachings on disciplined action, showing how work becomes liberating when it is rooted in clarity rather than craving.",
    }),
    Object.freeze({
        index: "Topic 2",
        title: "Devotion and Surrender",
        meta: "A teaching stream about love, trust, offering, and the relational side of spiritual life.",
        stats: "5 Chapters - 96 Verses",
        cta: "Open Topic",
        imageAlt: "Devotion topic insight thumbnail",
        caption: "This topic focuses on the movement of devotion, where love and surrender become a living form of wisdom.",
    }),
]);

function createTopicCard(topic, index) {
    const article = document.createElement("article");
    article.className = "book-card";
    article.setAttribute("role", "listitem");

    article.innerHTML = `
        <div class="book-card-main">
            <div class="book-card-left">
                <span class="book-row-lotus" aria-hidden="true"></span>
                <div class="book-row-text">
                    <p class="book-row-index">${topic.index}</p>
                    <p class="book-row-title">${topic.title}</p>
                    <p class="book-row-meta">${topic.meta}</p>
                </div>
            </div>
            <div class="book-row-actions">
                <p class="book-stat-line">${topic.stats}</p>
                <a class="book-open-btn" href="#">${topic.cta}</a>
            </div>
        </div>
        <div class="book-row-insight">
            <button class="insight-btn book-insight-btn" id="topicInsightToggle${index}" type="button" aria-expanded="false" aria-controls="topicInsightPanel${index}">
                <span class="insight-btn-icon" aria-hidden="true">&#9662;</span>
                <span>Key Insight</span>
            </button>
            <section class="key-insight-dropdown book-insight-dropdown" id="topicInsightPanel${index}" aria-labelledby="topicInsightToggle${index}">
                <div class="video-player-card">
                    <h3 class="section-title">Topic Insight</h3>
                    <div class="video-player">
                        <img src="/assets/images/image.png" alt="${topic.imageAlt}">
                        <button class="play-button" type="button" aria-label="Play topic insight video"></button>
                    </div>
                    <p class="video-caption">${topic.caption}</p>
                </div>
            </section>
        </div>
    `;

    return article;
}

function initializeTopicsPage() {
    const grid = document.getElementById("topicGrid");
    if (!grid) return;

    grid.innerHTML = "";
    TOPICS.forEach((topic, index) => {
        grid.appendChild(createTopicCard(topic, index + 1));
    });

    initializeContentInteractions(grid);
}

export const TOPICS_PAGE_DEFINITION = createSharedPageDefinition({
    id: "topics",
    title: "Bhagavad Gita | Topics",
    bodyClasses: ["book-page", "collection-page"],
    bodyDataset: {
        navSection: "education",
        educationItem: "topics-all",
        footerVariant: "topics",
    },
    shellClassName: "book-shell",
    render() {
        return `
            <main class="book-page-main">
                <section class="book-hero">
                    <span class="lotus-large" aria-hidden="true"></span>
                    <h1>Topic Library</h1>
                    <p class="subtitle">Browse teachings by idea so readers can move through duty, devotion, wisdom, action, and discipline as themes.</p>
                    <a class="btn btn-primary" href="#" data-route="chapters.index">Explore Gita</a>
                </section>

                <section class="book-list-section">
                    <h2 class="section-title">Topics</h2>
                    <p class="book-intro">These topic cards act as collection points for broader teaching themes that can later gather verses, chapters, and explanation pages.</p>

                    <div class="book-grid" id="topicGrid" role="list"></div>
                </section>
            </main>
        `;
    },
    init: initializeTopicsPage,
});

export { TOPICS_PAGE_DEFINITION as PAGE_DEFINITION };
