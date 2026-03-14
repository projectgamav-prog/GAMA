import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const projectRoot = path.resolve(__dirname, "..", "..");
export const contentDirectory = path.join(projectRoot, "content");
export const contentDataDirectory = path.join(contentDirectory, "data");
export const dataDirectory = path.join(projectRoot, "data");
export const systemDataDirectory = path.join(dataDirectory, "system");
export const adminDirectory = path.join(projectRoot, "admin");

export const tableFileMap = Object.freeze({
  books: "books.json",
  book_sections: "book_sections.json",
  chapters: "chapters.json",
  chapter_sections: "chapter_sections.json",
  verses: "verses.json",
  characters: "characters.json",
  content_blocks: "content_blocks.json",
  media_assets: "media_assets.json",
  roles: "roles.json",
  role_capabilities: "role_capabilities.json",
  user_role_assignments: "user_role_assignments.json",
  explanation_documents: "explanation_documents.json",
  explanation_blocks: "explanation_blocks.json"
});

export function getTablePath(tableName) {
  const fileName = tableFileMap[tableName];
  if (!fileName) {
    throw new Error(`Unknown table "${tableName}".`);
  }

  return path.join(contentDataDirectory, fileName);
}
