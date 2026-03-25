import { Link } from '@inertiajs/react';
import { Badge } from '@/components/ui/badge';
import {
    Card,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import ScriptureLayout from '@/layouts/scripture-layout';
import type { BreadcrumbItem, DictionaryIndexProps } from '@/types';

export default function DictionaryIndex({
    dictionary_entries,
}: DictionaryIndexProps) {
    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Dictionary',
            href: '/dictionary',
        },
    ];

    return (
        <ScriptureLayout title="Dictionary" breadcrumbs={breadcrumbs}>
            <Card>
                <CardHeader className="gap-4">
                    <div className="flex flex-wrap items-center gap-2">
                        <Badge variant="outline">Reference</Badge>
                        <Badge variant="secondary">
                            {`${dictionary_entries.length} ${
                                dictionary_entries.length === 1
                                    ? 'entry'
                                    : 'entries'
                            }`}
                        </Badge>
                    </div>

                    <div className="space-y-2">
                        <CardTitle className="text-3xl">Dictionary</CardTitle>
                        <CardDescription className="max-w-3xl text-base leading-7">
                            Browse published scripture terms and open each
                            entry for fuller meaning and verse context.
                        </CardDescription>
                    </div>
                </CardHeader>
            </Card>

            <section className="space-y-3">
                <div className="space-y-1">
                    <h2 className="text-xl font-semibold">Entries</h2>
                    <p className="text-sm text-muted-foreground">
                        Public dictionary entries ordered for steady browsing.
                    </p>
                </div>

                {dictionary_entries.length > 0 ? (
                    <div className="space-y-3">
                        {dictionary_entries.map((entry) => (
                            <Link
                                key={entry.id}
                                href={entry.href}
                                className="block rounded-lg border bg-card p-4 transition-colors hover:border-primary"
                            >
                                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                                    <div className="space-y-2">
                                        <div className="space-y-1">
                                            <p className="text-lg font-semibold">
                                                {entry.headword}
                                            </p>
                                            {entry.transliteration && (
                                                <p className="text-sm italic text-muted-foreground">
                                                    {entry.transliteration}
                                                </p>
                                            )}
                                        </div>

                                        {entry.root_headword && (
                                            <p className="text-sm text-muted-foreground">
                                                Root headword:{' '}
                                                <span className="font-medium text-foreground">
                                                    {entry.root_headword}
                                                </span>
                                            </p>
                                        )}

                                        {entry.short_meaning && (
                                            <p className="text-sm leading-6 text-muted-foreground">
                                                {entry.short_meaning}
                                            </p>
                                        )}
                                    </div>

                                    <span className="text-sm font-medium text-primary">
                                        Open entry
                                    </span>
                                </div>
                            </Link>
                        ))}
                    </div>
                ) : (
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">
                                No Public Entries Yet
                            </CardTitle>
                            <CardDescription className="leading-7">
                                Published dictionary entries will appear here
                                once they are available for browsing.
                            </CardDescription>
                        </CardHeader>
                    </Card>
                )}
            </section>
        </ScriptureLayout>
    );
}
