import {
    CHARACTER_FALLBACK_IMAGE,
    listCharacters,
    listCharacterFilterValues,
} from "../../content/characters/queries.js";
import { getCharacterPageModel } from "../../content/services/page-models.js";
import { renderRegion } from "../../render/layout/region-renderer.js";
import { createSharedPageDefinition } from "../shared-page.js";

function buildOptions(select, values) {
    values.forEach((value) => {
        const option = document.createElement("option");
        option.value = value;
        option.textContent = value;
        select.appendChild(option);
    });
}

function createCard(character, routes) {
    const card = document.createElement("a");
    card.className = "character-card";
    card.href = routes ? routes.characters.bySlug(character.slug) : `/characters/index.html?slug=${encodeURIComponent(character.slug)}`;
    card.setAttribute("role", "listitem");
    card.setAttribute("aria-label", `Open ${character.name} character page`);
    card.dataset.adminEntity = "characters";
    card.dataset.adminId = character.id;
    card.dataset.adminSlug = character.slug;

    const media = document.createElement("span");
    media.className = "character-card-media";

    const image = document.createElement("img");
    image.src = character.image || CHARACTER_FALLBACK_IMAGE;
    image.alt = `${character.name} portrait`;
    image.loading = "lazy";
    image.onerror = () => {
        image.src = CHARACTER_FALLBACK_IMAGE;
    };

    const body = document.createElement("span");
    body.className = "character-card-body";

    const name = document.createElement("span");
    name.className = "character-card-name";
    name.textContent = character.name;

    const meta = document.createElement("span");
    meta.className = "character-card-meta";
    meta.textContent = character.short_meta;

    media.appendChild(image);
    body.append(name, meta);
    card.append(media, body);
    return card;
}

function sortCharacters(characters, sortValue) {
    const sorted = [...characters];

    if (sortValue === "z-a") {
        sorted.sort((a, b) => b.name.localeCompare(a.name));
        return sorted;
    }

    sorted.sort((a, b) => a.name.localeCompare(b.name));
    return sorted;
}

function characterMatchesSearch(character, searchTerm) {
    if (!searchTerm) return true;

    const haystack = [
        character.name,
        character.tradition,
        character.role,
        character.era,
        character.collection,
        character.short_meta,
        character.summary,
        character.focus,
        ...(character.aliases || []),
        ...(character.tags || []),
        ...(character.search_terms || []),
    ]
        .join(" ")
        .toLowerCase();

    return haystack.includes(searchTerm);
}

function setPageMode(mode, slug = "") {
    const body = document.body;
    if (!body) return;

    body.classList.remove("character-page", "collection-page", "character-detail-page");
    if (mode === "detail") {
        body.classList.add("character-detail-page");
        body.dataset.educationItem = slug ? `character-${slug}` : "characters-all";
        window.sharedLayout?.syncEducationNavigation?.();
        return;
    }

    body.classList.add("character-page", "collection-page");
    body.dataset.educationItem = "characters-all";
    window.sharedLayout?.syncEducationNavigation?.();
}

function renderCollectionView(routes) {
    const collectionView = document.getElementById("characterCollectionView");
    const detailView = document.getElementById("characterDetailView");
    const grid = document.getElementById("characterGrid");
    const emptyState = document.getElementById("characterEmpty");
    const resultCount = document.getElementById("characterResultsCount");
    const searchInput = document.getElementById("characterSearch");
    const traditionSelect = document.getElementById("characterTradition");
    const roleSelect = document.getElementById("characterRole");
    const eraSelect = document.getElementById("characterEra");
    const collectionSelect = document.getElementById("characterCollection");
    const sortSelect = document.getElementById("characterSort");
    const clearButton = document.getElementById("characterClearFilters");

    if (
        !collectionView ||
        !detailView ||
        !grid ||
        !emptyState ||
        !resultCount ||
        !searchInput ||
        !traditionSelect ||
        !roleSelect ||
        !eraSelect ||
        !collectionSelect ||
        !sortSelect ||
        !clearButton
    ) {
        return;
    }

    setPageMode("collection");
    collectionView.hidden = false;
    detailView.hidden = true;
    document.title = "Bhagavad Gita | All Characters";

    if (!traditionSelect.dataset.optionsReady) {
        const filterValues = listCharacterFilterValues();
        buildOptions(traditionSelect, filterValues.tradition);
        buildOptions(roleSelect, filterValues.role);
        buildOptions(eraSelect, filterValues.era);
        buildOptions(collectionSelect, filterValues.collection);
        traditionSelect.dataset.optionsReady = "true";
    }

    const allCharacters = listCharacters();
    const update = () => {
        const searchTerm = searchInput.value.trim().toLowerCase();
        const filtered = allCharacters.filter((character) => {
            if (!characterMatchesSearch(character, searchTerm)) return false;
            if (traditionSelect.value && character.tradition !== traditionSelect.value) return false;
            if (roleSelect.value && character.role !== roleSelect.value) return false;
            if (eraSelect.value && character.era !== eraSelect.value) return false;
            if (collectionSelect.value && character.collection !== collectionSelect.value) return false;
            return true;
        });

        const sorted = sortCharacters(filtered, sortSelect.value);

        grid.innerHTML = "";
        sorted.forEach((character) => {
            grid.appendChild(createCard(character, routes));
        });

        resultCount.textContent = `Showing ${sorted.length} of ${allCharacters.length} characters`;
        emptyState.hidden = sorted.length !== 0;
        grid.hidden = sorted.length === 0;
    };

    [searchInput, traditionSelect, roleSelect, eraSelect, collectionSelect, sortSelect].forEach((control) => {
        control.addEventListener("input", update);
        control.addEventListener("change", update);
    });

    clearButton.addEventListener("click", () => {
        searchInput.value = "";
        traditionSelect.value = "";
        roleSelect.value = "";
        eraSelect.value = "";
        collectionSelect.value = "";
        sortSelect.value = "a-z";
        update();
    });

    update();
}

function renderNotFound() {
    document.title = "Bhagavad Gita | Character Not Found";

    const title = document.getElementById("characterName");
    const summary = document.getElementById("characterSummary");
    const image = document.getElementById("characterImage");
    const overview = document.getElementById("characterOverview");
    const focus = document.getElementById("characterFocus");
    const chips = document.getElementById("characterChips");
    const note = document.getElementById("characterAvailabilityNote");
    const breadcrumb = document.getElementById("characterBreadcrumbCurrent");
    const insightRegion = document.getElementById("characterInsightBlocks");
    const bodyRegion = document.getElementById("characterBodyBlocks");

    if (title) title.textContent = "Character Not Found";
    if (summary) summary.textContent = "The requested character does not exist in the current collection.";
    if (image) {
        image.src = CHARACTER_FALLBACK_IMAGE;
        image.alt = "Character placeholder";
    }
    if (overview) overview.textContent = "Check the character collection and choose a valid entry from the gallery.";
    if (focus) focus.textContent = "Available once a valid character slug is selected.";
    if (chips) chips.innerHTML = "";
    if (note) note.textContent = "No character data was found for this route.";
    if (breadcrumb) breadcrumb.textContent = "Unknown Character";
    if (insightRegion) {
        insightRegion.hidden = true;
        insightRegion.innerHTML = "";
    }
    if (bodyRegion) {
        bodyRegion.hidden = true;
        bodyRegion.innerHTML = "";
    }
}

function renderDetailView(slug) {
    const collectionView = document.getElementById("characterCollectionView");
    const detailView = document.getElementById("characterDetailView");
    if (!collectionView || !detailView) return;

    setPageMode("detail", slug);
    collectionView.hidden = true;
    detailView.hidden = false;

    const pageModel = getCharacterPageModel(slug, {
        includeDraft: document.body.dataset.pageMode === "admin",
        includeHidden: document.body.dataset.pageMode === "admin",
    });
    const character = pageModel?.character || null;
    if (!character || !pageModel) {
        renderNotFound();
        return;
    }

    document.title = `Bhagavad Gita | ${character.name}`;

    const title = document.getElementById("characterName");
    const summary = document.getElementById("characterSummary");
    const image = document.getElementById("characterImage");
    const overview = document.getElementById("characterOverview");
    const focus = document.getElementById("characterFocus");
    const chips = document.getElementById("characterChips");
    const note = document.getElementById("characterAvailabilityNote");
    const breadcrumb = document.getElementById("characterBreadcrumbCurrent");
    const profileCard = document.querySelector(".character-profile-card");
    const insightRegion = document.getElementById("characterInsightBlocks");
    const bodyRegion = document.getElementById("characterBodyBlocks");

    if (title) title.textContent = character.name;
    if (summary) summary.textContent = character.summary;
    if (image) {
        image.src = character.image || CHARACTER_FALLBACK_IMAGE;
        image.alt = `${character.name} portrait`;
        image.onerror = () => {
            image.src = CHARACTER_FALLBACK_IMAGE;
        };
    }
    if (overview) overview.textContent = character.overview;
    if (focus) focus.textContent = character.focus;
    if (breadcrumb) breadcrumb.textContent = character.name;
    if (profileCard instanceof HTMLElement) {
        profileCard.dataset.adminEntity = "characters";
        profileCard.dataset.adminId = character.id;
        profileCard.dataset.adminSlug = character.slug;
    }

    if (chips) {
        chips.innerHTML = "";
        [character.tradition, character.role, character.era, character.collection].forEach((value) => {
            const chip = document.createElement("span");
            chip.className = "character-chip";
            chip.textContent = value;
            chips.appendChild(chip);
        });
    }

    if (note) {
        note.textContent = character.detail_available
            ? "This profile is part of the current detailed character set and will expand with deeper linked material over time."
            : "This profile currently uses a structured placeholder built from collection metadata and will expand into a fuller study page later.";
    }

    if (insightRegion instanceof HTMLElement) {
        renderRegion(insightRegion, pageModel.regions.insight, {
            renderOptions: {
                presentation: "insight-dropdown",
                wrapperClassName: "chapter-section-insight",
                buttonId: `characterInsightToggle-${character.id}`,
                panelId: `characterInsightPanel-${character.id}`,
                buttonClassName: "section-insight-btn",
                headingTag: "h2",
                fallbackTitle: character.name,
                alt: `${character.name} insight thumbnail`,
                fallbackMedia: CHARACTER_FALLBACK_IMAGE,
            },
        });
        insightRegion.hidden = pageModel.regions.insight.length === 0;
    }

    if (bodyRegion instanceof HTMLElement) {
        renderRegion(bodyRegion, pageModel.regions.body, {
            emptyMessage: "",
        });
        bodyRegion.hidden = pageModel.regions.body.length === 0;
    }
}

function initializeCharactersPage({ routes }) {
    const slug = new URLSearchParams(window.location.search).get("slug") || "";
    if (slug) {
        renderDetailView(slug);
        return;
    }

    renderCollectionView(routes);
}

export const CHARACTERS_PAGE_DEFINITION = createSharedPageDefinition({
    id: "characters",
    title: "Bhagavad Gita | Characters",
    bodyClasses: ["character-page", "collection-page"],
    bodyDataset: {
        navSection: "education",
        educationItem: "characters-all",
        footerVariant: "characters",
    },
    shellClassName: "character-shell",
    render() {
        return `
            <main>
                <section class="character-main" id="characterCollectionView">
                    <section class="character-hero">
                        <span class="lotus-large" aria-hidden="true"></span>
                        <h1>All Characters</h1>
                        <p class="subtitle">Browse teachers, seekers, saints, philosophers, and symbolic figures through one scalable character collection.</p>
                    </section>

                    <section class="character-discovery">
                        <div class="character-toolbar">
                            <div class="character-search-block">
                                <label class="character-control-label" for="characterSearch">Search Characters</label>
                                <input id="characterSearch" class="character-search-input" type="search" placeholder="Search by name, role, tradition, or collection">
                            </div>

                            <div class="character-filter-grid">
                                <div class="character-filter-item">
                                    <label class="character-control-label" for="characterTradition">Tradition</label>
                                    <select id="characterTradition" class="character-filter-select">
                                        <option value="">All Traditions</option>
                                    </select>
                                </div>
                                <div class="character-filter-item">
                                    <label class="character-control-label" for="characterRole">Role</label>
                                    <select id="characterRole" class="character-filter-select">
                                        <option value="">All Roles</option>
                                    </select>
                                </div>
                                <div class="character-filter-item">
                                    <label class="character-control-label" for="characterEra">Era</label>
                                    <select id="characterEra" class="character-filter-select">
                                        <option value="">All Eras</option>
                                    </select>
                                </div>
                                <div class="character-filter-item">
                                    <label class="character-control-label" for="characterCollection">Collection</label>
                                    <select id="characterCollection" class="character-filter-select">
                                        <option value="">All Collections</option>
                                    </select>
                                </div>
                                <div class="character-filter-item">
                                    <label class="character-control-label" for="characterSort">Sort</label>
                                    <select id="characterSort" class="character-filter-select">
                                        <option value="a-z">A-Z</option>
                                        <option value="z-a">Z-A</option>
                                    </select>
                                </div>
                            </div>

                            <div class="character-toolbar-meta">
                                <p class="character-results-count" id="characterResultsCount">Showing 0 of 0 characters</p>
                                <button class="character-clear-btn" id="characterClearFilters" type="button">Clear filters</button>
                            </div>
                        </div>

                        <div class="character-grid" id="characterGrid" role="list"></div>
                        <div class="character-empty" id="characterEmpty" hidden>
                            <h2>No Characters Found</h2>
                            <p>Try a different search term or clear one of the active filters.</p>
                        </div>
                    </section>
                </section>

                <section class="character-detail-main" id="characterDetailView" hidden>
                    <nav class="character-breadcrumb" aria-label="Breadcrumb">
                        <a href="#" data-route="home">Home</a>
                        <span>&gt;</span>
                        <a href="#" data-route="characters.index">All Characters</a>
                        <span>&gt;</span>
                        <span id="characterBreadcrumbCurrent">Character</span>
                    </nav>

                    <section class="character-profile-card">
                        <div class="character-profile-media">
                            <img id="characterImage" src="/assets/images/image.png" alt="Character portrait">
                        </div>
                        <div class="character-profile-content">
                            <h1 id="characterName">Character</h1>
                            <p class="character-profile-summary" id="characterSummary">Character summary will appear here.</p>
                            <div class="character-chip-list" id="characterChips"></div>
                        </div>
                    </section>

                    <section class="character-detail-grid">
                        <article class="character-detail-panel">
                            <h2>Overview</h2>
                            <p id="characterOverview">Character overview will appear here.</p>
                        </article>
                        <article class="character-detail-panel">
                            <h2>Teaching Focus</h2>
                            <p id="characterFocus">Primary teaching focus will appear here.</p>
                        </article>
                        <article class="character-detail-panel">
                            <h2>Availability Note</h2>
                            <p id="characterAvailabilityNote">Availability note will appear here.</p>
                        </article>
                    </section>

                    <section class="explanation-section" id="characterInsightBlocks" hidden></section>
                    <section class="explanation-section" id="characterBodyBlocks" hidden></section>
                </section>
            </main>
        `;
    },
    init: initializeCharactersPage,
});

export { CHARACTERS_PAGE_DEFINITION as PAGE_DEFINITION };
