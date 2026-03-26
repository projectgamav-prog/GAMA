import { Link } from '@inertiajs/react';
import { ArrowRight, BookOpenText } from 'lucide-react';
import { ScriptureActionRow } from '@/components/scripture/scripture-action-row';
import { ScriptureAdminRegionToolbar } from '@/components/scripture/scripture-admin-region-toolbar';
import { ScriptureAdminVisibilityToggle } from '@/components/scripture/scripture-admin-visibility-toggle';
import { ScriptureBookAdminEditSheet } from '@/components/scripture/scripture-book-admin-edit-sheet';
import { BookPublicMediaSection } from '@/components/scripture/book-public-media-section';
import { ScriptureContentBlocksSection } from '@/components/scripture/scripture-content-blocks-section';
import { ScriptureEmptyState } from '@/components/scripture/scripture-empty-state';
import { ScripturePageIntroCard } from '@/components/scripture/scripture-page-intro-card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useBookAdminEditSession } from '@/hooks/use-book-admin-edit-session';
import ScriptureLayout from '@/layouts/scripture-layout';
import type { BookOverviewProps, BreadcrumbItem } from '@/types';

export default function BookOverview({
    book,
    content_blocks,
    admin,
}: BookOverviewProps) {
    const bookEntity = {
        entityType: 'book' as const,
        entityId: book.id,
        entityLabel: book.title,
    };
    const {
        editSession,
        closeEditSession,
        detailsConfig,
        contentBlocksMeta,
        getContentBlockConfig,
        openDetailsEditor,
        openContentBlockEditor,
        openContentBlockCreator,
        openContentBlockCreatorAtSectionStart,
    } = useBookAdminEditSession({
        book,
        admin,
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
            <ScripturePageIntroCard
                entityMeta={{
                    ...bookEntity,
                    region: 'page_intro',
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
                headerAction={
                    <>
                        <ScriptureAdminVisibilityToggle />
                        {detailsConfig && (
                            <ScriptureAdminRegionToolbar
                                config={detailsConfig}
                                onEdit={openDetailsEditor}
                            />
                        )}
                    </>
                }
                contentClassName="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
            >
                <p className="max-w-2xl text-sm leading-6 text-muted-foreground">
                    Read the book-level introduction and supporting editorial
                    context, then continue into the canonical scripture
                    structure when you are ready.
                </p>

                <ScriptureActionRow className="shrink-0">
                    <Button asChild>
                        <Link href={book.href}>
                            Continue to Scripture Structure
                            <ArrowRight className="size-4" />
                        </Link>
                    </Button>
                </ScriptureActionRow>
            </ScripturePageIntroCard>

            <BookPublicMediaSection book={book} admin={admin} />

            {content_blocks.length > 0 ? (
                <ScriptureContentBlocksSection
                    title="Overview Content"
                    description="Curated book-level content published through the existing content block system."
                    blocks={content_blocks}
                    onInsertBlock={
                        admin
                            ? (insertion) =>
                                  openContentBlockCreator(
                                      contentBlocksMeta,
                                      insertion,
                                  )
                            : undefined
                    }
                    renderBlockHeaderAction={(block) => {
                        const config = getContentBlockConfig(block);

                        if (config === null) {
                            return null;
                        }

                        return (
                            <ScriptureAdminRegionToolbar
                                config={config}
                                onEdit={(meta, regionConfig) =>
                                    openContentBlockEditor(
                                        meta,
                                        block,
                                        regionConfig,
                                    )
                                }
                            />
                        );
                    }}
                    entityMeta={{
                        ...contentBlocksMeta,
                        entityId: book.id,
                    }}
                />
            ) : (
                <ScriptureEmptyState
                    title="Overview In Progress"
                    description="Editorial introduction blocks have not been published for this book yet. You can still enter the canonical scripture structure now."
                    icon={BookOpenText}
                    action={
                        <div className="flex flex-wrap gap-3">
                            {admin && (
                                <Button
                                    type="button"
                                    variant="secondary"
                                    onClick={
                                        openContentBlockCreatorAtSectionStart
                                    }
                                >
                                    Add first block
                                </Button>
                            )}
                            <Button asChild variant="outline">
                                <Link href={book.href}>
                                    Open Book Structure
                                </Link>
                            </Button>
                        </div>
                    }
                />
            )}

            <ScriptureBookAdminEditSheet
                session={editSession}
                onOpenChange={(open) => {
                    if (!open) {
                        closeEditSession();
                    }
                }}
            />
        </ScriptureLayout>
    );
}
