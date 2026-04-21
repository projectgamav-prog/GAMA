import { Link } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { ScriptureChapterVerseRowAdmin } from '@/components/scripture/scripture-chapter-verse-row-admin';
import { ScriptureIntroDropdown } from '@/components/scripture/scripture-intro-dropdown';
import { languageLabel, verseLabel } from '@/lib/scripture';
import type {
    ScriptureChapterVerseSharedAdmin,
    ScriptureReaderLanguage,
    ScriptureReaderVerse,
} from '@/types';

const LOCAL_ACTION_BUTTON_CLASS_NAME =
    'h-7 rounded-md px-2.5 text-xs font-medium shadow-none';

type Props = {
    verse: ScriptureReaderVerse;
    index: number;
    language: ScriptureReaderLanguage;
    hasReaderLanguages: boolean;
    sectionTitle: string;
    returnToHref: string;
    showAdminControls: boolean;
    verseAdminShared?: ScriptureChapterVerseSharedAdmin | null;
};

export function ScriptureVerseReaderRow({
    verse,
    language,
    hasReaderLanguages,
    sectionTitle,
    returnToHref,
    showAdminControls,
    verseAdminShared = null,
}: Props) {
    const translationText = verse.translations[language];

    return (
        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,360px)]">
            <div className="space-y-3">
                <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="space-y-1">
                        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground">
                            {verseLabel(verse.number)}
                        </p>
                        <p className="text-base leading-relaxed text-foreground">
                            {verse.text}
                        </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                        <ScriptureChapterVerseRowAdmin
                            verse={verse}
                            sectionTitle={sectionTitle}
                            showAdminControls={showAdminControls}
                            returnToHref={returnToHref}
                            sharedAdmin={verseAdminShared}
                        />

                        <ScriptureIntroDropdown
                            block={verse.intro_block ?? null}
                            buttonLabel="Verse intro"
                            contentLabel="Verse intro"
                        />

                        {verse.explanation_href ? (
                            <Button
                                asChild
                                size="sm"
                                variant="outline"
                                className={LOCAL_ACTION_BUTTON_CLASS_NAME}
                            >
                                <Link href={verse.explanation_href}>Open verse</Link>
                            </Button>
                        ) : null}

                        {verse.video_href ? (
                            <Button
                                asChild
                                size="sm"
                                variant="outline"
                                className={LOCAL_ACTION_BUTTON_CLASS_NAME}
                            >
                                <Link href={verse.video_href}>Media</Link>
                            </Button>
                        ) : null}
                    </div>
                </div>
            </div>

            <div className="rounded-xl border border-border/70 bg-muted/10 p-3">
                <div className="mb-2 flex items-center justify-between gap-2">
                    <p className="text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground">
                        {languageLabel(language)} translation
                    </p>
                </div>

                {translationText ? (
                    <div className="rounded-lg border border-border/60 bg-background/90 px-3 py-2 text-sm leading-relaxed text-foreground shadow-sm">
                        <p>{translationText}</p>
                    </div>
                ) : (
                    <p className="text-sm text-muted-foreground">
                        {hasReaderLanguages
                            ? `No ${languageLabel(language).toLowerCase()} translation available for this verse yet.`
                            : 'No supporting translations are available for this verse yet.'}
                    </p>
                )}
            </div>
        </div>
    );
}
