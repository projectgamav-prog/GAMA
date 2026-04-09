import { AdminModuleHostGroup } from '@/admin/core/AdminModuleHostGroup';
import { resolveChapterHeaderSurfaces } from '@/admin/integrations/scripture/chapters';
import { chapterLabel } from '@/lib/scripture';
import type { ScriptureChapter } from '@/types';

type Props = {
    chapter: ScriptureChapter;
    showAdminControls: boolean;
    panelClassName?: string;
};

export function ScriptureBookChapterRowAdmin({
    chapter,
    showAdminControls,
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
        enabled: showAdminControls,
    });

    if (!identitySurface && !introSurface && !actionsSurface) {
        return null;
    }

    return (
        <AdminModuleHostGroup
            surfaces={[identitySurface, introSurface, actionsSurface]}
            className={panelClassName}
        />
    );
}
