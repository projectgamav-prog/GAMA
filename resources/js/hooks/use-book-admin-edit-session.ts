import { useState } from 'react';
import type { ScriptureAdminSurfaceOptions } from '@/components/scripture/scripture-admin-surface';
import type {
    ScriptureAdminRegionConfig,
    ScriptureBook,
    ScriptureBookAdmin,
    ScriptureContentBlock,
    ScriptureContentBlockInsertionPoint,
    ScriptureContentBlockReorderMeta,
    ScriptureEntityRegionMeta,
} from '@/types';
import {
    DEFAULT_BOOK_CONTENT_BLOCK_REGION,
    DEFAULT_BOOK_CONTEXTUAL_BLOCK_TYPES,
    type BookContextualContentBlockType,
    type ScriptureBookAdminEditSession,
} from '@/lib/book-admin-edit-session';
import {
    createInlineTextContentBlockCreateSession,
    isInlineTextContentBlockType,
    type InlineTextContentBlockCreateSession,
} from '@/lib/scripture-inline-text-content-block';
import {
    createScriptureAdminSurfaceCapability,
    createScriptureContentBlockSectionCapabilities,
} from '@/lib/scripture-admin-capabilities';
import { isSameScriptureRegionMeta } from '@/lib/scripture-inline-admin';
import { useScriptureAdminFeedback } from '@/hooks/use-scripture-admin-feedback';

type BookAdminSessionContext = Pick<
    ScriptureBook,
    'id' | 'title' | 'description'
>;

type Props = {
    book: BookAdminSessionContext;
    admin?: ScriptureBookAdmin | null;
};

/**
 * Orchestrates the live book admin experience on public book pages.
 *
 * Responsibilities:
 * - map backend admin payloads into region/block surface configs
 * - keep only one active edit/create session at a time
 * - split safe text-first work into true inline editing
 * - keep richer create/edit flows on the shared sheet fallback
 * - route save/create/manage results into local feedback badges
 */
export function useBookAdminEditSession({ book, admin }: Props) {
    const [editSession, setEditSession] =
        useState<ScriptureBookAdminEditSession | null>(null);
    const [
        inlineCreateTextContentBlockSession,
        setInlineCreateTextContentBlockSession,
    ] = useState<InlineTextContentBlockCreateSession | null>(null);
    const { feedbackFor, showFeedback, clearFeedback } =
        useScriptureAdminFeedback();
    const introFeedbackKey = 'page_intro';
    const contentBlocksSectionFeedbackKey = 'content_blocks_section';
    const contentBlockFeedbackKey = (blockId: number) =>
        `content_block:${blockId}`;
    const isBlockManagementDisabled =
        editSession !== null || inlineCreateTextContentBlockSession !== null;

    const contentBlocksMeta: ScriptureEntityRegionMeta = {
        entityType: 'book',
        entityId: String(book.id),
        entityLabel: book.title,
        region: 'content_blocks',
        capabilityHint: 'content_blocks',
    };

    const detailsConfig: ScriptureAdminRegionConfig | null = admin
        ? {
              supportsEdit: true,
              supportsFullEdit: true,
              editTarget: 'entity_details',
              contextualEditHref: admin.details_update_href,
              fullEditHref: `${admin.full_edit_href}#details-editor`,
          }
        : null;

    const introMeta: ScriptureEntityRegionMeta = {
        entityType: 'book',
        entityId: String(book.id),
        entityLabel: book.title,
        region: 'page_intro',
        capabilityHint: 'intro',
    };

    const openDetailsEditor = (
        meta: ScriptureEntityRegionMeta,
        config: ScriptureAdminRegionConfig,
    ) => {
        if (!config.contextualEditHref) {
            return;
        }

        clearFeedback(introFeedbackKey);
        setInlineCreateTextContentBlockSession(null);
        setEditSession({
            kind: 'entity_details',
            meta,
            updateHref: config.contextualEditHref,
            fullEditHref: config.fullEditHref ?? admin?.full_edit_href ?? '#',
            bookTitle: book.title,
            bookDescription: book.description ?? null,
            values: {
                description: book.description ?? '',
            },
        });
    };

    const getContentBlockConfig = (
        block: ScriptureContentBlock,
    ): ScriptureAdminRegionConfig | null => {
        const updateHref = admin?.content_block_update_hrefs[String(block.id)];

        if (!updateHref || !admin) {
            return null;
        }

        return {
            supportsEdit: true,
            supportsFullEdit: true,
            editTarget: 'content_block',
            contextualEditHref: updateHref,
            fullEditHref: `${admin.full_edit_href}#block-${block.id}`,
        };
    };

    const openContentBlockEditor = (
        meta: ScriptureEntityRegionMeta,
        block: ScriptureContentBlock,
        config: ScriptureAdminRegionConfig,
    ) => {
        if (!config.contextualEditHref) {
            return;
        }

        clearFeedback(contentBlockFeedbackKey(block.id));
        setInlineCreateTextContentBlockSession(null);
        setEditSession({
            kind: 'content_block',
            meta,
            updateHref: config.contextualEditHref,
            fullEditHref: config.fullEditHref ?? admin?.full_edit_href ?? '#',
            bookTitle: book.title,
            block,
            values: {
                block_type: block.block_type as BookContextualContentBlockType,
                title: block.title ?? '',
                body: block.body ?? '',
                region: block.region,
                sort_order: block.sort_order,
                status: 'published',
            },
        });
    };

    const openContentBlockCreator = (
        meta: ScriptureEntityRegionMeta,
        insertion: ScriptureContentBlockInsertionPoint,
        blockType: string,
    ) => {
        if (!admin) {
            return;
        }

        const allowedBlockTypes = (
            admin.content_block_types.length > 0
                ? admin.content_block_types
                : DEFAULT_BOOK_CONTEXTUAL_BLOCK_TYPES
        ) as BookContextualContentBlockType[];

        if (!allowedBlockTypes.includes(blockType as BookContextualContentBlockType)) {
            return;
        }

        clearFeedback(contentBlocksSectionFeedbackKey);

        if (isInlineTextContentBlockType(blockType)) {
            setEditSession(null);
            setInlineCreateTextContentBlockSession(
                createInlineTextContentBlockCreateSession({
                    storeHref: admin.content_block_store_href,
                    fullEditHref: `${admin.full_edit_href}#content-blocks`,
                    defaultRegion:
                        admin.content_block_default_region ??
                        DEFAULT_BOOK_CONTENT_BLOCK_REGION,
                    insertionPoint: insertion,
                }),
            );

            return;
        }

        const defaultRegion =
            insertion.suggested_region ??
            admin.content_block_default_region ??
            DEFAULT_BOOK_CONTENT_BLOCK_REGION;

        setInlineCreateTextContentBlockSession(null);
        setEditSession({
            kind: 'create_content_block',
            meta,
            storeHref: admin.content_block_store_href,
            fullEditHref: `${admin.full_edit_href}#content-blocks`,
            bookTitle: book.title,
            allowedBlockTypes: [blockType as BookContextualContentBlockType],
            allowedRegions: admin.content_block_regions,
            insertionLabel: insertion.label,
            values: {
                block_type: blockType as BookContextualContentBlockType,
                title: '',
                body: '',
                region: defaultRegion,
                status: 'published',
                insertion_mode: insertion.insertion_mode,
                relative_block_id: insertion.relative_block_id,
            },
        });
    };

    const closeEditSession = () => {
        setEditSession(null);
        setInlineCreateTextContentBlockSession(null);
    };

    const introSurface: ScriptureAdminSurfaceOptions | null =
        createScriptureAdminSurfaceCapability({
            config: detailsConfig,
            onEdit: openDetailsEditor,
            label: 'Book intro',
            isActive:
                editSession?.kind === 'entity_details' &&
                isSameScriptureRegionMeta(editSession.meta, introMeta),
            statusLabel: feedbackFor(introFeedbackKey)?.label,
            statusTone: feedbackFor(introFeedbackKey)?.tone,
        });

    const sectionFeedback = feedbackFor(contentBlocksSectionFeedbackKey);
    const contentBlocksSectionSurface: ScriptureAdminSurfaceOptions | null =
        createScriptureAdminSurfaceCapability({
            label: 'Reading notes',
            isActive:
                editSession?.kind === 'create_content_block' ||
                inlineCreateTextContentBlockSession !== null,
            activeLabel: 'Creating block',
            statusLabel: sectionFeedback?.label,
            statusTone: sectionFeedback?.tone,
        });

    const getContentBlockSurface = (
        block: ScriptureContentBlock,
    ): ScriptureAdminSurfaceOptions | null => {
        const config = getContentBlockConfig(block);

        if (config === null) {
            return null;
        }

        return {
            config,
            label: 'Content block',
            onEdit: (meta, regionConfig) =>
                openContentBlockEditor(meta, block, regionConfig),
            isActive:
                editSession?.kind === 'content_block' &&
                editSession.meta.entityType === 'content_block' &&
                editSession.block.id === block.id,
            activeLabel: 'Editing',
            statusLabel: feedbackFor(contentBlockFeedbackKey(block.id))?.label,
            statusTone: feedbackFor(contentBlockFeedbackKey(block.id))?.tone,
        };
    };

    const getContentBlockManagement = (
        block: ScriptureContentBlock,
        reorderMeta?: ScriptureContentBlockReorderMeta,
    ) => {
        const moveUpHref = admin?.content_block_move_up_hrefs[String(block.id)];
        const moveDownHref =
            admin?.content_block_move_down_hrefs[String(block.id)];
        const duplicateHref =
            admin?.content_block_duplicate_hrefs[String(block.id)];
        const deleteHref = admin?.content_block_delete_hrefs[String(block.id)];

        if (!moveUpHref && !moveDownHref && !duplicateHref && !deleteHref) {
            return null;
        }

        return {
            moveUpHref,
            moveDownHref,
            reorderHref:
                admin?.content_block_reorder_hrefs[String(block.id)],
            duplicateHref,
            deleteHref,
            positionInRegion: reorderMeta?.positionInRegion,
            totalInRegion: reorderMeta?.totalInRegion,
            regionLabel: reorderMeta?.regionLabel,
            disabled: isBlockManagementDisabled,
            onMoveUpSuccess: () =>
                showFeedback(
                    contentBlockFeedbackKey(block.id),
                    reorderMeta
                        ? `Moved to ${Math.max(1, reorderMeta.positionInRegion - 1)} of ${reorderMeta.totalInRegion}`
                        : 'Moved up',
                ),
            onMoveDownSuccess: () =>
                showFeedback(
                    contentBlockFeedbackKey(block.id),
                    reorderMeta
                        ? `Moved to ${Math.min(reorderMeta.totalInRegion, reorderMeta.positionInRegion + 1)} of ${reorderMeta.totalInRegion}`
                        : 'Moved down',
                ),
            onReorderSuccess: (message: string) =>
                showFeedback(contentBlockFeedbackKey(block.id), message),
            onDuplicateSuccess: () =>
                showFeedback(
                    contentBlocksSectionFeedbackKey,
                    'Block duplicated',
                ),
            onDeleteSuccess: () =>
                showFeedback(contentBlocksSectionFeedbackKey, 'Block deleted'),
        };
    };

    const inlineIntroSession =
        editSession?.kind === 'entity_details' ? editSession : null;
    const inlineTextContentBlockSession =
        editSession?.kind === 'content_block' &&
        editSession.block.block_type === 'text'
            ? editSession
            : null;
    // Only the safest text-first flows stay inline on the public page. Any
    // other session continues to use the sheet fallback for now.
    const sheetSession =
        editSession?.kind === 'entity_details' || inlineTextContentBlockSession
            ? null
            : editSession;

    const getInlineTextContentBlockSession = (blockId: number) =>
        inlineTextContentBlockSession?.block.id === blockId
            ? inlineTextContentBlockSession
            : null;

    const contentBlocksCapabilities =
        createScriptureContentBlockSectionCapabilities({
            sectionAdminSurface: contentBlocksSectionSurface,
            insertBlockTypes: admin?.content_block_types ?? [],
            blockCreationDisabled: Boolean(
                inlineCreateTextContentBlockSession !== null ||
                    editSession?.kind === 'create_content_block',
            ),
            onInsertBlockTypeSelected: admin
                ? (insertion, blockType) =>
                      openContentBlockCreator(
                          contentBlocksMeta,
                          insertion,
                          blockType,
                      )
                : undefined,
            resolveBlockAdminSurface: getContentBlockSurface,
            resolveBlockManagement: getContentBlockManagement,
        });

    return {
        editSession: sheetSession,
        inlineIntroSession,
        inlineCreateTextContentBlockSession,
        getInlineTextContentBlockSession,
        closeEditSession,
        introSurface,
        contentBlocksSectionSurface,
        contentBlocksCapabilities,
        contentBlocksMeta,
        contentBlockTypes: admin?.content_block_types ?? [],
        isCreatingContentBlock: Boolean(
            inlineCreateTextContentBlockSession !== null ||
                editSession?.kind === 'create_content_block',
        ),
        handleIntroSaveSuccess: () => showFeedback(introFeedbackKey, 'Saved'),
        handleContentBlockSaveSuccess: (blockId: number) =>
            showFeedback(contentBlockFeedbackKey(blockId), 'Saved'),
        handleContentBlockCreateSuccess: () =>
            showFeedback(contentBlocksSectionFeedbackKey, 'Block added'),
        getContentBlockSurface,
        getContentBlockManagement,
        openContentBlockCreator,
    };
}
