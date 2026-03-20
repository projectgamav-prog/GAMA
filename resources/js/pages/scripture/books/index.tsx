import { Link } from '@inertiajs/react';
import { ArrowRight, BookOpenText } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import ScriptureLayout from '@/layouts/scripture-layout';
import type { BooksIndexProps, BreadcrumbItem } from '@/types';

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
                        <Card key={book.id} className="flex h-full flex-col">
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
                            <CardContent className="flex-1" />
                            <CardFooter>
                                <Link
                                    href={book.href}
                                    className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline"
                                >
                                    Open Book
                                    <ArrowRight className="size-4" />
                                </Link>
                            </CardFooter>
                        </Card>
                    ))}
                </div>
            </section>
        </ScriptureLayout>
    );
}
