import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { isDevAdminModeEnabled } from "../../src/auth/dev-admin-mode.js";
import { createApp } from "../http/app.js";
import { DEFAULT_ADMIN_ACCOUNT } from "../../src/permissions/keys.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, "..", "..");
const contentDataDirectory = path.join(projectRoot, "content", "data");

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

let sessionCookie = "";

async function requestJson(baseUrl, pathname, options = {}) {
  const response = await fetch(`${baseUrl}${pathname}`, {
    ...options,
    headers: {
      ...(options.headers || {}),
      ...(sessionCookie ? { Cookie: sessionCookie } : {}),
    },
  });
  const setCookie = response.headers.get("set-cookie");
  if (setCookie) {
    sessionCookie = setCookie.split(";")[0];
  }
  const payload = await response.json();
  return { response, payload };
}

async function readTable(tableName) {
  const tablePath = path.join(contentDataDirectory, `${tableName}.json`);
  return JSON.parse(await fs.readFile(tablePath, "utf8"));
}

async function assertTableContains(tableName, predicate, message) {
  const rows = await readTable(tableName);
  assert(rows.some(predicate), message);
}

async function assertTableOmits(tableName, predicate, message) {
  const rows = await readTable(tableName);
  assert(!rows.some(predicate), message);
}

const app = createApp();
const server = app.listen(0);
const devAdminModeEnabled = isDevAdminModeEnabled();

server.on("listening", async () => {
  const { port } = server.address();
  const baseUrl = `http://127.0.0.1:${port}`;
  const suffix = Date.now().toString().slice(-6);

  const tempSourceBook = {
    slug: `verify-source-${suffix}`,
    title: `Verify Source ${suffix}`,
    short_title: `Source ${suffix}`,
    description: "Temporary source book for API verification.",
    book_type: "source",
    ui_order: 9001,
    is_published: false,
    cover_image: "/assets/images/lotus_background_4k.png",
    theme_key: `verify-source-${suffix}`,
    meta_title: `Verify Source ${suffix}`,
    meta_description: "Temporary source book metadata for API verification.",
  };

  const tempCollectionBook = {
    slug: `verify-collection-${suffix}`,
    title: `Verify Collection ${suffix}`,
    short_title: `Collection ${suffix}`,
    description: "Temporary collection book for API verification.",
    book_type: "collection",
    ui_order: 9002,
    is_published: false,
    cover_image: "/assets/images/lotus_background_4k.png",
    theme_key: `verify-collection-${suffix}`,
    meta_title: `Verify Collection ${suffix}`,
    meta_description: "Temporary collection book metadata for API verification.",
  };

  const tempBlankInsightBook = {
    slug: `verify-blank-insight-${suffix}`,
    title: `Verify Blank Insight ${suffix}`,
    short_title: `Blank ${suffix}`,
    description: "Temporary blank-insight book for API verification.",
    book_type: "collection",
    ui_order: 9003,
    is_published: false,
    cover_image: "/assets/images/lotus_background_4k.png",
    theme_key: `verify-blank-insight-${suffix}`,
    meta_title: `Verify Blank Insight ${suffix}`,
    meta_description: "Temporary blank-insight metadata for API verification.",
    insight_title: "",
    insight_caption: "",
    insight_media: "",
  };

  const createdIds = {
    sourceBookId: null,
    collectionBookId: null,
    blankInsightBookId: null,
    chapterId: null,
    bookSectionId: null,
    chapterSectionId: null,
    verseId: null,
    bodyBlockId: null,
  };

  try {
    const { response: healthResponse, payload: healthPayload } = await requestJson(baseUrl, "/api/health");
    assert(healthResponse.ok, "Health endpoint did not return 200.");
    assert(healthPayload.success === true, "Health endpoint did not return a success payload.");

    const { response: booksResponse, payload: booksPayload } = await requestJson(baseUrl, "/api/books");
    assert(booksResponse.ok, "Books endpoint did not return 200.");
    assert(Array.isArray(booksPayload.data), "Books endpoint did not return an array.");

    const adminBooksPageResponse = await fetch(`${baseUrl}/admin/books/index.html`);
    assert(adminBooksPageResponse.ok, "Admin books page did not return 200.");
    const adminBooksPageHtml = await adminBooksPageResponse.text();
    assert(adminBooksPageHtml.includes("/src/core/browser/page-entry.js"), "Admin books page did not include the shared page bootstrap.");

    if (devAdminModeEnabled) {
      const { response: sessionResponse, payload: sessionPayload } = await requestJson(baseUrl, "/api/auth/session");
      assert(sessionResponse.ok, "Dev admin session endpoint did not return 200.");
      assert(sessionPayload.data.user?.username === "dev-admin", "Dev admin session did not expose the synthetic admin user.");
      assert(sessionPayload.data.canAccessAdmin === true, "Dev admin session did not expose admin access.");
    } else {
      const { response: blockedAnonymousWriteResponse, payload: blockedAnonymousWritePayload } = await requestJson(baseUrl, "/api/books", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(tempSourceBook),
      });
      assert(blockedAnonymousWriteResponse.status === 401, "Unauthenticated content creation should return 401.");
      assert(blockedAnonymousWritePayload.success === false, "Unauthenticated content creation should return an error payload.");

      const { response: loginResponse, payload: loginPayload } = await requestJson(baseUrl, "/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: DEFAULT_ADMIN_ACCOUNT.email,
          password: DEFAULT_ADMIN_ACCOUNT.password,
        }),
      });
      assert(loginResponse.ok, "Admin login failed for API verification.");
      assert(loginPayload.data.canAccessAdmin === true, "Admin login did not return admin access.");
    }

    const { response: createSourceResponse, payload: createSourcePayload } = await requestJson(baseUrl, "/api/books", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(tempSourceBook),
    });
    assert(createSourceResponse.status === 201, "Temporary source book was not created.");
    createdIds.sourceBookId = createSourcePayload.data.id;

    const { response: createCollectionResponse, payload: createCollectionPayload } = await requestJson(baseUrl, "/api/books", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(tempCollectionBook),
    });
    assert(createCollectionResponse.status === 201, "Temporary collection book was not created.");
    createdIds.collectionBookId = createCollectionPayload.data.id;

    const { response: createBlankInsightBookResponse, payload: createBlankInsightBookPayload } = await requestJson(baseUrl, "/api/books", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(tempBlankInsightBook),
    });
    assert(createBlankInsightBookResponse.status === 201, "Temporary blank-insight book was not created.");
    createdIds.blankInsightBookId = createBlankInsightBookPayload.data.id;

    await assertTableContains("books", (row) => row.id === createdIds.sourceBookId, "Source book was not written to books.json.");
    await assertTableContains("books", (row) => row.id === createdIds.collectionBookId, "Collection book was not written to books.json.");
    await assertTableContains("books", (row) => row.id === createdIds.blankInsightBookId, "Blank-insight book was not written to books.json.");
    await assertTableOmits(
      "content_blocks",
      (row) => row.owner_entity === "books" && row.owner_id === createdIds.blankInsightBookId,
      "Blank optional insight fields should not auto-provision book content blocks."
    );
    await assertTableOmits(
      "media_assets",
      (row) => row.metadata?.owner_entity === "books" && row.metadata?.owner_id === createdIds.blankInsightBookId,
      "Blank optional insight fields should not auto-provision book media assets."
    );

    const { response: deleteBlankInsightBookResponse, payload: deleteBlankInsightBookPayload } = await requestJson(
      baseUrl,
      `/api/books/${createdIds.blankInsightBookId}`,
      { method: "DELETE" }
    );
    assert(deleteBlankInsightBookResponse.ok, "Deleting a newly created empty book failed.");
    assert(deleteBlankInsightBookPayload.success === true, "Deleting a newly created empty book did not return success.");
    await assertTableOmits("books", (row) => row.id === createdIds.blankInsightBookId, "Blank-insight book was not removed from books.json.");
    createdIds.blankInsightBookId = null;

    const tempChapter = {
      source_book_id: createdIds.sourceBookId,
      chapter_number: 1,
      slug: `verify-chapter-${suffix}`,
      title: `Verify Chapter ${suffix}`,
      summary: "Temporary chapter for API verification.",
      ui_order: 1,
    };

    const { response: createChapterResponse, payload: createChapterPayload } = await requestJson(baseUrl, "/api/chapters", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(tempChapter),
    });
    assert(createChapterResponse.status === 201, "Temporary chapter was not created.");
    createdIds.chapterId = createChapterPayload.data.id;
    await assertTableContains("chapters", (row) => row.id === createdIds.chapterId, "Chapter was not written to chapters.json.");

    const tempBookSection = {
      book_id: createdIds.collectionBookId,
      source_book_id: createdIds.sourceBookId,
      title: `Verify Book Section ${suffix}`,
      slug: `verify-book-section-${suffix}`,
      summary: "Temporary book section for API verification.",
      ui_order: 1,
      chapter_start: 1,
      chapter_end: 1,
    };

    const { response: createBookSectionResponse, payload: createBookSectionPayload } = await requestJson(baseUrl, "/api/book-sections", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(tempBookSection),
    });
    assert(createBookSectionResponse.status === 201, "Temporary book section was not created.");
    createdIds.bookSectionId = createBookSectionPayload.data.id;
    await assertTableContains("book_sections", (row) => row.id === createdIds.bookSectionId, "Book section was not written to book_sections.json.");

    const tempChapterSection = {
      chapter_id: createdIds.chapterId,
      section_number: 1,
      slug: `verify-chapter-section-${suffix}`,
      title: `Verify Chapter Section ${suffix}`,
      summary: "Temporary chapter section for API verification.",
      ui_order: 1,
      verse_start: 1,
      verse_end: 1,
    };

    const { response: createChapterSectionResponse, payload: createChapterSectionPayload } = await requestJson(baseUrl, "/api/chapter-sections", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(tempChapterSection),
    });
    assert(createChapterSectionResponse.status === 201, "Temporary chapter section was not created.");
    createdIds.chapterSectionId = createChapterSectionPayload.data.id;
    await assertTableContains("chapter_sections", (row) => row.id === createdIds.chapterSectionId, "Chapter section was not written to chapter_sections.json.");

    const tempVerse = {
      chapter_id: createdIds.chapterId,
      verse_number: 1,
      slug: `verify-verse-${suffix}`,
      english_text: "Temporary verse for API verification.",
      hindi_text: "API verification temporary verse.",
      transliteration_text: "verify verse transliteration",
      sanskrit_text: "verify verse sanskrit",
      is_featured: false,
    };

    const { response: createVerseResponse, payload: createVersePayload } = await requestJson(baseUrl, "/api/verses", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(tempVerse),
    });
    assert(createVerseResponse.status === 201, "Temporary verse was not created.");
    createdIds.verseId = createVersePayload.data.id;
    await assertTableContains("verses", (row) => row.id === createdIds.verseId, "Verse was not written to verses.json.");

    const tempBodyBlock = {
      owner_entity: "verses",
      owner_id: createdIds.verseId,
      region: "body",
      block_type: "rich_text",
      position: 1,
      status: "published",
      visibility: "public",
      is_published: true,
      data: {
        title: "Verification Block",
        body: "Temporary verse body block.",
      },
    };

    const { response: createBodyBlockResponse, payload: createBodyBlockPayload } = await requestJson(
      baseUrl,
      "/api/content-blocks",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(tempBodyBlock),
      }
    );
    assert(createBodyBlockResponse.status === 201, "Temporary verse body block was not created.");
    createdIds.bodyBlockId = createBodyBlockPayload.data.id;
    await assertTableContains(
      "content_blocks",
      (row) => row.id === createdIds.bodyBlockId,
      "Verse body block was not written to content_blocks.json."
    );

    const { response: filteredChaptersResponse, payload: filteredChaptersPayload } = await requestJson(
      baseUrl,
      `/api/chapters?source_book_id=${createdIds.sourceBookId}`
    );
    assert(filteredChaptersResponse.ok, "Filtered chapters endpoint did not return 200.");
    assert(filteredChaptersPayload.data.some((row) => row.id === createdIds.chapterId), "Filtered chapters endpoint did not return the created chapter.");

    const { response: filteredVersesResponse, payload: filteredVersesPayload } = await requestJson(
      baseUrl,
      `/api/verses?chapter_id=${createdIds.chapterId}`
    );
    assert(filteredVersesResponse.ok, "Filtered verses endpoint did not return 200.");
    assert(filteredVersesPayload.data.some((row) => row.id === createdIds.verseId), "Filtered verses endpoint did not return the created verse.");

    const { response: filteredContentBlocksResponse, payload: filteredContentBlocksPayload } = await requestJson(
      baseUrl,
      `/api/content-blocks?owner_entity=verses&owner_id=${createdIds.verseId}&region=body`
    );
    assert(filteredContentBlocksResponse.ok, "Filtered content blocks endpoint did not return 200.");
    assert(
      filteredContentBlocksPayload.data.some((row) => row.id === createdIds.bodyBlockId),
      "Filtered content blocks endpoint did not return the created verse body block."
    );

    const { response: updateBookResponse, payload: updateBookPayload } = await requestJson(
      baseUrl,
      `/api/books/${createdIds.collectionBookId}`,
      {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: `Verify Collection Updated ${suffix}` }),
      }
    );
    assert(updateBookResponse.ok, "Book update failed.");
    assert(updateBookPayload.data.title.includes("Updated"), "Book update did not persist.");

    const { response: updateBookSectionResponse, payload: updateBookSectionPayload } = await requestJson(
      baseUrl,
      `/api/book-sections/${createdIds.bookSectionId}`,
      {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chapter_end: 1, badge_text: "Updated" }),
      }
    );
    assert(updateBookSectionResponse.ok, "Book section update failed.");
    assert(updateBookSectionPayload.data.badge_text === "Updated", "Book section update did not persist.");

    const { response: updateChapterResponse, payload: updateChapterPayload } = await requestJson(
      baseUrl,
      `/api/chapters/${createdIds.chapterId}`,
      {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ summary: "Updated chapter summary." }),
      }
    );
    assert(updateChapterResponse.ok, "Chapter update failed.");
    assert(updateChapterPayload.data.summary === "Updated chapter summary.", "Chapter update did not persist.");

    const { response: updateChapterSectionResponse, payload: updateChapterSectionPayload } = await requestJson(
      baseUrl,
      `/api/chapter-sections/${createdIds.chapterSectionId}`,
      {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ verse_end: 1, accent_key: "updated-accent" }),
      }
    );
    assert(updateChapterSectionResponse.ok, "Chapter section update failed.");
    assert(updateChapterSectionPayload.data.accent_key === "updated-accent", "Chapter section update did not persist.");

    const { response: updateVerseResponse, payload: updateVersePayload } = await requestJson(
      baseUrl,
      `/api/verses/${createdIds.verseId}`,
      {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ english_text: "Updated verse text.", is_featured: true }),
      }
    );
    assert(updateVerseResponse.ok, "Verse update failed.");
    assert(updateVersePayload.data.english_text === "Updated verse text.", "Verse update did not persist.");
    assert(updateVersePayload.data.is_featured === true, "Verse featured flag did not persist.");

    const { response: updateBodyBlockResponse, payload: updateBodyBlockPayload } = await requestJson(
      baseUrl,
      `/api/content-blocks/${createdIds.bodyBlockId}`,
      {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: "draft",
          visibility: "hidden",
          data: {
            title: "Verification Block Updated",
            body: "Updated verse body block.",
          },
        }),
      }
    );
    assert(updateBodyBlockResponse.ok, "Verse body block update failed.");
    assert(updateBodyBlockPayload.data.status === "draft", "Verse body block status update did not persist.");
    assert(updateBodyBlockPayload.data.visibility === "hidden", "Verse body block visibility update did not persist.");
    assert(
      updateBodyBlockPayload.data.data.body === "Updated verse body block.",
      "Verse body block data update did not persist."
    );

    const { response: duplicateBookResponse, payload: duplicateBookPayload } = await requestJson(baseUrl, "/api/books", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...tempCollectionBook, title: "Duplicate Book Title" }),
    });
    assert(duplicateBookResponse.status === 400, "Duplicate book slug should fail with 400.");
    assert(duplicateBookPayload.success === false, "Duplicate book slug did not return an error payload.");

    const { response: duplicateChapterResponse } = await requestJson(baseUrl, "/api/chapters", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...tempChapter, title: "Duplicate Chapter Title", slug: `duplicate-chapter-${suffix}` }),
    });
    assert(duplicateChapterResponse.status === 400, "Duplicate chapter number should fail with 400.");

    const { response: duplicateChapterSectionResponse } = await requestJson(baseUrl, "/api/chapter-sections", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...tempChapterSection, title: "Duplicate Section Title", slug: `duplicate-section-${suffix}` }),
    });
    assert(duplicateChapterSectionResponse.status === 400, "Duplicate chapter section number should fail with 400.");

    const { response: duplicateVerseResponse } = await requestJson(baseUrl, "/api/verses", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...tempVerse, english_text: "Duplicate verse text.", slug: `duplicate-verse-${suffix}` }),
    });
    assert(duplicateVerseResponse.status === 400, "Duplicate verse number should fail with 400.");

    const { response: duplicateBodyBlockPositionResponse } = await requestJson(baseUrl, "/api/content-blocks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...tempBodyBlock,
        block_type: "commentary",
        data: {
          title: "Duplicate Position",
          body: "This should fail because position 1 is already used.",
        },
      }),
    });
    assert(duplicateBodyBlockPositionResponse.status === 400, "Duplicate verse body block position should fail with 400.");

    const { response: invalidBookSectionResponse } = await requestJson(baseUrl, "/api/book-sections", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...tempBookSection,
        slug: `invalid-book-section-${suffix}`,
        title: `Invalid Book Section ${suffix}`,
        ui_order: 2,
        chapter_start: 4,
        chapter_end: 2,
      }),
    });
    assert(invalidBookSectionResponse.status === 400, "Invalid book section range should fail with 400.");

    const { response: invalidChapterSectionResponse } = await requestJson(baseUrl, "/api/chapter-sections", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...tempChapterSection,
        slug: `invalid-chapter-section-${suffix}`,
        title: `Invalid Chapter Section ${suffix}`,
        section_number: 2,
        verse_start: 5,
        verse_end: 1,
      }),
    });
    assert(invalidChapterSectionResponse.status === 400, "Invalid chapter section range should fail with 400.");

    const { response: invalidSourceBookUpdateResponse, payload: invalidSourceBookUpdatePayload } = await requestJson(
      baseUrl,
      `/api/books/${createdIds.sourceBookId}`,
      {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ book_type: "collection" }),
      }
    );
    assert(invalidSourceBookUpdateResponse.status === 400, "Breaking public graph update should fail with 400.");
    assert(
      String(invalidSourceBookUpdatePayload.error || "").includes("public content database"),
      "Breaking public graph update should explain the public database failure."
    );

    const { response: blockedBookDeleteResponse, payload: blockedBookDeletePayload } = await requestJson(
      baseUrl,
      `/api/books/${createdIds.sourceBookId}`,
      { method: "DELETE" }
    );
    assert(blockedBookDeleteResponse.status === 409, "Delete protection for books did not return 409.");
    assert(blockedBookDeletePayload.success === false, "Delete protection for books did not return an error payload.");

    const { response: blockedChapterDeleteResponse, payload: blockedChapterDeletePayload } = await requestJson(
      baseUrl,
      `/api/chapters/${createdIds.chapterId}`,
      { method: "DELETE" }
    );
    assert(blockedChapterDeleteResponse.status === 409, "Delete protection for chapters did not return 409.");
    assert(blockedChapterDeletePayload.success === false, "Delete protection for chapters did not return an error payload.");

    const { response: blockedVerseDeleteResponse, payload: blockedVerseDeletePayload } = await requestJson(
      baseUrl,
      `/api/verses/${createdIds.verseId}`,
      { method: "DELETE" }
    );
    assert(blockedVerseDeleteResponse.status === 409, "Delete protection for verses did not return 409 when body content blocks exist.");
    assert(blockedVerseDeletePayload.success === false, "Delete protection for verses did not return an error payload.");

    const cleanupSteps = [
      ["/api/content-blocks", createdIds.bodyBlockId, "content_blocks", (row) => row.id === createdIds.bodyBlockId],
      ["/api/verses", createdIds.verseId, "verses", (row) => row.id === createdIds.verseId],
      ["/api/chapter-sections", createdIds.chapterSectionId, "chapter_sections", (row) => row.id === createdIds.chapterSectionId],
      ["/api/book-sections", createdIds.bookSectionId, "book_sections", (row) => row.id === createdIds.bookSectionId],
      ["/api/chapters", createdIds.chapterId, "chapters", (row) => row.id === createdIds.chapterId],
      ["/api/books", createdIds.collectionBookId, "books", (row) => row.id === createdIds.collectionBookId],
      ["/api/books", createdIds.sourceBookId, "books", (row) => row.id === createdIds.sourceBookId],
    ];

    for (const [routeBase, id, tableName, predicate] of cleanupSteps) {
      const { response } = await requestJson(baseUrl, `${routeBase}/${id}`, { method: "DELETE" });
      assert(response.ok, `Cleanup delete failed for ${tableName}:${id}.`);
      await assertTableOmits(tableName, predicate, `Cleanup did not remove ${tableName}:${id} from disk.`);
    }

    console.log("API verification passed");
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  } finally {
    const cleanupSteps = [
      ["/api/books", createdIds.blankInsightBookId],
      ["/api/content-blocks", createdIds.bodyBlockId],
      ["/api/verses", createdIds.verseId],
      ["/api/chapter-sections", createdIds.chapterSectionId],
      ["/api/book-sections", createdIds.bookSectionId],
      ["/api/chapters", createdIds.chapterId],
      ["/api/books", createdIds.collectionBookId],
      ["/api/books", createdIds.sourceBookId],
    ];

    for (const [routeBase, id] of cleanupSteps) {
      if (!id) {
        continue;
      }

      try {
        await fetch(`${baseUrl}${routeBase}/${id}`, { method: "DELETE" });
      } catch {
        // Cleanup is best-effort here so verification can still report the original failure.
      }
    }

    if (sessionCookie) {
      try {
        await fetch(`${baseUrl}/api/auth/logout`, {
          method: "POST",
          headers: {
            Cookie: sessionCookie,
          },
        });
      } catch {
        // Session cleanup is best-effort here so verification can still report the original failure.
      }
    }

    server.close();
  }
});
