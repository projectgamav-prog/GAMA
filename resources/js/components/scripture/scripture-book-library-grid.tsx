import { Link } from '@inertiajs/react';
import { BookOpenText } from 'lucide-react';
import { AdminModuleHost } from '@/admin/core/AdminModuleHost';
import { resolveBookCardIntroSurface } from '@/admin/integrations/scripture/books';
import { ScriptureEntityRegion } from '@/components/scripture/scripture-entity-region';
import { ScriptureIntroDropdown } from '@/components/scripture/scripture-intro-dropdown';
import { SCRIPTURE_INLINE_ADMIN_PANEL_CLASS_NAME } from '@/components/scripture/scripture-section-group-wrapper';
import {
    Card,
    CardContent,
    CardFooter,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { resolveScriptureNavigationAction } from '@/lib/scripture-navigation-actions';
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
    const introSurface = resolveBookCardIntroSurface({
        book,
        enabled: showAdminControls,
    });
    const bookAction = resolveScriptureNavigationAction({
        actionKey: 'open_book',
        href: book.href,
    });
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
                    <CardTitle>{book.title}</CardTitle>
                </CardHeader>

                <CardContent className="flex-1 space-y-4">
                    {introSurface && (
                        <AdminModuleHost
                            surface={introSurface}
                            className={panelClassName}
                        />
                    )}
                    <ScriptureIntroDropdown textValue={book.description} />
                </CardContent>

                <CardFooter className="flex flex-wrap items-center gap-3">
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
