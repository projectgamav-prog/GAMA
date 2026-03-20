import { Link } from '@inertiajs/react';
import { ArrowRight, BookOpenText, ListTree } from 'lucide-react';
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
import ScriptureLayout from '@/layouts/scripture-layout';
import type { BreadcrumbItem, ChapterShowProps } from '@/types';

const chapterLabel = (number: string | null, title: string | null) => {
    if (number && title) {
        return `Chapter ${number}: ${title}`;
    }

    if (number) {
        return `Chapter ${number}`;
    }

    return title ?? 'Chapter';
};

const sectionLabel = (number: string | null, title: string | null) => {
    if (number && title) {
        return `Section ${number}: ${title}`;
    }

    if (number) {
        return `Section ${number}`;
    }

    return title ?? 'Section';
};

export default function ChapterShow({
    book,
    book_section,
    chapter,
    content_blocks,
    chapter_sections,
}: ChapterShowProps) {
    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: book.title,
            href: book.href,
        },
        {
            title: sectionLabel(book_section.number, book_section.title),
            href: book_section.href,
        },
        {
            title: chapterLabel(chapter.number, chapter.title),
            href: chapter.href,
        },
    ];

    return (
        <ScriptureLayout
            title={chapterLabel(chapter.number, chapter.title)}
            breadcrumbs={breadcrumbs}
        >
            <Card>
                <CardHeader className="gap-4">
                    <div className="flex flex-wrap items-center gap-2">
                        <Badge variant="outline">Chapter</Badge>
                        <Badge variant="secondary">{book.title}</Badge>
                        <Badge variant="secondary">
                            {sectionLabel(
                                book_section.number,
                                book_section.title,
                            )}
                        </Badge>
                    </div>
                    <div className="space-y-2">
                        <CardTitle className="text-3xl">
                            {chapterLabel(chapter.number, chapter.title)}
                        </CardTitle>
                        <CardDescription className="text-base leading-7">
                            Read the chapter overview first, then open the
                            reader and continue in canonical order.
                        </CardDescription>
                    </div>
                </CardHeader>
                <CardContent className="flex flex-wrap gap-3">
                    <Button asChild>
                        <Link href={chapter.verses_href ?? chapter.href}>
                            Open Reader
                            <ArrowRight className="size-4" />
                        </Link>
                    </Button>
                    <Button asChild variant="outline">
                        <Link href={book.href}>Back to Book</Link>
                    </Button>
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
                    <h2 className="text-xl font-semibold">Chapter Sections</h2>
                    <p className="text-sm text-muted-foreground">
                        Canonical sections inside this chapter, with verse
                        counts for quick entry into the reader.
                    </p>
                </div>
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
                                    {sectionLabel(section.number, section.title)}
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
            </section>
        </ScriptureLayout>
    );
}
