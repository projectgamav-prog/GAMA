import { Link } from '@inertiajs/react';
import { ArrowRight, BookOpenText } from 'lucide-react';
import { BookOverviewVideoDisclosure } from '@/components/scripture/book-overview-video-disclosure';
import { ScriptureEntityRegion } from '@/components/scripture/scripture-entity-region';
import { ScripturePageIntroCard } from '@/components/scripture/scripture-page-intro-card';
import { ScriptureSection } from '@/components/scripture/scripture-section';
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
import ScriptureLayout from '@/layouts/scripture-layout';
import type { BooksIndexProps, BreadcrumbItem, ScriptureBook } from '@/types';

function BookCard({ book }: { book: ScriptureBook }) {
    const overviewVideo = book.media_slots.overview_video;

    return (
        <ScriptureEntityRegion
            meta={{
                entityType: 'book',
                entityId: book.id,
                entityLabel: book.title,
                region: 'browse_card',
                capabilityHint: 'navigation',
            }}
            asChild
        >
            <Card className="flex h-full flex-col">
                <CardHeader className="space-y-3">
                    <div className="w-fit rounded-md bg-primary/10 p-2 text-primary">
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
                    {overviewVideo && (
                        <BookOverviewVideoDisclosure slot={overviewVideo} />
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
        </ScriptureEntityRegion>
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
            <ScripturePageIntroCard
                badges={
                    <>
                        <Badge variant="outline">Library</Badge>
                        <Badge variant="secondary">
                            {books.length} book{books.length === 1 ? '' : 's'}
                        </Badge>
                    </>
                }
                title="Scripture Library"
                description="Browse the available books and enter each reading journey from its canonical book page."
            />

            <ScriptureSection
                title="Available Books"
                description="Choose a book to open its overview, sections, and chapters."
            >
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                    {books.map((book) => (
                        <BookCard key={book.id} book={book} />
                    ))}
                </div>
            </ScriptureSection>
        </ScriptureLayout>
    );
}
