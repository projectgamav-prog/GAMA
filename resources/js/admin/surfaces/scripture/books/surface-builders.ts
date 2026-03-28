import {
    BOOK_CONTENT_BLOCKS_SURFACE_KEY,
    BOOK_INTRO_SURFACE_KEY,
    BOOK_MEDIA_SLOTS_SURFACE_KEY,
} from '@/admin/surfaces/core/surface-keys';
import {
    createBlockActionsSurface,
    createInlineEditorSurface,
    createInsertControlSurface,
    createSurfaceOwner,
} from '@/admin/surfaces/core/surface-builders';
import type {
    AdminSurfaceContract,
    AdminSurfacePresentation,
} from '@/admin/surfaces/core/surface-contracts';
import type {
    BlockActionManagement,
    BlockRegionSurfaceMetadata,
    RegisteredBlockEditorSurfaceMetadata,
} from '@/admin/surfaces/blocks/surface-types';
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
    presentation?: AdminSurfacePresentation | null;
};

type BookBlockRegionSurfaceArgs = {
    book: ScriptureBook;
    entityLabel: string;
    blocks: ScriptureContentBlock[];
    storeHref: string;
    fullEditHref: string;
    defaultRegion: string;
    blockTypes: string[];
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
    duplicateHref?: string;
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
        surfaceKey: BOOK_INTRO_SURFACE_KEY,
        contractKey: 'identity',
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
    presentation,
}: BookIntroSurfaceArgs): AdminSurfaceContract<BookIntroSurfaceMetadata> {
    return createInlineEditorSurface({
        surfaceKey: BOOK_INTRO_SURFACE_KEY,
        contractKey: 'intro',
        entity: 'book',
        entityId: book.id,
        regionKey: 'book_intro',
        capabilities: ['edit', 'full_edit'],
        presentation,
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
}: BookBlockRegionSurfaceArgs): AdminSurfaceContract<BlockRegionSurfaceMetadata> {
    const insertionPoint =
        blocks.length > 0
            ? createAfterLastContentBlockInsertionPoint(blocks[blocks.length - 1])
            : createSectionStartContentBlockInsertionPoint(defaultRegion);

    return createInsertControlSurface({
        surfaceKey: BOOK_CONTENT_BLOCKS_SURFACE_KEY,
        contractKey: 'block_region',
        entity: 'book',
        entityId: book.id,
        regionKey: 'content_blocks',
        owner: createSurfaceOwner('book', book.id),
        capabilities: ['add_block', 'full_edit'],
        metadata: {
            editor: 'block_region',
            entityLabel,
            storeHref,
            fullEditHref,
            defaultRegion,
            blockTypes,
            insertionPoint,
            label: 'Add Block',
            placementLabel: insertionPoint.label,
        },
    });
}

export function createBookContentBlockSurface({
    book,
    entityLabel,
    block,
    updateHref,
    fullEditHref,
}: BookContentBlockSurfaceArgs): AdminSurfaceContract<RegisteredBlockEditorSurfaceMetadata> {
    return createInlineEditorSurface({
        surfaceKey: BOOK_CONTENT_BLOCKS_SURFACE_KEY,
        contractKey: 'registered_block',
        entity: 'content_block',
        entityId: block.id,
        regionKey: 'content_blocks',
        blockType: block.block_type,
        owner: createSurfaceOwner('book', book.id),
        capabilities: ['edit'],
        metadata: {
            editor: 'registered_block',
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
    duplicateHref,
    deleteHref,
    positionInRegion,
    totalInRegion,
    regionLabel,
}: BookBlockActionsSurfaceArgs) {
    const capabilities: Array<'reorder' | 'duplicate' | 'delete' | 'full_edit'> = [];
    const management: BlockActionManagement = {
        moveUpHref,
        moveDownHref,
        reorderHref,
        duplicateHref,
        deleteHref,
        positionInRegion,
        totalInRegion,
        regionLabel,
    };

    if (moveUpHref || moveDownHref) {
        capabilities.push('reorder');
    }

    if (duplicateHref) {
        capabilities.push('duplicate');
    }

    if (deleteHref) {
        capabilities.push('delete');
    }

    if (fullEditHref) {
        capabilities.push('full_edit');
    }

    return createBlockActionsSurface({
        surfaceKey: BOOK_CONTENT_BLOCKS_SURFACE_KEY,
        contractKey: 'block_actions',
        entity: 'content_block',
        entityId: block.id,
        regionKey: 'content_blocks',
        blockType: block.block_type,
        owner: createSurfaceOwner('book', book.id),
        capabilities,
        metadata: {
            management,
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
        surfaceKey: BOOK_MEDIA_SLOTS_SURFACE_KEY,
        contractKey: 'media_slots',
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

