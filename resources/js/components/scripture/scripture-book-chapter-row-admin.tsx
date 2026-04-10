import { AdminModuleHostGroup } from '@/admin/core/AdminModuleHostGroup';
import { resolveChapterHeaderSurfaces } from '@/admin/integrations/scripture/chapters';
import { chapterLabel } from '@/lib/scripture';
import type { ScriptureChapter } from '@/types';

type Props = {
    chapter: ScriptureChapter;
    showAdminControls: boolean;
    returnToHref?: string | null;
    panelClassName?: string;
};

export function ScriptureBookChapterRowAdmin({
    chapter,
    showAdminControls,
    returnToHref = null,
    panelClassName = 'flex flex-wrap items-center gap-1.5',
}: Props) {
    if (!showAdminControls || !chapter.admin) {
        return null;
    }

    const chapterTitle = chapterLabel(chapter.number, chapter.title);
    const {
        identitySurface,
        introSurface,
        actionsSurface,
    } = resolveChapterHeaderSurfaces({
        chapter,
        chapterTitle,
        admin: chapter.admin,
        context: 'book_page_row',
        returnToHref,
        enabled: showAdminControls,
    });

    if (!identitySurface && !introSurface && !actionsSurface) {
        return null;
    }

    return (
        <div
            data-scripture-admin-scope="chapter-row"
            data-entity-id={chapter.id}
            data-entity-slug={chapter.slug}
        >
            <AdminModuleHostGroup
                surfaces={[identitySurface, introSurface, actionsSurface]}
                className={panelClassName}
            />
        </div>
    );
}
