import { Link } from '@inertiajs/react';
import { Badge } from '@/components/ui/badge';
import {
    Card,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import ScriptureLayout from '@/layouts/scripture-layout';
import type { BreadcrumbItem, TopicsIndexProps } from '@/types';

export default function TopicsIndex({ topics }: TopicsIndexProps) {
    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Topics',
            href: '/topics',
        },
    ];

    return (
        <ScriptureLayout title="Topics" breadcrumbs={breadcrumbs}>
            <Card>
                <CardHeader className="gap-4">
                    <div className="flex flex-wrap items-center gap-2">
                        <Badge variant="outline">Study Guide</Badge>
                        <Badge variant="secondary">
                            {`${topics.length} ${
                                topics.length === 1 ? 'topic' : 'topics'
                            }`}
                        </Badge>
                    </div>

                    <div className="space-y-2">
                        <CardTitle className="text-3xl">Topics</CardTitle>
                        <CardDescription className="max-w-3xl text-base leading-7">
                            Browse recurring themes and open each topic for its
                            public overview and linked verses.
                        </CardDescription>
                    </div>
                </CardHeader>
            </Card>

            <section className="space-y-3">
                <div className="space-y-1">
                    <h2 className="text-xl font-semibold">Available Topics</h2>
                    <p className="text-sm text-muted-foreground">
                        Explore the public topic library in browse order.
                    </p>
                </div>

                {topics.length > 0 ? (
                    <div className="space-y-3">
                        {topics.map((topic) => (
                            <Link
                                key={topic.id}
                                href={topic.href}
                                className="block rounded-lg border bg-card p-4 transition-colors hover:border-primary"
                            >
                                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                                    <div className="space-y-2">
                                        <p className="text-lg font-semibold">
                                            {topic.name}
                                        </p>

                                        {topic.description && (
                                            <p className="text-sm leading-6 text-muted-foreground">
                                                {topic.description}
                                            </p>
                                        )}
                                    </div>

                                    <span className="text-sm font-medium text-primary">
                                        Open topic
                                    </span>
                                </div>
                            </Link>
                        ))}
                    </div>
                ) : (
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">
                                No Topics Yet
                            </CardTitle>
                            <CardDescription className="leading-7">
                                Public topics will appear here once they are
                                available for browsing.
                            </CardDescription>
                        </CardHeader>
                    </Card>
                )}
            </section>
        </ScriptureLayout>
    );
}
