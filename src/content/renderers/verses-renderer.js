import {
    createInsightDropdown,
    createRouteHref,
    DEFAULT_INSIGHT_MEDIA,
} from "./renderer-utils.js";
import { initializeContentInteractions } from "../ui/content-interactions.js";

function formatVerseRange(section, verses) {
    if (verses.length) {
        const first = verses[0].verse_number;
        const last = verses[verses.length - 1].verse_number;
        return first === last ? `Verse ${first}` : `Verses ${first}-${last}`;
    }

    if (section.verse_start != null && section.verse_end != null) {
        return section.verse_start === section.verse_end
            ? `Verse ${section.verse_start}`
            : `Verses ${section.verse_start}-${section.verse_end}`;
    }

    return "Verses";
}

function appendVerseText(article, verse, mode) {
    if (mode === "sanskrit-english" || mode === "sanskrit-hindi") {
        const sanskrit = document.createElement("p");
        sanskrit.className = "verse-detail-sanskrit";
        sanskrit.textContent = verse.sanskrit_text || verse.transliteration_text || `Verse ${verse.verse_number}`;
        article.appendChild(sanskrit);
    }

    if (mode === "sanskrit-english" || mode === "english-only") {
        const english = document.createElement("p");
        english.className = "verse-detail-english";
        english.textContent = verse.english_text || "";
        article.appendChild(english);
    }

    if (mode === "sanskrit-hindi" || mode === "hindi-only") {
        const hindi = document.createElement("p");
        hindi.className = "verse-detail-hindi";
        hindi.textContent = verse.hindi_text || "";
        article.appendChild(hindi);
    }
}

function createVerseCard(book, chapter, verse, indexSeed, mode, highlighted, routeResolver) {
    const article = document.createElement("article");
    article.className = "verse-detail-card";
    article.dataset.adminEntity = "verses";
    article.dataset.adminId = verse.id;
    article.dataset.adminParentEntity = "chapters";
    article.dataset.adminParentId = chapter.id;
    article.dataset.adminBookId = book.id;
    if (highlighted) {
        article.id = `verse-${verse.verse_number}`;
    }

    const heading = document.createElement("h2");
    heading.className = "verse-card-heading";
    heading.textContent = `Verse ${verse.verse_number}`;

    const accent = document.createElement("div");
    accent.className = "verse-card-top-accent";
    accent.setAttribute("aria-hidden", "true");

    article.append(heading, accent);
    appendVerseText(article, verse, mode);

    const actions = document.createElement("div");
    actions.className = "verse-actions";
    const insightDropdown = createInsightDropdown({
        wrapperClassName: "verse-inline-insight",
        buttonId: `keyInsightToggle${indexSeed}`,
        panelId: `keyInsightPanel${indexSeed}`,
        headingTag: "h2",
        title: verse.insight_title || `Verse ${verse.verse_number}`,
        image: verse.insight_media,
        alt: `${chapter.title} verse ${verse.verse_number} insight thumbnail`,
        caption: verse.insight_caption,
        fallbackMedia: DEFAULT_INSIGHT_MEDIA,
    });
    if (insightDropdown) {
        actions.appendChild(insightDropdown);
    }

    const explanationLink = document.createElement("a");
    explanationLink.className = "btn btn-primary verse-detail-cta";
    explanationLink.href = createRouteHref(routeResolver, "explanations.index", {
        book: book.slug,
        chapter: chapter.slug,
        verse: verse.verse_number,
    });
    explanationLink.textContent = "Read Full Explanation";

    actions.appendChild(explanationLink);
    article.appendChild(actions);
    return article;
}

function createSectionCard(book, chapter, section, sectionIndex, mode, highlightedVerseNumber, queryApi, routeResolver) {
    const verses = queryApi.listVersesForChapterSection(section.id);
    if (!verses.length) {
        return null;
    }

    const details = document.createElement("details");
    details.className = "verse-group-card";
    details.dataset.adminEntity = "chapter_sections";
    details.dataset.adminId = section.id;
    details.dataset.adminParentEntity = "chapters";
    details.dataset.adminParentId = chapter.id;
    details.dataset.adminBookId = book.id;
    details.open = sectionIndex === 1 || verses.some((verse) => verse.verse_number === highlightedVerseNumber);

    const summary = document.createElement("summary");
    summary.className = "verse-group-summary";

    const meta = document.createElement("span");
    meta.className = "verse-group-meta";
    meta.textContent = `Chapter Section ${sectionIndex}`;

    const name = document.createElement("span");
    name.className = "verse-group-name";
    name.textContent = section.title;

    const range = document.createElement("span");
    range.className = "verse-group-range";
    range.textContent = formatVerseRange(section, verses);

    summary.append(meta, name, range);

    const body = document.createElement("div");
    body.className = "verse-group-body";

    const copy = document.createElement("p");
    copy.className = "verse-group-copy";
    copy.textContent = section.summary || "";
    body.appendChild(copy);

    const sectionInsightDropdown = createInsightDropdown({
        wrapperClassName: "chapter-section-insight",
        buttonId: `sectionInsightToggle${sectionIndex}`,
        panelId: `sectionInsightPanel${sectionIndex}`,
        buttonClassName: "section-insight-btn",
        headingTag: "h2",
        title: section.insight_title || section.title,
        image: section.insight_media,
        alt: `${section.title} insight thumbnail`,
        caption: section.insight_caption,
        fallbackMedia: DEFAULT_INSIGHT_MEDIA,
    });
    if (sectionInsightDropdown) {
        body.appendChild(sectionInsightDropdown);
    }

    verses.forEach((verse, verseIndex) => {
        body.appendChild(
            createVerseCard(
                book,
                chapter,
                verse,
                sectionIndex * 100 + verseIndex + 1,
                mode,
                verse.verse_number === highlightedVerseNumber,
                routeResolver
            )
        );
    });

    details.append(summary, body);
    return details;
}

function createUnassignedSection(book, chapter, mode, sectionIndex, highlightedVerseNumber, queryApi, routeResolver) {
    const assignedVerseIds = new Set(
        queryApi.listChapterSections(chapter.id)
            .flatMap((section) => queryApi.listVersesForChapterSection(section.id))
            .map((verse) => verse.id)
    );

    const verses = queryApi.listVersesForChapter(chapter.id).filter((verse) => !assignedVerseIds.has(verse.id));
    if (!verses.length) {
        return null;
    }

    return createSectionCard(
        book,
        chapter,
        {
            id: `${chapter.id}-unassigned`,
            title: "Unassigned Verses",
            summary: "These verses exist in the chapter but are not yet assigned to a chapter section.",
            insight_title: "Pending Section Assignment",
            insight_caption: "Use the admin data tables to map these verses into a chapter section.",
            insight_media: DEFAULT_INSIGHT_MEDIA,
            verse_start: verses[0].verse_number,
            verse_end: verses[verses.length - 1].verse_number,
        },
        sectionIndex,
        mode,
        highlightedVerseNumber,
        {
            ...queryApi,
            listVersesForChapterSection() {
                return verses;
            },
        },
        routeResolver
    );
}

export function renderChapterVersesPreview({
    book,
    chapter,
    container,
    queryApi,
    routeResolver,
    mode = "sanskrit-english",
    highlightedVerseNumber = null,
    breadcrumbElement = null,
    chapterLabelElement = null,
    chapterNameElement = null,
}) {
    if (!book || !chapter || !container || !queryApi) return;

    const highlightedVerse = Number.isInteger(highlightedVerseNumber)
        ? queryApi.getVerseByChapterAndNumber(chapter.id, highlightedVerseNumber)
        : null;

    if (breadcrumbElement) {
        breadcrumbElement.textContent = `${book.title} > Chapter ${chapter.chapter_number} > ${chapter.title}${highlightedVerse ? ` > Verse ${highlightedVerse.verse_number}` : ""}`;
    }

    if (chapterLabelElement) {
        chapterLabelElement.textContent = `Chapter ${chapter.chapter_number}`;
    }

    if (chapterNameElement) {
        chapterNameElement.textContent = chapter.title;
        const verseContext = chapterNameElement.closest(".verse-context");
        if (verseContext instanceof HTMLElement) {
            verseContext.dataset.adminEntity = "chapters";
            verseContext.dataset.adminId = chapter.id;
            verseContext.dataset.adminParentEntity = "books";
            verseContext.dataset.adminParentId = book.id;
            verseContext.dataset.adminSlug = chapter.slug;
        }
    }

    container.innerHTML = "";

    let renderedSections = 0;
    queryApi.listChapterSections(chapter.id).forEach((section) => {
        const card = createSectionCard(book, chapter, section, renderedSections + 1, mode, highlightedVerseNumber, queryApi, routeResolver);
        if (!card) return;
        renderedSections += 1;
        container.appendChild(card);
    });

    const unassignedCard = createUnassignedSection(book, chapter, mode, renderedSections + 1, highlightedVerseNumber, queryApi, routeResolver);
    if (unassignedCard) {
        container.appendChild(unassignedCard);
    }

    if (!container.children.length) {
        const empty = document.createElement("p");
        empty.className = "verse-group-copy";
        empty.textContent = "No verse content is available for this chapter yet.";
        container.appendChild(empty);
    }

    initializeContentInteractions(container);

    if (highlightedVerse) {
        const highlightedElement = document.getElementById(`verse-${highlightedVerse.verse_number}`);
        highlightedElement?.scrollIntoView({ block: "start" });
    }
}
