import {
    CHAPTER_CONTENT_BLOCKS_SURFACE_KEY,
    CHAPTER_INTRO_SURFACE_KEY,
} from '@/admin/modules/shared/surface-keys';
import {
    createBlockActionsSurface,
    createInlineEditorSurface,
    createInsertControlSurface,
    createSurfaceOwner,
} from '@/admin/modules/shared/surface-builders';
import type { AdminSurfaceContract } from '@/admin/modules/shared/surface-contracts';
import type {
    BlockActionManagement,
    BlockRegionSurfaceMetadata,
    RegisteredBlockEditorSurfaceMetadata,
} from '@/admin/modules/blocks/surface-types';
import {
    createAfterLastContentBlockInsertionPoint,
    createSectionStartContentBlockInsertionPoint,
} from '@/lib/scripture-content-block-insertion';
import type {
    ScriptureChapter,
    ScriptureContentBlock,
} from '@/types';
import type {
    ChapterIntroSurfaceMetadata,
} from './surface-types';

type ChapterIntroSurfaceArgs = {
    chapter: ScriptureChapter;
    chapterTitle: string;
    block: ScriptureContentBlock | null;
    updateHref: string | null;
    fullEditHref: string;
};

type ChapterBlockRegionSurfaceArgs = {
    chapter: ScriptureChapter;
    entityLabel: string;
    blocks: ScriptureContentBlock[];
    storeHref: string;
    fullEditHref: string;
    defaultRegion: string;
    blockTypes: string[];
};

type ChapterContentBlockSurfaceArgs = {
    chapter: ScriptureChapter;
    entityLabel: string;
    block: ScriptureContentBlock;
    updateHref: string;
    fullEditHref: string;
};

type ChapterBlockActionsSurfaceArgs = {
    chapter: ScriptureChapter;
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

export function createChapterIntroSurface({
    chapter,
    chapterTitle,
    block,
    updateHref,
    fullEditHref,
}: ChapterIntroSurfaceArgs): AdminSurfaceContract<ChapterIntroSurfaceMetadata> {
    return createInlineEditorSurface({
        surfaceKey: CHAPTER_INTRO_SURFACE_KEY,
        entity: 'chapter',
        entityId: chapter.id,
        regionKey: 'page_intro',
        capabilities: updateHref ? ['edit', 'full_edit'] : ['full_edit'],
        metadata: {
            chapter,
            chapterTitle,
            block,
            updateHref,
            fullEditHref,
        },
    });
}

export function createChapterBlockRegionSurface({
    chapter,
    entityLabel,
    blocks,
    storeHref,
    fullEditHref,
    defaultRegion,
    blockTypes,
}: ChapterBlockRegionSurfaceArgs): AdminSurfaceContract<BlockRegionSurfaceMetadata> {
    const insertionPoint =
        blocks.length > 0
            ? createAfterLastContentBlockInsertionPoint(blocks[blocks.length - 1])
            : createSectionStartContentBlockInsertionPoint(defaultRegion);

    return createInsertControlSurface({
        surfaceKey: CHAPTER_CONTENT_BLOCKS_SURFACE_KEY,
        entity: 'chapter',
        entityId: chapter.id,
        regionKey: 'content_blocks',
        owner: createSurfaceOwner('chapter', chapter.id),
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
            onSelectType: () => undefined,
        },
    });
}

export function createChapterContentBlockSurface({
    chapter,
    entityLabel,
    block,
    updateHref,
    fullEditHref,
}: ChapterContentBlockSurfaceArgs): AdminSurfaceContract<RegisteredBlockEditorSurfaceMetadata> {
    return createInlineEditorSurface({
        surfaceKey: CHAPTER_CONTENT_BLOCKS_SURFACE_KEY,
        entity: 'content_block',
        entityId: block.id,
        regionKey: 'content_blocks',
        blockType: block.block_type,
        owner: createSurfaceOwner('chapter', chapter.id),
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

export function createChapterContentBlockActionsSurface({
    chapter,
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
}: ChapterBlockActionsSurfaceArgs) {
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
        surfaceKey: CHAPTER_CONTENT_BLOCKS_SURFACE_KEY,
        entity: 'content_block',
        entityId: block.id,
        regionKey: 'content_blocks',
        blockType: block.block_type,
        owner: createSurfaceOwner('chapter', chapter.id),
        capabilities,
        metadata: {
            management,
            fullEditHref,
        },
    });
}
