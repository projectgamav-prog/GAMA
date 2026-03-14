import { canEditEntity, hasPermission } from "../permissions/access.js";
import { getEntityEditPermissionKey } from "../permissions/access.js";
import { getMediaAssetById, listContentBlocksForOwner } from "../content/repositories/cms-content-repository.js";
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

function createEditAction({ entity, record, openEditor, fieldScope = "default", allowDelete = true, label = "" }) {
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
            allowDelete,
        })
    );
}

function resolveInsightBinding(ownerEntity, record) {
    if (!record?.id) {
        return null;
    }

    const insightBlock = listContentBlocksForOwner(ownerEntity, record.id, {
        includeDraft: true,
        includeHidden: true,
    }).find((block) => block.region === "insight") || null;

    if (!insightBlock) {
        return null;
    }

    const mediaAsset = insightBlock.data?.media_asset_id
        ? getMediaAssetById(insightBlock.data.media_asset_id)
        : null;

    return Object.freeze({
        block: insightBlock,
        mediaAsset,
    });
}

function getInsightBlockFieldScope(ownerEntity, block) {
    if (ownerEntity === "books" && block?.region === "insight") {
        return "book_insight";
    }

    return block?.block_type === "media" || block?.block_type === "image" || block?.block_type === "audio"
        ? "insight_media"
        : "insight_rich_text";
}

function canEditCmsInsight(permissionContext, ownerEntity) {
    const permissionKey = getEntityEditPermissionKey(ownerEntity);
    return permissionKey ? hasPermission(permissionContext, permissionKey) : false;
}

function canEditCmsMedia(permissionContext, ownerEntity) {
    return canEditCmsInsight(permissionContext, ownerEntity)
        && hasPermission(permissionContext, "media.upload");
}

function buildInsightEditingActions({ ownerEntity, record, permissionContext, openEditor, baseLabel = "" }) {
    if (!record) {
        return [];
    }

    const label = baseLabel || getRecordLabel(ownerEntity, record);
    const insightBinding = resolveInsightBinding(ownerEntity, record);

    if (!insightBinding) {
        return canUpdateEntity(permissionContext, ownerEntity)
            ? [createEditAction({
                entity: ownerEntity,
                record,
                openEditor,
                label: `Edit ${label}`,
            })]
            : [];
    }

    const actions = [];

    if (canUpdateEntity(permissionContext, ownerEntity)) {
        actions.push(createEditAction({
            entity: ownerEntity,
            record,
            openEditor,
            fieldScope: "details",
            label: `Edit ${label} Details`,
        }));
    }

    if (canEditCmsInsight(permissionContext, ownerEntity)) {
        actions.push(createEditAction({
            entity: "content_blocks",
            record: insightBinding.block,
            openEditor,
            fieldScope: getInsightBlockFieldScope(ownerEntity, insightBinding.block),
            allowDelete: false,
            label: `Edit ${label} Insight`,
        }));
    }

    if (insightBinding.mediaAsset && canEditCmsMedia(permissionContext, ownerEntity)) {
        actions.push(createEditAction({
            entity: "media_assets",
            record: insightBinding.mediaAsset,
            openEditor,
            fieldScope: "insight_media_asset",
            allowDelete: false,
            label: `Edit ${label} Insight Media`,
        }));
    }

    return actions;
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
        actions.push(...buildInsightEditingActions({
            ownerEntity: "books",
            record: selectedBook,
            permissionContext,
            openEditor,
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
        actions.push(...buildInsightEditingActions({
            ownerEntity: "books",
            record: currentBook,
            permissionContext,
            openEditor,
        }));
    }

    if (selectedBookSection && canUpdateEntity(permissionContext, "book_sections")) {
        actions.push(...buildInsightEditingActions({
            ownerEntity: "book_sections",
            record: selectedBookSection,
            permissionContext,
            openEditor,
        }));
    }

    if (selectedChapter && canUpdateEntity(permissionContext, "chapters")) {
        actions.push(...buildInsightEditingActions({
            ownerEntity: "chapters",
            record: selectedChapter,
            permissionContext,
            openEditor,
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
        actions.push(...buildInsightEditingActions({
            ownerEntity: "chapters",
            record: currentChapter,
            permissionContext,
            openEditor,
        }));
    }

    if (selectedChapterSection && canUpdateEntity(permissionContext, "chapter_sections")) {
        actions.push(...buildInsightEditingActions({
            ownerEntity: "chapter_sections",
            record: selectedChapterSection,
            permissionContext,
            openEditor,
        }));
    }

    if (targetVerse && canUpdateEntity(permissionContext, "verses")) {
        actions.push(...buildInsightEditingActions({
            ownerEntity: "verses",
            record: targetVerse,
            permissionContext,
            openEditor,
            baseLabel: context.selection?.entity === "verses"
                ? getRecordLabel("verses", targetVerse)
                : "Current Verse",
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
    const currentDocument = context.currentExplanationDocument;
    const blockCount = Array.isArray(context.currentExplanationBlocks) ? context.currentExplanationBlocks.length : 0;
    const actions = [];

    if (currentVerse && hasPermission(permissionContext, "verses.edit")) {
        actions.push(createAction(
            currentDocument ? "Manage Explanation" : "Create Explanation",
            () => openEditor({
                workflow: "explanations",
            }),
            "primary"
        ));
    }

    if (currentVerse && canUpdateEntity(permissionContext, "verses")) {
        actions.push(createEditAction({
            entity: "verses",
            record: currentVerse,
            openEditor,
            allowDelete: false,
            label: "Edit Verse",
        }));
    }

    return {
        title: currentVerse ? `Explanation for ${getRecordLabel("verses", currentVerse)}` : "Explanation authoring",
        status: currentVerse
            ? (
                currentDocument
                    ? `${getRecordLabel("verses", currentVerse)} has a ${currentDocument.status} explanation document with ${blockCount} block${blockCount === 1 ? "" : "s"}.`
                    : `No explanation document exists yet for ${getRecordLabel("verses", currentVerse)}. Create one to start managing ordered explanation blocks.`
            )
            : "Open an explanation route with a real verse context to manage the current verse explanation document and blocks.",
        tone: "muted",
        actions,
    };
}

function getCharactersPageState(context, permissionContext, openEditor) {
    const currentCharacter = context.currentCharacter;
    const selectedCharacter = context.selection?.entity === "characters" ? context.selection.record : currentCharacter;
    const actions = [];

    if (canCreateEntity(permissionContext, "characters")) {
        actions.push(createNewAction({ entity: "characters", openEditor }));
    }

    if (selectedCharacter && canUpdateEntity(permissionContext, "characters")) {
        actions.push(createEditAction({
            entity: "characters",
            record: selectedCharacter,
            openEditor,
            label: currentCharacter && context.selection?.entity !== "characters"
                ? "Edit Current Character"
                : `Edit ${getRecordLabel("characters", selectedCharacter)}`,
        }));
    }

    return {
        title: selectedCharacter ? getRecordLabel("characters", selectedCharacter) : "Character authoring",
        status: selectedCharacter
            ? `Managing ${getRecordLabel("characters", selectedCharacter)} on the shared character page.`
            : "Select a character card or open a character detail route to edit character content inline.",
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
            case "characters":
                return getCharactersPageState(context, permissionContext, openEditor);
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
