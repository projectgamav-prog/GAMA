import { Link } from '@inertiajs/react';
import { useState } from 'react';
import {
    ArrowLeft,
    BookOpenText,
    Languages,
    MessageSquareQuote,
    PlayCircle,
} from 'lucide-react';
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

const languageLabel = (language: 'en' | 'hi') => {
    return language === 'hi' ? 'Hindi' : 'English';
};

export default function ChapterVersesIndex({
    book,
    book_section,
    chapter,
    reader_languages,
    default_language,
    chapter_sections,
}: ChapterVersesIndexProps) {
    const [language, setLanguage] = useState<'en' | 'hi'>(
        default_language ?? reader_languages[0] ?? 'en',
    );
    const hasReaderLanguages = reader_languages.length > 0;
    const showsLanguageToggle = reader_languages.length > 1;

    const totalCards = chapter_sections.reduce(
        (sum, section) => sum + section.cards.length,
        0,
    );

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
        {
            title: 'Reader',
            href: chapter.verses_href ?? chapter.href,
        },
    ];

    return (
        <ScriptureLayout
            title={`${chapterLabel(chapter.number, chapter.title)} Reader`}
            breadcrumbs={breadcrumbs}
        >
            <Card>
                <CardHeader className="gap-4">
                    <div className="flex flex-wrap items-center gap-2">
                        <Badge variant="outline">Reader</Badge>
                        <Badge variant="secondary">{book.title}</Badge>
                        <Badge variant="secondary">
                            {sectionLabel(
                                book_section.number,
                                book_section.title,
                            )}
                        </Badge>
                        <Badge variant="secondary">
                            {totalCards} card{totalCards === 1 ? '' : 's'}
                        </Badge>
                    </div>
                    <div className="space-y-2">
                        <CardTitle className="text-3xl">
                            {chapterLabel(chapter.number, chapter.title)}
                        </CardTitle>
                        <CardDescription className="text-base leading-7">
                            Canonical verses are rendered in reading order,
                            while valid helper-layer groupings stay inside their
                            own chapter section.
                        </CardDescription>
                    </div>
                </CardHeader>
                <CardContent className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                    <div className="space-y-2">
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
                                            {languageLabel(
                                                reader_languages[0],
                                            )}{' '}
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
                                Sanskrit remains visible. The control only
                                switches the supporting translation line below
                                each verse.
                            </p>
                        )}
                    </div>
                    <Button asChild variant="outline">
                        <Link href={chapter.href}>
                            <ArrowLeft className="size-4" />
                            Back to Chapter
                        </Link>
                    </Button>
                </CardContent>
            </Card>

            <div className="space-y-6">
                {chapter_sections.map((section) => {
                    const verseCount = section.cards.reduce(
                        (sum, card) => sum + card.verses.length,
                        0,
                    );

                    return (
                        <section
                            key={section.id}
                            id={section.slug}
                            className="space-y-4"
                        >
                            <div className="space-y-1">
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
                                <h2 className="text-xl font-semibold">
                                    {sectionLabel(section.number, section.title)}
                                </h2>
                            </div>

                            <div className="space-y-4">
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
                                                <div
                                                    key={verse.id}
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
                                                            <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
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
                                                                    Verse Details
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
                                                                        Notes &
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
                                                        <p className="mb-2 text-xs uppercase tracking-[0.18em] text-muted-foreground">
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
                                                                No supporting
                                                                translations are
                                                                available for
                                                                this chapter
                                                                yet.
                                                            </p>
                                                        ) : (
                                                            <p className="text-sm text-muted-foreground">
                                                                No{' '}
                                                                {languageLabel(
                                                                    language,
                                                                ).toLowerCase()}{' '}
                                                                translation is
                                                                available for
                                                                this verse yet.
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        </section>
                    );
                })}
            </div>

            <Card>
                <CardContent className="flex flex-wrap gap-3 py-6">
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
                </CardContent>
            </Card>
        </ScriptureLayout>
    );
}
