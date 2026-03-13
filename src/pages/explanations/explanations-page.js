import {
    DEFAULT_BOOK_SLUG,
    resolveExplanationsPageContext,
} from "../../content/books/page-context.js";
import { createSharedPageDefinition } from "../shared-page.js";

const FALLBACK_IMAGE = "/assets/images/arjun.png";

function getCurrentContext() {
    return resolveExplanationsPageContext();
}

function buildExplanationBlocks(book, chapter, verse) {
    return [
        {
            title: "Context",
            text: `${book.title} presents this teaching within Chapter ${chapter.chapter_number}, where ${chapter.title} clarifies how understanding must shape action and attention.`,
        },
        {
            title: "Reading the Verse",
            text: verse.english_text || verse.hindi_text || verse.sanskrit_text || "This verse is available, but its translation copy has not been added yet.",
        },
        {
            title: "Why It Matters",
            text: verse.insight_caption
                || "This explanation route is intentionally lightweight for now: it keeps the shared route alive while the deeper study experience is still being modeled.",
        },
    ];
}

function setLink(target, routeKey, params, routeResolver) {
    if (!(target instanceof HTMLAnchorElement) || typeof routeResolver !== "function") return;
    const route = routeResolver(routeKey);
    if (!route) return;

    const url = new URL(route, window.location.origin);
    Object.entries(params || {}).forEach(([key, value]) => {
        if (value == null || value === "") return;
        url.searchParams.set(key, value);
    });
    target.href = `${url.pathname}${url.search}`;
}

function initializeExplanationsPage({ routeResolver }) {
    const context = getCurrentContext();
    const body = document.body;
    if (!context || !body) return;

    const { book, chapter, verse, verses } = context;
    const title = document.getElementById("explanationHeroTitle");
    const subtitle = document.getElementById("explanationHeroSubtitle");
    const breadcrumbChapter = document.getElementById("explanationBreadcrumbChapter");
    const breadcrumbVerses = document.getElementById("explanationBreadcrumbVerses");
    const breadcrumbVerse = document.getElementById("explanationBreadcrumbVerse");
    const sanskrit = document.getElementById("explanationVerseSanskrit");
    const translation = document.getElementById("explanationVerseTranslation");
    const keyInsightTitle = document.getElementById("explanationInsightTitle");
    const keyInsightImage = document.getElementById("explanationInsightImage");
    const keyInsightCaption = document.getElementById("explanationInsightCaption");
    const blocks = document.getElementById("explanationBlocks");
    const prevLink = document.getElementById("explanationPrevVerse");
    const nextLink = document.getElementById("explanationNextVerse");
    const verseDetailCard = document.querySelector(".explanation-main .verse-detail-card");

    document.title = `Bhagavad Gita | Explanation | ${chapter.title} | Verse ${verse.verse_number}`;
    body.dataset.educationItem = book.slug === DEFAULT_BOOK_SLUG ? "books-gita" : "books-all";
    window.sharedLayout?.syncEducationNavigation?.();

    if (title) title.textContent = `Chapter ${chapter.chapter_number} \u2022 ${chapter.title}`;
    if (subtitle) subtitle.textContent = `Verse ${verse.verse_number}`;
    if (breadcrumbChapter) breadcrumbChapter.textContent = `Chapter ${chapter.chapter_number}`;
    if (breadcrumbVerse) breadcrumbVerse.textContent = `Verse ${verse.verse_number}`;
    setLink(breadcrumbChapter, "chapters.index", { book: book.slug }, routeResolver);
    setLink(breadcrumbVerses, "verses.index", {
        book: book.slug,
        chapter: chapter.slug,
        verse: verse.verse_number,
    }, routeResolver);
    if (sanskrit) sanskrit.textContent = verse.sanskrit_text || verse.transliteration_text || `Verse ${verse.verse_number}`;
    if (translation) translation.textContent = verse.english_text || verse.hindi_text || "Translation coming soon.";
    if (verseDetailCard instanceof HTMLElement) {
        verseDetailCard.dataset.adminEntity = "verses";
        verseDetailCard.dataset.adminId = verse.id;
        verseDetailCard.dataset.adminParentEntity = "chapters";
        verseDetailCard.dataset.adminParentId = chapter.id;
        verseDetailCard.dataset.adminBookId = book.id;
    }
    if (keyInsightTitle) keyInsightTitle.textContent = verse.insight_title || `${chapter.title} Insight`;
    if (keyInsightImage) {
        keyInsightImage.src = verse.insight_media || FALLBACK_IMAGE;
        keyInsightImage.alt = `${chapter.title} explanation thumbnail`;
        keyInsightImage.onerror = () => {
            keyInsightImage.src = FALLBACK_IMAGE;
        };
    }
    if (keyInsightCaption) {
        keyInsightCaption.textContent = verse.insight_caption
            || "Deeper commentary will stay aligned with the verse route and shared rendering system as the content model expands.";
    }

    if (blocks) {
        blocks.innerHTML = "";
        buildExplanationBlocks(book, chapter, verse).forEach((block) => {
            const article = document.createElement("article");
            article.className = "explanation-block";
            article.innerHTML = `
                <h3 class="explanation-block-title">${block.title}</h3>
                <div class="explanation-image-card">
                    <img src="${FALLBACK_IMAGE}" alt="${block.title} illustration">
                </div>
                <div class="explanation-text">
                    <p>${block.text}</p>
                </div>
            `;
            blocks.appendChild(article);
        });
    }

    const currentIndex = verses.findIndex((record) => record.id === verse.id);
    const previousVerse = currentIndex > 0 ? verses[currentIndex - 1] : null;
    const nextVerse = currentIndex >= 0 && currentIndex < verses.length - 1 ? verses[currentIndex + 1] : null;

    setLink(prevLink, "explanations.index", {
        book: book.slug,
        chapter: chapter.slug,
        verse: previousVerse?.verse_number || "",
    }, routeResolver);
    if (prevLink) {
        prevLink.textContent = previousVerse ? `\u2190 Previous Verse (${previousVerse.verse_number})` : "\u2190 Previous Verse";
        prevLink.setAttribute("aria-disabled", previousVerse ? "false" : "true");
        if (!previousVerse) prevLink.href = "#";
    }

    setLink(nextLink, "explanations.index", {
        book: book.slug,
        chapter: chapter.slug,
        verse: nextVerse?.verse_number || "",
    }, routeResolver);
    if (nextLink) {
        nextLink.textContent = nextVerse ? `Next Verse (${nextVerse.verse_number}) \u2192` : "Next Verse \u2192";
        nextLink.setAttribute("aria-disabled", nextVerse ? "false" : "true");
        if (!nextVerse) nextLink.href = "#";
    }
}

export const EXPLANATIONS_PAGE_DEFINITION = createSharedPageDefinition({
    id: "explanations",
    title: "Bhagavad Gita | Explanation",
    bodyClasses: ["explanation-page"],
    bodyDataset: {
        navSection: "education",
        educationItem: "books-gita",
        footerVariant: "explanation",
    },
    shellClassName: "explanation-shell",
    render() {
        return `
            <main class="explanation-main">
                <nav class="breadcrumb">
                    <a href="#" data-route="home">Bhagavad Gita</a> &gt;
                    <a href="#" data-route="chapters.index" id="explanationBreadcrumbChapter">Chapter</a> &gt;
                    <a href="#" data-route="verses.index" id="explanationBreadcrumbVerses">Verses</a> &gt;
                    <span id="explanationBreadcrumbVerse">Verse</span>
                </nav>

                <section class="verse-section">
                    <span class="lotus-large" aria-hidden="true"></span>
                    <h1 class="section-title" id="explanationHeroTitle">Chapter &#8226; Explanation</h1>
                    <p class="subtitle" id="explanationHeroSubtitle">Verse</p>

                    <div class="verse-detail-card">
                        <p class="verse-detail-sanskrit" id="explanationVerseSanskrit">Verse text</p>
                        <p class="verse-detail-translation" id="explanationVerseTranslation">Translation</p>
                    </div>
                </section>

                <section class="key-insight-section">
                    <h2 class="section-title">Key Insight</h2>
                    <div class="video-player-card">
                        <div class="video-player">
                            <img id="explanationInsightImage" src="/assets/images/image.png" alt="Key insight video thumbnail">
                            <button class="play-button" aria-label="Play video"></button>
                        </div>
                        <h3 class="section-title" id="explanationInsightTitle">Insight</h3>
                        <p class="video-caption" id="explanationInsightCaption">Insight caption</p>
                    </div>
                </section>

                <section class="explanation-section">
                    <h2 class="section-title">Explanation</h2>
                    <div id="explanationBlocks"></div>
                </section>

                <nav class="verse-navigation">
                    <a href="#" class="prev-verse-btn" id="explanationPrevVerse">&larr; Previous Verse</a>
                    <a href="#" class="next-verse-btn" id="explanationNextVerse">Next Verse &rarr;</a>
                </nav>
            </main>
        `;
    },
    init: initializeExplanationsPage,
});

export { EXPLANATIONS_PAGE_DEFINITION as PAGE_DEFINITION };
