import { Link } from '@inertiajs/react';
import { ArrowRight } from 'lucide-react';
import { AdminModuleHost } from '@/admin/modules/shared';
import { ScriptureActionRow } from '@/components/scripture/scripture-action-row';
import { ScriptureAdminModeBar } from '@/components/scripture/scripture-admin-mode-bar';
import { BookPublicMediaSection } from '@/components/scripture/book-public-media-section';
import { ScriptureContentBlocksSection } from '@/components/scripture/scripture-content-blocks-section';
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
        inlineIntroSession,
        inlineCreateTextContentBlockSession,
        getInlineTextContentBlockSession,
        closeEditSession,
        introSurface,
        contentBlocksCapabilities,
        contentBlocksMeta,
        handleIntroSaveSuccess,
        handleContentBlockSaveSuccess,
        handleContentBlockCreateSuccess,
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
            <ScriptureAdminModeBar />

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
                description={
                    inlineIntroSession ? undefined : (book.description ?? undefined)
                }
                adminSurface={introSurface ?? undefined}
                contentClassName="space-y-6"
            >
                <AdminModuleHost
                    surface={{
                        entity: 'book',
                        entityId: book.id,
                        slot: 'inline_editor',
                        regionKey: 'page_intro',
                        capabilities: ['edit', 'full_edit'],
                        metadata: {
                            session: inlineIntroSession,
                            onCancel: closeEditSession,
                            onSaveSuccess: handleIntroSaveSuccess,
                        },
                    }}
                />

                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <p className="max-w-2xl text-sm leading-6 text-muted-foreground">
                        Read the book-level introduction and supporting
                        editorial context, then continue into the canonical
                        scripture structure when you are ready.
                    </p>

                    <ScriptureActionRow className="shrink-0">
                        <Button asChild>
                            <Link href={book.href}>
                                Continue to Scripture Structure
                                <ArrowRight className="size-4" />
                            </Link>
                        </Button>
                    </ScriptureActionRow>
                </div>
            </ScripturePageIntroCard>

            <BookPublicMediaSection book={book} admin={admin} />

            <ScriptureContentBlocksSection
                title="Overview Content"
                description="Curated book-level content published through the existing content block system."
                blocks={content_blocks}
                capabilities={contentBlocksCapabilities}
                pendingInlineCreateInsertionPoint={
                    inlineCreateTextContentBlockSession?.insertionPoint ?? null
                }
                renderPendingInlineCreateEditor={() =>
                    inlineCreateTextContentBlockSession ? (
                        <AdminModuleHost
                            surface={{
                                entity: 'book',
                                entityId: book.id,
                                slot: 'inline_editor',
                                regionKey: 'content_blocks',
                                blockType: 'text',
                                capabilities: ['add_block', 'full_edit'],
                                metadata: {
                                    session: inlineCreateTextContentBlockSession,
                                    entityLabel: book.title,
                                    onCancel: closeEditSession,
                                    onSaveSuccess: (result: {
                                        kind: 'create' | 'edit';
                                    }) => {
                                        if (result.kind === 'create') {
                                            handleContentBlockCreateSuccess();
                                        }
                                    },
                                },
                            }}
                        />
                    ) : null
                }
                renderInlineBlockEditor={(block) => {
                    const inlineSession = getInlineTextContentBlockSession(
                        block.id,
                    );

                    return (
                        <AdminModuleHost
                            surface={{
                                entity: 'content_block',
                                entityId: block.id,
                                slot: 'inline_editor',
                                regionKey: 'content_blocks',
                                blockType: block.block_type,
                                owner: {
                                    entity: 'book',
                                    entityId: book.id,
                                },
                                capabilities: ['edit', 'full_edit'],
                                metadata: {
                                    session: inlineSession,
                                    entityLabel: book.title,
                                    onCancel: closeEditSession,
                                    onSaveSuccess: (result: {
                                        kind: 'create' | 'edit';
                                        blockId?: number;
                                    }) => {
                                        if (
                                            result.kind === 'edit' &&
                                            result.blockId !== undefined
                                        ) {
                                            handleContentBlockSaveSuccess(
                                                result.blockId,
                                            );
                                        }
                                    },
                                },
                            }}
                        />
                    );
                }}
                emptyStateAction={
                    <div className="flex flex-wrap gap-3">
                        <Button asChild variant="outline">
                            <Link href={book.href}>Open Book Structure</Link>
                        </Button>
                    </div>
                }
                entityMeta={{
                    ...contentBlocksMeta,
                    entityId: book.id,
                }}
            />

            <AdminModuleHost
                surface={{
                    entity: 'book',
                    entityId: book.id,
                    slot: 'sheet_editor',
                    regionKey:
                        editSession?.kind === 'entity_details'
                            ? 'page_intro'
                            : 'content_blocks',
                    blockType:
                        editSession?.kind === 'content_block'
                            ? editSession.block.block_type
                            : editSession?.kind === 'create_content_block'
                              ? editSession.values.block_type
                              : null,
                    capabilities: editSession
                        ? editSession.kind === 'create_content_block'
                            ? ['add_block', 'full_edit']
                            : ['edit', 'full_edit']
                        : [],
                    metadata: {
                        session: editSession,
                        onOpenChange: (open: boolean) => {
                            if (!open) {
                                closeEditSession();
                            }
                        },
                    },
                }}
            />
        </ScriptureLayout>
    );
}
