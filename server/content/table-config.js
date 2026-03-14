export const tableConfigs = Object.freeze({
  books: {
    label: "Book",
    relatedTables: []
  },
  book_sections: {
    label: "Book section",
    relatedTables: ["books"]
  },
  chapters: {
    label: "Chapter",
    relatedTables: ["books"]
  },
  chapter_sections: {
    label: "Chapter section",
    relatedTables: ["chapters"]
  },
  verses: {
    label: "Verse",
    relatedTables: ["chapters"]
  },
  characters: {
    label: "Character",
    relatedTables: []
  },
  content_blocks: {
    label: "Content block",
    relatedTables: ["books", "book_sections", "chapters", "chapter_sections", "verses", "characters", "media_assets"]
  },
  media_assets: {
    label: "Media asset",
    relatedTables: []
  },
  roles: {
    label: "Role",
    relatedTables: []
  },
  role_capabilities: {
    label: "Role capability",
    relatedTables: ["roles"]
  },
  user_role_assignments: {
    label: "User role assignment",
    relatedTables: ["roles"]
  }
});

export const deleteConstraints = Object.freeze({
  books: [
    { table: "chapters", field: "source_book_id", label: "chapters" },
    { table: "book_sections", field: "book_id", label: "book sections" },
    { table: "book_sections", field: "source_book_id", label: "book sections" },
    { table: "content_blocks", field: "owner_id", label: "content blocks", where: { owner_entity: "books" } }
  ],
  book_sections: [
    { table: "content_blocks", field: "owner_id", label: "content blocks", where: { owner_entity: "book_sections" } }
  ],
  chapters: [
    { table: "verses", field: "chapter_id", label: "verses" },
    { table: "chapter_sections", field: "chapter_id", label: "chapter sections" },
    { table: "content_blocks", field: "owner_id", label: "content blocks", where: { owner_entity: "chapters" } }
  ],
  chapter_sections: [
    { table: "content_blocks", field: "owner_id", label: "content blocks", where: { owner_entity: "chapter_sections" } }
  ],
  verses: [
    { table: "content_blocks", field: "owner_id", label: "content blocks", where: { owner_entity: "verses" } }
  ],
  characters: [
    { table: "content_blocks", field: "owner_id", label: "content blocks", where: { owner_entity: "characters" } }
  ],
  content_blocks: [],
  media_assets: [],
  roles: [
    { table: "role_capabilities", field: "role_id", label: "role capabilities" },
    { table: "user_role_assignments", field: "role_id", label: "user role assignments" }
  ],
  role_capabilities: [],
  user_role_assignments: [],
});
