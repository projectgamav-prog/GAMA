import {
    CHAPTER_IDENTITY_SURFACE_KEY,
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
    EntityActionsContractMetadata,
    IdentityContractMetadata,
    IntroContractMetadata,
} from '@/admin/surfaces/core/contract-readers';

type ChapterIdentitySurfaceArgs = {
    chapter: ScriptureChapter;
    updateHref: string;
    fullEditHref: string;
    regionKey?: string;
    returnToHref?: string | null;
    editorDescription?: string | null;
};

type ChapterIntroSurfaceArgs = {
    chapter: ScriptureChapter;
    chapterTitle: string;
    block: ScriptureContentBlock | null;
    blockTypes: string[];
    updateHref: string | null;
    destroyHref?: string | null;
    storeHref: string | null;
    fullEditHref: string;
};

type ChapterActionsSurfaceArgs = {
    chapter: ScriptureChapter;
    chapterTitle: string;
    destroyHref: string | null;
};

export function createChapterIdentitySurface({
    chapter,
    updateHref,
    fullEditHref,
    regionKey = 'chapter_identity',
    returnToHref = null,
    editorDescription = null,
}: ChapterIdentitySurfaceArgs): AdminSurfaceContract<IdentityContractMetadata<ScriptureChapter>> {
    return createInlineEditorSurface({
        surfaceKey: CHAPTER_IDENTITY_SURFACE_KEY,
        contractKey: 'identity',
        entity: 'chapter',
        entityId: chapter.id,
        regionKey,
        capabilities: ['edit', 'full_edit'],
        metadata: {
            entityRecord: chapter,
            updateHref,
            fullEditHref,
            returnToHref,
            editorDescription,
        },
    });
}

export function createChapterIntroSurface({
    chapter,
    chapterTitle,
    block,
    blockTypes,
    updateHref,
    destroyHref = null,
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
            destroyHref,
            storeHref,
            fullEditHref,
        },
    });
}

export function createChapterActionsSurface({
    chapter,
    chapterTitle,
    destroyHref,
}: ChapterActionsSurfaceArgs): AdminSurfaceContract<EntityActionsContractMetadata> {
    return createInlineEditorSurface({
        contractKey: 'entity_actions',
        entity: 'chapter',
        entityId: chapter.id,
        regionKey: 'chapter_actions',
        capabilities: destroyHref ? ['delete'] : [],
        presentation: {
            placement: 'inline',
            variant: 'compact',
        },
        metadata: {
            entityLabel: chapterTitle,
            parentLabel: null,
            createHref: null,
            destroyHref,
            fullEditHref: null,
        },
    });
}
