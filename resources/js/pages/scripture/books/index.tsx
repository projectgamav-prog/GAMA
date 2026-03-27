import { Link } from '@inertiajs/react';
import { ArrowRight, BookOpenText } from 'lucide-react';
import type { ReactNode } from 'react';
import { BookOverviewVideoDisclosure } from '@/components/scripture/book-overview-video-disclosure';
import type { ScriptureAdminSurfaceOptions } from '@/components/scripture/scripture-admin-surface';
import { ScriptureAdminSurface } from '@/components/scripture/scripture-admin-surface';
import { ScriptureEntityRegion } from '@/components/scripture/scripture-entity-region';
import { ScriptureBookIntroInlineEditor } from '@/components/scripture/scripture-book-intro-inline-editor';
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
import { useBookLibraryAdminSession } from '@/hooks/use-book-library-admin-session';
import ScriptureLayout from '@/layouts/scripture-layout';
import type { BooksIndexProps, BreadcrumbItem, ScriptureBook } from '@/types';

function BookCard({
    book,
    adminSurface,
    inlineEditor,
}: {
    book: ScriptureBook;
    adminSurface: ScriptureAdminSurfaceOptions | null;
    inlineEditor?: ReactNode;
}) {
    const overviewVideo = book.media_slots.overview_video;
    const card = (
        <Card className="flex h-full flex-col">
            <CardHeader className="space-y-3">
                <div className="w-fit rounded-md bg-primary/10 p-2 text-primary">
                    <BookOpenText className="size-4" />
                </div>
                <div className="space-y-2">
                    <CardTitle>{book.title}</CardTitle>
                    {!inlineEditor && book.description && (
                        <CardDescription className="line-clamp-3 leading-6">
                            {book.description}
                        </CardDescription>
                    )}
                </div>
            </CardHeader>

            <CardContent className="flex-1 space-y-4">
                {inlineEditor}
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
    );

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
            {adminSurface ? (
                <ScriptureAdminSurface {...adminSurface}>
                    {card}
                </ScriptureAdminSurface>
            ) : (
                card
            )}
        </ScriptureEntityRegion>
    );
}

export default function BooksIndex({ books }: BooksIndexProps) {
    const {
        closeEditSession,
        getBookCardSurface,
        getInlineBookCardSession,
        handleBookCardSaveSuccess,
    } = useBookLibraryAdminSession({
        books,
    });
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
                    {books.map((book) => {
                        const inlineSession = getInlineBookCardSession(book.id);

                        return (
                            <BookCard
                                key={book.id}
                                book={book}
                                adminSurface={getBookCardSurface(book)}
                                inlineEditor={
                                    inlineSession ? (
                                        <ScriptureBookIntroInlineEditor
                                            session={inlineSession}
                                            onCancel={closeEditSession}
                                            onSaveSuccess={() =>
                                                handleBookCardSaveSuccess(
                                                    book.id,
                                                )
                                            }
                                        />
                                    ) : undefined
                                }
                            />
                        );
                    })}
                </div>
            </ScriptureSection>
        </ScriptureLayout>
    );
}
