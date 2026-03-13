import { CONTENT_FIELD_CONFIGS } from "../content/books/schema.js";
import { getEntityEditPermissionKey } from "../permissions/access.js";

export const CONTENT_ADMIN_ENTITY_CONFIGS = Object.freeze({
    books: Object.freeze({
        entity: "books",
        label: "Book",
        endpoint: "/api/books",
        collectionKey: "books",
        fields: CONTENT_FIELD_CONFIGS.books,
        permissionKey: getEntityEditPermissionKey("books"),
        sortable: true,
        orderField: "ui_order",
    }),
    book_sections: Object.freeze({
        entity: "book_sections",
        label: "Book Section",
        endpoint: "/api/book-sections",
        collectionKey: "bookSections",
        fields: CONTENT_FIELD_CONFIGS.book_sections,
        permissionKey: getEntityEditPermissionKey("book_sections"),
        sortable: true,
        orderField: "ui_order",
    }),
    chapters: Object.freeze({
        entity: "chapters",
        label: "Chapter",
        endpoint: "/api/chapters",
        collectionKey: "chapters",
        fields: CONTENT_FIELD_CONFIGS.chapters,
        permissionKey: getEntityEditPermissionKey("chapters"),
        sortable: false,
    }),
    chapter_sections: Object.freeze({
        entity: "chapter_sections",
        label: "Chapter Section",
        endpoint: "/api/chapter-sections",
        collectionKey: "chapterSections",
        fields: CONTENT_FIELD_CONFIGS.chapter_sections,
        permissionKey: getEntityEditPermissionKey("chapter_sections"),
        sortable: true,
        orderField: "ui_order",
    }),
    verses: Object.freeze({
        entity: "verses",
        label: "Verse",
        endpoint: "/api/verses",
        collectionKey: "verses",
        fields: CONTENT_FIELD_CONFIGS.verses,
        permissionKey: getEntityEditPermissionKey("verses"),
        sortable: false,
    }),
});

export function getContentEntityConfig(entity) {
    return CONTENT_ADMIN_ENTITY_CONFIGS[entity] || null;
}
