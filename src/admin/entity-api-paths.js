export const ADMIN_ENTITY_API_PATHS = Object.freeze({
    books: "/api/books",
    book_sections: "/api/book-sections",
    chapters: "/api/chapters",
    chapter_sections: "/api/chapter-sections",
    verses: "/api/verses",
    characters: "/api/characters",
    content_blocks: "/api/content-blocks",
    media_assets: "/api/media-assets",
    explanation_documents: "/api/explanation-documents",
    explanation_blocks: "/api/explanation-blocks",
});

export function getAdminEntityApiPath(entity) {
    return ADMIN_ENTITY_API_PATHS[entity] || "";
}

export function getAdminEntityApiMountPath(entity) {
    const apiPath = getAdminEntityApiPath(entity);
    return apiPath.startsWith("/api/") ? apiPath.slice(4) : apiPath;
}
