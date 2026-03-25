import { Link } from '@inertiajs/react';
import {
    ArrowLeft,
    ArrowRight,
    BookOpenText,
    Headphones,
    MessageSquareQuote,
    Sparkles,
    Tag,
    Users,
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
import { chapterLabel, sectionLabel, verseLabel } from '@/lib/scripture';
import ScriptureLayout from '@/layouts/scripture-layout';
import type { BreadcrumbItem, VerseShowProps } from '@/types';

export default function VerseShow({
    book,
    book_section,
    chapter,
    chapter_section,
    verse,
    previous_verse,
    next_verse,
    translations,
    commentaries,
    verse_meta,
    dictionary_terms,
    recitations,
    topics,
    characters,
    content_blocks,
}: VerseShowProps) {
    const chapterTitle = chapterLabel(chapter.number, chapter.title);
    const bookSectionTitle = sectionLabel(book_section.number, book_section.title);
    const chapterSectionTitle = sectionLabel(
        chapter_section.number,
        chapter_section.title,
    );
    const verseTitle = verseLabel(verse.number);

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
            title: chapterSectionTitle,
            href: chapter_section.href,
        },
        {
            title: verseTitle,
            href: chapter.href,
        },
    ];
    const metaBadges = [
        verse_meta?.is_featured ? 'Featured' : null,
        verse_meta?.difficulty_level ?? null,
        verse_meta?.teaching_mode ?? null,
        verse_meta?.narrative_phase ?? null,
        verse_meta?.scene_location ?? null,
        verse_meta && verse_meta.memorization_priority > 0
            ? `Memorization ${verse_meta.memorization_priority}`
            : null,
    ].filter((value): value is string => value !== null);
    const hasVerseMeta = verse_meta !== null
        && (metaBadges.length > 0 || verse_meta.summary_short !== null);

    const formatDuration = (durationSeconds: number | null): string | null => {
        if (durationSeconds === null || durationSeconds < 0) {
            return null;
        }

        const hours = Math.floor(durationSeconds / 3600);
        const minutes = Math.floor((durationSeconds % 3600) / 60);
        const seconds = durationSeconds % 60;

        if (hours > 0) {
            return `${hours}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
        }

        return `${minutes}:${String(seconds).padStart(2, '0')}`;
    };

    return (
        <ScriptureLayout
            title={`${verseTitle} - ${chapterTitle}`}
            breadcrumbs={breadcrumbs}
        >
            <Card>
                <CardHeader className="gap-4">
                    <div className="flex flex-wrap items-center gap-2">
                        <Badge variant="outline">Verse Details</Badge>
                        <Badge variant="secondary">{book.title}</Badge>
                        <Badge variant="secondary">
                            {bookSectionTitle}
                        </Badge>
                        <Badge variant="secondary">
                            {chapterSectionTitle}
                        </Badge>
                        <Badge variant="secondary">{verseTitle}</Badge>
                    </div>
                    <div className="space-y-2">
                        <CardTitle className="text-3xl">{verseTitle}</CardTitle>
                        <CardDescription className="text-base leading-7">
                            {chapterTitle}
                        </CardDescription>
                    </div>
                </CardHeader>
                <CardContent className="flex flex-wrap gap-3">
                    {previous_verse && (
                        <Button asChild variant="outline">
                            <Link href={previous_verse.href}>
                                <ArrowLeft className="size-4" />
                                Previous Verse
                            </Link>
                        </Button>
                    )}
                    {next_verse && (
                        <Button asChild>
                            <Link href={next_verse.href}>
                                Next Verse
                                <ArrowRight className="size-4" />
                            </Link>
                        </Button>
                    )}
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

            {hasVerseMeta && (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-xl">
                            <Sparkles className="size-5" />
                            Verse Study Notes
                        </CardTitle>
                        <CardDescription>
                            Compact study metadata attached to this verse.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {metaBadges.length > 0 && (
                            <div className="flex flex-wrap gap-2">
                                {metaBadges.map((item) => (
                                    <Badge key={item} variant="outline">
                                        {item}
                                    </Badge>
                                ))}
                            </div>
                        )}
                        {verse_meta?.summary_short && (
                            <p className="text-sm leading-7 text-muted-foreground">
                                {verse_meta.summary_short}
                            </p>
                        )}
                    </CardContent>
                </Card>
            )}

            {dictionary_terms.length > 0 && (
                <section className="space-y-4">
                    <div className="space-y-1">
                        <h2 className="text-xl font-semibold">Dictionary Terms</h2>
                        <p className="text-sm text-muted-foreground">
                            Linked study terms related to this verse.
                        </p>
                    </div>
                    <div className="flex flex-wrap gap-3">
                        {dictionary_terms.map((term) => (
                            <Card key={term.id} className="min-w-48 flex-1">
                                <CardContent className="space-y-3 py-4">
                                    <div className="space-y-1">
                                        <p className="font-medium leading-none">
                                            {term.dictionary_entry?.headword ??
                                                term.matched_text ??
                                                'Untitled term'}
                                        </p>
                                        {term.dictionary_entry?.transliteration && (
                                            <p className="text-sm text-muted-foreground">
                                                {term.dictionary_entry.transliteration}
                                            </p>
                                        )}
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        {term.language_code && (
                                            <Badge variant="outline">
                                                {term.language_code}
                                            </Badge>
                                        )}
                                        <Badge variant="secondary">
                                            {term.match_type}
                                        </Badge>
                                    </div>
                                    {term.dictionary_entry?.short_meaning && (
                                        <p className="text-sm text-muted-foreground">
                                            {term.dictionary_entry.short_meaning}
                                        </p>
                                    )}
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </section>
            )}

            {recitations.length > 0 && (
                <section className="space-y-4">
                    <div className="space-y-1">
                        <h2 className="text-xl font-semibold">Recitations</h2>
                        <p className="text-sm text-muted-foreground">
                            Available verse audio and listening variants.
                        </p>
                    </div>
                    <div className="space-y-3">
                        {recitations.map((recitation) => {
                            const mediaHref =
                                recitation.media?.url ?? recitation.media?.path ?? null;
                            const durationLabel = formatDuration(
                                recitation.duration_seconds,
                            );

                            return (
                                <Card key={recitation.id}>
                                    <CardContent className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between">
                                        <div className="space-y-2">
                                            <div className="flex flex-wrap items-center gap-2">
                                                <Headphones className="size-4 text-muted-foreground" />
                                                <span className="font-medium">
                                                    {recitation.reciter_name}
                                                </span>
                                                {recitation.language_code && (
                                                    <Badge variant="outline">
                                                        {recitation.language_code}
                                                    </Badge>
                                                )}
                                                {recitation.style && (
                                                    <Badge variant="secondary">
                                                        {recitation.style}
                                                    </Badge>
                                                )}
                                                {durationLabel && (
                                                    <Badge variant="outline">
                                                        {durationLabel}
                                                    </Badge>
                                                )}
                                            </div>
                                            {recitation.media?.title && (
                                                <p className="text-sm text-muted-foreground">
                                                    {recitation.media.title}
                                                </p>
                                            )}
                                        </div>
                                        {mediaHref && (
                                            <Button asChild size="sm" variant="outline">
                                                <a
                                                    href={mediaHref}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                >
                                                    Listen
                                                </a>
                                            </Button>
                                        )}
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </div>
                </section>
            )}

            {topics.length > 0 && (
                <section className="space-y-4">
                    <div className="space-y-1">
                        <h2 className="text-xl font-semibold">Related Topics</h2>
                        <p className="text-sm text-muted-foreground">
                            Editorial topic links attached to this verse.
                        </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {topics.map((assignment) => (
                            <Badge
                                key={assignment.id}
                                variant="secondary"
                                className="px-3 py-1"
                            >
                                <Tag className="size-3.5" />
                                {assignment.topic?.name ?? 'Untitled topic'}
                            </Badge>
                        ))}
                    </div>
                </section>
            )}

            {characters.length > 0 && (
                <section className="space-y-4">
                    <div className="space-y-1">
                        <h2 className="text-xl font-semibold">Related Characters</h2>
                        <p className="text-sm text-muted-foreground">
                            Characters directly associated with this verse.
                        </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {characters.map((assignment) => (
                            <Badge
                                key={assignment.id}
                                variant="outline"
                                className="px-3 py-1"
                            >
                                <Users className="size-3.5" />
                                {assignment.character?.name ?? 'Untitled character'}
                            </Badge>
                        ))}
                    </div>
                </section>
            )}

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
