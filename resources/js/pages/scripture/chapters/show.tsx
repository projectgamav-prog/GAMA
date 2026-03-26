import { Link } from '@inertiajs/react';
import {
    ArrowRight,
    BookOpenText,
    LayoutGrid,
    ListTree,
    Rows3,
} from 'lucide-react';
import { useState } from 'react';
import { ScriptureActionRow } from '@/components/scripture/scripture-action-row';
import { ScriptureContentBlocksSection } from '@/components/scripture/scripture-content-blocks-section';
import { ScriptureEntityRegion } from '@/components/scripture/scripture-entity-region';
import { ScripturePageIntroCard } from '@/components/scripture/scripture-page-intro-card';
import { ScriptureSection } from '@/components/scripture/scripture-section';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import ScriptureLayout from '@/layouts/scripture-layout';
import {
    chapterLabel,
    hidesSingleGenericSection,
    isGenericSectionLabel,
    sectionLabel,
} from '@/lib/scripture';
import type { BreadcrumbItem, ChapterShowProps } from '@/types';

export default function ChapterShow({
    book,
    book_section,
    chapter,
    content_blocks,
    chapter_sections,
}: ChapterShowProps) {
    const [viewMode, setViewMode] = useState<'cards' | 'list'>('cards');
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
    ];

    return (
        <ScriptureLayout title={chapterTitle} breadcrumbs={breadcrumbs}>
            <ScripturePageIntroCard
                entityMeta={{
                    ...chapterEntity,
                    region: 'page_intro',
                    capabilityHint: 'intro',
                }}
                badges={
                    <>
                        <Badge variant="outline">Chapter</Badge>
                        <Badge variant="secondary">{book.title}</Badge>
                        {!hidesGenericBookSection && (
                            <Badge variant="secondary">
                                {bookSectionTitle}
                            </Badge>
                        )}
                    </>
                }
                title={chapterTitle}
                description="Read the chapter overview first, then open the reader and continue in canonical order."
                contentClassName="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between"
            >
                <ScriptureActionRow>
                    <Button asChild>
                        <Link href={chapter.verses_href ?? chapter.href}>
                            Open Reader
                            <ArrowRight className="size-4" />
                        </Link>
                    </Button>
                    <Button asChild variant="outline">
                        <Link href={book.href}>Back to Book</Link>
                    </Button>
                </ScriptureActionRow>
                <div className="space-y-2">
                    <p className="text-sm font-medium">Presentation</p>
                    <ToggleGroup
                        type="single"
                        value={viewMode}
                        variant="outline"
                        onValueChange={(value) => {
                            if (value === 'cards' || value === 'list') {
                                setViewMode(value);
                            }
                        }}
                    >
                        <ToggleGroupItem value="cards" aria-label="Card view">
                            <LayoutGrid className="size-4" />
                            Card View
                        </ToggleGroupItem>
                        <ToggleGroupItem value="list" aria-label="List view">
                            <Rows3 className="size-4" />
                            List View
                        </ToggleGroupItem>
                    </ToggleGroup>
                </div>
            </ScripturePageIntroCard>

            <ScriptureContentBlocksSection
                title="Published Notes"
                description="Study content attached to this chapter."
                blocks={content_blocks}
                entityMeta={{
                    ...chapterEntity,
                    region: 'content_blocks',
                    capabilityHint: 'content_blocks',
                }}
            />

            <ScriptureSection
                entityMeta={{
                    ...chapterEntity,
                    region: 'chapter_sections',
                    capabilityHint: 'navigation',
                }}
                title={
                    hidesGenericChapterSection
                        ? 'Reader Entry'
                        : 'Chapter Sections'
                }
                description={
                    hidesGenericChapterSection
                        ? 'This chapter flows through one continuous reader entry point.'
                        : 'Canonical sections inside this chapter, with verse counts for quick entry into the reader.'
                }
            >
                {viewMode === 'cards' ? (
                    <div className="grid gap-4 md:grid-cols-2">
                        {chapter_sections.map((section) => {
                            const sectionTitle = hidesGenericChapterSection
                                ? 'All Verses'
                                : sectionLabel(section.number, section.title);

                            return (
                                <ScriptureEntityRegion
                                    key={section.id}
                                    meta={{
                                        entityType: 'chapter_section',
                                        entityId: section.id,
                                        entityLabel: sectionTitle,
                                        region: 'chapter_section_entry',
                                        capabilityHint: 'navigation',
                                    }}
                                    asChild
                                >
                                    <Card>
                                        <CardHeader className="gap-3">
                                            <div className="flex items-center gap-2">
                                                <Badge variant="outline">
                                                    {section.verses_count ?? 0}{' '}
                                                    verses
                                                </Badge>
                                            </div>
                                            <CardTitle>{sectionTitle}</CardTitle>
                                        </CardHeader>
                                        <CardContent className="flex items-center justify-between gap-3">
                                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                <ListTree className="size-4" />
                                                <span>
                                                    Open this section in the
                                                    reader
                                                </span>
                                            </div>
                                            <Button
                                                asChild
                                                variant="outline"
                                                size="sm"
                                            >
                                                <Link
                                                    href={
                                                        section.href ??
                                                        chapter.verses_href ??
                                                        chapter.href
                                                    }
                                                >
                                                    <BookOpenText className="size-4" />
                                                    Open Reader
                                                </Link>
                                            </Button>
                                        </CardContent>
                                    </Card>
                                </ScriptureEntityRegion>
                            );
                        })}
                    </div>
                ) : (
                    <div className="overflow-hidden rounded-xl border bg-card">
                        {chapter_sections.map((section, index) => {
                            const sectionTitle = hidesGenericChapterSection
                                ? 'All Verses'
                                : sectionLabel(section.number, section.title);

                            return (
                                <ScriptureEntityRegion
                                    key={section.id}
                                    meta={{
                                        entityType: 'chapter_section',
                                        entityId: section.id,
                                        entityLabel: sectionTitle,
                                        region: 'chapter_section_entry',
                                        capabilityHint: 'navigation',
                                    }}
                                    asChild
                                >
                                    <div
                                        className={
                                            index === 0
                                                ? 'flex flex-col gap-4 px-4 py-4 sm:flex-row sm:items-center sm:justify-between'
                                                : 'flex flex-col gap-4 border-t px-4 py-4 sm:flex-row sm:items-center sm:justify-between'
                                        }
                                    >
                                        <div className="min-w-0 space-y-2">
                                            <div className="flex flex-wrap items-center gap-2">
                                                <Badge variant="outline">
                                                    {section.verses_count ?? 0}{' '}
                                                    verses
                                                </Badge>
                                                <Badge variant="secondary">
                                                    Reader Entry
                                                </Badge>
                                            </div>
                                            <div className="space-y-1">
                                                <p className="leading-none font-medium">
                                                    {sectionTitle}
                                                </p>
                                                <p className="text-sm text-muted-foreground">
                                                    Open this section in the
                                                    reader.
                                                </p>
                                            </div>
                                        </div>
                                        <Button
                                            asChild
                                            variant="outline"
                                            size="sm"
                                        >
                                            <Link
                                                href={
                                                    section.href ??
                                                    chapter.verses_href ??
                                                    chapter.href
                                                }
                                            >
                                                <BookOpenText className="size-4" />
                                                Open Reader
                                            </Link>
                                        </Button>
                                    </div>
                                </ScriptureEntityRegion>
                            );
                        })}
                    </div>
                )}
            </ScriptureSection>
        </ScriptureLayout>
    );
}
