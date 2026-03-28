import { Link } from '@inertiajs/react';
import { BookOpenText } from 'lucide-react';
import { AdminModuleHost } from '@/admin/core/AdminModuleHost';
import {
    resolveBookHeaderSurfaces,
} from '@/admin/integrations/scripture/books';
import {
    resolveBookChapterGroupsSurface,
    resolveBookSectionChapterGroupSurface,
} from '@/admin/integrations/sections';
import { BookPublicMediaSection } from '@/components/scripture/book-public-media-section';
import { ScriptureBookContentBlockRegion } from '@/components/scripture/scripture-book-content-block-region';
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
import type { BookShowProps, BreadcrumbItem } from '@/types';

const PANEL_CLASS_NAME =
    'flex flex-wrap items-center gap-2 rounded-2xl border border-border/70 bg-muted/20 p-3';

export default function BookShow({
    book,
    content_blocks,
    isAdmin,
    admin,
    book_sections,
}: BookShowProps) {
    const hidesGenericSingleSection = hidesSingleGenericSection(book_sections);
    const bookEntity = {
        entityType: 'book' as const,
        entityId: book.id,
        entityLabel: book.title,
    };
    const { identitySurface, introSurface } = resolveBookHeaderSurfaces({
        book,
        admin,
        enabled: isAdmin,
    });
    const chapterGroupsSurface = resolveBookChapterGroupsSurface({
        book,
        bookSections: book_sections,
        admin,
        enabled: isAdmin,
    });
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
                    region: 'book_intro',
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
                contentClassName="space-y-4"
            >
                {(identitySurface || introSurface) && (
                    <div className="space-y-3">
                        {identitySurface && (
                            <AdminModuleHost
                                surface={identitySurface}
                                className={PANEL_CLASS_NAME}
                            />
                        )}
                        {introSurface && (
                            <AdminModuleHost
                                surface={introSurface}
                                className={PANEL_CLASS_NAME}
                            />
                        )}
                    </div>
                )}
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
                {chapterGroupsSurface && (
                    <div className="mb-4">
                        <AdminModuleHost
                            surface={chapterGroupsSurface}
                            className={PANEL_CLASS_NAME}
                        />
                    </div>
                )}
                <div className="space-y-4">
                    {book_sections.map((section) => {
                        const sectionTitle = hidesGenericSingleSection
                            ? 'Chapters'
                            : sectionLabel(section.number, section.title);
                        const sectionGroupSurface =
                            resolveBookSectionChapterGroupSurface({
                                bookSection: section,
                                title: sectionTitle,
                                enabled: isAdmin && admin !== null && admin !== undefined,
                            });

                        return (
                            <ScriptureEntityRegion
                                key={section.id}
                                meta={{
                                    entityType: 'book_section',
                                    entityId: section.id,
                                    entityLabel: sectionTitle,
                                    region: 'canonical_browse_section',
                                    capabilityHint: 'navigation',
                                }}
                                asChild
                            >
                                <Card id={sectionAnchorId(section.slug)}>
                                    <CardHeader className="space-y-3">
                                        {sectionGroupSurface && (
                                            <AdminModuleHost
                                                surface={sectionGroupSurface}
                                                className={PANEL_CLASS_NAME}
                                            />
                                        )}
                                        <div className="space-y-2">
                                            <CardTitle>{sectionTitle}</CardTitle>
                                            <CardDescription>
                                                {section.chapters.length} chapter
                                                {section.chapters.length === 1
                                                    ? ''
                                                    : 's'}
                                            </CardDescription>
                                        </div>
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
                        );
                    })}
                </div>
            </ScriptureSection>
        </ScriptureLayout>
    );
}

