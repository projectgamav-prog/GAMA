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
    { table: "explanation_documents", field: "target_id", label: "explanation documents", where: { target_type: "book" } }
  ],
  book_sections: [
    { table: "explanation_documents", field: "target_id", label: "explanation documents", where: { target_type: "book_section" } }
  ],
  chapters: [
    { table: "verses", field: "chapter_id", label: "verses" },
    { table: "chapter_sections", field: "chapter_id", label: "chapter sections" },
    { table: "explanation_documents", field: "target_id", label: "explanation documents", where: { target_type: "chapter" } }
  ],
  chapter_sections: [
    { table: "explanation_documents", field: "target_id", label: "explanation documents", where: { target_type: "chapter_section" } }
  ],
  verses: [
    { table: "explanation_documents", field: "target_id", label: "explanation documents", where: { target_type: "verse" } }
  ],
  explanation_documents: [
    { table: "explanation_blocks", field: "explanation_id", label: "explanation blocks" }
  ],
  explanation_blocks: [],
});
