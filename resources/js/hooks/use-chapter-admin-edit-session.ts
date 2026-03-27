import { useState } from 'react';
import type { ScriptureAdminSurfaceOptions } from '@/components/scripture/scripture-admin-surface';
import type { ScriptureChapterAdminEditSession } from '@/components/scripture/scripture-chapter-admin-edit-sheet';
import {
    createInlineTextContentBlockCreateSession,
    isInlineTextContentBlockType,
    type InlineTextContentBlockCreateSession,
} from '@/lib/scripture-inline-text-content-block';
import {
    createScriptureAdminSurfaceCapability,
    createScriptureContentBlockSectionCapabilities,
} from '@/lib/scripture-admin-capabilities';
import { useScriptureAdminFeedback } from '@/hooks/use-scripture-admin-feedback';
import type {
    ScriptureAdminRegionConfig,
    ScriptureChapterAdmin,
    ScriptureContentBlock,
    ScriptureContentBlockInsertionPoint,
    ScriptureContentBlockReorderMeta,
    ScriptureEntityRegionMeta,
} from '@/types';
import { isSameScriptureRegionMeta } from '@/lib/scripture-inline-admin';

type Props = {
    chapterId: number;
    bookTitle: string;
    bookSectionTitle: string;
    chapterTitle: string;
    contentBlocks: ScriptureContentBlock[];
    admin?: ScriptureChapterAdmin | null;
};

/**
 * Coordinates public-page chapter editing with the same shared surface/session
 * model used by books and verses.
 *
 * Chapter currently keeps a narrow live scope:
 * - the page intro may map to a single primary published text block
 * - text note blocks can edit/create inline
 * - structurally richer work still falls back to the sheet/full-edit path
 */
export function useChapterAdminEditSession({
    chapterId,
    bookTitle,
    bookSectionTitle,
    chapterTitle,
    contentBlocks,
    admin,
}: Props) {
    const [editSession, setEditSession] =
        useState<ScriptureChapterAdminEditSession | null>(null);
    const [
        inlineCreateTextContentBlockSession,
        setInlineCreateTextContentBlockSession,
    ] = useState<InlineTextContentBlockCreateSession | null>(null);
    const { feedbackFor, showFeedback, clearFeedback } =
        useScriptureAdminFeedback();
    const pageIntroFeedbackKey = 'page_intro';
    const contentBlocksSectionFeedbackKey = 'content_blocks_section';
    const contentBlockFeedbackKey = (blockId: number) =>
        `content_block:${blockId}`;
    const isBlockManagementDisabled =
        editSession !== null || inlineCreateTextContentBlockSession !== null;

    const primaryEditableBlock =
        admin?.primary_content_block_id === null ||
        admin?.primary_content_block_id === undefined
            ? null
            : (contentBlocks.find(
                  (block) => block.id === admin.primary_content_block_id,
              ) ?? null);

    const pageIntroConfig: ScriptureAdminRegionConfig | null = admin
        ? {
              supportsEdit:
                  primaryEditableBlock !== null &&
                  admin.primary_content_block_update_href !== null,
              supportsFullEdit: true,
              editTarget: 'content_block',
              contextualEditHref: admin.primary_content_block_update_href,
              fullEditHref:
                  primaryEditableBlock !== null
                      ? `${admin.full_edit_href}#block-${primaryEditableBlock.id}`
                      : admin.full_edit_href,
          }
        : null;

    const pageIntroMeta: ScriptureEntityRegionMeta = {
        entityType: 'chapter',
        entityId: String(chapterId),
        entityLabel: chapterTitle,
        region: 'page_intro',
        capabilityHint: 'intro',
    };
    const contentBlocksMeta: ScriptureEntityRegionMeta = {
        entityType: 'chapter',
        entityId: String(chapterId),
        entityLabel: chapterTitle,
        region: 'content_blocks',
        capabilityHint: 'content_blocks',
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
        clearFeedback(pageIntroFeedbackKey);
        setInlineCreateTextContentBlockSession(null);
        setEditSession({
            meta,
            updateHref: config.contextualEditHref,
            fullEditHref: config.fullEditHref ?? admin?.full_edit_href ?? '#',
            bookTitle,
            bookSectionTitle,
            chapterTitle,
            block,
            values: {
                title: block.title ?? '',
                body: block.body ?? '',
                region: block.region,
                sort_order: block.sort_order,
                status: 'published',
            },
        });
    };

    const openContentBlockCreator = (
        insertion: ScriptureContentBlockInsertionPoint,
        blockType: string,
    ) => {
        if (!admin || !isInlineTextContentBlockType(blockType)) {
            return;
        }

        clearFeedback(contentBlocksSectionFeedbackKey);
        setEditSession(null);
        setInlineCreateTextContentBlockSession(
            createInlineTextContentBlockCreateSession({
                storeHref: admin.content_block_store_href,
                fullEditHref: `${admin.full_edit_href}#content-blocks`,
                defaultRegion: admin.content_block_default_region,
                insertionPoint: insertion,
            }),
        );
    };

    const closeEditSession = () => {
        setEditSession(null);
        setInlineCreateTextContentBlockSession(null);
    };

    const pageIntroSurface: ScriptureAdminSurfaceOptions | null =
        createScriptureAdminSurfaceCapability({
            config: pageIntroConfig,
            label: 'Chapter intro',
            onEdit: (meta, config) => {
                if (primaryEditableBlock !== null) {
                    openContentBlockEditor(meta, primaryEditableBlock, config);
                }
            },
            isActive:
                editSession !== null &&
                isSameScriptureRegionMeta(editSession.meta, pageIntroMeta),
            statusLabel: feedbackFor(pageIntroFeedbackKey)?.label,
            statusTone: feedbackFor(pageIntroFeedbackKey)?.tone,
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
            label: 'Published note',
            onEdit: (meta, regionConfig) =>
                openContentBlockEditor(meta, block, regionConfig),
            isActive:
                editSession !== null &&
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
    const sectionFeedback = feedbackFor(contentBlocksSectionFeedbackKey);
    const contentBlocksSectionSurface: ScriptureAdminSurfaceOptions | null =
        createScriptureAdminSurfaceCapability({
            label: 'Published notes',
            isActive: inlineCreateTextContentBlockSession !== null,
            activeLabel: 'Creating block',
            statusLabel: sectionFeedback?.label,
            statusTone: sectionFeedback?.tone,
        });

    const inlineIntroSession =
        editSession !== null && editSession.meta.region === 'page_intro'
            ? editSession
            : null;
    const inlineTextContentBlockSession =
        editSession !== null &&
        editSession.meta.entityType === 'content_block' &&
        editSession.block.block_type === 'text'
            ? editSession
            : null;
    const sheetSession =
        editSession !== null &&
        (editSession.meta.region === 'page_intro' ||
            inlineTextContentBlockSession !== null)
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
            blockCreationDisabled:
                inlineCreateTextContentBlockSession !== null,
            onInsertBlockTypeSelected: admin
                ? (insertion, blockType) =>
                      openContentBlockCreator(insertion, blockType)
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
        pageIntroBlock: primaryEditableBlock,
        pageIntroSurface,
        contentBlocksMeta,
        contentBlocksSectionSurface,
        contentBlocksCapabilities,
        contentBlockTypes: admin?.content_block_types ?? [],
        isCreatingContentBlock:
            inlineCreateTextContentBlockSession !== null,
        handlePageIntroSaveSuccess: () =>
            showFeedback(pageIntroFeedbackKey, 'Saved'),
        handleContentBlockSaveSuccess: (blockId: number) =>
            showFeedback(contentBlockFeedbackKey(blockId), 'Saved'),
        handleContentBlockCreateSuccess: () =>
            showFeedback(contentBlocksSectionFeedbackKey, 'Block added'),
        getContentBlockSurface,
        getContentBlockManagement,
        openContentBlockCreator,
    };
}
