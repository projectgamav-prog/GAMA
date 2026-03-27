import {
    createBlockActionsSurface,
    createInlineEditorSurface,
    createInsertControlSurface,
    createSurfaceOwner,
} from '@/admin/modules/shared';
import type { AdminSurfaceContract } from '@/admin/modules/shared';
import {
    createAfterLastContentBlockInsertionPoint,
    createSectionStartContentBlockInsertionPoint,
} from '@/lib/scripture-content-block-insertion';
import type {
    ScriptureAdminMediaAssignment,
    ScriptureAdminMediaSummary,
    ScriptureBook,
    ScriptureContentBlock,
} from '@/types';
import type {
    BookBlockRegionSurfaceMetadata,
    BookContentBlockSurfaceMetadata,
    BookIdentitySurfaceMetadata,
    BookIntroSurfaceMetadata,
    BookMediaSlotsSurfaceMetadata,
} from './surface-types';

type BookIdentitySurfaceArgs = {
    book: ScriptureBook;
    updateHref: string;
    fullEditHref: string;
};

type BookIntroSurfaceArgs = {
    book: ScriptureBook;
    updateHref: string;
    fullEditHref: string;
};

type BookBlockRegionSurfaceArgs = {
    book: ScriptureBook;
    entityLabel: string;
    blocks: ScriptureContentBlock[];
    storeHref: string;
    fullEditHref: string;
    defaultRegion: string;
    blockTypes: string[];
    onSelectType: (blockType: string) => void;
};

type BookContentBlockSurfaceArgs = {
    book: ScriptureBook;
    entityLabel: string;
    block: ScriptureContentBlock;
    updateHref: string;
    fullEditHref: string;
};

type BookBlockActionsSurfaceArgs = {
    book: ScriptureBook;
    block: ScriptureContentBlock;
    fullEditHref: string;
    moveUpHref?: string;
    moveDownHref?: string;
    reorderHref?: string;
    deleteHref?: string;
    positionInRegion?: number;
    totalInRegion?: number;
    regionLabel?: string;
};

type BookMediaSlotsSurfaceArgs = {
    book: ScriptureBook;
    storeHref: string;
    fullEditHref: string;
    assignments: ScriptureAdminMediaAssignment[];
    availableMedia: ScriptureAdminMediaSummary[];
    nextSortOrder: number;
};

export function createBookIdentitySurface({
    book,
    updateHref,
    fullEditHref,
}: BookIdentitySurfaceArgs): AdminSurfaceContract<BookIdentitySurfaceMetadata> {
    return createInlineEditorSurface({
        entity: 'book',
        entityId: book.id,
        regionKey: 'book_intro',
        capabilities: ['edit', 'full_edit'],
        metadata: {
            editor: 'book_identity',
            book,
            updateHref,
            fullEditHref,
        },
    });
}

export function createBookIntroSurface({
    book,
    updateHref,
    fullEditHref,
}: BookIntroSurfaceArgs): AdminSurfaceContract<BookIntroSurfaceMetadata> {
    return createInlineEditorSurface({
        entity: 'book',
        entityId: book.id,
        regionKey: 'book_intro',
        capabilities: ['edit', 'full_edit'],
        metadata: {
            editor: 'book_intro',
            book,
            updateHref,
            fullEditHref,
        },
    });
}

export function createBookBlockRegionSurface({
    book,
    entityLabel,
    blocks,
    storeHref,
    fullEditHref,
    defaultRegion,
    blockTypes,
    onSelectType,
}: BookBlockRegionSurfaceArgs): AdminSurfaceContract<BookBlockRegionSurfaceMetadata> {
    const insertionPoint =
        blocks.length > 0
            ? createAfterLastContentBlockInsertionPoint(blocks[blocks.length - 1])
            : createSectionStartContentBlockInsertionPoint(defaultRegion);

    return createInsertControlSurface({
        entity: 'book',
        entityId: book.id,
        regionKey: 'content_blocks',
        owner: createSurfaceOwner('book', book.id),
        capabilities: ['add_block', 'full_edit'],
        metadata: {
            editor: 'book_block_region',
            entityLabel,
            storeHref,
            fullEditHref,
            defaultRegion,
            blockTypes,
            insertionPoint,
            label: 'Add Block',
            placementLabel: insertionPoint.label,
            onSelectType,
        },
    });
}

export function createBookContentBlockSurface({
    book,
    entityLabel,
    block,
    updateHref,
    fullEditHref,
}: BookContentBlockSurfaceArgs): AdminSurfaceContract<BookContentBlockSurfaceMetadata> {
    return createInlineEditorSurface({
        entity: 'content_block',
        entityId: block.id,
        regionKey: 'content_blocks',
        blockType: block.block_type,
        owner: createSurfaceOwner('book', book.id),
        capabilities: ['edit'],
        metadata: {
            editor: 'book_content_block',
            entityLabel,
            block,
            updateHref,
            fullEditHref,
        },
    });
}

export function createBookContentBlockActionsSurface({
    book,
    block,
    fullEditHref,
    moveUpHref,
    moveDownHref,
    reorderHref,
    deleteHref,
    positionInRegion,
    totalInRegion,
    regionLabel,
}: BookBlockActionsSurfaceArgs) {
    const capabilities: Array<'reorder' | 'delete' | 'full_edit'> = [];

    if (moveUpHref || moveDownHref) {
        capabilities.push('reorder');
    }

    if (deleteHref) {
        capabilities.push('delete');
    }

    if (fullEditHref) {
        capabilities.push('full_edit');
    }

    return createBlockActionsSurface({
        entity: 'content_block',
        entityId: block.id,
        regionKey: 'content_blocks',
        blockType: block.block_type,
        owner: createSurfaceOwner('book', book.id),
        capabilities,
        metadata: {
            management: {
                moveUpHref,
                moveDownHref,
                reorderHref,
                deleteHref,
                positionInRegion,
                totalInRegion,
                regionLabel,
            },
            fullEditHref,
        },
    });
}

export function createBookMediaSlotsSurface({
    book,
    storeHref,
    fullEditHref,
    assignments,
    availableMedia,
    nextSortOrder,
}: BookMediaSlotsSurfaceArgs): AdminSurfaceContract<BookMediaSlotsSurfaceMetadata> {
    return createInlineEditorSurface({
        entity: 'book',
        entityId: book.id,
        regionKey: 'book_media_slots',
        capabilities: ['edit', 'full_edit', 'manage_media'],
        metadata: {
            editor: 'book_media_slots',
            bookTitle: book.title,
            storeHref,
            fullEditHref,
            assignments,
            availableMedia,
            nextSortOrder,
        },
    });
}
