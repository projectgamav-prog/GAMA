export const PERMISSION_DEFINITIONS = Object.freeze([
    { key: "books.view", label: "Books View", description: "View book-level content controls and protected book resources." },
    { key: "books.edit", label: "Books Edit", description: "Edit books and book sections." },
    { key: "chapters.edit", label: "Chapters Edit", description: "Edit chapters and chapter sections." },
    { key: "verses.edit", label: "Verses Edit", description: "Edit verse content." },
    { key: "places.edit", label: "Places Edit", description: "Edit place content when a place model is connected." },
    { key: "characters.edit", label: "Characters Edit", description: "Edit character content when a character model is connected." },
    { key: "topics.edit", label: "Topics Edit", description: "Edit topic content when a topic model is connected." },
    { key: "content.create", label: "Content Create", description: "Create new content records." },
    { key: "content.delete", label: "Content Delete", description: "Delete content records." },
    { key: "content.publish", label: "Content Publish", description: "Publish or unpublish content." },
    { key: "media.upload", label: "Media Upload", description: "Upload or manage media assets." },
    { key: "users.manage", label: "Users Manage", description: "Assign and manage user roles." },
    { key: "permissions.manage", label: "Permissions Manage", description: "Manage role permissions and per-user overrides." },
    { key: "settings.manage", label: "Settings Manage", description: "Manage global admin settings." },
]);

export const PERMISSION_KEYS = Object.freeze(PERMISSION_DEFINITIONS.map((item) => item.key));

export const ROLE_DEFINITIONS = Object.freeze([
    { id: "guest", label: "Guest", description: "Unauthenticated public visitor." },
    { id: "member", label: "Member", description: "Authenticated reader with no authoring access." },
    { id: "editor", label: "Editor", description: "Content editor with create/edit/delete access for the books hierarchy." },
    { id: "admin", label: "Admin", description: "Full access to content, permissions, and settings." },
]);

export const DEFAULT_ROLE_PERMISSION_MAP = Object.freeze({
    guest: Object.freeze(["books.view"]),
    member: Object.freeze(["books.view"]),
    editor: Object.freeze([
        "books.view",
        "books.edit",
        "chapters.edit",
        "verses.edit",
        "content.create",
        "content.delete",
        "content.publish",
        "media.upload",
    ]),
    admin: Object.freeze([...PERMISSION_KEYS]),
});

export const ENTITY_EDIT_PERMISSION_MAP = Object.freeze({
    books: "books.edit",
    book_sections: "books.edit",
    chapters: "chapters.edit",
    chapter_sections: "chapters.edit",
    verses: "verses.edit",
    characters: "characters.edit",
    topics: "topics.edit",
    places: "places.edit",
});

export const ADMIN_ACCESS_PERMISSIONS = Object.freeze([
    "books.edit",
    "chapters.edit",
    "verses.edit",
    "users.manage",
    "permissions.manage",
    "settings.manage",
]);

export const DEFAULT_ADMIN_ACCOUNT = Object.freeze({
    username: "admin",
    email: "admin@bhagavadgita.local",
    fullName: "Bhagavad Gita Admin",
    password: "Admin12345!",
});
