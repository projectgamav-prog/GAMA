import { Link } from '@inertiajs/react';
import { BookOpenText } from 'lucide-react';
import { AdminModuleHost } from '@/admin/core/AdminModuleHost';
import { resolveBookCardIntroSurface } from '@/admin/integrations/scripture/books';
import { BookOverviewVideoDisclosure } from '@/components/scripture/book-overview-video-disclosure';
import { ScriptureEntityRegion } from '@/components/scripture/scripture-entity-region';
import { SCRIPTURE_INLINE_ADMIN_PANEL_CLASS_NAME } from '@/components/scripture/scripture-section-group-wrapper';
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
    resolveScriptureNavigationAction,
} from '@/lib/scripture-navigation-actions';
import type { ScriptureBook } from '@/types';

const DEFAULT_PANEL_CLASS_NAME = SCRIPTURE_INLINE_ADMIN_PANEL_CLASS_NAME;

type Props = {
    books: ScriptureBook[];
    showAdminControls: boolean;
    panelClassName?: string;
};

function ScriptureBookLibraryCard({
    book,
    showAdminControls,
    panelClassName,
}: {
    book: ScriptureBook;
    showAdminControls: boolean;
    panelClassName: string;
}) {
    const overviewVideo = book.media_slots.overview_video;
    const introSurface = resolveBookCardIntroSurface({
        book,
        enabled: showAdminControls,
    });
    const overviewAction = resolveScriptureNavigationAction({
        actionKey: 'open_book_overview',
        href: book.overview_href,
    });
    const bookAction = resolveScriptureNavigationAction({
        actionKey: 'open_book',
        href: book.href,
    });
    const OverviewIcon = overviewAction?.icon;
    const BookActionIcon = bookAction?.icon;

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

                <CardContent className="flex-1 space-y-4">
                    {introSurface && (
                        <AdminModuleHost
                            surface={introSurface}
                            className={panelClassName}
                        />
                    )}
                    {overviewVideo && (
                        <BookOverviewVideoDisclosure slot={overviewVideo} />
                    )}
                </CardContent>

                <CardFooter className="flex flex-wrap items-center gap-3">
                    {overviewAction && (
                        <Button asChild variant="outline" size="sm">
                            <Link href={overviewAction.href}>
                                {overviewAction.iconPosition === 'start' &&
                                    OverviewIcon && (
                                        <OverviewIcon className="size-4" />
                                    )}
                                {overviewAction.label}
                                {overviewAction.iconPosition === 'end' &&
                                    OverviewIcon && (
                                        <OverviewIcon className="size-4" />
                                    )}
                            </Link>
                        </Button>
                    )}

                    {bookAction && (
                        <Link
                            href={bookAction.href}
                            className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline"
                        >
                            {bookAction.label}
                            {bookAction.iconPosition === 'end' &&
                                BookActionIcon && (
                                    <BookActionIcon className="size-4" />
                                )}
                        </Link>
                    )}
                </CardFooter>
            </Card>
        </ScriptureEntityRegion>
    );
}

export function ScriptureBookLibraryGrid({
    books,
    showAdminControls,
    panelClassName = DEFAULT_PANEL_CLASS_NAME,
}: Props) {
    return (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {books.map((book) => (
                <ScriptureBookLibraryCard
                    key={book.id}
                    book={book}
                    showAdminControls={showAdminControls}
                    panelClassName={panelClassName}
                />
            ))}
        </div>
    );
}
