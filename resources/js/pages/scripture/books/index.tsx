import { Link } from '@inertiajs/react';
import { ChevronRight } from 'lucide-react';
import { AdminModuleHost } from '@/admin/core/AdminModuleHost';
import { resolveBooksCollectionSurface } from '@/admin/integrations/sections';
import { ScriptureBookLibraryGrid } from '@/components/scripture/scripture-book-library-grid';
import {
    ChronicleEditorialGrid,
    ChroniclePaperPanel,
    ChronicleSectionHeading,
    ChronicleSideRail,
} from '@/components/site/chronicle-primitives';
import { Button } from '@/components/ui/button';
import { useVisibleAdminControls } from '@/hooks/use-admin-context';
import ScriptureLayout from '@/layouts/scripture-layout';
import { buildBooksIndexDescriptorModel } from '@/rendering/adapters/books-index-page-adapter';
import { UniversalSectionStack } from '@/rendering/core';
import type { BooksIndexProps, BreadcrumbItem } from '@/types';

const CARD_PANEL_CLASS_NAME =
    'chronicle-admin-surface flex flex-wrap gap-1.5 p-1';

export default function BooksIndex({ books, admin }: BooksIndexProps) {
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
    const pageModel = buildBooksIndexDescriptorModel({ books, breadcrumbs });

    return (
        <ScriptureLayout title="Books" breadcrumbs={breadcrumbs}>
            <ChroniclePaperPanel className="grid gap-5 p-5 sm:p-7 lg:grid-cols-[1fr_auto] lg:items-end">
                <div className="space-y-3">
                    <p className="chronicle-kicker">Scriptures</p>
                    <h1 className="chronicle-feature-title">
                        Scripture Library
                    </h1>
                    <p className="max-w-2xl text-base leading-7 text-[color:var(--chronicle-brown)]">
                        Browse the sacred books, organized for study and
                        reading.
                    </p>
                </div>
                {libraryCollectionSurface && (
                    <AdminModuleHost
                        surface={libraryCollectionSurface}
                        className={CARD_PANEL_CLASS_NAME}
                    />
                )}
            </ChroniclePaperPanel>

            <ChronicleEditorialGrid>
                <main className="space-y-5">
                    {pageModel.featuredBook && (
                        <ChroniclePaperPanel className="grid gap-5 p-5 md:grid-cols-[10rem_1fr_auto] md:items-center">
                            <div
                                aria-hidden="true"
                                className="min-h-28 rounded-sm border border-[color:var(--chronicle-border)] bg-[radial-gradient(circle_at_50%_48%,rgba(173,122,44,0.22),transparent_0.5rem),linear-gradient(135deg,rgba(255,248,235,0.35),rgba(104,69,31,0.12))]"
                            />
                            <div className="space-y-2">
                                <p className="chronicle-kicker">
                                    Featured Collection
                                </p>
                                <h2 className="chronicle-title text-3xl">
                                    The Life & Teachings of Jesus
                                </h2>
                                <p className="text-sm leading-6 text-[color:var(--chronicle-ink)]">
                                    Journey through the narrative of hope,
                                    redemption, and eternal life.
                                </p>
                            </div>
                            <div className="space-y-3 md:min-w-44">
                                <p className="text-sm text-[color:var(--chronicle-brown)]">
                                    {Math.min(4, books.length)} Books
                                </p>
                                <Button
                                    asChild
                                    className="chronicle-button w-full rounded-sm"
                                >
                                    <Link href={pageModel.featuredBook.href}>
                                        Explore Collection
                                        <ChevronRight className="size-4" />
                                    </Link>
                                </Button>
                            </div>
                        </ChroniclePaperPanel>
                    )}

                    {pageModel.groupedBooks.map((group) => {
                        const Icon = group.icon;

                        return (
                            <ChroniclePaperPanel
                                key={group.label}
                                className="space-y-4 p-4"
                            >
                                <ChronicleSectionHeading
                                    title={
                                        <span className="flex items-center gap-2">
                                            <Icon className="size-5 text-[color:var(--chronicle-gold)]" />
                                            {group.label}
                                        </span>
                                    }
                                    action={
                                        <span className="chronicle-link text-xs">
                                            View All ({group.books.length})
                                        </span>
                                    }
                                />
                                <ScriptureBookLibraryGrid
                                    books={group.books}
                                    showAdminControls={showAdminControls}
                                    panelClassName={CARD_PANEL_CLASS_NAME}
                                />
                            </ChroniclePaperPanel>
                        );
                    })}
                </main>

                <ChronicleSideRail>
                    <UniversalSectionStack
                        sections={pageModel.railSections}
                        renderContext={pageModel.railRenderContext}
                    />
                </ChronicleSideRail>
            </ChronicleEditorialGrid>
        </ScriptureLayout>
    );
}
