import { Link } from '@inertiajs/react';
import { BookOpenText } from 'lucide-react';
import { useState } from 'react';
import { ScriptureAdminRegionToolbar } from '@/components/scripture/scripture-admin-region-toolbar';
import { ScriptureAdminVisibilityToggle } from '@/components/scripture/scripture-admin-visibility-toggle';
import { ScriptureBookAdminEditSheet } from '@/components/scripture/scripture-book-admin-edit-sheet';
import type { ScriptureBookAdminEditSession } from '@/components/scripture/scripture-book-admin-edit-sheet';
import { ScriptureContentBlocksSection } from '@/components/scripture/scripture-content-blocks-section';
import { ScriptureEntityRegion } from '@/components/scripture/scripture-entity-region';
import { ScripturePageIntroCard } from '@/components/scripture/scripture-page-intro-card';
import { ScriptureSection } from '@/components/scripture/scripture-section';
import { Badge } from '@/components/ui/badge';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import ScriptureLayout from '@/layouts/scripture-layout';
import {
    chapterLabel,
    hidesSingleGenericSection,
    sectionAnchorId,
    sectionLabel,
} from '@/lib/scripture';
import type {
    BookShowProps,
    BreadcrumbItem,
    ScriptureAdminRegionConfig,
    ScriptureContentBlock,
    ScriptureEntityRegionMeta,
} from '@/types';

export default function BookShow({
    book,
    content_blocks,
    admin,
    book_sections,
}: BookShowProps) {
    const [editSession, setEditSession] =
        useState<ScriptureBookAdminEditSession | null>(null);
    const hidesGenericSingleSection = hidesSingleGenericSection(book_sections);
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
            title: book.title,
            href: book.href,
        },
    ];

    return (
        <ScriptureLayout title={book.title} breadcrumbs={breadcrumbs}>
            <ScripturePageIntroCard
                entityMeta={{
                    ...bookEntity,
                    region: 'page_intro',
                    capabilityHint: 'intro',
                }}
                badges={
                    <>
                        <Badge variant="outline">Book</Badge>
                        <Badge variant="secondary">
                            {book_sections.length} section
                            {book_sections.length === 1 ? '' : 's'}
                        </Badge>
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
            />

            <ScriptureContentBlocksSection
                title="Reading Notes"
                description="Published study content attached to this book."
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

            <ScriptureSection
                entityMeta={{
                    entityType: 'book',
                    entityId: book.id,
                    entityLabel: book.title,
                    region: 'canonical_browse',
                    capabilityHint: 'navigation',
                }}
                title="Canonical Browse"
                description={
                    hidesGenericSingleSection
                        ? 'Browse this book chapter by chapter.'
                        : 'Browse from the book into its canonical sections and chapters.'
                }
            >
                <div className="space-y-4">
                    {book_sections.map((section) => (
                        <ScriptureEntityRegion
                            key={section.id}
                            meta={{
                                entityType: 'book_section',
                                entityId: section.id,
                                entityLabel: hidesGenericSingleSection
                                    ? 'Chapters'
                                    : sectionLabel(
                                          section.number,
                                          section.title,
                                      ),
                                region: 'canonical_browse_section',
                                capabilityHint: 'navigation',
                            }}
                            asChild
                        >
                            <Card id={sectionAnchorId(section.slug)}>
                                <CardHeader>
                                    <CardTitle>
                                        {hidesGenericSingleSection
                                            ? 'Chapters'
                                            : sectionLabel(
                                                  section.number,
                                                  section.title,
                                              )}
                                    </CardTitle>
                                    <CardDescription>
                                        {section.chapters.length} chapter
                                        {section.chapters.length === 1
                                            ? ''
                                            : 's'}
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid gap-3 md:grid-cols-2">
                                        {section.chapters.map((chapter) => (
                                            <ScriptureEntityRegion
                                                key={chapter.id}
                                                meta={{
                                                    entityType: 'chapter',
                                                    entityId: chapter.id,
                                                    entityLabel: chapterLabel(
                                                        chapter.number,
                                                        chapter.title,
                                                    ),
                                                    region: 'canonical_browse_chapter',
                                                    capabilityHint:
                                                        'navigation',
                                                }}
                                                asChild
                                            >
                                                <Link
                                                    href={chapter.href}
                                                    className="group rounded-lg border p-4 transition-colors hover:border-primary"
                                                >
                                                    <div className="flex items-start gap-3">
                                                        <div className="rounded-md bg-primary/10 p-2 text-primary">
                                                            <BookOpenText className="size-4" />
                                                        </div>
                                                        <div className="space-y-1">
                                                            <p className="font-medium group-hover:text-primary">
                                                                {chapterLabel(
                                                                    chapter.number,
                                                                    chapter.title,
                                                                )}
                                                            </p>
                                                            <p className="text-sm text-muted-foreground">
                                                                Open chapter
                                                                overview
                                                            </p>
                                                        </div>
                                                    </div>
                                                </Link>
                                            </ScriptureEntityRegion>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        </ScriptureEntityRegion>
                    ))}
                </div>
            </ScriptureSection>

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
