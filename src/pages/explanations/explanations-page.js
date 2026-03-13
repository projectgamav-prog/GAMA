import {
    DEFAULT_BOOK_SLUG,
    resolveExplanationsPageContext,
} from "../../content/books/page-context.js";
import {
    getVerseExplanationContent,
} from "../../content/explanations/queries.js";
import {
    setExplanationPageBridge,
} from "../../content/explanations/page-bridge.js";
import { renderExplanationBlocks } from "../../content/explanations/block-renderer.js";
import { createSharedPageDefinition } from "../shared-page.js";

function getCurrentContext() {
    return resolveExplanationsPageContext();
}

function setLink(target, routeKey, params, routeResolver) {
    if (!(target instanceof HTMLAnchorElement) || typeof routeResolver !== "function") {
        return;
    }

    const route = routeResolver(routeKey);
    if (!route) {
        return;
    }

    const url = new URL(route, window.location.origin);
    Object.entries(params || {}).forEach(([key, value]) => {
        if (value == null || value === "") {
            return;
        }

        url.searchParams.set(key, value);
    });
    target.href = `${url.pathname}${url.search}`;
}

function applyVerseAdminTarget(element, { book, chapter, verse }) {
    if (!(element instanceof HTMLElement)) {
        return;
    }

    element.dataset.adminEntity = "verses";
    element.dataset.adminId = verse.id;
    element.dataset.adminParentEntity = "chapters";
    element.dataset.adminParentId = chapter.id;
    element.dataset.adminBookId = book.id;
}

function appendMeaningEntry(container, label, value) {
    if (!(container instanceof HTMLElement) || !value) {
        return;
    }

    const group = document.createElement("div");
    group.className = "meaning-entry";

    const eyebrow = document.createElement("p");
    eyebrow.className = "meaning-label";
    eyebrow.textContent = label;

    const text = document.createElement("p");
    text.className = "verse-detail-translation meaning-copy";
    text.textContent = value;

    group.append(eyebrow, text);
    container.appendChild(group);
}

function renderMeaningCard(container, verse) {
    if (!(container instanceof HTMLElement)) {
        return;
    }

    container.replaceChildren();
    appendMeaningEntry(container, "English", verse.english_text);
    appendMeaningEntry(container, "Hindi", verse.hindi_text);

    if (!container.children.length) {
        const fallback = document.createElement("p");
        fallback.className = "verse-detail-translation meaning-copy";
        fallback.textContent = "Meaning coming soon.";
        container.appendChild(fallback);
    }
}

function getAdminEmptyMessage(mode) {
    return mode === "admin"
        ? "No editorial explanation blocks exist for this verse yet. Use the inline explanation editor to create the document and add ordered blocks."
        : "Editorial explanation for this verse is still being prepared.";
}

function initializeExplanationsPage({ mode, routeResolver }) {
    const context = getCurrentContext();
    const body = document.body;
    if (!context || !body) {
        return;
    }

    const { book, chapter, verse, verses } = context;
    const title = document.getElementById("explanationHeroTitle");
    const subtitle = document.getElementById("explanationHeroSubtitle");
    const breadcrumbChapter = document.getElementById("explanationBreadcrumbChapter");
    const breadcrumbVerses = document.getElementById("explanationBreadcrumbVerses");
    const breadcrumbVerse = document.getElementById("explanationBreadcrumbVerse");
    const sanskrit = document.getElementById("explanationVerseSanskrit");
    const transliteration = document.getElementById("explanationVerseTransliteration");
    const meaningCard = document.getElementById("explanationMeaningCard");
    const blocks = document.getElementById("explanationBlocks");
    const prevLink = document.getElementById("explanationPrevVerse");
    const nextLink = document.getElementById("explanationNextVerse");
    const verseDetailCard = document.getElementById("explanationVerseCard");
    const pageState = {
        targetType: "verse",
        targetId: verse.id,
        document: null,
        blocks: [],
    };

    function applyExplanationContent({ document = null, blocks: nextBlocks = [] } = {}) {
        pageState.document = document || null;
        pageState.blocks = Array.isArray(nextBlocks) ? [...nextBlocks] : [];

        if (!(blocks instanceof HTMLElement)) {
            return;
        }

        if (pageState.document) {
            blocks.dataset.explanationDocumentId = pageState.document.id;
        } else {
            delete blocks.dataset.explanationDocumentId;
        }

        renderExplanationBlocks({
            container: blocks,
            blocks: pageState.blocks,
            emptyMessage: getAdminEmptyMessage(mode),
        });
    }

    document.title = `${book.title} | Chapter ${chapter.chapter_number} | Verse ${verse.verse_number} Explanation`;
    body.dataset.educationItem = book.slug === DEFAULT_BOOK_SLUG ? "books-gita" : "books-all";
    window.sharedLayout?.syncEducationNavigation?.();

    if (title) {
        title.textContent = `Chapter ${chapter.chapter_number} \u2022 ${chapter.title}`;
    }
    if (subtitle) {
        subtitle.textContent = `Verse ${verse.verse_number}`;
    }
    if (breadcrumbChapter) {
        breadcrumbChapter.textContent = `Chapter ${chapter.chapter_number}`;
    }
    if (breadcrumbVerse) {
        breadcrumbVerse.textContent = `Verse ${verse.verse_number}`;
    }

    setLink(breadcrumbChapter, "chapters.index", { book: book.slug }, routeResolver);
    setLink(
        breadcrumbVerses,
        "verses.index",
        {
            book: book.slug,
            chapter: chapter.slug,
            verse: verse.verse_number,
        },
        routeResolver
    );

    if (sanskrit) {
        sanskrit.textContent = verse.sanskrit_text || verse.transliteration_text || `Verse ${verse.verse_number}`;
    }

    if (transliteration) {
        const value = verse.transliteration_text && verse.transliteration_text !== verse.sanskrit_text
            ? verse.transliteration_text
            : "";
        transliteration.textContent = value;
        transliteration.hidden = !value;
    }

    applyVerseAdminTarget(verseDetailCard, { book, chapter, verse });
    applyVerseAdminTarget(meaningCard, { book, chapter, verse });
    renderMeaningCard(meaningCard, verse);

    applyExplanationContent(
        getVerseExplanationContent(verse.id, {
            includeDraft: mode === "admin",
            includeHidden: mode === "admin",
        })
    );

    setExplanationPageBridge({
        getState() {
            return Object.freeze({
                targetType: pageState.targetType,
                targetId: pageState.targetId,
                document: pageState.document,
                blocks: Object.freeze([...pageState.blocks]),
            });
        },
        setExplanationContent(nextState = {}) {
            applyExplanationContent(nextState);
        },
        clearExplanationContent() {
            applyExplanationContent({ document: null, blocks: [] });
        },
    });

    const currentIndex = verses.findIndex((record) => record.id === verse.id);
    const previousVerse = currentIndex > 0 ? verses[currentIndex - 1] : null;
    const nextVerse = currentIndex >= 0 && currentIndex < verses.length - 1 ? verses[currentIndex + 1] : null;

    setLink(
        prevLink,
        "explanations.index",
        {
            book: book.slug,
            chapter: chapter.slug,
            verse: previousVerse?.verse_number || "",
        },
        routeResolver
    );
    if (prevLink) {
        prevLink.textContent = previousVerse ? `\u2190 Previous Verse (${previousVerse.verse_number})` : "\u2190 Previous Verse";
        prevLink.setAttribute("aria-disabled", previousVerse ? "false" : "true");
        if (!previousVerse) {
            prevLink.href = "#";
        }
    }

    setLink(
        nextLink,
        "explanations.index",
        {
            book: book.slug,
            chapter: chapter.slug,
            verse: nextVerse?.verse_number || "",
        },
        routeResolver
    );
    if (nextLink) {
        nextLink.textContent = nextVerse ? `Next Verse (${nextVerse.verse_number}) \u2192` : "Next Verse \u2192";
        nextLink.setAttribute("aria-disabled", nextVerse ? "false" : "true");
        if (!nextVerse) {
            nextLink.href = "#";
        }
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

                    <div class="verse-detail-card" id="explanationVerseCard">
                        <p class="verse-detail-sanskrit" id="explanationVerseSanskrit">Verse text</p>
                        <p class="verse-detail-translation explanation-verse-transliteration" id="explanationVerseTransliteration" hidden>Transliteration</p>
                    </div>
                </section>

                <section class="meaning-section">
                    <h2 class="section-title">Meaning</h2>
                    <div class="verse-detail-card explanation-meaning-card" id="explanationMeaningCard"></div>
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
