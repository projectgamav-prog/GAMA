import { canEditEntity, hasPermission } from "../permissions/access.js";
import {
    getContentEntityConfig,
} from "./content-config.js";

function getRecordLabel(entity, record) {
    const config = getContentEntityConfig(entity);
    if (!config || !record) {
        return "";
    }

    return config.getRecordLabel?.(record) || config.label;
}

function canCreateEntity(permissionContext, entity) {
    const config = getContentEntityConfig(entity);
    return Boolean(config)
        && hasPermission(permissionContext, config.permissionKey)
        && hasPermission(permissionContext, config.createPermissionKey || "content.create");
}

function canUpdateEntity(permissionContext, entity) {
    const config = getContentEntityConfig(entity);
    return Boolean(config) && canEditEntity(permissionContext, entity);
}

function createAction(label, onClick, variant = "secondary") {
    return {
        label,
        variant,
        onClick,
    };
}

function createEditAction({ entity, record, openEditor, fieldScope = "default", label = "" }) {
    if (!record) {
        return null;
    }

    const config = getContentEntityConfig(entity);
    if (!config) {
        return null;
    }

    return createAction(
        label || config.editActionLabel || `Edit ${config.label}`,
        () => openEditor({
            entity,
            mode: "edit",
            recordId: record.id,
            fieldScope,
            allowDelete: fieldScope !== "explanations",
        })
    );
}

function createNewAction({ entity, openEditor }) {
    const config = getContentEntityConfig(entity);
    if (!config) {
        return null;
    }

    return createAction(
        config.createActionLabel || `New ${config.label}`,
        () => openEditor({
            entity,
            mode: "create",
        }),
        "primary"
    );
}

function dedupeActions(actions = []) {
    const seen = new Set();

    return actions.filter((action) => {
        if (!action?.label) {
            return false;
        }

        const key = `${action.label}:${action.variant || "secondary"}`;
        if (seen.has(key)) {
            return false;
        }

        seen.add(key);
        return true;
    });
}

function getBooksPageState(context, permissionContext, openEditor) {
    const actions = [];
    const selectedBook = context.selection?.entity === "books" ? context.selection.record : null;

    if (canCreateEntity(permissionContext, "books")) {
        actions.push(createNewAction({ entity: "books", openEditor }));
    }

    if (selectedBook && canUpdateEntity(permissionContext, "books")) {
        actions.push(createEditAction({
            entity: "books",
            record: selectedBook,
            openEditor,
            label: `Edit ${getRecordLabel("books", selectedBook)}`,
        }));
    }

    return {
        title: "Books authoring",
        status: selectedBook
            ? `Selected ${getRecordLabel("books", selectedBook)}.`
            : "Create a new book or select a book card on the page to edit it.",
        tone: "muted",
        actions,
    };
}

function getChaptersPageState(context, permissionContext, openEditor) {
    const actions = [];
    const currentBook = context.currentBook;
    const selectedBookSection = context.selection?.entity === "book_sections" ? context.selection.record : null;
    const selectedChapter = context.selection?.entity === "chapters" ? context.selection.record : null;

    if (currentBook && canCreateEntity(permissionContext, "book_sections")) {
        actions.push(createNewAction({ entity: "book_sections", openEditor }));
    }

    if (currentBook?.book_type === "source" && canCreateEntity(permissionContext, "chapters")) {
        actions.push(createNewAction({ entity: "chapters", openEditor }));
    }

    if (currentBook && canUpdateEntity(permissionContext, "books")) {
        actions.push(createEditAction({
            entity: "books",
            record: currentBook,
            openEditor,
            label: `Edit ${getRecordLabel("books", currentBook)}`,
        }));
    }

    if (selectedBookSection && canUpdateEntity(permissionContext, "book_sections")) {
        actions.push(createEditAction({
            entity: "book_sections",
            record: selectedBookSection,
            openEditor,
            label: `Edit ${getRecordLabel("book_sections", selectedBookSection)}`,
        }));
    }

    if (selectedChapter && canUpdateEntity(permissionContext, "chapters")) {
        actions.push(createEditAction({
            entity: "chapters",
            record: selectedChapter,
            openEditor,
            label: `Edit ${getRecordLabel("chapters", selectedChapter)}`,
        }));
    }

    const status = currentBook?.book_type === "source"
        ? `Working inside ${getRecordLabel("books", currentBook)}. Select a book section or chapter card for focused edits.`
        : `${getRecordLabel("books", currentBook)} is a collection, so new chapters stay on source-book routes. Select a book section or chapter card to edit the existing hierarchy.`;

    return {
        title: currentBook ? getRecordLabel("books", currentBook) : "Chapter authoring",
        status,
        tone: "muted",
        actions,
    };
}

function getVersesPageState(context, permissionContext, openEditor) {
    const actions = [];
    const currentChapter = context.currentChapter;
    const targetVerse = context.selection?.entity === "verses" ? context.selection.record : context.currentVerse;
    const selectedChapterSection = context.selection?.entity === "chapter_sections" ? context.selection.record : null;

    if (currentChapter && canCreateEntity(permissionContext, "chapter_sections")) {
        actions.push(createNewAction({ entity: "chapter_sections", openEditor }));
    }

    if (currentChapter && canCreateEntity(permissionContext, "verses")) {
        actions.push(createNewAction({ entity: "verses", openEditor }));
    }

    if (currentChapter && canUpdateEntity(permissionContext, "chapters")) {
        actions.push(createEditAction({
            entity: "chapters",
            record: currentChapter,
            openEditor,
            label: `Edit ${getRecordLabel("chapters", currentChapter)}`,
        }));
    }

    if (selectedChapterSection && canUpdateEntity(permissionContext, "chapter_sections")) {
        actions.push(createEditAction({
            entity: "chapter_sections",
            record: selectedChapterSection,
            openEditor,
            label: `Edit ${getRecordLabel("chapter_sections", selectedChapterSection)}`,
        }));
    }

    if (targetVerse && canUpdateEntity(permissionContext, "verses")) {
        actions.push(createEditAction({
            entity: "verses",
            record: targetVerse,
            openEditor,
            label: context.selection?.entity === "verses"
                ? `Edit ${getRecordLabel("verses", targetVerse)}`
                : "Edit Current Verse",
        }));
    }

    return {
        title: currentChapter ? getRecordLabel("chapters", currentChapter) : "Verse authoring",
        status: currentChapter
            ? `Working inside ${getRecordLabel("chapters", currentChapter)}. Select a chapter section or verse card for focused edits.`
            : "Select a chapter route to unlock verse authoring actions.",
        tone: "muted",
        actions,
    };
}

function getExplanationsPageState(context, permissionContext, openEditor) {
    const currentVerse = context.currentVerse;
    const actions = [];

    if (currentVerse && canUpdateEntity(permissionContext, "verses")) {
        actions.push(createEditAction({
            entity: "verses",
            record: currentVerse,
            openEditor,
            fieldScope: "explanations",
            label: "Edit Current Verse",
        }));
    }

    return {
        title: currentVerse ? `Explanation for ${getRecordLabel("verses", currentVerse)}` : "Explanation authoring",
        status: currentVerse
            ? "Verse and Meaning stay canonical here. Editorial explanation blocks now load from a dedicated explanation document for this verse, and block editing will layer on next."
            : "Open an explanation route with a real verse context to edit canonical verse fields while explanation documents and blocks stay route-driven.",
        tone: "muted",
        actions,
    };
}

function getUnsupportedPageState() {
    return {
        title: "Shared admin route",
        status: "This shared route does not yet have a CRUD-backed inline authoring model.",
        tone: "muted",
        actions: [],
    };
}

export function resolveAdminAuthoringState({ context, permissionContext, openEditor, customActions = [] }) {
    const pageState = (() => {
        switch (context?.pageId) {
            case "books":
                return getBooksPageState(context, permissionContext, openEditor);
            case "chapters":
                return getChaptersPageState(context, permissionContext, openEditor);
            case "verses":
                return getVersesPageState(context, permissionContext, openEditor);
            case "explanations":
                return getExplanationsPageState(context, permissionContext, openEditor);
            default:
                return getUnsupportedPageState();
        }
    })();

    const actions = dedupeActions([
        ...pageState.actions,
        ...(Array.isArray(customActions) ? customActions : []),
    ]);

    if (actions.length) {
        return {
            ...pageState,
            actions,
        };
    }

    if (context?.supported) {
        return {
            ...pageState,
            actions,
            status: "No write actions are available here for this account or current page context.",
        };
    }

    return {
        ...pageState,
        actions,
    };
}
