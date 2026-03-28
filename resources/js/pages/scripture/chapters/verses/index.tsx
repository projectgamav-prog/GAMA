import { Link } from '@inertiajs/react';
import {
    ArrowLeft,
    BookOpenText,
    Languages,
    MessageSquareQuote,
    PlayCircle,
} from 'lucide-react';
import { useState } from 'react';
import { AdminModuleHost } from '@/admin/core/AdminModuleHost';
import {
    createChapterSectionVerseGroupSurface,
    createChapterVerseGroupsSurface,
} from '@/admin/surfaces/sections/surface-builders';
import { ScriptureActionRow } from '@/components/scripture/scripture-action-row';
import { ScriptureAdminModeBar } from '@/components/scripture/scripture-admin-mode-bar';
import { ScriptureEntityRegion } from '@/components/scripture/scripture-entity-region';
import { ScripturePageIntroCard } from '@/components/scripture/scripture-page-intro-card';
import { ScriptureSection } from '@/components/scripture/scripture-section';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { useVisibleAdminControls } from '@/hooks/use-admin-context';
import ScriptureLayout from '@/layouts/scripture-layout';
import {
    chapterLabel,
    hidesSingleGenericSection,
    isGenericSectionLabel,
    languageLabel,
    sectionLabel,
    verseLabel,
} from '@/lib/scripture';
import type { BreadcrumbItem, ChapterVersesIndexProps } from '@/types';

export default function ChapterVersesIndex({
    book,
    book_section,
    chapter,
    reader_languages,
    default_language,
    admin,
    chapter_sections,
}: ChapterVersesIndexProps) {
    const adminPanelClassName =
        'flex flex-wrap items-center gap-2 rounded-2xl border border-border/70 bg-muted/20 p-3';
    const [language, setLanguage] = useState<'en' | 'hi'>(
        default_language ?? reader_languages[0] ?? 'en',
    );
    const showAdminControls = useVisibleAdminControls();
    const hasReaderLanguages = reader_languages.length > 0;
    const showsLanguageToggle = reader_languages.length > 1;

    const totalCards = chapter_sections.reduce(
        (sum, section) => sum + section.cards.length,
        0,
    );
    const totalVerses = chapter_sections.reduce(
        (sum, section) =>
            sum +
            section.cards.reduce((cardSum, card) => cardSum + card.verses.length, 0),
        0,
    );
    const hidesGenericBookSection = isGenericSectionLabel(
        book_section.slug,
        book_section.title,
    );
    const hidesGenericChapterSection =
        hidesSingleGenericSection(chapter_sections);
    const chapterTitle = chapterLabel(chapter.number, chapter.title);
    const bookSectionTitle = sectionLabel(
        book_section.number,
        book_section.title,
    );
    const chapterEntity = {
        entityType: 'chapter' as const,
        entityId: chapter.id,
        entityLabel: chapterTitle,
        parentEntityType: 'book_section' as const,
        parentEntityId: book_section.id,
    };
    const verseGroupsSurface = showAdminControls && admin
        ? createChapterVerseGroupsSurface({
              chapter,
              groupCount: chapter_sections.length,
              verseCount: totalVerses,
              readerHref: chapter.verses_href ?? chapter.href,
              chapterSectionStoreHref: admin.chapter_section_store_href,
          })
        : null;

    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: book.title,
            href: book.href,
        },
        {
            title: bookSectionTitle,
            href: book_section.href,
        },
        {
            title: chapterTitle,
            href: chapter.href,
        },
        {
            title: 'Reader',
            href: chapter.verses_href ?? chapter.href,
        },
    ];

    return (
        <ScriptureLayout
            title={`${chapterTitle} Reader`}
            breadcrumbs={breadcrumbs}
        >
            <ScriptureAdminModeBar />

            <ScripturePageIntroCard
                entityMeta={{
                    ...chapterEntity,
                    region: 'page_intro',
                    capabilityHint: 'reader',
                }}
                badges={
                    <>
                        <Badge variant="outline">Reader</Badge>
                        <Badge variant="secondary">{book.title}</Badge>
                        {!hidesGenericBookSection && (
                            <Badge variant="secondary">
                                {bookSectionTitle}
                            </Badge>
                        )}
                        <Badge variant="secondary">
                            {totalCards} card{totalCards === 1 ? '' : 's'}
                        </Badge>
                    </>
                }
                title={chapterTitle}
                description="Canonical verses are rendered in reading order, while valid helper-layer groupings stay inside their own chapter section."
                contentClassName="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between"
            >
                <div className="space-y-2">
                    {verseGroupsSurface && (
                        <AdminModuleHost
                            surface={verseGroupsSurface}
                            className={adminPanelClassName}
                        />
                    )}
                    <p className="text-sm font-medium">Reader Controls</p>
                    <div className="flex flex-wrap items-center gap-3">
                        {hasReaderLanguages ? (
                            <>
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <Languages className="size-4" />
                                    <span>Translation</span>
                                </div>
                                {showsLanguageToggle ? (
                                    <ToggleGroup
                                        type="single"
                                        value={language}
                                        variant="outline"
                                        onValueChange={(value) => {
                                            if (
                                                value === 'en' ||
                                                value === 'hi'
                                            ) {
                                                setLanguage(value);
                                            }
                                        }}
                                    >
                                        {reader_languages.map(
                                            (readerLanguage) => (
                                                <ToggleGroupItem
                                                    key={readerLanguage}
                                                    value={readerLanguage}
                                                >
                                                    {languageLabel(
                                                        readerLanguage,
                                                    )}
                                                </ToggleGroupItem>
                                            ),
                                        )}
                                    </ToggleGroup>
                                ) : (
                                    <Badge variant="outline">
                                        {languageLabel(reader_languages[0])}{' '}
                                        Translation
                                    </Badge>
                                )}
                            </>
                        ) : (
                            <p className="text-sm text-muted-foreground">
                                No supporting translations are available for
                                this chapter yet.
                            </p>
                        )}
                    </div>
                    {showsLanguageToggle && (
                        <p className="text-sm text-muted-foreground">
                            Sanskrit remains visible. The control only switches
                            the supporting translation line below each verse.
                        </p>
                    )}
                </div>
                <ScriptureActionRow className="shrink-0">
                    <Button asChild variant="outline">
                        <Link href={chapter.href}>
                            <ArrowLeft className="size-4" />
                            Back to Chapter
                        </Link>
                    </Button>
                </ScriptureActionRow>
            </ScripturePageIntroCard>

            <div className="space-y-6">
                {chapter_sections.map((section) => {
                    const verseCount = section.cards.reduce(
                        (sum, card) => sum + card.verses.length,
                        0,
                    );
                    const sectionTitle = hidesGenericChapterSection
                        ? 'All Verses'
                        : sectionLabel(section.number, section.title);
                    const sectionGroupSurface = showAdminControls
                        ? createChapterSectionVerseGroupSurface({
                              chapterSection: section,
                              title: sectionTitle,
                              primaryCount: section.cards.length,
                              primaryLabel: 'cards',
                              secondaryCount: verseCount,
                              secondaryLabel: 'verses',
                              openHref: section.href ?? null,
                              openLabel: 'Jump to Group',
                          })
                        : null;

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
                                region: 'reader_section',
                                capabilityHint: 'reader',
                            }}
                            title={sectionTitle}
                            description={
                                <div className="flex flex-wrap items-center gap-2">
                                    <Badge variant="outline">
                                        {section.cards.length} card
                                        {section.cards.length === 1 ? '' : 's'}
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
                                        className={adminPanelClassName}
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
                                                        region: 'reader_verse',
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
                                                                    chapter yet.
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

            <Card>
                <CardContent className="py-6">
                    <ScriptureActionRow>
                        <Button asChild variant="outline">
                            <Link href={chapter.href}>
                                <ArrowLeft className="size-4" />
                                Back to Chapter
                            </Link>
                        </Button>
                        <Button asChild variant="outline">
                            <Link href={book.href}>
                                <BookOpenText className="size-4" />
                                Back to Book
                            </Link>
                        </Button>
                    </ScriptureActionRow>
                </CardContent>
            </Card>
        </ScriptureLayout>
    );
}

