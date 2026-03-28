import { AdminModuleHost } from '@/admin/core/AdminModuleHost';
import { resolveChapterHeaderSurfaces } from '@/admin/integrations/scripture/chapters';
import { ScriptureAdminModeBar } from '@/components/scripture/scripture-admin-mode-bar';
import { ScriptureChapterVerseList } from '@/components/scripture/scripture-chapter-verse-list';
import { ScriptureChapterContentBlockRegion } from '@/components/scripture/scripture-chapter-content-block-region';
import { ContentBlockRenderer } from '@/components/scripture/content-block-renderer';
import { ScripturePageIntroCard } from '@/components/scripture/scripture-page-intro-card';
import { ScriptureReadingNavigationActions } from '@/components/scripture/scripture-reading-navigation-actions';
import { Badge } from '@/components/ui/badge';
import { useVisibleAdminControls } from '@/hooks/use-admin-context';
import ScriptureLayout from '@/layouts/scripture-layout';
import {
    chapterLabel,
    isGenericSectionLabel,
    sectionLabel,
} from '@/lib/scripture';
import type { BreadcrumbItem, ChapterShowProps } from '@/types';

const PANEL_CLASS_NAME =
    'flex flex-wrap items-center gap-2 rounded-2xl border border-border/70 bg-muted/20 p-3';

export default function ChapterShow({
    book,
    book_section,
    chapter,
    content_blocks,
    reader_languages,
    default_language,
    chapter_sections,
    admin,
}: ChapterShowProps) {
    const showAdminControls = useVisibleAdminControls();
    const hidesGenericBookSection = isGenericSectionLabel(
        book_section.slug,
        book_section.title,
    );
    const chapterTitle = chapterLabel(chapter.number, chapter.title);
    const bookSectionTitle = sectionLabel(
        book_section.number,
        book_section.title,
    );
    const chapterEntity = {
        entityType: 'chapter' as const,
        entityId: chapter.id,
        entityLabel: chapterTitle,
        parentEntityType: 'book_section' as const,
        parentEntityId: book_section.id,
    };
    const {
        identitySurface: chapterIdentitySurface,
        introSurface: chapterIntroSurface,
        introBlock: pageIntroBlock,
    } = resolveChapterHeaderSurfaces({
        chapter,
        chapterTitle,
        blocks: content_blocks,
        admin,
        enabled: showAdminControls,
    });
    const chapterNoteBlocks =
        pageIntroBlock === null
            ? content_blocks
            : content_blocks.filter((block) => block.id !== pageIntroBlock.id);
    const totalVerseCount = chapter_sections.reduce(
        (sum, section) =>
            sum +
            section.cards.reduce(
                (cardSum, card) => cardSum + card.verses.length,
                0,
            ),
        0,
    );

    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: book.title,
            href: book.href,
        },
        {
            title: bookSectionTitle,
            href: book_section.href,
        },
        {
            title: chapterTitle,
            href: chapter.href,
        },
    ];

    return (
        <ScriptureLayout title={chapterTitle} breadcrumbs={breadcrumbs}>
            <ScriptureAdminModeBar />

            <ScripturePageIntroCard
                entityMeta={{
                    ...chapterEntity,
                    region: 'page_intro',
                    capabilityHint: 'intro',
                }}
                badges={
                    <>
                        <Badge variant="outline">Chapter</Badge>
                        <Badge variant="secondary">{book.title}</Badge>
                        {!hidesGenericBookSection && (
                            <Badge variant="secondary">
                                {bookSectionTitle}
                            </Badge>
                        )}
                        <Badge variant="secondary">
                            {totalVerseCount} verse
                            {totalVerseCount === 1 ? '' : 's'}
                        </Badge>
                    </>
                }
                title={chapterTitle}
                description="Read the chapter introduction first, then continue through the grouped verse list in canonical order."
                contentClassName="space-y-6"
            >
                {(chapterIdentitySurface || chapterIntroSurface) && (
                    <div className="space-y-3">
                        {chapterIdentitySurface && (
                            <AdminModuleHost
                                surface={chapterIdentitySurface}
                                className={PANEL_CLASS_NAME}
                            />
                        )}
                        {chapterIntroSurface && (
                            <AdminModuleHost
                                surface={chapterIntroSurface}
                                className={PANEL_CLASS_NAME}
                            />
                        )}
                    </div>
                )}

                {pageIntroBlock ? (
                    pageIntroBlock.block_type === 'text' ? (
                        <div className="rounded-2xl border border-border/70 bg-muted/20 px-5 py-5 sm:px-6 sm:py-6">
                            <p className="text-xs font-semibold tracking-[0.18em] text-muted-foreground uppercase">
                                Chapter Introduction
                            </p>
                            {pageIntroBlock.title && (
                                <p className="mt-4 text-lg font-semibold">
                                    {pageIntroBlock.title}
                                </p>
                            )}
                            {pageIntroBlock.body && (
                                <p className="mt-3 leading-7 text-muted-foreground">
                                    {pageIntroBlock.body}
                                </p>
                            )}
                        </div>
                    ) : (
                        <div className="rounded-2xl border border-border/70 bg-muted/20 p-2 sm:p-3">
                            <p className="px-3 pt-3 text-xs font-semibold tracking-[0.18em] text-muted-foreground uppercase sm:px-4">
                                Chapter Introduction
                            </p>
                            <div className="mt-3">
                                <ContentBlockRenderer block={pageIntroBlock} />
                            </div>
                        </div>
                    )
                ) : null}

                <ScriptureReadingNavigationActions
                    actions={[
                        {
                            kind: 'back_to_chapter_list',
                            href: book_section.href,
                        },
                    ]}
                />
            </ScripturePageIntroCard>

            <ScriptureChapterContentBlockRegion
                chapter={chapter}
                chapterTitle={chapterTitle}
                blocks={chapterNoteBlocks}
                showAdminControls={showAdminControls}
                admin={admin}
            />

            <ScriptureChapterVerseList
                chapter={chapter}
                chapterSections={chapter_sections}
                readerLanguages={reader_languages}
                defaultLanguage={default_language}
                showAdminControls={showAdminControls}
                admin={admin}
                panelClassName={PANEL_CLASS_NAME}
            />
        </ScriptureLayout>
    );
}
