import { AdminModuleHost } from '@/admin/core/AdminModuleHost';
import {
    resolveBookHeaderSurfaces,
} from '@/admin/integrations/scripture/books';
import { BookPublicMediaSection } from '@/components/scripture/book-public-media-section';
import { ScriptureBookChapterList } from '@/components/scripture/scripture-book-chapter-list';
import { ScriptureBookContentBlockRegion } from '@/components/scripture/scripture-book-content-block-region';
import { ScripturePageIntroCard } from '@/components/scripture/scripture-page-intro-card';
import { Badge } from '@/components/ui/badge';
import ScriptureLayout from '@/layouts/scripture-layout';
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

            <ScriptureBookChapterList
                book={book}
                bookSections={book_sections}
                showAdminControls={isAdmin}
                admin={admin}
                panelClassName={PANEL_CLASS_NAME}
            />
        </ScriptureLayout>
    );
}

