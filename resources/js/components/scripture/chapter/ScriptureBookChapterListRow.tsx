import { Link } from '@inertiajs/react';
import { BookOpenText } from 'lucide-react';
import { ScriptureBookChapterRowAdmin } from '@/components/scripture/scripture-book-chapter-row-admin';
import { ScriptureEntityRegion } from '@/components/scripture/scripture-entity-region';
import { ScriptureIntroDropdown } from '@/components/scripture/scripture-intro-dropdown';
import { chapterLabel } from '@/lib/scripture';
import { resolveScriptureNavigationAction } from '@/lib/scripture-navigation-actions';
import type { ScriptureChapter } from '@/types';

type Props = {
    chapter: ScriptureChapter;
    showAdminControls: boolean;
    returnToHref: string;
    panelClassName: string;
};

export function ScriptureBookChapterListRow({
    chapter,
    showAdminControls,
    returnToHref,
    panelClassName,
}: Props) {
    const chapterAction = resolveScriptureNavigationAction({
        actionKey: 'open_chapter',
        href: chapter.href,
    });

    if (chapterAction === null) {
        return null;
    }

    return (
        <ScriptureEntityRegion
            meta={{
                entityType: 'chapter',
                entityId: chapter.id,
                entityLabel: chapterLabel(chapter.number, chapter.title),
                region: 'chapter_list_row',
                capabilityHint: 'navigation',
            }}
        >
            <div className="space-y-3 rounded-lg border p-4 transition-colors hover:border-primary">
                <Link href={chapterAction.href} className="group block">
                    <div className="flex items-start gap-3">
                        <div className="rounded-md bg-primary/10 p-2 text-primary">
                            <BookOpenText className="size-4" />
                        </div>
                        <div className="space-y-1">
                            <p className="font-medium group-hover:text-primary">
                                {chapterLabel(chapter.number, chapter.title)}
                            </p>
                            <p className="text-sm text-muted-foreground">
                                {chapterAction.label}
                            </p>
                        </div>
                    </div>
                </Link>

                <ScriptureBookChapterRowAdmin
                    chapter={chapter}
                    showAdminControls={showAdminControls}
                    returnToHref={returnToHref}
                    panelClassName={panelClassName}
                />

                <ScriptureIntroDropdown block={chapter.intro_block ?? null} />
            </div>
        </ScriptureEntityRegion>
    );
}
