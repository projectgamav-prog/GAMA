import { Link } from '@inertiajs/react';
import { BookOpenText } from 'lucide-react';
import { ScriptureAdminModeBar } from '@/components/scripture/scripture-admin-mode-bar';
import { ScriptureBookAdminEditSheet } from '@/components/scripture/scripture-book-admin-edit-sheet';
import { ScriptureBookIntroInlineEditor } from '@/components/scripture/scripture-book-intro-inline-editor';
import { BookPublicMediaSection } from '@/components/scripture/book-public-media-section';
import { ScriptureContentBlocksSection } from '@/components/scripture/scripture-content-blocks-section';
import { ScriptureEntityRegion } from '@/components/scripture/scripture-entity-region';
import { ScripturePageIntroCard } from '@/components/scripture/scripture-page-intro-card';
import { ScriptureSection } from '@/components/scripture/scripture-section';
import { ScriptureTextContentBlockInlineEditor } from '@/components/scripture/scripture-text-content-block-inline-editor';
import { Badge } from '@/components/ui/badge';
import { useBookAdminEditSession } from '@/hooks/use-book-admin-edit-session';
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
import type { BookShowProps, BreadcrumbItem } from '@/types';

export default function BookShow({
    book,
    content_blocks,
    admin,
    book_sections,
}: BookShowProps) {
    const hidesGenericSingleSection = hidesSingleGenericSection(book_sections);
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
            title: book.title,
            href: book.href,
        },
    ];

    return (
        <ScriptureLayout title={book.title} breadcrumbs={breadcrumbs}>
            <ScriptureAdminModeBar />

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
                description={
                    inlineIntroSession ? undefined : (book.description ?? undefined)
                }
                adminSurface={introSurface ?? undefined}
            >
                <ScriptureBookIntroInlineEditor
                    session={inlineIntroSession}
                    onCancel={closeEditSession}
                    onSaveSuccess={handleIntroSaveSuccess}
                />
            </ScripturePageIntroCard>

            <BookPublicMediaSection book={book} admin={admin} />

            <ScriptureContentBlocksSection
                title="Reading Notes"
                description="Published study content attached to this book."
                blocks={content_blocks}
                capabilities={contentBlocksCapabilities}
                pendingInlineCreateInsertionPoint={
                    inlineCreateTextContentBlockSession?.insertionPoint ?? null
                }
                renderPendingInlineCreateEditor={() =>
                    inlineCreateTextContentBlockSession ? (
                        <ScriptureTextContentBlockInlineEditor
                            session={inlineCreateTextContentBlockSession}
                            entityLabel={book.title}
                            onCancel={closeEditSession}
                            onSaveSuccess={(result) => {
                                if (result.kind === 'create') {
                                    handleContentBlockCreateSuccess();
                                }
                            }}
                        />
                    ) : null
                }
                renderInlineBlockEditor={(block) => {
                    const inlineSession = getInlineTextContentBlockSession(
                        block.id,
                    );

                    return inlineSession ? (
                        <ScriptureTextContentBlockInlineEditor
                            session={inlineSession}
                            entityLabel={book.title}
                            onCancel={closeEditSession}
                            onSaveSuccess={(result) => {
                                if (result.kind === 'edit') {
                                    handleContentBlockSaveSuccess(
                                        result.blockId,
                                    );
                                }
                            }}
                        />
                    ) : null;
                }}
                entityMeta={{
                    ...contentBlocksMeta,
                    entityId: book.id,
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
                        closeEditSession();
                    }
                }}
            />
        </ScriptureLayout>
    );
}
