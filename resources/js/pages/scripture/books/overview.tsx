import { Link } from '@inertiajs/react';
import { ArrowRight, BookOpenText } from 'lucide-react';
import { useState } from 'react';
import { ScriptureActionRow } from '@/components/scripture/scripture-action-row';
import { ScriptureAdminRegionToolbar } from '@/components/scripture/scripture-admin-region-toolbar';
import { ScriptureAdminVisibilityToggle } from '@/components/scripture/scripture-admin-visibility-toggle';
import { ScriptureBookAdminEditSheet } from '@/components/scripture/scripture-book-admin-edit-sheet';
import type { ScriptureBookAdminEditSession } from '@/components/scripture/scripture-book-admin-edit-sheet';
import { ScriptureContentBlocksSection } from '@/components/scripture/scripture-content-blocks-section';
import { ScriptureEmptyState } from '@/components/scripture/scripture-empty-state';
import { ScripturePageIntroCard } from '@/components/scripture/scripture-page-intro-card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import ScriptureLayout from '@/layouts/scripture-layout';
import type {
    BookOverviewProps,
    BreadcrumbItem,
    ScriptureAdminRegionConfig,
    ScriptureContentBlock,
    ScriptureEntityRegionMeta,
} from '@/types';

export default function BookOverview({
    book,
    content_blocks,
    admin,
}: BookOverviewProps) {
    const [editSession, setEditSession] =
        useState<ScriptureBookAdminEditSession | null>(null);
    const bookEntity = {
        entityType: 'book' as const,
        entityId: book.id,
        entityLabel: book.title,
    };
    const detailsConfig: ScriptureAdminRegionConfig | null = admin
        ? {
              supportsEdit: true,
              supportsFullEdit: true,
              editTarget: 'entity_details',
              contextualEditHref: admin.details_update_href,
              fullEditHref: `${admin.full_edit_href}#details-editor`,
          }
        : null;
    const openDetailsEditor = (
        meta: ScriptureEntityRegionMeta,
        config: ScriptureAdminRegionConfig,
    ) => {
        if (!config.contextualEditHref) {
            return;
        }

        setEditSession({
            kind: 'entity_details',
            meta,
            updateHref: config.contextualEditHref,
            fullEditHref: config.fullEditHref ?? admin?.full_edit_href ?? '#',
            bookTitle: book.title,
            bookDescription: book.description ?? null,
            values: {
                description: book.description ?? '',
            },
        });
    };
    const getContentBlockConfig = (
        block: ScriptureContentBlock,
    ): ScriptureAdminRegionConfig | null => {
        const updateHref = admin?.content_block_update_hrefs[String(block.id)];

        if (!updateHref || !admin) {
            return null;
        }

        return {
            supportsEdit: true,
            supportsFullEdit: true,
            editTarget: 'content_block',
            contextualEditHref: updateHref,
            fullEditHref: `${admin.full_edit_href}#block-${block.id}`,
        };
    };
    const openContentBlockEditor = (
        meta: ScriptureEntityRegionMeta,
        block: ScriptureContentBlock,
        config: ScriptureAdminRegionConfig,
    ) => {
        if (!config.contextualEditHref) {
            return;
        }

        setEditSession({
            kind: 'content_block',
            meta,
            updateHref: config.contextualEditHref,
            fullEditHref: config.fullEditHref ?? admin?.full_edit_href ?? '#',
            bookTitle: book.title,
            block,
            values: {
                block_type: block.block_type as 'text' | 'quote',
                title: block.title ?? '',
                body: block.body ?? '',
                region: block.region,
                sort_order: block.sort_order,
                status: 'published',
            },
        });
    };
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

            {content_blocks.length > 0 ? (
                <ScriptureContentBlocksSection
                    title="Overview Content"
                    description="Curated book-level content published through the existing content block system."
                    blocks={content_blocks}
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
                        ...bookEntity,
                        region: 'content_blocks',
                        capabilityHint: 'content_blocks',
                    }}
                />
            ) : (
                <ScriptureEmptyState
                    title="Overview In Progress"
                    description="Editorial introduction blocks have not been published for this book yet. You can still enter the canonical scripture structure now."
                    icon={BookOpenText}
                    action={
                        <Button asChild variant="outline">
                            <Link href={book.href}>Open Book Structure</Link>
                        </Button>
                    }
                />
            )}

            <ScriptureBookAdminEditSheet
                session={editSession}
                onOpenChange={(open) => {
                    if (!open) {
                        setEditSession(null);
                    }
                }}
            />
        </ScriptureLayout>
    );
}
