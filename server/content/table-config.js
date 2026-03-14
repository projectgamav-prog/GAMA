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
  },
  explanation_documents: {
    label: "Explanation document",
    relatedTables: ["books", "book_sections", "chapters", "chapter_sections", "verses"]
  },
  explanation_blocks: {
    label: "Explanation block",
    relatedTables: ["explanation_documents"]
  }
});

export const deleteConstraints = Object.freeze({
  books: [
    { table: "chapters", field: "source_book_id", label: "chapters" },
    { table: "book_sections", field: "book_id", label: "book sections" },
    { table: "book_sections", field: "source_book_id", label: "book sections" },
    { table: "content_blocks", field: "owner_id", label: "content blocks", where: { owner_entity: "books" } },
    { table: "explanation_documents", field: "target_id", label: "explanation documents", where: { target_type: "book" } }
  ],
  book_sections: [
    { table: "content_blocks", field: "owner_id", label: "content blocks", where: { owner_entity: "book_sections" } },
    { table: "explanation_documents", field: "target_id", label: "explanation documents", where: { target_type: "book_section" } }
  ],
  chapters: [
    { table: "verses", field: "chapter_id", label: "verses" },
    { table: "chapter_sections", field: "chapter_id", label: "chapter sections" },
    { table: "content_blocks", field: "owner_id", label: "content blocks", where: { owner_entity: "chapters" } },
    { table: "explanation_documents", field: "target_id", label: "explanation documents", where: { target_type: "chapter" } }
  ],
  chapter_sections: [
    { table: "content_blocks", field: "owner_id", label: "content blocks", where: { owner_entity: "chapter_sections" } },
    { table: "explanation_documents", field: "target_id", label: "explanation documents", where: { target_type: "chapter_section" } }
  ],
  verses: [
    { table: "content_blocks", field: "owner_id", label: "content blocks", where: { owner_entity: "verses" } },
    { table: "explanation_documents", field: "target_id", label: "explanation documents", where: { target_type: "verse" } }
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
  explanation_documents: [
    { table: "explanation_blocks", field: "explanation_id", label: "explanation blocks" }
  ],
  explanation_blocks: [],
});
