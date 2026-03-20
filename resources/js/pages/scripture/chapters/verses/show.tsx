import { Link } from '@inertiajs/react';
import { ArrowLeft, BookOpenText, MessageSquareQuote } from 'lucide-react';
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
import type { BreadcrumbItem, VerseShowProps } from '@/types';

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

const verseLabel = (number: string | null) => {
    return number ? `Verse ${number}` : 'Verse';
};

export default function VerseShow({
    book,
    chapter,
    chapter_section,
    verse,
    translations,
    commentaries,
    content_blocks,
}: VerseShowProps) {
    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: book.title,
            href: book.href,
        },
        {
            title: chapterLabel(chapter.number, chapter.title),
            href: chapter.href,
        },
        {
            title: 'Reader',
            href: chapter.verses_href ?? chapter.href,
        },
        {
            title: verseLabel(verse.number),
            href: chapter_section.href,
        },
    ];

    return (
        <ScriptureLayout
            title={`${verseLabel(verse.number)} - ${chapterLabel(chapter.number, chapter.title)}`}
            breadcrumbs={breadcrumbs}
        >
            <Card>
                <CardHeader className="gap-4">
                    <div className="flex flex-wrap items-center gap-2">
                        <Badge variant="outline">{book.title}</Badge>
                        <Badge variant="secondary">
                            {sectionLabel(
                                chapter_section.number,
                                chapter_section.title,
                            )}
                        </Badge>
                        <Badge variant="secondary">{verseLabel(verse.number)}</Badge>
                    </div>
                    <div className="space-y-2">
                        <CardTitle className="text-3xl">
                            {verseLabel(verse.number)}
                        </CardTitle>
                        <CardDescription className="text-base leading-7">
                            {chapterLabel(chapter.number, chapter.title)}
                        </CardDescription>
                    </div>
                </CardHeader>
                <CardContent className="flex flex-wrap gap-3">
                    <Button asChild variant="outline">
                        <Link href={chapter.verses_href ?? chapter.href}>
                            <ArrowLeft className="size-4" />
                            Back to Reader
                        </Link>
                    </Button>
                    <Button asChild variant="outline">
                        <Link href={chapter.href}>
                            <BookOpenText className="size-4" />
                            Back to Chapter
                        </Link>
                    </Button>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Canonical Verse</CardTitle>
                    <CardDescription>
                        The canonical text in the scripture hierarchy.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <p className="text-lg leading-9">{verse.text}</p>
                </CardContent>
            </Card>

            <section className="space-y-4">
                <div className="space-y-1">
                    <h2 className="text-xl font-semibold">Translations</h2>
                    <p className="text-sm text-muted-foreground">
                        Read-only translations attached to this verse.
                    </p>
                </div>
                <div className="space-y-4">
                    {translations.length > 0 ? (
                        translations.map((translation) => (
                            <Card key={translation.id}>
                                <CardHeader className="gap-3">
                                    <div className="flex flex-wrap items-center gap-2">
                                        <Badge variant="outline">
                                            {translation.language_code}
                                        </Badge>
                                        <Badge variant="secondary">
                                            {translation.source_name}
                                        </Badge>
                                    </div>
                                    <CardTitle className="text-xl">
                                        {translation.source_name}
                                    </CardTitle>
                                    <CardDescription>
                                        Source key: {translation.source_key}
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <p className="leading-8">{translation.text}</p>
                                </CardContent>
                            </Card>
                        ))
                    ) : (
                        <Card>
                            <CardContent className="py-6 text-sm text-muted-foreground">
                                No translations are available for this verse yet.
                            </CardContent>
                        </Card>
                    )}
                </div>
            </section>

            <section className="space-y-4">
                <div className="space-y-1">
                    <h2 className="text-xl font-semibold">Commentaries</h2>
                    <p className="text-sm text-muted-foreground">
                        Read-only commentary content attached to this verse.
                    </p>
                </div>
                <div className="space-y-4">
                    {commentaries.length > 0 ? (
                        commentaries.map((commentary) => (
                            <Card key={commentary.id}>
                                <CardHeader className="gap-3">
                                    <div className="flex flex-wrap items-center gap-2">
                                        <Badge variant="outline">
                                            {commentary.language_code}
                                        </Badge>
                                        <Badge variant="secondary">
                                            {commentary.author_name ??
                                                commentary.source_name}
                                        </Badge>
                                    </div>
                                    <CardTitle className="text-xl">
                                        {commentary.title ?? commentary.source_name}
                                    </CardTitle>
                                    <CardDescription>
                                        <span>{commentary.source_name}</span>
                                        {commentary.source_key && (
                                            <span>
                                                {' '}
                                                - Source key:{' '}
                                                {commentary.source_key}
                                            </span>
                                        )}
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                        <MessageSquareQuote className="size-4" />
                                        <span>Commentary</span>
                                    </div>
                                    <p className="leading-8">{commentary.body}</p>
                                </CardContent>
                            </Card>
                        ))
                    ) : (
                        <Card>
                            <CardContent className="py-6 text-sm text-muted-foreground">
                                No commentaries are available for this verse yet.
                            </CardContent>
                        </Card>
                    )}
                </div>
            </section>

            {content_blocks.length > 0 && (
                <section id="published-notes" className="space-y-4">
                    <div className="space-y-1">
                        <h2 className="text-xl font-semibold">Published Notes</h2>
                        <p className="text-sm text-muted-foreground">
                            Published content blocks attached directly to this verse.
                        </p>
                    </div>
                    <div className="space-y-4">
                        {content_blocks.map((block) => (
                            <ContentBlockRenderer key={block.id} block={block} />
                        ))}
                    </div>
                </section>
            )}
        </ScriptureLayout>
    );
}
