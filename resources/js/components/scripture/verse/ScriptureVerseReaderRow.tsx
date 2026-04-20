import { Link } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { ScriptureChapterVerseRowAdmin } from '@/components/scripture/scripture-chapter-verse-row-admin';
import { ScriptureEntityRegion } from '@/components/scripture/scripture-entity-region';
import { ScriptureIntroDropdown } from '@/components/scripture/scripture-intro-dropdown';
import { languageLabel, verseLabel } from '@/lib/scripture';
import { resolveScriptureNavigationAction } from '@/lib/scripture-navigation-actions';
import { cn } from '@/lib/utils';
import type {
    ScriptureChapterVerseSharedAdmin,
    ScriptureReaderLanguage,
    ScriptureReaderVerse,
} from '@/types';

const LOCAL_ACTION_BUTTON_CLASS_NAME =
    'h-7 rounded-md px-2.5 text-xs font-medium shadow-none';

type Props = {
    verse: ScriptureReaderVerse;
    readerLanguage: ScriptureReaderLanguage;
    sharedAdmin: ScriptureChapterVerseSharedAdmin | null;
};

export function ScriptureVerseReaderRow({
    verse,
    readerLanguage,
    sharedAdmin,
}: Props) {
    const verseDetailAction = resolveScriptureNavigationAction(verse.actions.show);
    const verseMediaAction = verse.actions.media
        ? resolveScriptureNavigationAction(verse.actions.media)
        : null;

    return (
        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,360px)]">
            <div className="space-y-3">
                <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="space-y-1">
                        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground">
                            {verseLabel(verse.verse_number)}
                        </p>
                        <p className="text-base leading-relaxed text-foreground">
                            {verse.sanskrit_text}
                        </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                        <ScriptureChapterVerseRowAdmin
                            verse={verse}
                            sharedAdmin={sharedAdmin}
                        />

                        <ScriptureIntroDropdown
                            introduction={verse.introduction}
                            triggerLabel="Verse intro"
                            align="end"
                        />

                        {verseDetailAction ? (
                            <Button
                                asChild
                                size="sm"
                                variant="outline"
                                className={LOCAL_ACTION_BUTTON_CLASS_NAME}
                            >
                                <Link href={verseDetailAction.href}>Open verse</Link>
                            </Button>
                        ) : null}

                        {verseMediaAction ? (
                            <Button
                                asChild
                                size="sm"
                                variant="outline"
                                className={LOCAL_ACTION_BUTTON_CLASS_NAME}
                            >
                                <Link href={verseMediaAction.href}>Media</Link>
                            </Button>
                        ) : null}
                    </div>
                </div>

                <ScriptureEntityRegion
                    value={verse.admin?.regions?.description ?? null}
                    emptyLabel="No public verse description."
                />
            </div>

            <div className="rounded-xl border border-border/70 bg-muted/10 p-3">
                <div className="mb-2 flex items-center justify-between gap-2">
                    <p className="text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground">
                        {languageLabel(readerLanguage)} translation
                    </p>
                </div>

                {verse.translations.length > 0 ? (
                    <div className="space-y-2">
                        {verse.translations.map((translation) => (
                            <div
                                key={translation.id}
                                className={cn(
                                    'rounded-lg border border-border/60 bg-background/90 px-3 py-2 text-sm leading-relaxed text-foreground shadow-sm',
                                    translation.language === readerLanguage
                                        ? 'border-amber-500/40 bg-amber-50/50'
                                        : null,
                                )}
                            >
                                <div className="mb-1 flex items-center justify-between gap-2">
                                    <span className="text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground">
                                        {translation.label}
                                    </span>

                                    {translation.language === readerLanguage ? (
                                        <span className="rounded-full bg-amber-500/10 px-2 py-0.5 text-[11px] font-medium text-amber-700">
                                            Selected
                                        </span>
                                    ) : null}
                                </div>

                                <p>{translation.text}</p>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-sm text-muted-foreground">
                        No published translations yet.
                    </p>
                )}
            </div>
        </div>
    );
}
