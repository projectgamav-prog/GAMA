import { AdminModuleHostGroup } from '@/admin/core/AdminModuleHostGroup';
import { resolveChapterHeaderSurfaces } from '@/admin/integrations/scripture/chapters';
import { ScriptureAdminModeBar } from '@/components/scripture/scripture-admin-mode-bar';
import { ScriptureChapterVerseList } from '@/components/scripture/scripture-chapter-verse-list';
import { ScriptureChapterContentBlockRegion } from '@/components/scripture/scripture-chapter-content-block-region';
import { ScriptureIntroBlock } from '@/components/scripture/scripture-intro-block';
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
    } = resolveChapterHeaderSurfaces({
        chapter,
        chapterTitle,
        admin,
        enabled: showAdminControls,
    });
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
                <AdminModuleHostGroup
                    surfaces={[chapterIdentitySurface, chapterIntroSurface]}
                />

                <ScriptureIntroBlock
                    label="Chapter Introduction"
                    block={chapter.intro_block}
                />

                <ScriptureReadingNavigationActions
                    actions={[
                        {
                            actionKey: 'back_to_chapter_list',
                            href: book_section.href,
                        },
                    ]}
                />
            </ScripturePageIntroCard>

            <ScriptureChapterContentBlockRegion
                chapter={chapter}
                chapterTitle={chapterTitle}
                blocks={content_blocks}
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
            />
        </ScriptureLayout>
    );
}
