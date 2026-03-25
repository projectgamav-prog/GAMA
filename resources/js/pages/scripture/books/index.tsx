import { useState } from 'react';
import { Link } from '@inertiajs/react';
import { ArrowRight, BookOpenText, ChevronDown, CirclePlay } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { cn } from '@/lib/utils';
import ScriptureLayout from '@/layouts/scripture-layout';
import type {
    BooksIndexProps,
    BreadcrumbItem,
    ScriptureBook,
} from '@/types';

const getDataValue = (
    data: Record<string, unknown> | null | undefined,
    key: string,
): string | null => {
    if (!data) {
        return null;
    }

    const value = data[key];

    return typeof value === 'string' && value.length > 0 ? value : null;
};

function BookCard({ book }: { book: ScriptureBook }) {
    const [isOverviewOpen, setIsOverviewOpen] = useState(false);

    const overviewVideo = book.overview_video;
    const videoUrl = getDataValue(overviewVideo?.data_json, 'url');
    const videoPoster = getDataValue(overviewVideo?.data_json, 'poster');
    const hasOverviewVideo =
        overviewVideo?.block_type === 'video' && videoUrl !== null;

    return (
        <Card className="flex h-full flex-col">
            <CardHeader className="space-y-3">
                <div className="rounded-md bg-primary/10 p-2 text-primary w-fit">
                    <BookOpenText className="size-4" />
                </div>
                <div className="space-y-2">
                    <CardTitle>{book.title}</CardTitle>
                    {book.description && (
                        <CardDescription className="line-clamp-3 leading-6">
                            {book.description}
                        </CardDescription>
                    )}
                </div>
            </CardHeader>

            <CardContent className="flex-1">
                {hasOverviewVideo && overviewVideo && (
                    <Collapsible
                        open={isOverviewOpen}
                        onOpenChange={setIsOverviewOpen}
                        className="space-y-3"
                    >
                        <CollapsibleTrigger asChild>
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                className="w-full justify-between"
                            >
                                <span className="inline-flex items-center gap-2">
                                    <CirclePlay className="size-4" />
                                    {isOverviewOpen
                                        ? 'Hide Overview'
                                        : 'Watch Overview'}
                                </span>
                                <ChevronDown
                                    className={cn(
                                        'size-4 transition-transform',
                                        isOverviewOpen && 'rotate-180',
                                    )}
                                />
                            </Button>
                        </CollapsibleTrigger>

                        <CollapsibleContent className="rounded-xl border border-border/70 bg-muted/30 p-3">
                            <div className="space-y-3">
                                <video
                                    controls
                                    preload="none"
                                    className="aspect-video w-full rounded-lg border bg-black"
                                    poster={videoPoster ?? undefined}
                                    src={videoUrl}
                                />

                                {(overviewVideo.title || overviewVideo.body) && (
                                    <div className="space-y-1">
                                        {overviewVideo.title && (
                                            <p className="text-sm font-medium">
                                                {overviewVideo.title}
                                            </p>
                                        )}
                                        {overviewVideo.body && (
                                            <p className="text-sm leading-6 text-muted-foreground">
                                                {overviewVideo.body}
                                            </p>
                                        )}
                                    </div>
                                )}
                            </div>
                        </CollapsibleContent>
                    </Collapsible>
                )}
            </CardContent>

            <CardFooter className="flex flex-wrap items-center gap-3">
                <Button asChild variant="outline" size="sm">
                    <Link href={book.overview_href}>Read Overview</Link>
                </Button>

                <Link
                    href={book.href}
                    className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline"
                >
                    Open Book
                    <ArrowRight className="size-4" />
                </Link>
            </CardFooter>
        </Card>
    );
}

export default function BooksIndex({ books }: BooksIndexProps) {
    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Books',
            href: '/books',
        },
    ];

    return (
        <ScriptureLayout title="Books" breadcrumbs={breadcrumbs}>
            <Card>
                <CardHeader className="gap-4">
                    <div className="flex items-center gap-2">
                        <Badge variant="outline">Library</Badge>
                        <Badge variant="secondary">
                            {books.length} book{books.length === 1 ? '' : 's'}
                        </Badge>
                    </div>
                    <div className="space-y-2">
                        <CardTitle className="text-3xl">
                            Scripture Library
                        </CardTitle>
                        <CardDescription className="max-w-3xl text-base leading-7">
                            Browse the available books and enter each reading
                            journey from its canonical book page.
                        </CardDescription>
                    </div>
                </CardHeader>
            </Card>

            <section className="space-y-4">
                <div className="space-y-1">
                    <h2 className="text-xl font-semibold">Available Books</h2>
                    <p className="text-sm text-muted-foreground">
                        Choose a book to open its overview, sections, and
                        chapters.
                    </p>
                </div>

                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                    {books.map((book) => (
                        <BookCard key={book.id} book={book} />
                    ))}
                </div>
            </section>
        </ScriptureLayout>
    );
}
