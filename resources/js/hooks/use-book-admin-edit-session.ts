import { useState } from 'react';
import type {
    ScriptureAdminRegionConfig,
    ScriptureBook,
    ScriptureBookAdmin,
    ScriptureContentBlock,
    ScriptureContentBlockInsertionPoint,
    ScriptureEntityRegionMeta,
} from '@/types';
import {
    DEFAULT_BOOK_CONTENT_BLOCK_REGION,
    DEFAULT_BOOK_CONTEXTUAL_BLOCK_TYPES,
    type BookContextualContentBlockType,
    type ScriptureBookAdminEditSession,
} from '@/lib/book-admin-edit-session';
import { createSectionStartContentBlockInsertionPoint } from '@/lib/scripture-content-block-insertion';

type BookAdminSessionContext = Pick<
    ScriptureBook,
    'id' | 'title' | 'description'
>;

type Props = {
    book: BookAdminSessionContext;
    admin?: ScriptureBookAdmin | null;
};

export function useBookAdminEditSession({ book, admin }: Props) {
    const [editSession, setEditSession] =
        useState<ScriptureBookAdminEditSession | null>(null);

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

    const openDetailsEditor = (
        meta: ScriptureEntityRegionMeta,
        config: ScriptureAdminRegionConfig,
    ) => {
        if (!config.contextualEditHref) {
            return;
        }

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
    ) => {
        if (!admin) {
            return;
        }

        const allowedBlockTypes = (
            admin.content_block_types.length > 0
                ? admin.content_block_types
                : DEFAULT_BOOK_CONTEXTUAL_BLOCK_TYPES
        ) as BookContextualContentBlockType[];
        const defaultRegion =
            insertion.suggested_region ??
            admin.content_block_regions[0] ??
            DEFAULT_BOOK_CONTENT_BLOCK_REGION;

        setEditSession({
            kind: 'create_content_block',
            meta,
            storeHref: admin.content_block_store_href,
            fullEditHref: `${admin.full_edit_href}#content-blocks`,
            bookTitle: book.title,
            allowedBlockTypes,
            allowedRegions: admin.content_block_regions,
            insertionLabel: insertion.label,
            values: {
                block_type: allowedBlockTypes[0] ?? 'text',
                title: '',
                body: '',
                region: defaultRegion,
                status: 'published',
                insertion_mode: insertion.insertion_mode,
                relative_block_id: insertion.relative_block_id,
            },
        });
    };

    const openContentBlockCreatorAtSectionStart = () => {
        if (!admin) {
            return;
        }

        openContentBlockCreator(
            contentBlocksMeta,
            createSectionStartContentBlockInsertionPoint(
                admin.content_block_regions[0] ??
                    DEFAULT_BOOK_CONTENT_BLOCK_REGION,
            ),
        );
    };

    const closeEditSession = () => setEditSession(null);

    return {
        editSession,
        closeEditSession,
        detailsConfig,
        contentBlocksMeta,
        getContentBlockConfig,
        openDetailsEditor,
        openContentBlockEditor,
        openContentBlockCreator,
        openContentBlockCreatorAtSectionStart,
    };
}
