import { Link } from '@inertiajs/react';
import { BookOpenText, ChevronRight } from 'lucide-react';
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
            <article className="chronicle-panel group flex h-full flex-col justify-between gap-3 rounded-sm p-4 transition-colors hover:border-[color:var(--chronicle-gold)] hover:bg-[rgba(173,122,44,0.08)]">
                <Link href={chapterAction.href} className="block">
                    <div className="flex items-start gap-3">
                        <div className="mt-0.5 rounded-full border border-[color:var(--chronicle-rule)] bg-[color:var(--chronicle-paper-soft)] p-2 text-[color:var(--chronicle-gold)]">
                            <BookOpenText className="size-4" />
                        </div>
                        <div className="min-w-0 flex-1 space-y-2">
                            <p className="chronicle-title text-2xl leading-tight text-[color:var(--chronicle-ink)] group-hover:text-[color:var(--chronicle-brown)]">
                                {chapterLabel(chapter.number, chapter.title)}
                            </p>
                            <p className="inline-flex items-center gap-1 text-xs font-semibold tracking-[0.16em] text-[color:var(--chronicle-brown)] uppercase">
                                {chapterAction.label}
                                <ChevronRight className="size-3.5" />
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
            </article>
        </ScriptureEntityRegion>
    );
}
