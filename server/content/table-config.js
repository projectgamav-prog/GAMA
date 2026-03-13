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
  }
});

export const deleteConstraints = Object.freeze({
  books: [
    { table: "chapters", field: "source_book_id", label: "chapters" },
    { table: "book_sections", field: "book_id", label: "book sections" },
    { table: "book_sections", field: "source_book_id", label: "book sections" }
  ],
  book_sections: [],
  chapters: [
    { table: "verses", field: "chapter_id", label: "verses" },
    { table: "chapter_sections", field: "chapter_id", label: "chapter sections" }
  ],
  chapter_sections: [],
  verses: [],
});
