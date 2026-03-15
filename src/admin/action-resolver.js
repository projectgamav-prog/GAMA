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

function createEditAction({ entity, record, openEditor, fieldScope = "default", allowDelete = true, label = "", context = null }) {
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
            context,
        })
    );
}

function createCreateAction({ entity, openEditor, fieldScope = "default", label = "", context = null }) {
    const config = getContentEntityConfig(entity);
    if (!config) {
        return null;
    }

    return createAction(
        label || config.createActionLabel || `New ${config.label}`,
        () => openEditor({
            entity,
            mode: "create",
            fieldScope,
            context,
        })
    );
}

function listInsightBindings(ownerEntity, record) {
    if (!record?.id) {
        return [];
    }

    const insightBlocks = listContentBlocksForOwner(ownerEntity, record.id, {
        includeDraft: true,
        includeHidden: true,
    }).filter((block) => block.region === "insight");

    const filteredBlocks = ownerEntity === "verses"
        ? insightBlocks.filter((block) => block.block_type === "verse_insight")
        : insightBlocks.slice(0, 1);

    return Object.freeze(
        filteredBlocks.map((block) => Object.freeze({
            block,
            mediaAsset: block.data?.media_asset_id
                ? getMediaAssetById(block.data.media_asset_id)
                : null,
        }))
    );
}

function getInsightBlockFieldScope(ownerEntity, block) {
    if (ownerEntity === "verses" || block?.block_type === "verse_insight") {
        return "verse_insight";
    }

    return "insight_block";
}

function getInsightOptionLabel(ownerEntity, recordLabel, binding, index) {
    if (ownerEntity === "verses") {
        const optionLabel = String(binding?.block?.data?.label || binding?.block?.data?.title || "").trim();
        if (optionLabel) {
            return `${recordLabel} Insight: ${optionLabel}`;
        }

        return `${recordLabel} Insight ${index + 1}`;
    }

    return `${recordLabel} Insight`;
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
    const insightBindings = listInsightBindings(ownerEntity, record);
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
        if (ownerEntity === "verses") {
            actions.push(createCreateAction({
                entity: "content_blocks",
                openEditor,
                fieldScope: "verse_insight",
                label: insightBindings.length ? `Create Another ${label} Insight` : `Create ${label} Insight`,
                context: {
                    requestedOwnerEntity: ownerEntity,
                    requestedOwnerRecord: record,
                },
            }));

            insightBindings.forEach((binding, index) => {
                actions.push(createEditAction({
                    entity: "content_blocks",
                    record: binding.block,
                    openEditor,
                    fieldScope: "verse_insight",
                    label: `Edit ${getInsightOptionLabel(ownerEntity, label, binding, index)}`,
                    context: {
                        requestedOwnerEntity: ownerEntity,
                        requestedOwnerRecord: record,
                    },
                }));

                if (binding.mediaAsset && canEditCmsMedia(permissionContext, ownerEntity)) {
                    actions.push(createEditAction({
                        entity: "media_assets",
                        record: binding.mediaAsset,
                        openEditor,
                        fieldScope: "insight_media_asset",
                        allowDelete: false,
                        label: `Edit ${getInsightOptionLabel(ownerEntity, label, binding, index)} Media`,
                    }));
                }
            });
        } else if (insightBindings[0]) {
            actions.push(createEditAction({
                entity: "content_blocks",
                record: insightBindings[0].block,
                openEditor,
                fieldScope: getInsightBlockFieldScope(ownerEntity, insightBindings[0].block),
                allowDelete: false,
                label: `Edit ${label} Insight`,
                context: {
                    requestedOwnerEntity: ownerEntity,
                    requestedOwnerRecord: record,
                },
            }));
        } else {
            actions.push(createCreateAction({
                entity: "content_blocks",
                openEditor,
                fieldScope: "insight_block",
                label: `Create ${label} Insight`,
                context: {
                    requestedOwnerEntity: ownerEntity,
                    requestedOwnerRecord: record,
                },
            }));
        }
    }

    if (ownerEntity !== "verses" && insightBindings[0]?.mediaAsset && canEditCmsMedia(permissionContext, ownerEntity)) {
        actions.push(createEditAction({
            entity: "media_assets",
            record: insightBindings[0].mediaAsset,
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
    const blockCount = Array.isArray(context.currentBodyBlocks) ? context.currentBodyBlocks.length : 0;
    const actions = [];

    if (currentVerse && hasPermission(permissionContext, "verses.edit")) {
        actions.push(createAction(
            blockCount ? "Manage Body Blocks" : "Create Body Blocks",
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
                blockCount
                    ? `${getRecordLabel("verses", currentVerse)} has ${blockCount} unified body block${blockCount === 1 ? "" : "s"} in content_blocks.`
                    : `No verse body blocks exist yet for ${getRecordLabel("verses", currentVerse)}. Create content_blocks to start composing the editorial explanation.`
            )
            : "Open an explanation route with a real verse context to manage the current verse body blocks.",
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
