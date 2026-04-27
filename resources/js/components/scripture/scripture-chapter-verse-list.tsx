import { Languages } from 'lucide-react';
import { useState } from 'react';
import { AdminModuleHost } from '@/admin/core/AdminModuleHost';
import { AdminModuleHostGroup } from '@/admin/core/AdminModuleHostGroup';
import {
    resolveChapterSectionActionsSurface,
    resolveChapterSectionVerseGroupSurface,
    resolveChapterVerseGroupsSurface,
} from '@/admin/integrations/sections';
import { ScriptureEntityRegion } from '@/components/scripture/scripture-entity-region';
import { ScriptureIntroDropdown } from '@/components/scripture/scripture-intro-dropdown';
import { SCRIPTURE_INLINE_ADMIN_PANEL_CLASS_NAME } from '@/components/scripture/scripture-section-group-wrapper';
import { ScriptureVerseReaderRow } from '@/components/scripture/verse/ScriptureVerseReaderRow';
import {
    ChroniclePaperPanel,
    ChronicleSectionHeading,
} from '@/components/site/chronicle-primitives';
import { Badge } from '@/components/ui/badge';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import {
    hidesSingleGenericSection,
    languageLabel,
    sectionLabel,
} from '@/lib/scripture';
import { cn } from '@/lib/utils';
import type {
    ScriptureChapter,
    ScriptureChapterAdmin,
    ScriptureChapterSection,
    ScriptureChapterVerseSharedAdmin,
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
        <ChroniclePaperPanel variant="panel" className="overflow-hidden">
            {showsHeader && (
                <div className="border-b border-[color:var(--chronicle-border)] bg-[rgba(173,122,44,0.07)] px-4 py-3 sm:px-5">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                        <div>
                            <p className="chronicle-kicker">
                                {card.type === 'group'
                                    ? 'Grouped Passage'
                                    : 'Verse Card'}
                            </p>
                            <h4 className="chronicle-title text-2xl leading-tight">
                                {card.label}
                            </h4>
                        </div>
                        <span className="rounded-full border border-[color:var(--chronicle-rule)] px-2.5 py-1 text-xs text-[color:var(--chronicle-brown)]">
                            {card.verses.length} verse
                            {card.verses.length === 1 ? '' : 's'}
                        </span>
                    </div>
                </div>
            )}

            <div
                className={cn(
                    'divide-y divide-[color:var(--chronicle-border)]',
                    showsHeader ? '' : 'pt-0',
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
            </div>
        </ChroniclePaperPanel>
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
        <ScriptureEntityRegion
            meta={{
                entityType: 'chapter',
                entityId: chapter.id,
                entityLabel: chapter.title ?? chapter.number ?? 'Chapter',
                region: 'verse_list',
                capabilityHint: 'reader',
            }}
            asChild
        >
            <section id="verse-list" className="space-y-4">
                <ChronicleSectionHeading
                    title="Verse List"
                    eyebrow={
                        hidesGenericChapterSection
                            ? 'Continuous chapter reading'
                            : 'Grouped by canonical chapter section'
                    }
                    action={
                        <div className="flex flex-wrap items-center gap-2 text-xs">
                            <span className="chronicle-link">
                                {totalCardCount} card
                                {totalCardCount === 1 ? '' : 's'}
                            </span>
                            <span className="text-[color:var(--chronicle-rule)]">
                                /
                            </span>
                            <span className="chronicle-link">
                                {totalVerseCount} verse
                                {totalVerseCount === 1 ? '' : 's'}
                            </span>
                        </div>
                    }
                />

                {chapterVerseGroupsSurface && (
                    <AdminModuleHost
                        surface={chapterVerseGroupsSurface}
                        className={panelClassName}
                    />
                )}

                <ChroniclePaperPanel
                    variant="panel"
                    className="px-4 py-3 sm:px-5"
                >
                    <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                        <div className="space-y-1">
                            <div className="flex items-center gap-2 text-sm font-medium text-[color:var(--chronicle-ink)]">
                                <Languages className="size-4 text-[color:var(--chronicle-gold)]" />
                                <span>Reader Translation</span>
                            </div>
                            {showsLanguageToggle && (
                                <p className="text-sm text-[color:var(--chronicle-brown)]">
                                    Original text stays fixed. This switches the
                                    supporting translation line below each
                                    verse.
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
                                    className="justify-start"
                                >
                                    {readerLanguages.map((readerLanguage) => (
                                        <ToggleGroupItem
                                            key={readerLanguage}
                                            value={readerLanguage}
                                            className="rounded-sm border-[color:var(--chronicle-border)] data-[state=on]:bg-[color:var(--chronicle-gold)] data-[state=on]:text-white"
                                        >
                                            {languageLabel(readerLanguage)}
                                        </ToggleGroupItem>
                                    ))}
                                </ToggleGroup>
                            ) : (
                                <Badge
                                    variant="outline"
                                    className="border-[color:var(--chronicle-rule)] text-[color:var(--chronicle-brown)]"
                                >
                                    {languageLabel(readerLanguages[0])}{' '}
                                    Translation
                                </Badge>
                            )
                        ) : (
                            <p className="text-sm text-[color:var(--chronicle-brown)]">
                                No supporting translations are available for
                                this chapter yet.
                            </p>
                        )}
                    </div>
                </ChroniclePaperPanel>

                <div className="space-y-4">
                    {chapterSections.map((section, index) => {
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
                            <ScriptureEntityRegion
                                key={section.id}
                                meta={{
                                    entityType: 'chapter_section',
                                    entityId: section.id,
                                    entityLabel: sectionTitle,
                                    parentEntityType: 'chapter',
                                    parentEntityId: chapter.id,
                                    region: 'verse_list_section',
                                    capabilityHint: 'reader',
                                }}
                                asChild
                            >
                                <ChroniclePaperPanel
                                    id={section.slug}
                                    className="space-y-4 p-4 sm:p-5"
                                >
                                    <div className="grid gap-3 sm:grid-cols-[auto_minmax(0,1fr)_auto] sm:items-start">
                                        <div className="chronicle-title text-4xl leading-none text-[color:var(--chronicle-gold)]">
                                            {index + 1}
                                        </div>
                                        <div>
                                            <p className="chronicle-kicker">
                                                Passage Section
                                            </p>
                                            <h3 className="chronicle-title text-3xl leading-tight">
                                                {sectionTitle}
                                            </h3>
                                            <p className="text-sm text-[color:var(--chronicle-brown)]">
                                                {section.cards.length} card
                                                {section.cards.length === 1
                                                    ? ''
                                                    : 's'}
                                                {' / '}
                                                {verseCount} verse
                                                {verseCount === 1 ? '' : 's'}
                                            </p>
                                        </div>
                                        <AdminModuleHostGroup
                                            surfaces={[
                                                sectionGroupSurface,
                                                sectionActionsSurface,
                                            ]}
                                            className={panelClassName}
                                        />
                                    </div>

                                    <ScriptureIntroDropdown
                                        block={section.intro_block}
                                        contentLabel="Section Introduction"
                                    />

                                    <div className="space-y-3">
                                        {section.cards.map((card) => (
                                            <ScriptureVerseReaderCardPanel
                                                key={card.id}
                                                card={card}
                                                language={language}
                                                hasReaderLanguages={
                                                    hasReaderLanguages
                                                }
                                                sectionTitle={sectionTitle}
                                                returnToHref={chapter.href}
                                                showAdminControls={
                                                    showAdminControls
                                                }
                                                verseAdminShared={
                                                    verseAdminShared
                                                }
                                            />
                                        ))}
                                    </div>
                                </ChroniclePaperPanel>
                            </ScriptureEntityRegion>
                        );
                    })}
                </div>
            </section>
        </ScriptureEntityRegion>
    );
}
