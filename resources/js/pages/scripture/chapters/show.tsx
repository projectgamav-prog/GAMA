import { Link } from '@inertiajs/react';
import { useState } from 'react';
import {
    ArrowRight,
    BookOpenText,
    LayoutGrid,
    ListTree,
    Rows3,
} from 'lucide-react';
import { ContentBlockRenderer } from '@/components/scripture/content-block-renderer';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import {
    chapterLabel,
    hidesSingleGenericSection,
    isGenericSectionLabel,
    sectionLabel,
} from '@/lib/scripture';
import ScriptureLayout from '@/layouts/scripture-layout';
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
    const bookSectionTitle = sectionLabel(book_section.number, book_section.title);

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
        <ScriptureLayout
            title={chapterTitle}
            breadcrumbs={breadcrumbs}
        >
            <Card>
                <CardHeader className="gap-4">
                    <div className="flex flex-wrap items-center gap-2">
                        <Badge variant="outline">Chapter</Badge>
                        <Badge variant="secondary">{book.title}</Badge>
                        {!hidesGenericBookSection && (
                            <Badge variant="secondary">
                                {bookSectionTitle}
                            </Badge>
                        )}
                    </div>
                    <div className="space-y-2">
                        <CardTitle className="text-3xl">{chapterTitle}</CardTitle>
                        <CardDescription className="text-base leading-7">
                            Read the chapter overview first, then open the
                            reader and continue in canonical order.
                        </CardDescription>
                    </div>
                </CardHeader>
                <CardContent className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                    <div className="flex flex-wrap gap-3">
                        <Button asChild>
                            <Link href={chapter.verses_href ?? chapter.href}>
                                Open Reader
                                <ArrowRight className="size-4" />
                            </Link>
                        </Button>
                        <Button asChild variant="outline">
                            <Link href={book.href}>Back to Book</Link>
                        </Button>
                    </div>
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
                </CardContent>
            </Card>

            {content_blocks.length > 0 && (
                <section className="space-y-4">
                    <div className="space-y-1">
                        <h2 className="text-xl font-semibold">Published Notes</h2>
                        <p className="text-sm text-muted-foreground">
                            Study content attached to this chapter.
                        </p>
                    </div>
                    <div className="space-y-4">
                        {content_blocks.map((block) => (
                            <ContentBlockRenderer
                                key={block.id}
                                block={block}
                            />
                        ))}
                    </div>
                </section>
            )}

            <section className="space-y-4">
                <div className="space-y-1">
                    <h2 className="text-xl font-semibold">
                        {hidesGenericChapterSection
                            ? 'Reader Entry'
                            : 'Chapter Sections'}
                    </h2>
                    <p className="text-sm text-muted-foreground">
                        {hidesGenericChapterSection
                            ? 'This chapter flows through one continuous reader entry point.'
                            : 'Canonical sections inside this chapter, with verse counts for quick entry into the reader.'}
                    </p>
                </div>
                {viewMode === 'cards' ? (
                    <div className="grid gap-4 md:grid-cols-2">
                        {chapter_sections.map((section) => (
                            <Card key={section.id}>
                                <CardHeader className="gap-3">
                                    <div className="flex items-center gap-2">
                                        <Badge variant="outline">
                                            {section.verses_count ?? 0} verses
                                        </Badge>
                                    </div>
                                    <CardTitle>
                                        {hidesGenericChapterSection
                                            ? 'All Verses'
                                            : sectionLabel(
                                                  section.number,
                                                  section.title,
                                              )}
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="flex items-center justify-between gap-3">
                                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                        <ListTree className="size-4" />
                                        <span>Open this section in the reader</span>
                                    </div>
                                    <Button asChild variant="outline" size="sm">
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
                        ))}
                    </div>
                ) : (
                    <div className="overflow-hidden rounded-xl border bg-card">
                        {chapter_sections.map((section, index) => (
                            <div
                                key={section.id}
                                className={
                                    index === 0
                                        ? 'flex flex-col gap-4 px-4 py-4 sm:flex-row sm:items-center sm:justify-between'
                                        : 'flex flex-col gap-4 border-t px-4 py-4 sm:flex-row sm:items-center sm:justify-between'
                                }
                            >
                                <div className="min-w-0 space-y-2">
                                    <div className="flex flex-wrap items-center gap-2">
                                        <Badge variant="outline">
                                            {section.verses_count ?? 0} verses
                                        </Badge>
                                        <Badge variant="secondary">
                                            Reader Entry
                                        </Badge>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="font-medium leading-none">
                                            {hidesGenericChapterSection
                                                ? 'All Verses'
                                                : sectionLabel(
                                                      section.number,
                                                      section.title,
                                                  )}
                                        </p>
                                        <p className="text-sm text-muted-foreground">
                                            Open this section in the reader.
                                        </p>
                                    </div>
                                </div>
                                <Button asChild variant="outline" size="sm">
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
                        ))}
                    </div>
                )}
            </section>
        </ScriptureLayout>
    );
}
