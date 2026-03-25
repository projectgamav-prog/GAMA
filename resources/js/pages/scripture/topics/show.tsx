import { Link } from '@inertiajs/react';
import { ContentBlockRenderer } from '@/components/scripture/content-block-renderer';
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
import type { BreadcrumbItem, TopicShowProps } from '@/types';

export default function TopicShow({
    topic,
    related_verses,
    content_blocks,
}: TopicShowProps) {
    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Topics',
            href: '/topics',
        },
        {
            title: topic.name,
            href: topic.href,
        },
    ];

    return (
        <ScriptureLayout title={topic.name} breadcrumbs={breadcrumbs}>
            <Card>
                <CardHeader className="gap-4">
                    <div className="flex flex-wrap items-center gap-2">
                        <Badge variant="outline">Topic</Badge>
                    </div>

                    <div className="space-y-2">
                        <CardTitle className="text-3xl">{topic.name}</CardTitle>
                    </div>
                </CardHeader>
            </Card>

            {topic.description && (
                <section className="space-y-3">
                    <div className="space-y-1">
                        <h2 className="text-xl font-semibold">Description</h2>
                        <p className="text-sm text-muted-foreground">
                            Public overview text attached directly to this topic.
                        </p>
                    </div>

                    <Card>
                        <CardContent className="pt-6">
                            <p className="leading-7 whitespace-pre-line">
                                {topic.description}
                            </p>
                        </CardContent>
                    </Card>
                </section>
            )}

            {content_blocks.length > 0 && (
                <section className="space-y-3">
                    <div className="space-y-1">
                        <h2 className="text-xl font-semibold">Topic Content</h2>
                        <p className="text-sm text-muted-foreground">
                            Published editorial blocks attached to this topic.
                        </p>
                    </div>

                    <div className="space-y-4">
                        {content_blocks.map((block) => (
                            <ContentBlockRenderer key={block.id} block={block} />
                        ))}
                    </div>
                </section>
            )}

            <section className="space-y-3">
                <div className="space-y-1">
                    <h2 className="text-xl font-semibold">Related Verses</h2>
                    <p className="text-sm text-muted-foreground">
                        Verses associated with this topic in the public study
                        data.
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
                                This topic is public, but no verse assignments
                                are currently available for it.
                            </CardDescription>
                        </CardHeader>
                    </Card>
                )}
            </section>
        </ScriptureLayout>
    );
}
