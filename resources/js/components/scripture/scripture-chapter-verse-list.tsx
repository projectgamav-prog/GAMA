import { Link } from '@inertiajs/react';
import {
    Languages,
    MessageSquareQuote,
    PlayCircle,
} from 'lucide-react';
import { useState } from 'react';
import { AdminModuleHost } from '@/admin/core/AdminModuleHost';
import {
    resolveChapterSectionVerseGroupSurface,
    resolveChapterVerseGroupsSurface,
} from '@/admin/integrations/sections';
import { ScriptureEntityRegion } from '@/components/scripture/scripture-entity-region';
import { ScriptureSection } from '@/components/scripture/scripture-section';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import {
    hidesSingleGenericSection,
    languageLabel,
    sectionLabel,
    verseLabel,
} from '@/lib/scripture';
import type {
    ScriptureChapter,
    ScriptureChapterAdmin,
    ScriptureChapterSection,
    ScriptureReaderCard,
    ScriptureReaderLanguage,
} from '@/types';

const DEFAULT_PANEL_CLASS_NAME =
    'flex flex-wrap items-center gap-2 rounded-2xl border border-border/70 bg-muted/20 p-3';

type Props = {
    chapter: ScriptureChapter;
    chapterSections: Array<
        ScriptureChapterSection & {
            cards: ScriptureReaderCard[];
        }
    >;
    readerLanguages: ScriptureReaderLanguage[];
    defaultLanguage: ScriptureReaderLanguage | null;
    showAdminControls: boolean;
    admin?: Pick<ScriptureChapterAdmin, 'chapter_section_store_href'> | null;
    panelClassName?: string;
};

export function ScriptureChapterVerseList({
    chapter,
    chapterSections,
    readerLanguages,
    defaultLanguage,
    showAdminControls,
    admin,
    panelClassName = DEFAULT_PANEL_CLASS_NAME,
}: Props) {
    const [language, setLanguage] = useState<ScriptureReaderLanguage>(
        defaultLanguage ?? readerLanguages[0] ?? 'en',
    );
    const hasReaderLanguages = readerLanguages.length > 0;
    const showsLanguageToggle = readerLanguages.length > 1;
    const hidesGenericChapterSection =
        hidesSingleGenericSection(chapterSections);
    const chapterVerseGroupsSurface = resolveChapterVerseGroupsSurface({
        chapter,
        chapterSections: chapterSections.map((section) => ({
            ...section,
            verses_count: section.cards.reduce(
                (sum, card) => sum + card.verses.length,
                0,
            ),
        })),
        admin,
        enabled: showAdminControls,
    });
    const totalCardCount = chapterSections.reduce(
        (sum, section) => sum + section.cards.length,
        0,
    );
    const totalVerseCount = chapterSections.reduce(
        (sum, section) =>
            sum +
            section.cards.reduce(
                (cardSum, card) => cardSum + card.verses.length,
                0,
            ),
        0,
    );

    return (
        <ScriptureSection
            entityMeta={{
                entityType: 'chapter',
                entityId: chapter.id,
                entityLabel: chapter.title ?? chapter.number ?? 'Chapter',
                region: 'verse_list',
                capabilityHint: 'reader',
            }}
            title="Verse List"
            description={
                hidesGenericChapterSection
                    ? 'Read this chapter as one continuous verse list.'
                    : 'Verses grouped by their canonical chapter section.'
            }
            action={
                <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="outline">
                        {totalCardCount} card
                        {totalCardCount === 1 ? '' : 's'}
                    </Badge>
                    <Badge variant="secondary">
                        {totalVerseCount} verse
                        {totalVerseCount === 1 ? '' : 's'}
                    </Badge>
                </div>
            }
        >
            <div className="space-y-6">
                {chapterVerseGroupsSurface && (
                    <AdminModuleHost
                        surface={chapterVerseGroupsSurface}
                        className={panelClassName}
                    />
                )}

                <div className="rounded-2xl border border-border/70 bg-muted/20 px-5 py-4 sm:px-6">
                    <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                        <div className="space-y-1">
                            <div className="flex items-center gap-2 text-sm font-medium">
                                <Languages className="size-4 text-muted-foreground" />
                                <span>Reader Translation</span>
                            </div>
                            {showsLanguageToggle && (
                                <p className="text-sm text-muted-foreground">
                                    Sanskrit stays fixed. This only switches the
                                    supporting translation line below each verse.
                                </p>
                            )}
                        </div>
                        {hasReaderLanguages ? (
                            showsLanguageToggle ? (
                                <ToggleGroup
                                    type="single"
                                    value={language}
                                    variant="outline"
                                    onValueChange={(value) => {
                                        if (value === 'en' || value === 'hi') {
                                            setLanguage(value);
                                        }
                                    }}
                                >
                                    {readerLanguages.map((readerLanguage) => (
                                        <ToggleGroupItem
                                            key={readerLanguage}
                                            value={readerLanguage}
                                        >
                                            {languageLabel(readerLanguage)}
                                        </ToggleGroupItem>
                                    ))}
                                </ToggleGroup>
                            ) : (
                                <Badge variant="outline">
                                    {languageLabel(readerLanguages[0])}{' '}
                                    Translation
                                </Badge>
                            )
                        ) : (
                            <p className="text-sm text-muted-foreground">
                                No supporting translations are available for
                                this chapter yet.
                            </p>
                        )}
                    </div>
                </div>

                {chapterSections.map((section) => {
                    const verseCount = section.cards.reduce(
                        (sum, card) => sum + card.verses.length,
                        0,
                    );
                    const sectionTitle = hidesGenericChapterSection
                        ? 'All Verses'
                        : sectionLabel(section.number, section.title);
                    const sectionGroupSurface =
                        resolveChapterSectionVerseGroupSurface({
                            chapterSection: section,
                            title: sectionTitle,
                            primaryCount: section.cards.length,
                            primaryLabel: 'cards',
                            secondaryCount: verseCount,
                            secondaryLabel: 'verses',
                            openHref: null,
                            enabled: showAdminControls,
                        });

                    return (
                        <ScriptureSection
                            key={section.id}
                            id={section.slug}
                            entityMeta={{
                                entityType: 'chapter_section',
                                entityId: section.id,
                                entityLabel: sectionTitle,
                                parentEntityType: 'chapter',
                                parentEntityId: chapter.id,
                                region: 'verse_list_section',
                                capabilityHint: 'reader',
                            }}
                            title={sectionTitle}
                            description={
                                <div className="flex flex-wrap items-center gap-2">
                                    <Badge variant="outline">
                                        {section.cards.length} card
                                        {section.cards.length === 1
                                            ? ''
                                            : 's'}
                                    </Badge>
                                    <Badge variant="secondary">
                                        {verseCount} verse
                                        {verseCount === 1 ? '' : 's'}
                                    </Badge>
                                </div>
                            }
                        >
                            <div className="space-y-4">
                                {sectionGroupSurface && (
                                    <AdminModuleHost
                                        surface={sectionGroupSurface}
                                        className={panelClassName}
                                    />
                                )}

                                {section.cards.map((card) => (
                                    <Card key={card.id}>
                                        <CardHeader className="gap-3">
                                            <div className="flex flex-wrap items-center gap-2">
                                                <Badge variant="outline">
                                                    {card.type === 'group'
                                                        ? 'Grouped Card'
                                                        : 'Single Verse'}
                                                </Badge>
                                                <Badge variant="secondary">
                                                    {card.label}
                                                </Badge>
                                            </div>
                                            <CardTitle className="text-xl">
                                                {card.label}
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent className="space-y-6">
                                            {card.verses.map((verse, index) => (
                                                <ScriptureEntityRegion
                                                    key={verse.id}
                                                    meta={{
                                                        entityType: 'verse',
                                                        entityId: verse.id,
                                                        entityLabel: verseLabel(
                                                            verse.number,
                                                        ),
                                                        region: 'verse_list_verse',
                                                        capabilityHint:
                                                            'reader',
                                                    }}
                                                    asChild
                                                >
                                                    <div
                                                        className={
                                                            index === 0
                                                                ? 'space-y-4'
                                                                : 'space-y-4 border-t pt-6'
                                                        }
                                                    >
                                                        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                                                            <div className="space-y-1">
                                                                <p className="text-sm font-medium text-muted-foreground">
                                                                    {verseLabel(
                                                                        verse.number,
                                                                    )}
                                                                </p>
                                                                <p className="text-xs tracking-[0.18em] text-muted-foreground uppercase">
                                                                    Sanskrit
                                                                </p>
                                                            </div>
                                                            <div className="flex flex-wrap gap-2">
                                                                <Button
                                                                    asChild
                                                                    size="sm"
                                                                    variant="outline"
                                                                >
                                                                    <Link
                                                                        href={
                                                                            verse.explanation_href
                                                                        }
                                                                    >
                                                                        <MessageSquareQuote className="size-4" />
                                                                        Verse
                                                                        Details
                                                                    </Link>
                                                                </Button>
                                                                {verse.video_href && (
                                                                    <Button
                                                                        asChild
                                                                        size="sm"
                                                                        variant="outline"
                                                                    >
                                                                        <Link
                                                                            href={
                                                                                verse.video_href
                                                                            }
                                                                        >
                                                                            <PlayCircle className="size-4" />
                                                                            Notes
                                                                            &
                                                                            Video
                                                                        </Link>
                                                                    </Button>
                                                                )}
                                                            </div>
                                                        </div>

                                                        <p className="text-lg leading-9">
                                                            {verse.text}
                                                        </p>

                                                        <div className="rounded-lg bg-muted/40 px-4 py-4">
                                                            <p className="mb-2 text-xs tracking-[0.18em] text-muted-foreground uppercase">
                                                                {hasReaderLanguages
                                                                    ? `${languageLabel(language)} Translation`
                                                                    : 'Translation'}
                                                            </p>
                                                            {hasReaderLanguages &&
                                                            verse.translations[
                                                                language
                                                            ] ? (
                                                                <p className="leading-8 text-muted-foreground">
                                                                    {
                                                                        verse
                                                                            .translations[
                                                                            language
                                                                        ]
                                                                    }
                                                                </p>
                                                            ) : !hasReaderLanguages ? (
                                                                <p className="text-sm text-muted-foreground">
                                                                    No
                                                                    supporting
                                                                    translations
                                                                    are
                                                                    available
                                                                    for this
                                                                    chapter
                                                                    yet.
                                                                </p>
                                                            ) : (
                                                                <p className="text-sm text-muted-foreground">
                                                                    No{' '}
                                                                    {languageLabel(
                                                                        language,
                                                                    ).toLowerCase()}{' '}
                                                                    translation
                                                                    is
                                                                    available
                                                                    for this
                                                                    verse yet.
                                                                </p>
                                                            )}
                                                        </div>
                                                    </div>
                                                </ScriptureEntityRegion>
                                            ))}
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        </ScriptureSection>
                    );
                })}
            </div>
        </ScriptureSection>
    );
}
