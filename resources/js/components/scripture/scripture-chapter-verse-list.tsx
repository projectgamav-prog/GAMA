import { Link } from '@inertiajs/react';
import { Languages } from 'lucide-react';
import { useState } from 'react';
import { AdminModuleHost } from '@/admin/core/AdminModuleHost';
import {
    resolveChapterSectionActionsSurface,
    resolveChapterSectionVerseGroupSurface,
    resolveChapterVerseGroupsSurface,
} from '@/admin/integrations/sections';
import {
    SCRIPTURE_INLINE_ADMIN_PANEL_CLASS_NAME,
    ScriptureSectionGroupWrapper,
} from '@/components/scripture/scripture-section-group-wrapper';
import { ScriptureSection } from '@/components/scripture/scripture-section';
import { ScriptureVerseReaderRow } from '@/components/scripture/verse/ScriptureVerseReaderRow';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import {
    hidesSingleGenericSection,
    languageLabel,
    sectionLabel,
} from '@/lib/scripture';
import type {
    ScriptureChapter,
    ScriptureChapterAdmin,
    ScriptureChapterVerseSharedAdmin,
    ScriptureChapterSection,
    ScriptureReaderCard,
    ScriptureReaderLanguage,
} from '@/types';

const DEFAULT_PANEL_CLASS_NAME = SCRIPTURE_INLINE_ADMIN_PANEL_CLASS_NAME;

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
    verseAdminShared?: ScriptureChapterVerseSharedAdmin | null;
    panelClassName?: string;
};

type VerseReaderCardPanelProps = {
    card: ScriptureReaderCard;
    language: ScriptureReaderLanguage;
    hasReaderLanguages: boolean;
    sectionTitle: string;
    returnToHref: string;
    showAdminControls: boolean;
    verseAdminShared?: ScriptureChapterVerseSharedAdmin | null;
};

function ScriptureVerseReaderCardPanel({
    card,
    language,
    hasReaderLanguages,
    sectionTitle,
    returnToHref,
    showAdminControls,
    verseAdminShared = null,
}: VerseReaderCardPanelProps) {
    const showsHeader = card.type === 'group' || card.verses.length > 1;

    return (
        <Card className="border-border/70">
            {showsHeader && (
                <CardHeader className="gap-2 px-5 py-4">
                    <div className="flex flex-wrap items-center gap-2">
                        <Badge variant="outline">
                            {card.type === 'group'
                                ? 'Grouped Card'
                                : 'Verse Card'}
                        </Badge>
                        <Badge variant="secondary">{card.label}</Badge>
                    </div>
                    <CardTitle className="text-lg">{card.label}</CardTitle>
                </CardHeader>
            )}

            <CardContent
                className={cn(
                    'space-y-4 px-5',
                    showsHeader ? 'pb-5 pt-0' : 'py-5',
                )}
            >
                {card.verses.map((verse, index) => (
                    <ScriptureVerseReaderRow
                        key={verse.id}
                        verse={verse}
                        index={index}
                        language={language}
                        hasReaderLanguages={hasReaderLanguages}
                        sectionTitle={sectionTitle}
                        returnToHref={returnToHref}
                        showAdminControls={showAdminControls}
                        verseAdminShared={verseAdminShared}
                    />
                ))}
            </CardContent>
        </Card>
    );
}

export function ScriptureChapterVerseList({
    chapter,
    chapterSections,
    readerLanguages,
    defaultLanguage,
    showAdminControls,
    admin,
    verseAdminShared = null,
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
            <div className="space-y-5">
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
                    const sectionActionsSurface =
                        resolveChapterSectionActionsSurface({
                            chapterSection: section,
                            title: sectionTitle,
                            enabled: showAdminControls,
                        });

                    return (
                        <ScriptureSectionGroupWrapper
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
                            meta={
                                <span>
                                    {section.cards.length} card
                                    {section.cards.length === 1 ? '' : 's'}
                                    {' | '}
                                    {verseCount} verse
                                    {verseCount === 1 ? '' : 's'}
                                </span>
                            }
                            introBlock={section.intro_block}
                            adminSurfaces={[
                                sectionGroupSurface,
                                sectionActionsSurface,
                            ]}
                            panelClassName={panelClassName}
                        >
                            <div className="space-y-3">
                                {section.cards.map((card) => (
                                    <ScriptureVerseReaderCardPanel
                                        key={card.id}
                                        card={card}
                                        language={language}
                                        hasReaderLanguages={hasReaderLanguages}
                                        sectionTitle={sectionTitle}
                                        returnToHref={chapter.href}
                                        showAdminControls={showAdminControls}
                                        verseAdminShared={verseAdminShared}
                                    />
                                ))}
                            </div>
                        </ScriptureSectionGroupWrapper>
                    );
                })}
            </div>
        </ScriptureSection>
    );
}
