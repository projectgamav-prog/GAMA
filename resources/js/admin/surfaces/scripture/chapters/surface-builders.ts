import {
    CHAPTER_CONTENT_BLOCKS_SURFACE_KEY,
    CHAPTER_INTRO_SURFACE_KEY,
} from '@/admin/surfaces/core/surface-keys';
import {
    createInlineEditorSurface,
} from '@/admin/surfaces/core/surface-builders';
import type { AdminSurfaceContract } from '@/admin/surfaces/core/surface-contracts';
import type {
    ScriptureChapter,
    ScriptureContentBlock,
} from '@/types';
import type {
    IdentityContractMetadata,
    IntroContractMetadata,
} from '@/admin/surfaces/core/contract-readers';

type ChapterIdentitySurfaceArgs = {
    chapter: ScriptureChapter;
    updateHref: string;
    fullEditHref: string;
};

type ChapterIntroSurfaceArgs = {
    chapter: ScriptureChapter;
    chapterTitle: string;
    block: ScriptureContentBlock | null;
    blockTypes: string[];
    updateHref: string | null;
    storeHref: string | null;
    fullEditHref: string;
};

export function createChapterIdentitySurface({
    chapter,
    updateHref,
    fullEditHref,
}: ChapterIdentitySurfaceArgs): AdminSurfaceContract<IdentityContractMetadata<ScriptureChapter>> {
    return createInlineEditorSurface({
        surfaceKey: CHAPTER_INTRO_SURFACE_KEY,
        contractKey: 'identity',
        entity: 'chapter',
        entityId: chapter.id,
        regionKey: 'page_intro',
        capabilities: ['edit', 'full_edit'],
        metadata: {
            entityRecord: chapter,
            updateHref,
            fullEditHref,
        },
    });
}

export function createChapterIntroSurface({
    chapter,
    chapterTitle,
    block,
    blockTypes,
    updateHref,
    storeHref,
    fullEditHref,
}: ChapterIntroSurfaceArgs): AdminSurfaceContract<IntroContractMetadata<ScriptureChapter>> {
    return createInlineEditorSurface({
        surfaceKey: CHAPTER_INTRO_SURFACE_KEY,
        contractKey: 'intro',
        entity: 'chapter',
        entityId: chapter.id,
        regionKey: 'page_intro',
        capabilities:
            updateHref !== null
                ? ['edit', 'full_edit']
                : ['add_block', 'full_edit'],
        metadata: {
            introKind: 'registered_block',
            entityRecord: chapter,
            entityLabel: chapterTitle,
            textValue: null,
            block,
            blockTypes,
            updateHref,
            storeHref,
            fullEditHref,
        },
    });
}

