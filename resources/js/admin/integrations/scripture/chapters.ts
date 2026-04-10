import { chapterIdentityEditorModule } from '@/admin/modules/chapters/ChapterIdentityEditor';
import { chapterIntroEditorModule } from '@/admin/modules/chapters/ChapterIntroEditor';
import {
    createChapterActionsSurface,
    createChapterIdentitySurface,
    createChapterIntroSurface,
} from '@/admin/surfaces/scripture/chapters/surface-builders';
import type {
    ScriptureChapter,
    ScriptureChapterAdmin,
    ScriptureChapterRowAdmin,
} from '@/types';

export {
    chapterIdentityEditorModule,
    chapterIntroEditorModule,
};

export const chapterAdminModules = [
    chapterIdentityEditorModule,
    chapterIntroEditorModule,
] as const;

export function resolveChapterHeaderSurfaces({
    chapter,
    chapterTitle,
    admin,
    context = 'chapter_page',
    returnToHref = null,
    enabled = true,
}: {
    chapter: ScriptureChapter;
    chapterTitle: string;
    admin?: ScriptureChapterAdmin | ScriptureChapterRowAdmin | null;
    context?: 'chapter_page' | 'book_page_row';
    returnToHref?: string | null;
    enabled?: boolean;
}) {
    if (!enabled || !admin) {
        return {
            identitySurface: null,
            introSurface: null,
            actionsSurface: null,
        };
    }

    return {
        identitySurface: createChapterIdentitySurface({
            chapter,
            updateHref: admin.identity_update_href,
            fullEditHref: admin.full_edit_href,
            regionKey:
                context === 'book_page_row'
                    ? 'chapter_list_row_identity'
                    : 'chapter_identity',
            returnToHref,
            editorDescription:
                context === 'book_page_row'
                    ? 'Update the canonical chapter slug, number, and title directly from this chapter row on the book page.'
                    : 'Update the canonical chapter slug, number, and title without leaving the public chapter page.',
        }),
        introSurface: createChapterIntroSurface({
            chapter,
            chapterTitle,
            block: admin.primary_intro_block,
            blockTypes: admin.intro_block_types,
            updateHref: admin.primary_intro_update_href,
            destroyHref: admin.primary_intro_destroy_href,
            storeHref: admin.intro_store_href,
            fullEditHref: admin.full_edit_href,
        }),
        actionsSurface: createChapterActionsSurface({
            chapter,
            chapterTitle,
            destroyHref: admin.destroy_href ?? null,
        }),
    };
}
