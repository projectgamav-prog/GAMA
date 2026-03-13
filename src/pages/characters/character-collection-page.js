import {
    CHARACTERS,
    CHARACTER_FALLBACK_IMAGE,
    listCharacterFilterValues,
} from "../../content/characters/queries.js";

const routes = window.APP_ROUTES;

function buildOptions(select, values) {
    values.forEach((value) => {
        const option = document.createElement("option");
        option.value = value;
        option.textContent = value;
        select.appendChild(option);
    });
}

function createCard(character) {
    const card = document.createElement("a");
    card.className = "character-card";
    card.href = routes ? routes.characters.bySlug(character.slug) : `/characters/detail.html?slug=${encodeURIComponent(character.slug)}`;
    card.setAttribute("role", "listitem");
    card.setAttribute("aria-label", `Open ${character.name} character page`);

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

function render() {
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

    const filterValues = listCharacterFilterValues();

    buildOptions(traditionSelect, filterValues.tradition);
    buildOptions(roleSelect, filterValues.role);
    buildOptions(eraSelect, filterValues.era);
    buildOptions(collectionSelect, filterValues.collection);

    const update = () => {
        const searchTerm = searchInput.value.trim().toLowerCase();
        const filtered = CHARACTERS.filter((character) => {
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
            grid.appendChild(createCard(character));
        });

        resultCount.textContent = `Showing ${sorted.length} of ${CHARACTERS.length} characters`;
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

render();
