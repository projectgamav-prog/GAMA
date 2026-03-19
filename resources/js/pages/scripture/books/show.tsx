import { Link } from '@inertiajs/react';
import { BookOpenText } from 'lucide-react';
import { ContentBlockRenderer } from '@/components/scripture/content-block-renderer';
import { Badge } from '@/components/ui/badge';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import ScriptureLayout from '@/layouts/scripture-layout';
import type { BookShowProps, BreadcrumbItem } from '@/types';

const sectionLabel = (number: string | null, title: string | null) => {
    if (number && title) {
        return `Section ${number}: ${title}`;
    }

    if (number) {
        return `Section ${number}`;
    }

    return title ?? 'Section';
};

const chapterLabel = (number: string | null, title: string | null) => {
    if (number && title) {
        return `Chapter ${number}: ${title}`;
    }

    if (number) {
        return `Chapter ${number}`;
    }

    return title ?? 'Chapter';
};

export default function BookShow({
    book,
    content_blocks,
    book_sections,
}: BookShowProps) {
    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: book.title,
            href: book.href,
        },
    ];

    return (
        <ScriptureLayout title={book.title} breadcrumbs={breadcrumbs}>
            <Card>
                <CardHeader className="gap-4">
                    <div className="flex items-center gap-2">
                        <Badge variant="outline">Book</Badge>
                        <Badge variant="secondary">
                            {book_sections.length} section
                            {book_sections.length === 1 ? '' : 's'}
                        </Badge>
                    </div>
                    <div className="space-y-2">
                        <CardTitle className="text-3xl">{book.title}</CardTitle>
                        {book.description && (
                            <CardDescription className="max-w-3xl text-base leading-7">
                                {book.description}
                            </CardDescription>
                        )}
                    </div>
                </CardHeader>
            </Card>

            {content_blocks.length > 0 && (
                <section className="space-y-4">
                    <div className="space-y-1">
                        <h2 className="text-xl font-semibold">Reading Notes</h2>
                        <p className="text-sm text-muted-foreground">
                            Published study content attached to this book.
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
                    <h2 className="text-xl font-semibold">Canonical Browse</h2>
                    <p className="text-sm text-muted-foreground">
                        Browse from the book into its canonical sections and
                        chapters.
                    </p>
                </div>

                <div className="space-y-4">
                    {book_sections.map((section) => (
                        <Card key={section.id}>
                            <CardHeader>
                                <CardTitle>
                                    {sectionLabel(section.number, section.title)}
                                </CardTitle>
                                <CardDescription>
                                    {section.chapters.length} chapter
                                    {section.chapters.length === 1 ? '' : 's'}
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="grid gap-3 md:grid-cols-2">
                                    {section.chapters.map((chapter) => (
                                        <Link
                                            key={chapter.id}
                                            href={chapter.href}
                                            className="group rounded-lg border p-4 transition-colors hover:border-primary"
                                        >
                                            <div className="flex items-start gap-3">
                                                <div className="rounded-md bg-primary/10 p-2 text-primary">
                                                    <BookOpenText className="size-4" />
                                                </div>
                                                <div className="space-y-1">
                                                    <p className="font-medium group-hover:text-primary">
                                                        {chapterLabel(
                                                            chapter.number,
                                                            chapter.title,
                                                        )}
                                                    </p>
                                                    <p className="text-sm text-muted-foreground">
                                                        Open chapter overview
                                                    </p>
                                                </div>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </section>
        </ScriptureLayout>
    );
}
