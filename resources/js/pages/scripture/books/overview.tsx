import { Link } from '@inertiajs/react';
import { ArrowRight, BookOpenText } from 'lucide-react';
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
import type { BookOverviewProps, BreadcrumbItem } from '@/types';

export default function BookOverview({ book, content_blocks }: BookOverviewProps) {
    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Books',
            href: '/books',
        },
        {
            title: book.title,
            href: book.href,
        },
        {
            title: 'Overview',
            href: book.overview_href,
        },
    ];

    return (
        <ScriptureLayout
            title={`${book.title} Overview`}
            breadcrumbs={breadcrumbs}
        >
            <Card>
                <CardHeader className="gap-4">
                    <div className="flex flex-wrap items-center gap-2">
                        <Badge variant="outline">Overview</Badge>
                        <Badge variant="secondary">Editorial</Badge>
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
                <CardContent className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <p className="max-w-2xl text-sm leading-6 text-muted-foreground">
                        Read the book-level introduction and supporting editorial
                        context, then continue into the canonical scripture
                        structure when you are ready.
                    </p>

                    <Button asChild>
                        <Link href={book.href}>
                            Continue to Scripture Structure
                            <ArrowRight className="size-4" />
                        </Link>
                    </Button>
                </CardContent>
            </Card>

            {content_blocks.length > 0 ? (
                <section className="space-y-4">
                    <div className="space-y-1">
                        <h2 className="text-xl font-semibold">Overview Content</h2>
                        <p className="text-sm text-muted-foreground">
                            Curated book-level content published through the
                            existing content block system.
                        </p>
                    </div>

                    <div className="space-y-4">
                        {content_blocks.map((block) => (
                            <ContentBlockRenderer key={block.id} block={block} />
                        ))}
                    </div>
                </section>
            ) : (
                <Card>
                    <CardHeader className="gap-3">
                        <div className="rounded-md bg-primary/10 p-2 text-primary w-fit">
                            <BookOpenText className="size-4" />
                        </div>
                        <div className="space-y-2">
                            <CardTitle>Overview In Progress</CardTitle>
                            <CardDescription className="max-w-3xl leading-7">
                                Editorial introduction blocks have not been
                                published for this book yet. You can still enter
                                the canonical scripture structure now.
                            </CardDescription>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <Button asChild variant="outline">
                            <Link href={book.href}>Open Book Structure</Link>
                        </Button>
                    </CardContent>
                </Card>
            )}
        </ScriptureLayout>
    );
}
