import { Link } from '@inertiajs/react';
import { BookOpenText, Film } from 'lucide-react';
import { AdminFieldQuickEditSurface } from '@/admin/core/AdminFieldQuickEditSurface';
import { resolveVerseTextFieldSurface } from '@/admin/integrations/scripture/verses';
import { ScriptureChapterVerseRowAdmin } from '@/components/scripture/scripture-chapter-verse-row-admin';
import { ScriptureIntroDropdown } from '@/components/scripture/scripture-intro-dropdown';
import { Button } from '@/components/ui/button';
import { languageLabel, verseLabel } from '@/lib/scripture';
import type {
    ScriptureChapterVerseSharedAdmin,
    ScriptureReaderLanguage,
    ScriptureReaderVerse,
} from '@/types';

const LOCAL_ACTION_BUTTON_CLASS_NAME =
    'h-7 rounded-sm border-[color:var(--chronicle-border)] px-2.5 text-xs font-medium text-[color:var(--chronicle-brown)] shadow-none hover:bg-[rgba(173,122,44,0.08)]';

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
    const verseTextSurface = resolveVerseTextFieldSurface({
        verse,
        admin: verse.admin ?? null,
        enabled: showAdminControls,
    });

    return (
        <article className="grid gap-4 px-4 py-4 sm:px-5 lg:grid-cols-[minmax(0,1fr)_minmax(16rem,22rem)]">
            <div className="space-y-3">
                <div className="grid gap-3 sm:grid-cols-[3rem_minmax(0,1fr)]">
                    <p className="chronicle-title text-3xl leading-none text-[color:var(--chronicle-gold)]">
                        {verseLabel(verse.number)}
                    </p>
                    <div className="space-y-3">
                        <AdminFieldQuickEditSurface
                            surface={verseTextSurface}
                            manifestKey={`verse-text:${verse.id}`}
                            block={{
                                blockType: 'text_field',
                                contentKind: 'long_text',
                                fieldKind: 'text',
                            }}
                            layout={{
                                layoutZone: 'inline_prose',
                                visualRole: 'field',
                                preferredPlacement: 'top-right',
                            }}
                            schemaConstraints={{
                                quickEditAllowedFields: ['text'],
                                structuredOnlyFields: ['slug', 'number'],
                            }}
                        >
                            <p className="font-serif text-lg leading-8 text-[color:var(--chronicle-ink)]">
                                {verse.text}
                            </p>
                        </AdminFieldQuickEditSurface>

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
                                    <Link href={verse.explanation_href}>
                                        Read verse
                                        <BookOpenText className="size-3.5" />
                                    </Link>
                                </Button>
                            ) : null}

                            {verse.video_href ? (
                                <Button
                                    asChild
                                    size="sm"
                                    variant="outline"
                                    className={LOCAL_ACTION_BUTTON_CLASS_NAME}
                                >
                                    <Link href={verse.video_href}>
                                        Media
                                        <Film className="size-3.5" />
                                    </Link>
                                </Button>
                            ) : null}
                        </div>
                    </div>
                </div>
            </div>

            <div className="rounded-sm border border-[color:var(--chronicle-border)] bg-[color:var(--chronicle-paper-soft)] p-3">
                <div className="mb-2 flex items-center justify-between gap-2">
                    <p className="chronicle-kicker text-[0.65rem]">
                        {languageLabel(language)} translation
                    </p>
                </div>

                {translationText ? (
                    <div className="rounded-sm border border-[color:var(--chronicle-border)] bg-[rgba(255,248,235,0.72)] px-3 py-2 text-sm leading-relaxed text-[color:var(--chronicle-ink)]">
                        <p>{translationText}</p>
                    </div>
                ) : (
                    <p className="text-sm text-[color:var(--chronicle-brown)]">
                        {hasReaderLanguages
                            ? `No ${languageLabel(language).toLowerCase()} translation available for this verse yet.`
                            : 'No supporting translations are available for this verse yet.'}
                    </p>
                )}
            </div>
        </article>
    );
}
