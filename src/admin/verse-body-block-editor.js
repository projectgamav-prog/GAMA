import { hasPermission } from "../permissions/access.js";
import { getExplanationsPageBridge } from "../pages/explanations/page-bridge.js";
import {
    createContentBlockDraftFromRecord,
    createContentBlockForm,
    createEmptyContentBlockDraft,
    getContentBlockSummary,
    getContentBlockTypeLabel,
} from "./content-block-form.js";
import { createAdminApi } from "./api.js";

function sortBlocks(blocks = []) {
    return [...blocks].sort((left, right) => Number(left.position) - Number(right.position));
}

function getVerseTargetContext(pageContext) {
    const verse = pageContext?.currentVerse || null;
    if (!verse) {
        return null;
    }

    const chapter = pageContext?.currentChapter || null;
    const book = pageContext?.currentBook || null;

    return Object.freeze({
        verse,
        chapter,
        book,
        ownerEntity: "verses",
        ownerId: verse.id,
        region: "body",
        label: verse?.verse_number ? `Verse ${verse.verse_number}` : "Verse",
        detail: chapter?.chapter_number
            ? `Chapter ${chapter.chapter_number}${book?.title ? ` in ${book.title}` : ""}`
            : book?.title || "Current verse target",
    });
}

function canManageBodyBlocks(permissionContext) {
    return hasPermission(permissionContext, "verses.edit");
}

function canCreateBodyBlocks(permissionContext) {
    return canManageBodyBlocks(permissionContext) && hasPermission(permissionContext, "content.create");
}

function canDeleteBodyBlocks(permissionContext) {
    return canManageBodyBlocks(permissionContext) && hasPermission(permissionContext, "content.delete");
}

function canPublishBodyBlocks(permissionContext) {
    return canManageBodyBlocks(permissionContext) && hasPermission(permissionContext, "content.publish");
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

export function createVerseBodyBlockEditorPanel({
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
        const bridge = getExplanationsPageBridge();
        if (!bridge?.setBodyBlocks || !state.target) {
            return;
        }

        bridge.setBodyBlocks({
            blocks: state.blocks,
        });
        window.adminChrome?.refresh?.();
    }

    async function loadBodyBlockState({ keepForm = true } = {}) {
        if (!state.target) {
            state.blocks = [];
            render();
            return;
        }

        const records = await api.listRecords("content_blocks", {
            owner_entity: state.target.ownerEntity,
            owner_id: state.target.ownerId,
            region: state.target.region,
        });
        const blocks = sortBlocks(Array.isArray(records) ? records : []);
        state.blocks = blocks;

        if (!keepForm) {
            state.blockForm = null;
        } else if (state.blockForm?.mode === "edit" && state.blockForm?.blockId) {
            const currentBlock = blocks.find((block) => block.id === state.blockForm.blockId) || null;
            state.blockForm = currentBlock
                ? {
                    ...state.blockForm,
                    draft: createContentBlockDraftFromRecord(currentBlock),
                }
                : null;
        }

        syncPagePreview();
        render();
    }

    async function runMutation(message, task, { successMessage = "Body blocks updated.", keepForm = false } = {}) {
        state.busy = true;
        setMessage(message);
        render();

        try {
            await task();
            await loadBodyBlockState({ keepForm });
            state.busy = false;
            setMessage(successMessage, "success");
            render();
        } catch (error) {
            state.busy = false;
            setMessage(error.message || "Unable to update these body blocks.", "error");
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
        state.blockForm = {
            mode,
            blockId: block?.id || "",
            draft: block ? createContentBlockDraftFromRecord(block) : createEmptyContentBlockDraft(),
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
        const maxPosition = orderedBlocks.reduce((maxValue, block) => {
            const currentValue = Number(block.position) || 0;
            return currentValue > maxValue ? currentValue : maxValue;
        }, 0);
        const temporaryBase = maxPosition + orderedBlocks.length + 10;

        for (let index = 0; index < orderedBlocks.length; index += 1) {
            await api.updateRecord("content_blocks", orderedBlocks[index].id, {
                position: temporaryBase + index,
            });
        }

        for (let index = 0; index < orderedBlocks.length; index += 1) {
            await api.updateRecord("content_blocks", orderedBlocks[index].id, {
                position: index + 1,
            });
        }
    }

    async function saveBlock(payload) {
        const isEdit = state.blockForm?.mode === "edit" && state.blockForm?.blockId;
        await runMutation(
            isEdit ? "Saving body block..." : "Creating body block...",
            async () => {
                if (isEdit) {
                    await api.updateRecord("content_blocks", state.blockForm.blockId, payload);
                    return;
                }

                await api.createRecord("content_blocks", {
                    owner_entity: state.target.ownerEntity,
                    owner_id: state.target.ownerId,
                    region: state.target.region,
                    position: state.blocks.length + 1,
                    ...payload,
                });
            },
            {
                successMessage: isEdit ? "Body block saved." : "Body block created.",
            }
        );
    }

    async function duplicateBlock(block) {
        await runMutation(
            `Duplicating ${getContentBlockTypeLabel(block.block_type).toLowerCase()}...`,
            async () => {
                const createdBlock = await api.createRecord("content_blocks", {
                    owner_entity: state.target.ownerEntity,
                    owner_id: state.target.ownerId,
                    region: state.target.region,
                    block_type: block.block_type,
                    variant: block.variant,
                    position: state.blocks.length + 1,
                    status: block.status,
                    visibility: block.visibility,
                    is_published: block.status === "published",
                    data: block.data,
                });

                const desiredBlocks = [...state.blocks];
                const sourceIndex = desiredBlocks.findIndex((record) => record.id === block.id);
                desiredBlocks.splice(sourceIndex + 1, 0, createdBlock);
                await persistBlockOrder(desiredBlocks);
            },
            {
                successMessage: `${getContentBlockTypeLabel(block.block_type)} duplicated.`,
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
        const nextVisibility = block.visibility === "hidden" ? "public" : "hidden";
        await runMutation(
            nextVisibility === "hidden" ? "Hiding block..." : "Showing block...",
            async () => {
                await api.updateRecord("content_blocks", block.id, {
                    visibility: nextVisibility,
                });
            },
            {
                successMessage: nextVisibility === "hidden" ? "Block hidden on public pages." : "Block shown on public pages.",
                keepForm: true,
            }
        );
    }

    async function toggleBlockStatus(block) {
        const nextStatus = block.status === "published" ? "draft" : "published";
        await runMutation(
            nextStatus === "published" ? "Publishing block..." : "Moving block to draft...",
            async () => {
                await api.updateRecord("content_blocks", block.id, {
                    status: nextStatus,
                    is_published: nextStatus === "published",
                });
            },
            {
                successMessage: nextStatus === "published" ? "Block published." : "Block moved to draft.",
                keepForm: true,
            }
        );
    }

    async function deleteBlock(block) {
        const confirmed = window.confirm(`Delete this ${getContentBlockTypeLabel(block.block_type).toLowerCase()} block?`);
        if (!confirmed) {
            return;
        }

        await runMutation(
            `Deleting ${getContentBlockTypeLabel(block.block_type).toLowerCase()}...`,
            async () => {
                await api.deleteRecord("content_blocks", block.id);
                const remainingBlocks = state.blocks.filter((record) => record.id !== block.id);
                if (remainingBlocks.length) {
                    await persistBlockOrder(remainingBlocks);
                }
            },
            {
                successMessage: `${getContentBlockTypeLabel(block.block_type)} deleted.`,
            }
        );
    }

    function renderBlockList(permissionContext, card) {
        const section = document.createElement("section");
        section.className = "admin-explanation-block-list";
        const header = createSectionHeader(
            "Body Blocks",
            "Create, edit, duplicate, reorder, publish, hide, and delete the unified content_blocks for this verse body region."
        );

        if (canCreateBodyBlocks(permissionContext)) {
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
            title.textContent = "No body blocks yet";

            const copy = document.createElement("p");
            copy.className = "admin-editor-subtitle";
            copy.textContent = "Add the first content block to start building the verse explanation body.";

            emptyState.append(title, copy);
            section.appendChild(emptyState);
        } else {
            const list = document.createElement("div");
            list.className = "admin-explanation-block-cards";

            state.blocks.forEach((block, index) => {
                const item = document.createElement("article");
                item.className = "admin-explanation-block-card";
                if (block.visibility === "hidden") {
                    item.classList.add("is-hidden");
                }

                const meta = document.createElement("div");
                meta.className = "admin-explanation-block-meta";
                meta.append(
                    createMetaPill(`#${index + 1}`),
                    createMetaPill(getContentBlockTypeLabel(block.block_type)),
                    createMetaPill(block.status === "published" ? "Published" : "Draft", block.status === "published" ? "is-published" : "is-draft"),
                    block.visibility === "hidden" ? createMetaPill("Hidden", "is-hidden") : createMetaPill("Visible", "is-visible")
                );

                const title = document.createElement("h4");
                title.className = "admin-explanation-block-title";
                title.textContent = getContentBlockSummary(block);

                const actions = document.createElement("div");
                actions.className = "admin-explanation-block-actions";

                const editButton = document.createElement("button");
                editButton.type = "button";
                editButton.className = "admin-inline-bar-link";
                editButton.disabled = state.busy || !canManageBodyBlocks(permissionContext);
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
                duplicateButton.disabled = state.busy || !canCreateBodyBlocks(permissionContext);
                duplicateButton.textContent = "Duplicate";
                duplicateButton.addEventListener("click", () => {
                    duplicateBlock(block);
                });
                actions.appendChild(duplicateButton);

                if (canPublishBodyBlocks(permissionContext)) {
                    const statusButton = document.createElement("button");
                    statusButton.type = "button";
                    statusButton.className = "admin-inline-bar-link";
                    statusButton.disabled = state.busy;
                    statusButton.textContent = block.status === "published" ? "Move To Draft" : "Publish";
                    statusButton.addEventListener("click", () => {
                        toggleBlockStatus(block);
                    });
                    actions.appendChild(statusButton);
                }

                const toggleButton = document.createElement("button");
                toggleButton.type = "button";
                toggleButton.className = "admin-inline-bar-link";
                toggleButton.disabled = state.busy || !canManageBodyBlocks(permissionContext);
                toggleButton.textContent = block.visibility === "hidden" ? "Show" : "Hide";
                toggleButton.addEventListener("click", () => {
                    toggleBlockVisibility(block);
                });
                actions.appendChild(toggleButton);

                const upButton = document.createElement("button");
                upButton.type = "button";
                upButton.className = "admin-inline-bar-link";
                upButton.disabled = state.busy || index === 0 || !canManageBodyBlocks(permissionContext);
                upButton.textContent = "Move Up";
                upButton.addEventListener("click", () => {
                    moveBlock(block, -1);
                });
                actions.appendChild(upButton);

                const downButton = document.createElement("button");
                downButton.type = "button";
                downButton.className = "admin-inline-bar-link";
                downButton.disabled = state.busy || index === state.blocks.length - 1 || !canManageBodyBlocks(permissionContext);
                downButton.textContent = "Move Down";
                downButton.addEventListener("click", () => {
                    moveBlock(block, 1);
                });
                actions.appendChild(downButton);

                const deleteButton = document.createElement("button");
                deleteButton.type = "button";
                deleteButton.className = "admin-inline-bar-link admin-editor-delete";
                deleteButton.disabled = state.busy || !canDeleteBodyBlocks(permissionContext);
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
                    state.blockForm.mode === "edit" ? "Edit Body Block" : "New Body Block",
                    state.blockForm.mode === "edit"
                        ? "Update the selected content block and save it back to the verse body region."
                        : "Choose a supported content block type and fill in its structured fields."
                )
            );

            formCard.appendChild(
                createContentBlockForm({
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
                                ...createEmptyContentBlockDraft(nextType),
                                status: state.blockForm?.draft?.status || "draft",
                                visibility: state.blockForm?.draft?.visibility || "public",
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
        eyebrow.textContent = "Verse Body Blocks";

        const title = document.createElement("h2");
        title.className = "admin-editor-title";
        title.textContent = state.target
            ? `${state.target.label} Explanation`
            : "Verse Body Blocks";

        const subtitle = document.createElement("p");
        subtitle.className = "admin-editor-subtitle";
        subtitle.textContent = state.target
            ? `Manage the unified content_blocks body region for ${state.target.detail}.`
            : "Open an explanation route with a real verse target to manage body blocks.";

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
        message.textContent = state.message || "Manage the verse body content_blocks below.";
        card.appendChild(message);

        if (state.loading) {
            const loading = document.createElement("div");
            loading.className = "admin-editor-loading";
            loading.textContent = "Loading body block editor...";
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

        const publishedCount = state.blocks.filter((block) => block.status === "published").length;
        const summary = document.createElement("div");
        summary.className = "admin-explanation-summary-grid";
        summary.append(
            createSummaryCard("Target", state.target.label),
            createSummaryCard("Blocks", String(state.blocks.length)),
            createSummaryCard("Published", String(publishedCount))
        );
        card.appendChild(summary);

        renderBlockList(permissionContext, card);
        panel.appendChild(card);
    }

    async function open() {
        state.isOpen = true;
        state.loading = true;
        state.busy = false;
        state.pageContext = getPageContext?.() || null;
        state.target = getVerseTargetContext(state.pageContext);
        state.blocks = [];
        state.blockForm = null;
        setMessage("Loading body block editor...");
        render();

        try {
            await loadBodyBlockState({ keepForm: false });
            state.loading = false;
            setMessage(
                state.blocks.length
                    ? `Managing ${state.blocks.length} body block${state.blocks.length === 1 ? "" : "s"} for ${state.target.label}.`
                    : `No body blocks exist yet for ${state.target.label}.`,
                "muted"
            );
            render();
        } catch (error) {
            state.loading = false;
            setMessage(error.message || "Unable to load the body block editor.", "error");
            render();
        }
    }

    function close() {
        state.isOpen = false;
        state.loading = false;
        state.busy = false;
        state.pageContext = null;
        state.target = null;
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
