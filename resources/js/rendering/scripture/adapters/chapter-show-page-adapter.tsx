import {
    BookOpenText,
    Clock3,
    Feather,
    Languages,
    Layers3,
    Library,
    ListTree,
    ScrollText,
    Sparkles,
} from 'lucide-react';
import { ScriptureReadingNavigationActions } from '@/components/scripture/scripture-reading-navigation-actions';
import {
    createCompactListSection,
    createPaperPanelSection,
} from '@/rendering/core';
import { createScriptureIntroTextSection } from '@/rendering/scripture/scripture-section-descriptors';
import {
    chapterLabel,
    isGenericSectionLabel,
    languageLabel,
    sectionLabel,
} from '@/lib/scripture';
import type { AdminSurfaceContract } from '@/admin/surfaces/core/surface-contracts';
import type { BreadcrumbItem, ChapterShowProps } from '@/types';

export function buildChapterShowDescriptorModel({
    book,
    bookSection,
    chapter,
    readerLanguages,
    defaultLanguage,
    chapterSections,
    chapterIntroSurface,
}: {
    book: ChapterShowProps['book'];
    bookSection: ChapterShowProps['book_section'];
    chapter: ChapterShowProps['chapter'];
    readerLanguages: ChapterShowProps['reader_languages'];
    defaultLanguage: ChapterShowProps['default_language'];
    chapterSections: ChapterShowProps['chapter_sections'];
    chapterIntroSurface?: AdminSurfaceContract | null;
}) {
    const hidesGenericBookSection = isGenericSectionLabel(
        bookSection.slug,
        bookSection.title,
    );
    const chapterTitle = chapterLabel(chapter.number, chapter.title);
    const bookSectionTitle = sectionLabel(
        bookSection.number,
        bookSection.title,
    );
    const totalCardCount = chapterSections.reduce(
        (sum, section) => sum + section.cards.length,
        0,
    );
    const totalVerseCount = chapterSections.reduce(
        (sum, section) =>
            sum +
            section.cards.reduce(
                (cardSum, card) => cardSum + card.verses.length,
                0,
            ),
        0,
    );
    const firstVerse = chapterSections
        .flatMap((section) => section.cards)
        .flatMap((card) => card.verses)
        .at(0);
    const primaryReaderLanguage = defaultLanguage ?? readerLanguages[0] ?? null;
    const readerLanguageLabel = primaryReaderLanguage
        ? languageLabel(primaryReaderLanguage)
        : 'Original';
    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: book.title,
            href: book.href,
        },
        {
            title: bookSectionTitle,
            href: bookSection.href,
        },
        {
            title: chapterTitle,
            href: chapter.href,
        },
    ];

    return {
        hidesGenericBookSection,
        chapterTitle,
        bookSectionTitle,
        totalVerseCount,
        firstVerse,
        breadcrumbs,
        statItems: [
            {
                label: 'Book',
                value: book.title,
                icon: Library,
            },
            {
                label: 'Sections',
                value: `${chapterSections.length} section${
                    chapterSections.length === 1 ? '' : 's'
                }`,
                icon: Layers3,
            },
            {
                label: 'Verses',
                value: `${totalVerseCount} verse${
                    totalVerseCount === 1 ? '' : 's'
                }`,
                icon: BookOpenText,
            },
            {
                label: 'Reader',
                value: `${readerLanguageLabel} support`,
                icon: Languages,
            },
        ],
        mainRenderContext: {
            page: {
                pageKey: 'scripture.chapters.show.main',
                title: chapterTitle,
                breadcrumbs,
                layout: 'scripture' as const,
            },
        },
        railRenderContext: {
            page: {
                pageKey: 'scripture.chapters.show.rail',
                title: chapterTitle,
                breadcrumbs,
                layout: 'scripture' as const,
            },
        },
        introSections: [
            createScriptureIntroTextSection({
                id: 'chapter-introduction',
                label: 'Chapter Introduction',
                block: chapter.intro_block,
                adminSurface: chapterIntroSurface,
            }),
        ],
        railSections: [
            createCompactListSection({
                id: 'chapter-overview',
                content: {
                    title: 'Chapter Overview',
                    items: [
                        {
                            label: 'Canonical sections',
                            meta: chapterSections.length,
                            icon: Layers3,
                        },
                        {
                            label: 'Reader cards',
                            meta: totalCardCount,
                            icon: ListTree,
                        },
                        {
                            label: 'Available verses',
                            meta: totalVerseCount,
                            icon: BookOpenText,
                        },
                    ],
                },
            }),
            createCompactListSection({
                id: 'chapter-section-jumps',
                content: {
                    eyebrow: 'Section Jumps',
                    items: chapterSections.map((section) => ({
                        label: sectionLabel(section.number, section.title),
                        meta: section.cards.reduce(
                            (sum, card) => sum + card.verses.length,
                            0,
                        ),
                        icon: ScrollText,
                        href: `#${section.slug}`,
                    })),
                },
            }),
            createPaperPanelSection({
                id: 'chapter-reading-navigation',
                content: {
                    eyebrow: 'Reading Navigation',
                    children: (
                        <ScriptureReadingNavigationActions
                            actions={[
                                {
                                    actionKey: 'back_to_chapter_list',
                                    href: bookSection.href,
                                },
                            ]}
                        />
                    ),
                },
            }),
            createCompactListSection({
                id: 'chapter-study-resources',
                content: {
                    eyebrow: 'Study Resources',
                    items: [
                        {
                            label: 'Context and themes',
                            meta: 'Soon',
                            icon: Sparkles,
                        },
                        {
                            label: 'Commentary highlights',
                            meta: 'Soon',
                            icon: Feather,
                        },
                        {
                            label: 'Parallel readings',
                            meta: 'Soon',
                            icon: Clock3,
                        },
                    ],
                },
            }),
        ],
    };
}
