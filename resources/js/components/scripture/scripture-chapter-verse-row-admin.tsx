import { AdminModuleHost } from '@/admin/core/AdminModuleHost';
import { AdminModuleHostGroup } from '@/admin/core/AdminModuleHostGroup';
import {
    resolveVerseHeaderSurfaces,
    resolveVerseReaderRelationSurfaces,
    resolveVerseRowActionSurface,
} from '@/admin/integrations/scripture/verses';
import type {
    ScriptureChapterVerseSharedAdmin,
    ScriptureReaderVerse,
} from '@/types';
import { verseLabel } from '@/lib/scripture';

type Props = {
    verse: ScriptureReaderVerse;
    sectionTitle: string;
    showAdminControls: boolean;
    returnToHref?: string | null;
    sharedAdmin?: ScriptureChapterVerseSharedAdmin | null;
    panelClassName?: string;
};

export function ScriptureChapterVerseRowAdmin({
    verse,
    sectionTitle,
    showAdminControls,
    returnToHref = null,
    sharedAdmin = null,
    panelClassName = 'flex flex-wrap items-center gap-1.5',
}: Props) {
    if (!showAdminControls || !verse.admin) {
        return null;
    }

    const verseTitle = verseLabel(verse.number);
    const verseRecord = {
        id: verse.id,
        slug: verse.slug,
        number: verse.number,
        text: verse.text,
    };
    const {
        identitySurface,
        introSurface,
        metaSurface,
    } = resolveVerseHeaderSurfaces({
        verse: verseRecord,
        verseTitle,
        verseMeta: verse.verse_meta ?? null,
        characters: verse.characters ?? [],
        admin: verse.admin,
        context: 'chapter_page_row',
        returnToHref,
        enabled: showAdminControls,
    });
    const rowActionSurface = resolveVerseRowActionSurface({
        verse: verseRecord,
        verseTitle,
        parentLabel: sectionTitle,
        admin: verse.admin,
        enabled: showAdminControls,
    });
    const {
        translationsSurface,
        commentariesSurface,
    } = resolveVerseReaderRelationSurfaces({
        verse: verseRecord,
        verseTitle,
        translationsAdmin: verse.admin.translations,
        commentariesAdmin: verse.admin.commentaries,
        sharedAdmin,
        fullEditHref: verse.admin.full_edit_href,
        enabled: showAdminControls,
    });

    if (
        !identitySurface &&
        !introSurface &&
        !metaSurface &&
        !rowActionSurface &&
        !translationsSurface &&
        !commentariesSurface
    ) {
        return null;
    }

    return (
        <div
            className="space-y-2"
            data-scripture-admin-scope="verse-row"
            data-entity-id={verse.id}
            data-entity-slug={verse.slug}
        >
            <AdminModuleHostGroup
                surfaces={[
                    identitySurface,
                    introSurface,
                    metaSurface,
                    rowActionSurface,
                ]}
                className={panelClassName}
            />

            {translationsSurface && (
                <AdminModuleHost
                    surface={translationsSurface}
                    className={panelClassName}
                />
            )}

            {commentariesSurface && (
                <AdminModuleHost
                    surface={commentariesSurface}
                    className={panelClassName}
                />
            )}
        </div>
    );
}
