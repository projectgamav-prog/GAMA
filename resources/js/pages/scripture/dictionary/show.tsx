import { Link } from '@inertiajs/react';
import { Badge } from '@/components/ui/badge';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { chapterLabel, verseLabel } from '@/lib/scripture';
import ScriptureLayout from '@/layouts/scripture-layout';
import type { BreadcrumbItem, DictionaryEntryShowProps } from '@/types';

export default function DictionaryEntryShow({
    dictionary_entry,
    related_verses,
}: DictionaryEntryShowProps) {
    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Dictionary',
            href: '/dictionary',
        },
        {
            title: dictionary_entry.headword,
            href: dictionary_entry.href,
        },
    ];

    return (
        <ScriptureLayout
            title={dictionary_entry.headword}
            breadcrumbs={breadcrumbs}
        >
            <Card>
                <CardHeader className="gap-4">
                    <div className="flex flex-wrap items-center gap-2">
                        <Badge variant="outline">Dictionary Entry</Badge>
                        {dictionary_entry.entry_type && (
                            <Badge variant="secondary">
                                {dictionary_entry.entry_type}
                            </Badge>
                        )}
                    </div>

                    <div className="space-y-3">
                        <div className="space-y-1">
                            <CardTitle className="text-3xl">
                                {dictionary_entry.headword}
                            </CardTitle>
                            {dictionary_entry.transliteration && (
                                <CardDescription className="text-base italic">
                                    {dictionary_entry.transliteration}
                                </CardDescription>
                            )}
                        </div>

                        {dictionary_entry.root_headword && (
                            <p className="text-sm text-muted-foreground">
                                Root headword:{' '}
                                <span className="font-medium text-foreground">
                                    {dictionary_entry.root_headword}
                                </span>
                            </p>
                        )}
                    </div>
                </CardHeader>
            </Card>

            {dictionary_entry.meaning && (
                <section className="space-y-3">
                    <div className="space-y-1">
                        <h2 className="text-xl font-semibold">Meaning</h2>
                        <p className="text-sm text-muted-foreground">
                            Primary public meaning attached to this term.
                        </p>
                    </div>

                    <Card>
                        <CardContent className="pt-6">
                            <p className="leading-7">{dictionary_entry.meaning}</p>
                        </CardContent>
                    </Card>
                </section>
            )}

            {dictionary_entry.explanation && (
                <section className="space-y-3">
                    <div className="space-y-1">
                        <h2 className="text-xl font-semibold">Explanation</h2>
                        <p className="text-sm text-muted-foreground">
                            Additional editorial notes published for this entry.
                        </p>
                    </div>

                    <Card>
                        <CardContent className="pt-6">
                            <p className="leading-7 whitespace-pre-line">
                                {dictionary_entry.explanation}
                            </p>
                        </CardContent>
                    </Card>
                </section>
            )}

            <section className="space-y-3">
                <div className="space-y-1">
                    <h2 className="text-xl font-semibold">Related Verses</h2>
                    <p className="text-sm text-muted-foreground">
                        Verses where this dictionary term appears in the study
                        companion data.
                    </p>
                </div>

                {related_verses.length > 0 ? (
                    <div className="space-y-3">
                        {related_verses.map((verse) => (
                            <Link
                                key={verse.id}
                                href={verse.href}
                                className="block rounded-lg border bg-card p-4 transition-colors hover:border-primary"
                            >
                                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                                    <div className="space-y-1">
                                        <p className="font-medium">
                                            {chapterLabel(
                                                verse.chapter_number,
                                                null,
                                            )}{' '}
                                            - {verseLabel(verse.number)}
                                        </p>
                                        <p className="text-sm text-muted-foreground">
                                            {verse.book_slug} /{' '}
                                            {verse.chapter_slug} / {verse.slug}
                                        </p>
                                    </div>

                                    <span className="text-sm font-medium text-primary">
                                        Open verse
                                    </span>
                                </div>
                            </Link>
                        ))}
                    </div>
                ) : (
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">
                                No Related Verses Yet
                            </CardTitle>
                            <CardDescription className="leading-7">
                                This term is public, but no verse dictionary
                                assignments are currently available for it.
                            </CardDescription>
                        </CardHeader>
                    </Card>
                )}
            </section>
        </ScriptureLayout>
    );
}
