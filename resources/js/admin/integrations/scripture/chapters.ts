import { chapterIdentityEditorModule } from '@/admin/modules/chapters/ChapterIdentityEditor';
import { chapterIntroEditorModule } from '@/admin/modules/chapters/ChapterIntroEditor';
import {
    createChapterActionsSurface,
    createChapterIdentitySurface,
    createChapterIntroSurface,
} from '@/admin/surfaces/scripture/chapters/surface-builders';
import {
    resolveChapterIdentitySurfaceContext,
    type ChapterIdentitySurfaceContext,
} from './identity-surface-context';
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
    context?: ChapterIdentitySurfaceContext;
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

    const identityContext = resolveChapterIdentitySurfaceContext(context);

    return {
        identitySurface: createChapterIdentitySurface({
            chapter,
            updateHref: admin.identity_update_href,
            fullEditHref: admin.full_edit_href,
            regionKey: identityContext.regionKey,
            returnToHref,
            editorDescription: identityContext.editorDescription,
            semanticContext: identityContext.semanticContext,
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
