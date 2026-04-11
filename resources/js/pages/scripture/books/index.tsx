import { AdminModuleHost } from '@/admin/core/AdminModuleHost';
import { resolveBooksCollectionSurface } from '@/admin/integrations/sections';
import { ScriptureBookLibraryGrid } from '@/components/scripture/scripture-book-library-grid';
import { ScripturePageIntroCard } from '@/components/scripture/scripture-page-intro-card';
import { ScriptureSection } from '@/components/scripture/scripture-section';
import { Badge } from '@/components/ui/badge';
import { useVisibleAdminControls } from '@/hooks/use-admin-context';
import ScriptureLayout from '@/layouts/scripture-layout';
import type { BooksIndexProps, BreadcrumbItem } from '@/types';

const CARD_PANEL_CLASS_NAME =
    'flex flex-wrap items-center gap-2 rounded-2xl border border-border/70 bg-muted/20 p-3';

export default function BooksIndex({ books, isAdmin, admin }: BooksIndexProps) {
    const showAdminControls = useVisibleAdminControls();
    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Books',
            href: '/books',
        },
    ];
    const libraryCollectionSurface = resolveBooksCollectionSurface({
        bookCount: books.length,
        admin,
        enabled: showAdminControls,
    });

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
                description="Browse the available books and enter each reading path from its canonical book page."
            >
                {libraryCollectionSurface && (
                    <AdminModuleHost
                        surface={libraryCollectionSurface}
                        className={CARD_PANEL_CLASS_NAME}
                    />
                )}
            </ScripturePageIntroCard>

            <ScriptureSection
                title="Available Books"
                description="Choose a book to open its canonical structure, then continue into sections and chapters."
            >
                <ScriptureBookLibraryGrid
                    books={books}
                    showAdminControls={showAdminControls}
                    panelClassName={CARD_PANEL_CLASS_NAME}
                />
            </ScriptureSection>
        </ScriptureLayout>
    );
}

