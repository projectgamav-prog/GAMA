import { chapterIdentityEditorModule } from '@/admin/modules/chapters/ChapterIdentityEditor';
import { chapterIntroEditorModule } from '@/admin/modules/chapters/ChapterIntroEditor';
import {
    createChapterIdentitySurface,
    createChapterIntroSurface,
} from '@/admin/surfaces/scripture/chapters/surface-builders';
import type {
    ScriptureChapter,
    ScriptureChapterAdmin,
    ScriptureContentBlock,
} from '@/types';

export {
    chapterIdentityEditorModule,
    chapterIntroEditorModule,
};

export const chapterAdminModules = [
    chapterIdentityEditorModule,
    chapterIntroEditorModule,
] as const;

function resolvePrimaryChapterIntroBlock(
    blocks: ScriptureContentBlock[],
    primaryContentBlockId: number | null,
): ScriptureContentBlock | null {
    if (primaryContentBlockId === null) {
        return null;
    }

    return (
        blocks.find((block) => block.id === primaryContentBlockId) ?? null
    );
}

export function resolveChapterHeaderSurfaces({
    chapter,
    chapterTitle,
    blocks,
    admin,
    enabled = true,
}: {
    chapter: ScriptureChapter;
    chapterTitle: string;
    blocks: ScriptureContentBlock[];
    admin?: ScriptureChapterAdmin | null;
    enabled?: boolean;
}) {
    if (!enabled || !admin) {
        return {
            identitySurface: null,
            introSurface: null,
            introBlock: null,
        };
    }

    const introBlock = resolvePrimaryChapterIntroBlock(
        blocks,
        admin.primary_content_block_id,
    );

    return {
        identitySurface: createChapterIdentitySurface({
            chapter,
            updateHref: admin.identity_update_href,
            fullEditHref: admin.full_edit_href,
        }),
        introSurface: createChapterIntroSurface({
            chapter,
            chapterTitle,
            block: introBlock,
            blockTypes: admin.content_block_types,
            updateHref: admin.primary_content_block_update_href,
            storeHref: admin.content_block_store_href,
            fullEditHref: admin.full_edit_href,
        }),
        introBlock,
    };
}
