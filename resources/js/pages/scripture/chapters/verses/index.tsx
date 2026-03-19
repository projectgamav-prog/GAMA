import { Link } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';
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
import type { BreadcrumbItem, ChapterVersesIndexProps } from '@/types';

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

export default function ChapterVersesIndex({
    book,
    chapter,
    chapter_sections,
}: ChapterVersesIndexProps) {
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
            title: 'Verses',
            href: chapter.verses_href ?? chapter.href,
        },
    ];

    return (
        <ScriptureLayout
            title={`${chapterLabel(chapter.number, chapter.title)} Verses`}
            breadcrumbs={breadcrumbs}
        >
            <Card>
                <CardHeader className="gap-4">
                    <div className="flex items-center gap-2">
                        <Badge variant="outline">Verse List</Badge>
                    </div>
                    <div className="space-y-2">
                        <CardTitle className="text-3xl">
                            {chapterLabel(chapter.number, chapter.title)}
                        </CardTitle>
                        <CardDescription className="text-base leading-7">
                            Canonical verses are grouped by chapter section and
                            shown in reading order.
                        </CardDescription>
                    </div>
                </CardHeader>
                <CardContent>
                    <Button asChild variant="outline">
                        <Link href={chapter.href}>
                            <ArrowLeft className="size-4" />
                            Back to Chapter
                        </Link>
                    </Button>
                </CardContent>
            </Card>

            <div className="space-y-6">
                {chapter_sections.map((section) => (
                    <Card key={section.id} id={section.slug}>
                        <CardHeader>
                            <div className="flex items-center gap-2">
                                <Badge variant="secondary">
                                    {section.verses.length} verse
                                    {section.verses.length === 1 ? '' : 's'}
                                </Badge>
                            </div>
                            <CardTitle>
                                {sectionLabel(section.number, section.title)}
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {section.verses.map((verse) => (
                                <div
                                    key={verse.id}
                                    className="rounded-lg border px-4 py-4"
                                >
                                    <p className="mb-2 text-sm font-medium text-muted-foreground">
                                        {verseLabel(verse.number)}
                                    </p>
                                    <p className="leading-8">{verse.text}</p>
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                ))}
            </div>
        </ScriptureLayout>
    );
}
