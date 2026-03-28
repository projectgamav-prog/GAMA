import { AdminModuleHost } from '@/admin/core/AdminModuleHost';
import { resolveBookHeaderSurfaces } from '@/admin/integrations/scripture/books';
import { ScriptureAdminModeBar } from '@/components/scripture/scripture-admin-mode-bar';
import { BookPublicMediaSection } from '@/components/scripture/book-public-media-section';
import { ScriptureBookContentBlockRegion } from '@/components/scripture/scripture-book-content-block-region';
import { ScripturePageIntroCard } from '@/components/scripture/scripture-page-intro-card';
import { ScriptureReadingNavigationActions } from '@/components/scripture/scripture-reading-navigation-actions';
import { Badge } from '@/components/ui/badge';
import ScriptureLayout from '@/layouts/scripture-layout';
import type { BookOverviewProps, BreadcrumbItem } from '@/types';

const PANEL_CLASS_NAME =
    'flex flex-wrap items-center gap-2 rounded-2xl border border-border/70 bg-muted/20 p-3';

export default function BookOverview({
    book,
    content_blocks,
    isAdmin,
    admin,
}: BookOverviewProps) {
    const bookEntity = {
        entityType: 'book' as const,
        entityId: book.id,
        entityLabel: book.title,
    };
    const { introSurface } = resolveBookHeaderSurfaces({
        book,
        admin,
        enabled: isAdmin,
    });
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
            <ScriptureAdminModeBar />

            <ScripturePageIntroCard
                entityMeta={{
                    ...bookEntity,
                    region: 'book_intro',
                    capabilityHint: 'intro',
                }}
                badges={
                    <>
                        <Badge variant="outline">Overview</Badge>
                        <Badge variant="secondary">Editorial</Badge>
                    </>
                }
                title={book.title}
                description={book.description ?? undefined}
                contentClassName="space-y-6"
            >
                {introSurface && (
                    <AdminModuleHost
                        surface={introSurface}
                        className={PANEL_CLASS_NAME}
                    />
                )}

                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <p className="max-w-2xl text-sm leading-6 text-muted-foreground">
                        Read the book-level introduction and supporting
                        editorial context, then continue into the canonical
                        scripture structure when you are ready.
                    </p>

                    <ScriptureReadingNavigationActions
                        className="shrink-0"
                        actions={[
                            {
                                kind: 'continue_to_structure',
                                href: book.href,
                            },
                        ]}
                    />
                </div>
            </ScripturePageIntroCard>

            <BookPublicMediaSection
                book={book}
                admin={admin}
                isAdmin={isAdmin}
            />

            <ScriptureBookContentBlockRegion
                book={book}
                blocks={content_blocks}
                isAdmin={isAdmin}
                admin={admin}
                title="Overview Content"
                description="Curated book-level content published through the existing content block system."
                emptyState={
                    <div className="space-y-4 rounded-2xl border border-dashed border-border/80 bg-muted/20 px-5 py-5 text-sm leading-6 text-muted-foreground sm:px-6 sm:py-6">
                        <p>
                            Published content blocks have not been added to this
                            book overview yet.
                        </p>
                        <ScriptureReadingNavigationActions
                            actions={[
                                {
                                    kind: 'continue_to_structure',
                                    href: book.href,
                                },
                            ]}
                        />
                    </div>
                }
            />
        </ScriptureLayout>
    );
}

