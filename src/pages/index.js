import { PAGE_DEFINITION as HOME_PAGE_DEFINITION } from "./home/home-page.js";
import { PAGE_DEFINITION as BOOKS_PAGE_DEFINITION } from "./books/books-page.js";
import { PAGE_DEFINITION as CHAPTERS_PAGE_DEFINITION } from "./chapters/chapters-page.js";
import { PAGE_DEFINITION as VERSES_PAGE_DEFINITION } from "./verses/verses-page.js";
import { PAGE_DEFINITION as EXPLANATIONS_PAGE_DEFINITION } from "./explanations/explanations-page.js";
import { PAGE_DEFINITION as CHARACTERS_PAGE_DEFINITION } from "./characters/characters-page.js";
import { PAGE_DEFINITION as TOPICS_PAGE_DEFINITION } from "./topics/topics-page.js";
import { PAGE_DEFINITION as PLACES_PAGE_DEFINITION } from "./places/places-page.js";
import { PAGE_DEFINITION as PROFILE_PAGE_DEFINITION } from "./profile/profile-page.js";

const SHARED_PAGE_DEFINITIONS = Object.freeze({
    home: HOME_PAGE_DEFINITION,
    books: BOOKS_PAGE_DEFINITION,
    chapters: CHAPTERS_PAGE_DEFINITION,
    verses: VERSES_PAGE_DEFINITION,
    explanations: EXPLANATIONS_PAGE_DEFINITION,
    characters: CHARACTERS_PAGE_DEFINITION,
    topics: TOPICS_PAGE_DEFINITION,
    places: PLACES_PAGE_DEFINITION,
    profile: PROFILE_PAGE_DEFINITION,
});

export function getSharedPageDefinition(pageId) {
    return SHARED_PAGE_DEFINITIONS[pageId] || null;
}
