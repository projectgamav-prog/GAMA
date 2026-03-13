import { getCharacterBySlug, CHARACTER_FALLBACK_IMAGE } from "../../content/characters/queries.js";

function renderNotFound() {
    const title = document.getElementById("characterName");
    const summary = document.getElementById("characterSummary");
    const image = document.getElementById("characterImage");
    const overview = document.getElementById("characterOverview");
    const focus = document.getElementById("characterFocus");
    const chips = document.getElementById("characterChips");
    const note = document.getElementById("characterAvailabilityNote");
    const breadcrumb = document.getElementById("characterBreadcrumbCurrent");

    document.title = "Bhagavad Gita | Character Not Found";

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
}

function renderCharacter() {
    const params = new URLSearchParams(window.location.search);
    const slug = params.get("slug") || "";
    const character = getCharacterBySlug(slug);

    if (!character) {
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
}

renderCharacter();
