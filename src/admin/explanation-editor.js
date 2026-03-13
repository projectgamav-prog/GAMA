import { hasPermission } from "../permissions/access.js";
import { getExplanationPageBridge } from "../content/explanations/page-bridge.js";
import {
    createEmptyExplanationBlockDraft,
    createExplanationBlockDraftFromRecord,
    createExplanationBlockForm,
    getExplanationBlockSummary,
    getExplanationBlockTypeLabel,
} from "./explanation-block-form.js";
import { createAdminApi } from "./api.js";

function sortBlocks(blocks = []) {
    return [...blocks].sort((left, right) => Number(left.sort_order) - Number(right.sort_order));
}

function getVerseTargetContext(pageContext) {
    const verse = pageContext?.currentVerse || null;
    if (!verse) {
        return null;
    }

    const chapter = pageContext?.currentChapter || null;
    const book = pageContext?.currentBook || null;

    return Object.freeze({
        targetType: "verse",
        targetId: verse.id,
        verse,
        chapter,
        book,
        label: verse?.verse_number ? `Verse ${verse.verse_number}` : "Verse",
        detail: chapter?.chapter_number
            ? `Chapter ${chapter.chapter_number}${book?.title ? ` in ${book.title}` : ""}`
            : book?.title || "Current verse target",
    });
}

function canManageExplanation(permissionContext) {
    return hasPermission(permissionContext, "verses.edit");
}

function canCreateExplanationContent(permissionContext) {
    return canManageExplanation(permissionContext) && hasPermission(permissionContext, "content.create");
}

function canDeleteExplanationContent(permissionContext) {
    return canManageExplanation(permissionContext) && hasPermission(permissionContext, "content.delete");
}

function canPublishExplanationContent(permissionContext) {
    return canManageExplanation(permissionContext) && hasPermission(permissionContext, "content.publish");
}

function createMetaPill(text, modifier = "") {
    const pill = document.createElement("span");
    pill.className = ["admin-explanation-pill", modifier].filter(Boolean).join(" ");
    pill.textContent = text;
    return pill;
}

function createSectionHeader(titleText, detailText = "") {
    const header = document.createElement("div");
    header.className = "admin-explanation-section-header";

    const copy = document.createElement("div");
    copy.className = "admin-explanation-section-copy";

    const title = document.createElement("h3");
    title.className = "admin-explanation-section-title";
    title.textContent = titleText;

    copy.appendChild(title);

    if (detailText) {
        const detail = document.createElement("p");
        detail.className = "admin-editor-subtitle admin-explanation-section-detail";
        detail.textContent = detailText;
        copy.appendChild(detail);
    }

    header.appendChild(copy);
    return header;
}

export function createExplanationEditorPanel({
    host,
    getPermissionContext,
    getPageContext,
    onStatusChange,
}) {
    const api = createAdminApi();
    const state = {
        isOpen: false,
        loading: false,
        busy: false,
        message: "",
        tone: "muted",
        pageContext: null,
        target: null,
        document: null,
        blocks: [],
        blockForm: null,
    };

    const panel = document.createElement("section");
    panel.className = "admin-editor-panel admin-explanation-panel";
    panel.setAttribute("data-admin-editor-panel", "");
    panel.hidden = true;
    host.appendChild(panel);

    function setMessage(message, tone = "muted") {
        state.message = message ? String(message) : "";
        state.tone = tone || "muted";
        onStatusChange?.(state.message, state.tone);
    }

    function clearMessage() {
        state.message = "";
        state.tone = "muted";
        onStatusChange?.("", "muted");
    }

    function syncPagePreview() {
        const bridge = getExplanationPageBridge();
        if (!bridge?.setExplanationContent || !state.target) {
            return;
        }

        bridge.setExplanationContent({
            document: state.document,
            blocks: state.blocks,
        });

        window.adminChrome?.refresh?.();
    }

    async function loadExplanationState({ keepForm = true } = {}) {
        if (!state.target) {
            state.document = null;
            state.blocks = [];
            render();
            return;
        }

        const documentRecord = await api.getExplanationDocumentForTarget(state.target.targetType, state.target.targetId);
        const blocks = documentRecord
            ? sortBlocks(await api.listExplanationBlocks(documentRecord.id))
            : [];

        state.document = documentRecord;
        state.blocks = blocks;

        if (!keepForm) {
            state.blockForm = null;
        } else if (state.blockForm?.mode === "edit" && state.blockForm?.blockId) {
            const currentBlock = blocks.find((block) => block.id === state.blockForm.blockId) || null;
            state.blockForm = currentBlock
                ? {
                    ...state.blockForm,
                    draft: createExplanationBlockDraftFromRecord(currentBlock),
                }
                : null;
        }

        syncPagePreview();
        render();
    }

    async function runMutation(message, task, { successMessage = "Explanation updated.", keepForm = false } = {}) {
        state.busy = true;
        setMessage(message);
        render();

        try {
            await task();
            await loadExplanationState({ keepForm });
            state.busy = false;
            setMessage(successMessage, "success");
            render();
        } catch (error) {
            state.busy = false;
            setMessage(error.message || "Unable to update this explanation.", "error");
            render();
        }
    }

    function createSummaryCard(label, value) {
        const card = document.createElement("article");
        card.className = "admin-explanation-summary-card";

        const heading = document.createElement("p");
        heading.className = "admin-inline-bar-label";
        heading.textContent = label;

        const detail = document.createElement("p");
        detail.className = "admin-explanation-summary-value";
        detail.textContent = value;

        card.append(heading, detail);
        return card;
    }

    function setBlockForm(mode, block = null) {
        const draft = block
            ? createExplanationBlockDraftFromRecord(block)
            : createEmptyExplanationBlockDraft();

        state.blockForm = {
            mode,
            blockId: block?.id || "",
            draft,
        };
    }

    function createBlockOrderList({ blocks, movedBlockId = "", direction = 0 }) {
        const records = [...blocks];
        const sourceIndex = records.findIndex((block) => block.id === movedBlockId);
        if (sourceIndex < 0) {
            return records;
        }

        const nextIndex = sourceIndex + direction;
        if (nextIndex < 0 || nextIndex >= records.length) {
            return records;
        }

        const [moved] = records.splice(sourceIndex, 1);
        records.splice(nextIndex, 0, moved);
        return records;
    }

    async function persistBlockOrder(blocks) {
        const orderedBlocks = [...blocks];
        const maxSortOrder = orderedBlocks.reduce((maxValue, block) => {
            const currentValue = Number(block.sort_order) || 0;
            return currentValue > maxValue ? currentValue : maxValue;
        }, 0);
        const temporaryBase = maxSortOrder + orderedBlocks.length + 10;

        for (let index = 0; index < orderedBlocks.length; index += 1) {
            const block = orderedBlocks[index];
            await api.updateExplanationBlock(block.id, {
                sort_order: temporaryBase + index,
            });
        }

        for (let index = 0; index < orderedBlocks.length; index += 1) {
            const block = orderedBlocks[index];
            await api.updateExplanationBlock(block.id, {
                sort_order: index + 1,
            });
        }
    }

    async function bootstrapDocument() {
        await runMutation(
            `Creating explanation document for ${state.target.label}...`,
            async () => {
                await api.createExplanationDocument(state.target.targetType, state.target.targetId, {
                    status: "draft",
                });
            },
            {
                successMessage: `Explanation document created for ${state.target.label}.`,
            }
        );
    }

    async function updateDocumentStatus(nextStatus) {
        if (!state.document) {
            return;
        }

        await runMutation(
            `Updating explanation document status to ${nextStatus}...`,
            async () => {
                await api.updateExplanationDocument(state.document.id, {
                    status: nextStatus,
                });
            },
            {
                successMessage: `Explanation document is now ${nextStatus}.`,
                keepForm: true,
            }
        );
    }

    async function saveBlock(payload) {
        if (!state.document) {
            throw new Error("Create the explanation document before saving blocks.");
        }

        const isEdit = state.blockForm?.mode === "edit" && state.blockForm?.blockId;
        await runMutation(
            isEdit ? "Saving explanation block..." : "Creating explanation block...",
            async () => {
                if (isEdit) {
                    await api.updateExplanationBlock(state.blockForm.blockId, payload);
                    return;
                }

                await api.createExplanationBlock(state.document.id, {
                    ...payload,
                    sort_order: state.blocks.length + 1,
                });
            },
            {
                successMessage: isEdit ? "Explanation block saved." : "Explanation block created.",
            }
        );
    }

    async function duplicateBlock(block) {
        if (!state.document) {
            return;
        }

        await runMutation(
            `Duplicating ${getExplanationBlockTypeLabel(block.type).toLowerCase()}...`,
            async () => {
                const createdBlock = await api.createExplanationBlock(state.document.id, {
                    type: block.type,
                    sort_order: state.blocks.length + 1,
                    data_json: block.data_json,
                    is_visible: block.is_visible,
                });

                const desiredBlocks = [...state.blocks];
                const sourceIndex = desiredBlocks.findIndex((record) => record.id === block.id);
                desiredBlocks.splice(sourceIndex + 1, 0, createdBlock);
                await persistBlockOrder(desiredBlocks);
            },
            {
                successMessage: `${getExplanationBlockTypeLabel(block.type)} duplicated.`,
                keepForm: true,
            }
        );
    }

    async function moveBlock(block, direction) {
        const desiredBlocks = createBlockOrderList({
            blocks: state.blocks,
            movedBlockId: block.id,
            direction,
        });

        if (desiredBlocks.map((item) => item.id).join(":") === state.blocks.map((item) => item.id).join(":")) {
            return;
        }

        await runMutation(
            direction < 0 ? "Moving block up..." : "Moving block down...",
            async () => {
                await persistBlockOrder(desiredBlocks);
            },
            {
                successMessage: "Block order updated.",
                keepForm: true,
            }
        );
    }

    async function toggleBlockVisibility(block) {
        await runMutation(
            block.is_visible ? "Hiding block..." : "Showing block...",
            async () => {
                await api.toggleExplanationBlockVisibility(block.id, !block.is_visible);
            },
            {
                successMessage: block.is_visible ? "Block hidden on public pages." : "Block shown on public pages.",
                keepForm: true,
            }
        );
    }

    async function deleteBlock(block) {
        const confirmed = window.confirm(`Delete this ${getExplanationBlockTypeLabel(block.type).toLowerCase()} block?`);
        if (!confirmed) {
            return;
        }

        await runMutation(
            `Deleting ${getExplanationBlockTypeLabel(block.type).toLowerCase()}...`,
            async () => {
                await api.deleteExplanationBlock(block.id);
                const remainingBlocks = state.blocks.filter((record) => record.id !== block.id);
                if (remainingBlocks.length) {
                    await persistBlockOrder(remainingBlocks);
                }
            },
            {
                successMessage: `${getExplanationBlockTypeLabel(block.type)} deleted.`,
            }
        );
    }

    function renderDocumentBootstrap(permissionContext, card) {
        const section = document.createElement("section");
        section.className = "admin-explanation-empty-state";

        const title = document.createElement("h3");
        title.className = "admin-explanation-section-title";
        title.textContent = "Explanation document missing";

        const copy = document.createElement("p");
        copy.className = "admin-editor-subtitle";
        copy.textContent = `No explanation document exists yet for ${state.target.label}. Create it first, then add ordered editorial blocks.`;

        section.append(title, copy);

        if (canCreateExplanationContent(permissionContext)) {
            const action = document.createElement("button");
            action.type = "button";
            action.className = "admin-inline-bar-link is-primary";
            action.disabled = state.busy;
            action.textContent = state.busy ? "Creating..." : "Create Explanation Document";
            action.addEventListener("click", () => {
                bootstrapDocument();
            });
            section.appendChild(action);
        } else {
            const hint = document.createElement("p");
            hint.className = "admin-editor-field-hint";
            hint.textContent = "Creating explanation documents requires verse edit access and content.create permission.";
            section.appendChild(hint);
        }

        card.appendChild(section);
    }

    function renderDocumentControls(permissionContext, card) {
        const section = document.createElement("section");
        section.className = "admin-explanation-document-card";
        section.appendChild(
            createSectionHeader(
                "Explanation Document",
                `This document targets ${state.target.label}. Blocks stay attached to the document, not the route.`
            )
        );

        const meta = document.createElement("div");
        meta.className = "admin-explanation-pills";
        meta.append(
            createMetaPill(state.target.label),
            createMetaPill(
                state.document?.status === "published" ? "Published" : "Draft",
                state.document?.status === "published" ? "is-published" : "is-draft"
            ),
            createMetaPill(`${state.blocks.length} Block${state.blocks.length === 1 ? "" : "s"}`)
        );
        section.appendChild(meta);

        if (canPublishExplanationContent(permissionContext)) {
            const actions = document.createElement("div");
            actions.className = "admin-editor-footer admin-explanation-document-actions";

            if (state.document?.status !== "published") {
                const publishButton = document.createElement("button");
                publishButton.type = "button";
                publishButton.className = "admin-inline-bar-link";
                publishButton.disabled = state.busy;
                publishButton.textContent = "Publish";
                publishButton.addEventListener("click", () => {
                    updateDocumentStatus("published");
                });
                actions.appendChild(publishButton);
            }

            if (state.document?.status !== "draft") {
                const draftButton = document.createElement("button");
                draftButton.type = "button";
                draftButton.className = "admin-inline-bar-link";
                draftButton.disabled = state.busy;
                draftButton.textContent = "Move To Draft";
                draftButton.addEventListener("click", () => {
                    updateDocumentStatus("draft");
                });
                actions.appendChild(draftButton);
            }

            section.appendChild(actions);
        }

        card.appendChild(section);
    }

    function renderBlockList(permissionContext, card) {
        const section = document.createElement("section");
        section.className = "admin-explanation-block-list";
        const header = createSectionHeader(
            "Explanation Blocks",
            "Create, edit, duplicate, reorder, hide, and delete the ordered editorial blocks for this verse."
        );

        if (canCreateExplanationContent(permissionContext)) {
            const addButton = document.createElement("button");
            addButton.type = "button";
            addButton.className = "admin-inline-bar-link is-primary";
            addButton.disabled = state.busy;
            addButton.textContent = "Add Block";
            addButton.addEventListener("click", () => {
                setBlockForm("create");
                clearMessage();
                render();
            });
            header.appendChild(addButton);
        }

        section.appendChild(header);

        if (!state.blocks.length) {
            const emptyState = document.createElement("div");
            emptyState.className = "admin-explanation-empty-state";

            const title = document.createElement("h4");
            title.className = "admin-explanation-section-title";
            title.textContent = "No blocks yet";

            const copy = document.createElement("p");
            copy.className = "admin-editor-subtitle";
            copy.textContent = "Add the first explanation block to start building the editorial section below Meaning.";

            emptyState.append(title, copy);
            section.appendChild(emptyState);
        } else {
            const list = document.createElement("div");
            list.className = "admin-explanation-block-cards";

            state.blocks.forEach((block, index) => {
                const item = document.createElement("article");
                item.className = "admin-explanation-block-card";
                if (block.is_visible === false) {
                    item.classList.add("is-hidden");
                }

                const meta = document.createElement("div");
                meta.className = "admin-explanation-block-meta";
                meta.append(
                    createMetaPill(`#${index + 1}`),
                    createMetaPill(getExplanationBlockTypeLabel(block.type)),
                    block.is_visible === false ? createMetaPill("Hidden", "is-hidden") : createMetaPill("Visible", "is-visible")
                );

                const title = document.createElement("h4");
                title.className = "admin-explanation-block-title";
                title.textContent = getExplanationBlockSummary(block);

                const actions = document.createElement("div");
                actions.className = "admin-explanation-block-actions";

                const editButton = document.createElement("button");
                editButton.type = "button";
                editButton.className = "admin-inline-bar-link";
                editButton.disabled = state.busy || !canManageExplanation(permissionContext);
                editButton.textContent = "Edit";
                editButton.addEventListener("click", () => {
                    setBlockForm("edit", block);
                    clearMessage();
                    render();
                });
                actions.appendChild(editButton);

                const duplicateButton = document.createElement("button");
                duplicateButton.type = "button";
                duplicateButton.className = "admin-inline-bar-link";
                duplicateButton.disabled = state.busy || !canCreateExplanationContent(permissionContext);
                duplicateButton.textContent = "Duplicate";
                duplicateButton.addEventListener("click", () => {
                    duplicateBlock(block);
                });
                actions.appendChild(duplicateButton);

                const toggleButton = document.createElement("button");
                toggleButton.type = "button";
                toggleButton.className = "admin-inline-bar-link";
                toggleButton.disabled = state.busy || !canManageExplanation(permissionContext);
                toggleButton.textContent = block.is_visible ? "Hide" : "Show";
                toggleButton.addEventListener("click", () => {
                    toggleBlockVisibility(block);
                });
                actions.appendChild(toggleButton);

                const upButton = document.createElement("button");
                upButton.type = "button";
                upButton.className = "admin-inline-bar-link";
                upButton.disabled = state.busy || index === 0 || !canManageExplanation(permissionContext);
                upButton.textContent = "Move Up";
                upButton.addEventListener("click", () => {
                    moveBlock(block, -1);
                });
                actions.appendChild(upButton);

                const downButton = document.createElement("button");
                downButton.type = "button";
                downButton.className = "admin-inline-bar-link";
                downButton.disabled = state.busy || index === state.blocks.length - 1 || !canManageExplanation(permissionContext);
                downButton.textContent = "Move Down";
                downButton.addEventListener("click", () => {
                    moveBlock(block, 1);
                });
                actions.appendChild(downButton);

                const deleteButton = document.createElement("button");
                deleteButton.type = "button";
                deleteButton.className = "admin-inline-bar-link admin-editor-delete";
                deleteButton.disabled = state.busy || !canDeleteExplanationContent(permissionContext);
                deleteButton.textContent = "Delete";
                deleteButton.addEventListener("click", () => {
                    deleteBlock(block);
                });
                actions.appendChild(deleteButton);

                item.append(meta, title, actions);
                list.appendChild(item);
            });

            section.appendChild(list);
        }

        if (state.blockForm) {
            const formCard = document.createElement("div");
            formCard.className = "admin-explanation-form-card";
            formCard.appendChild(
                createSectionHeader(
                    state.blockForm.mode === "edit" ? "Edit Block" : "New Block",
                    state.blockForm.mode === "edit"
                        ? "Update the selected block fields and save back to the explanation document."
                        : "Choose a supported block type and fill in its structured fields."
                )
            );

            formCard.appendChild(
                createExplanationBlockForm({
                    draft: state.blockForm.draft,
                    busy: state.busy,
                    submitLabel: state.busy
                        ? (state.blockForm.mode === "edit" ? "Saving..." : "Creating...")
                        : (state.blockForm.mode === "edit" ? "Save Block" : "Create Block"),
                    onCancel() {
                        state.blockForm = null;
                        clearMessage();
                        render();
                    },
                    onTypeChange(nextType) {
                        state.blockForm = {
                            ...state.blockForm,
                            draft: {
                                ...createEmptyExplanationBlockDraft(nextType),
                                is_visible: state.blockForm?.draft?.is_visible !== false,
                            },
                        };
                        render();
                    },
                    onError(message) {
                        setMessage(message, "error");
                        render();
                    },
                    async onSubmit(payload) {
                        await saveBlock(payload);
                    },
                })
            );

            section.appendChild(formCard);
        }

        card.appendChild(section);
    }

    function render() {
        if (!state.isOpen) {
            panel.hidden = true;
            panel.replaceChildren();
            return;
        }

        panel.hidden = false;
        panel.replaceChildren();

        const permissionContext = getPermissionContext?.() || null;
        const card = document.createElement("div");
        card.className = "admin-editor-card admin-explanation-editor-card";

        const header = document.createElement("div");
        header.className = "admin-editor-header";

        const copy = document.createElement("div");
        copy.className = "admin-editor-copy";

        const eyebrow = document.createElement("p");
        eyebrow.className = "admin-inline-bar-label";
        eyebrow.textContent = "Explanation Editor";

        const title = document.createElement("h2");
        title.className = "admin-editor-title";
        title.textContent = state.target
            ? `${state.target.label} Explanation`
            : "Explanation Editor";

        const subtitle = document.createElement("p");
        subtitle.className = "admin-editor-subtitle";
        subtitle.textContent = state.target
            ? `Manage the explanation document and ordered editorial blocks for ${state.target.detail}.`
            : "Open an explanation route with a real verse target to manage explanation documents and blocks.";

        copy.append(eyebrow, title, subtitle);

        const closeButton = document.createElement("button");
        closeButton.type = "button";
        closeButton.className = "admin-inline-bar-link";
        closeButton.textContent = "Close";
        closeButton.addEventListener("click", () => close());

        header.append(copy, closeButton);
        card.appendChild(header);

        const message = document.createElement("p");
        message.className = `admin-editor-message is-${state.tone}`;
        message.textContent = state.message || "Manage the explanation document first, then shape the ordered block list below.";
        card.appendChild(message);

        if (state.loading) {
            const loading = document.createElement("div");
            loading.className = "admin-editor-loading";
            loading.textContent = "Loading explanation editor...";
            card.appendChild(loading);
            panel.appendChild(card);
            return;
        }

        if (!state.target) {
            const emptyState = document.createElement("div");
            emptyState.className = "admin-explanation-empty-state";
            const copyText = document.createElement("p");
            copyText.className = "admin-editor-subtitle";
            copyText.textContent = "This editor needs a verse-backed explanation route to determine the current target.";
            emptyState.appendChild(copyText);
            card.appendChild(emptyState);
            panel.appendChild(card);
            return;
        }

        const summary = document.createElement("div");
        summary.className = "admin-explanation-summary-grid";
        summary.append(
            createSummaryCard("Target", state.target.label),
            createSummaryCard("Document", state.document ? (state.document.status === "published" ? "Published" : "Draft") : "Missing"),
            createSummaryCard("Blocks", String(state.blocks.length))
        );
        card.appendChild(summary);

        if (!state.document) {
            renderDocumentBootstrap(permissionContext, card);
        } else {
            renderDocumentControls(permissionContext, card);
            renderBlockList(permissionContext, card);
        }

        panel.appendChild(card);
    }

    async function open() {
        state.isOpen = true;
        state.loading = true;
        state.busy = false;
        state.pageContext = getPageContext?.() || null;
        state.target = getVerseTargetContext(state.pageContext);
        state.document = null;
        state.blocks = [];
        state.blockForm = null;
        setMessage("Loading explanation editor...");
        render();

        try {
            await loadExplanationState({ keepForm: false });
            state.loading = false;
            setMessage(
                state.document
                    ? `Managing ${state.blocks.length} explanation block${state.blocks.length === 1 ? "" : "s"} for ${state.target.label}.`
                    : `No explanation document exists yet for ${state.target.label}.`,
                "muted"
            );
            render();
        } catch (error) {
            state.loading = false;
            setMessage(error.message || "Unable to load the explanation editor.", "error");
            render();
        }
    }

    function close() {
        state.isOpen = false;
        state.loading = false;
        state.busy = false;
        state.pageContext = null;
        state.target = null;
        state.document = null;
        state.blocks = [];
        state.blockForm = null;
        clearMessage();
        render();
    }

    return {
        async open() {
            await open();
        },
        close,
        rerender() {
            render();
        },
        isOpen() {
            return state.isOpen;
        },
        getElement() {
            return panel;
        },
    };
}
