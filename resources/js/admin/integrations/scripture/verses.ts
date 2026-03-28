import { verseIdentityEditorModule } from '@/admin/modules/verses/VerseIdentityEditor';
import { verseMetaEditorModule } from '@/admin/modules/verses/VerseMetaEditor';
import {
    createVerseIdentitySurface,
    createVerseMetaSurface,
} from '@/admin/surfaces/scripture/verses/surface-builders';
import type {
    ScriptureVerse,
    ScriptureVerseAdmin,
    ScriptureVerseCharacterAssignment,
    ScriptureVerseMeta,
} from '@/types';

export {
    verseIdentityEditorModule,
    verseMetaEditorModule,
};

export const verseAdminModules = [
    verseIdentityEditorModule,
    verseMetaEditorModule,
] as const;

export function resolveVerseHeaderSurfaces({
    verse,
    verseMeta,
    characters,
    admin,
    enabled = true,
}: {
    verse: ScriptureVerse;
    verseMeta: ScriptureVerseMeta | null;
    characters: ScriptureVerseCharacterAssignment[];
    admin?: ScriptureVerseAdmin | null;
    enabled?: boolean;
}) {
    if (!enabled || !admin) {
        return {
            introSurface: null,
            metaSurface: null,
        };
    }

    return {
        introSurface: createVerseIdentitySurface({
            verse,
            updateHref: admin.identity_update_href,
            fullEditHref: admin.full_edit_href,
        }),
        metaSurface: createVerseMetaSurface({
            verse,
            verseMeta,
            characters,
            updateHref: admin.meta_update_href,
            fullEditHref: admin.full_edit_href,
        }),
    };
}
