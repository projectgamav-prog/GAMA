import { useState } from 'react';
import type { ScriptureAdminSurfaceOptions } from '@/components/scripture/scripture-admin-surface';
import type { ScriptureVerseAdminEditSession } from '@/components/scripture/scripture-verse-admin-edit-sheet';
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
import { verseLabel } from '@/lib/scripture';
import { formatAdminList } from '@/lib/scripture-admin';
import { isSameScriptureRegionMeta } from '@/lib/scripture-inline-admin';
import type {
    ScriptureAdminRegionConfig,
    ScriptureContentBlock,
    ScriptureContentBlockInsertionPoint,
    ScriptureContentBlockReorderMeta,
    ScriptureEntityRegionMeta,
    ScriptureVerse,
    ScriptureVerseAdmin,
    ScriptureVerseMeta,
} from '@/types';

type Props = {
    verse: ScriptureVerse;
    verseMeta: ScriptureVerseMeta | null;
    admin?: ScriptureVerseAdmin | null;
};

/**
 * Coordinates the live verse admin flow on the public verse page.
 *
 * Verse keeps two inline-safe lanes today:
 * - verse meta / study note editing
 * - text-only published note blocks
 *
 * Everything else continues to use the shared sheet fallback so the public-page
 * editing surface stays predictable while the broader CMS model is still staged.
 */
export function useVerseAdminEditSession({
    verse,
    verseMeta,
    admin,
}: Props) {
    const [editSession, setEditSession] =
        useState<ScriptureVerseAdminEditSession | null>(null);
    const [
        inlineCreateTextContentBlockSession,
        setInlineCreateTextContentBlockSession,
    ] = useState<InlineTextContentBlockCreateSession | null>(null);
    const { feedbackFor, showFeedback, clearFeedback } =
        useScriptureAdminFeedback();
    const verseMetaFeedbackKey = 'verse_meta';
    const contentBlocksSectionFeedbackKey = 'content_blocks_section';
    const contentBlockFeedbackKey = (blockId: number) =>
        `content_block:${blockId}`;
    const isBlockManagementDisabled =
        editSession !== null || inlineCreateTextContentBlockSession !== null;

    const verseTitle = verseLabel(verse.number);

    const verseMetaConfig: ScriptureAdminRegionConfig | null = admin
        ? {
              supportsEdit: true,
              supportsFullEdit: true,
              editTarget: 'verse_meta',
              contextualEditHref: admin.meta_update_href,
              fullEditHref: `${admin.full_edit_href}#meta-editor`,
          }
        : null;

    const openVerseMetaEditor = (
        meta: ScriptureEntityRegionMeta,
        config: ScriptureAdminRegionConfig,
    ) => {
        if (!config.contextualEditHref) {
            return;
        }

        clearFeedback(verseMetaFeedbackKey);
        setInlineCreateTextContentBlockSession(null);
        setEditSession({
            kind: 'verse_meta',
            meta,
            updateHref: config.contextualEditHref,
            fullEditHref: config.fullEditHref ?? admin?.full_edit_href ?? '#',
            verseTitle,
            verseText: verse.text,
            values: {
                summary_short: verseMeta?.summary_short ?? '',
                is_featured: verseMeta?.is_featured ?? false,
                keywords_text: formatAdminList(verseMeta?.keywords_json ?? null),
                study_flags_text: formatAdminList(
                    verseMeta?.study_flags_json ?? null,
                ),
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
            verseTitle,
            verseText: verse.text,
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

    const introMeta: ScriptureEntityRegionMeta = {
        entityType: 'verse',
        entityId: String(verse.id),
        entityLabel: verseTitle,
        region: 'page_intro',
        capabilityHint: 'intro',
    };

    const studyNotesMeta: ScriptureEntityRegionMeta = {
        entityType: 'verse',
        entityId: String(verse.id),
        entityLabel: verseTitle,
        region: 'study_notes',
        capabilityHint: 'relationships',
    };
    const contentBlocksMeta: ScriptureEntityRegionMeta = {
        entityType: 'verse',
        entityId: String(verse.id),
        entityLabel: verseTitle,
        region: 'content_blocks',
        capabilityHint: 'content_blocks',
    };

    const introVerseNotesSurface: ScriptureAdminSurfaceOptions | null =
        createScriptureAdminSurfaceCapability({
            config: verseMetaConfig,
            onEdit: openVerseMetaEditor,
            label: 'Verse notes',
            isActive:
                editSession?.kind === 'verse_meta' &&
                isSameScriptureRegionMeta(editSession.meta, introMeta),
            statusLabel: feedbackFor(verseMetaFeedbackKey)?.label,
            statusTone: feedbackFor(verseMetaFeedbackKey)?.tone,
        });

    const verseMetaSurface: ScriptureAdminSurfaceOptions | null =
        createScriptureAdminSurfaceCapability({
            config: verseMetaConfig,
            onEdit: openVerseMetaEditor,
            label: 'Study notes',
            isActive:
                editSession?.kind === 'verse_meta' &&
                isSameScriptureRegionMeta(editSession.meta, studyNotesMeta),
            statusLabel: feedbackFor(verseMetaFeedbackKey)?.label,
            statusTone: feedbackFor(verseMetaFeedbackKey)?.tone,
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
    const sectionFeedback = feedbackFor(contentBlocksSectionFeedbackKey);
    const contentBlocksSectionSurface: ScriptureAdminSurfaceOptions | null =
        createScriptureAdminSurfaceCapability({
            label: 'Published notes',
            isActive: inlineCreateTextContentBlockSession !== null,
            activeLabel: 'Creating block',
            statusLabel: sectionFeedback?.label,
            statusTone: sectionFeedback?.tone,
        });

    const inlineVerseNotesSession =
        editSession?.kind === 'verse_meta' ? editSession : null;
    const inlineTextContentBlockSession =
        editSession?.kind === 'content_block' &&
        editSession.block.block_type === 'text'
            ? editSession
            : null;
    const sheetSession =
        editSession?.kind === 'verse_meta' || inlineTextContentBlockSession
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
        inlineVerseNotesSession,
        inlineCreateTextContentBlockSession,
        getInlineTextContentBlockSession,
        closeEditSession,
        introVerseNotesSurface,
        verseMetaSurface,
        contentBlocksMeta,
        contentBlocksSectionSurface,
        contentBlocksCapabilities,
        contentBlockTypes: admin?.content_block_types ?? [],
        isCreatingContentBlock:
            inlineCreateTextContentBlockSession !== null,
        handleVerseMetaSaveSuccess: () =>
            showFeedback(verseMetaFeedbackKey, 'Saved'),
        handleContentBlockSaveSuccess: (blockId: number) =>
            showFeedback(contentBlockFeedbackKey(blockId), 'Saved'),
        handleContentBlockCreateSuccess: () =>
            showFeedback(contentBlocksSectionFeedbackKey, 'Block added'),
        getContentBlockSurface,
        getContentBlockManagement,
        openContentBlockCreator,
    };
}
