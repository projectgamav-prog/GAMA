import { Link } from '@inertiajs/react';
import {
    ArrowRight,
    BookOpenText,
    LayoutGrid,
    ListTree,
    Rows3,
} from 'lucide-react';
import { useState } from 'react';
import { AdminModuleHost } from '@/admin/core/AdminModuleHost';
import {
    resolveChapterHeaderSurfaces,
} from '@/admin/integrations/scripture/chapters';
import {
    resolveChapterSectionVerseGroupSurface,
    resolveChapterVerseGroupsSurface,
} from '@/admin/integrations/sections';
import { ScriptureActionRow } from '@/components/scripture/scripture-action-row';
import { ScriptureAdminModeBar } from '@/components/scripture/scripture-admin-mode-bar';
import { ScriptureChapterContentBlockRegion } from '@/components/scripture/scripture-chapter-content-block-region';
import { ContentBlockRenderer } from '@/components/scripture/content-block-renderer';
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
    sectionLabel,
} from '@/lib/scripture';
import type { BreadcrumbItem, ChapterShowProps } from '@/types';

const PANEL_CLASS_NAME =
    'flex flex-wrap items-center gap-2 rounded-2xl border border-border/70 bg-muted/20 p-3';

export default function ChapterShow({
    book,
    book_section,
    chapter,
    content_blocks,
    chapter_sections,
    isAdmin,
    admin,
}: ChapterShowProps) {
    const [viewMode, setViewMode] = useState<'cards' | 'list'>('cards');
    const showAdminControls = useVisibleAdminControls();
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
    const {
        identitySurface: chapterIdentitySurface,
        introSurface: chapterIntroSurface,
        introBlock: pageIntroBlock,
    } = resolveChapterHeaderSurfaces({
        chapter,
        chapterTitle,
        blocks: content_blocks,
        admin,
        enabled: showAdminControls,
    });
    const chapterNoteBlocks =
        pageIntroBlock === null
            ? content_blocks
            : content_blocks.filter((block) => block.id !== pageIntroBlock.id);
    const chapterVerseGroupsSurface = resolveChapterVerseGroupsSurface({
        chapter,
        chapterSections: chapter_sections,
        admin,
        enabled: showAdminControls,
    });
    const buildChapterSectionGroupSurface = (
        section: ChapterShowProps['chapter_sections'][number],
        sectionTitle: string,
    ) =>
        resolveChapterSectionVerseGroupSurface({
            chapterSection: section,
            title: sectionTitle,
            primaryCount: section.verses_count ?? 0,
            primaryLabel: 'verses',
            openHref: section.href ?? chapter.verses_href ?? chapter.href,
            openLabel: 'Open Reader',
            enabled: showAdminControls,
        });

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
            <ScriptureAdminModeBar />

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
                contentClassName="space-y-6"
            >
                {(chapterIdentitySurface || chapterIntroSurface) && (
                    <div className="space-y-3">
                        {chapterIdentitySurface && (
                            <AdminModuleHost
                                surface={chapterIdentitySurface}
                                className={PANEL_CLASS_NAME}
                            />
                        )}
                        {chapterIntroSurface && (
                            <AdminModuleHost
                                surface={chapterIntroSurface}
                                className={PANEL_CLASS_NAME}
                            />
                        )}
                    </div>
                )}

                {pageIntroBlock ? (
                    pageIntroBlock.block_type === 'text' ? (
                        <div className="rounded-2xl border border-border/70 bg-muted/20 px-5 py-5 sm:px-6 sm:py-6">
                            <p className="text-xs font-semibold tracking-[0.18em] text-muted-foreground uppercase">
                                Chapter Introduction
                            </p>
                            {pageIntroBlock.title && (
                                <p className="mt-4 text-lg font-semibold">
                                    {pageIntroBlock.title}
                                </p>
                            )}
                            {pageIntroBlock.body && (
                                <p className="mt-3 leading-7 text-muted-foreground">
                                    {pageIntroBlock.body}
                                </p>
                            )}
                        </div>
                    ) : (
                        <div className="rounded-2xl border border-border/70 bg-muted/20 p-2 sm:p-3">
                            <p className="px-3 pt-3 text-xs font-semibold tracking-[0.18em] text-muted-foreground uppercase sm:px-4">
                                Chapter Introduction
                            </p>
                            <div className="mt-3">
                                <ContentBlockRenderer block={pageIntroBlock} />
                            </div>
                        </div>
                    )
                ) : null}

                <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
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
                </div>
            </ScripturePageIntroCard>

            <ScriptureChapterContentBlockRegion
                chapter={chapter}
                chapterTitle={chapterTitle}
                blocks={chapterNoteBlocks}
                showAdminControls={showAdminControls}
                admin={admin}
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
                {chapterVerseGroupsSurface && (
                    <div className="mb-4">
                        <AdminModuleHost
                            surface={chapterVerseGroupsSurface}
                            className={PANEL_CLASS_NAME}
                        />
                    </div>
                )}
                {viewMode === 'cards' ? (
                    <div className="grid gap-4 md:grid-cols-2">
                        {chapter_sections.map((section) => {
                            const sectionTitle = hidesGenericChapterSection
                                ? 'All Verses'
                                : sectionLabel(section.number, section.title);
                            const sectionGroupSurface =
                                buildChapterSectionGroupSurface(
                                    section,
                                    sectionTitle,
                                );

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
                                            {sectionGroupSurface && (
                                                <AdminModuleHost
                                                    surface={sectionGroupSurface}
                                                    className={
                                                        PANEL_CLASS_NAME
                                                    }
                                                />
                                            )}
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
                            const sectionGroupSurface =
                                buildChapterSectionGroupSurface(
                                    section,
                                    sectionTitle,
                                );

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
                                            {sectionGroupSurface && (
                                                <AdminModuleHost
                                                    surface={sectionGroupSurface}
                                                    className={
                                                        PANEL_CLASS_NAME
                                                    }
                                                />
                                            )}
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

