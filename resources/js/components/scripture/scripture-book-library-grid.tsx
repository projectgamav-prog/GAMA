import { Link } from '@inertiajs/react';
import { BookOpenText } from 'lucide-react';
import { AdminModuleHost } from '@/admin/core/AdminModuleHost';
import { resolveBookCardIntroSurface } from '@/admin/integrations/scripture/books';
import { ScriptureEntityRegion } from '@/components/scripture/scripture-entity-region';
import { ScriptureIntroDropdown } from '@/components/scripture/scripture-intro-dropdown';
import { SCRIPTURE_INLINE_ADMIN_PANEL_CLASS_NAME } from '@/components/scripture/scripture-section-group-wrapper';
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
            <article className="chronicle-panel flex h-full flex-col rounded-sm p-4 text-center transition hover:-translate-y-0.5 hover:border-[color:var(--chronicle-gold)]">
                <div className="space-y-3">
                    <BookOpenText className="mx-auto size-8 text-[color:var(--chronicle-gold)]" />
                    <h3 className="chronicle-title text-xl leading-tight">
                        {book.title}
                    </h3>
                </div>

                <div className="flex-1 space-y-3 py-4">
                    {introSurface && (
                        <AdminModuleHost
                            surface={introSurface}
                            className={panelClassName}
                        />
                    )}
                    <ScriptureIntroDropdown textValue={book.description} />
                </div>

                <div className="flex flex-wrap items-center justify-center gap-3">
                    {bookAction && (
                        <Link
                            href={bookAction.href}
                            className="chronicle-link inline-flex items-center gap-2 text-xs"
                        >
                            {bookAction.label}
                            {bookAction.iconPosition === 'end' &&
                                BookActionIcon && (
                                    <BookActionIcon className="size-4" />
                                )}
                        </Link>
                    )}
                </div>
            </article>
        </ScriptureEntityRegion>
    );
}

export function ScriptureBookLibraryGrid({
    books,
    showAdminControls,
    panelClassName = DEFAULT_PANEL_CLASS_NAME,
}: Props) {
    return (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
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
