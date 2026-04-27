import {
    BookMarked,
    BookOpenText,
    Clock3,
    Crown,
    Feather,
    Layers3,
    Library,
    ScrollText,
    Sparkles,
} from 'lucide-react';
import { createCompactListSection } from '@/rendering/core';
import type { BookShowProps, BreadcrumbItem } from '@/types';

export function buildBookShowDescriptorModel({
    book,
    bookSections,
    breadcrumbs,
}: {
    book: BookShowProps['book'];
    bookSections: BookShowProps['book_sections'];
    breadcrumbs: BreadcrumbItem[];
}) {
    const chapterCount = bookSections.reduce(
        (total, section) => total + section.chapters.length,
        0,
    );
    const primarySection = bookSections[0] ?? null;
    const firstChapter = bookSections
        .flatMap((section) => section.chapters)
        .at(0);

    return {
        chapterCount,
        firstChapter,
        statItems: [
            {
                label: 'Structure',
                value: `${bookSections.length} section${
                    bookSections.length === 1 ? '' : 's'
                }`,
                icon: Layers3,
            },
            {
                label: 'Chapters',
                value: `${chapterCount} chapter${
                    chapterCount === 1 ? '' : 's'
                }`,
                icon: BookOpenText,
            },
            {
                label: 'Entry Point',
                value: firstChapter
                    ? (firstChapter.title ?? `Chapter ${firstChapter.number}`)
                    : 'In preparation',
                icon: ScrollText,
            },
            {
                label: 'Reading Mode',
                value: 'Canonical path',
                icon: Clock3,
            },
        ],
        railRenderContext: {
            page: {
                pageKey: 'scripture.books.show.rail',
                title: book.title,
                breadcrumbs,
                layout: 'scripture' as const,
            },
        },
        railSections: [
            createCompactListSection({
                id: 'book-overview',
                content: {
                    title: 'Book Overview',
                    items: [
                        {
                            label: 'Canonical sections',
                            meta: bookSections.length,
                            icon: Layers3,
                        },
                        {
                            label: 'Available chapters',
                            meta: chapterCount,
                            icon: BookOpenText,
                        },
                        {
                            label: 'Primary section',
                            meta:
                                primarySection?.title ??
                                primarySection?.number ??
                                'Book',
                            icon: Library,
                        },
                    ],
                },
            }),
            createCompactListSection({
                id: 'book-key-themes',
                content: {
                    eyebrow: 'Key Themes',
                    items: [
                        {
                            label: 'Covenant & promise',
                            icon: Crown,
                        },
                        {
                            label: 'Wisdom for daily living',
                            icon: Feather,
                        },
                        {
                            label: 'Faithful discipleship',
                            icon: Sparkles,
                        },
                    ],
                },
            }),
            createCompactListSection({
                id: 'book-popular-chapters',
                content: {
                    eyebrow: 'Popular Chapters',
                    items: bookSections
                        .flatMap((section) => section.chapters)
                        .slice(0, 5)
                        .map((chapter) => ({
                            label: chapter.title ?? `Chapter ${chapter.number}`,
                            meta: chapter.number,
                            icon: BookMarked,
                            href: chapter.href,
                        })),
                },
            }),
            createCompactListSection({
                id: 'book-study-resources',
                content: {
                    eyebrow: 'Study Resources',
                    items: [
                        {
                            label: `Commentaries on ${book.title}`,
                            meta: 'Soon',
                            icon: ScrollText,
                        },
                        {
                            label: 'Maps & backgrounds',
                            meta: 'Soon',
                            icon: Library,
                        },
                        {
                            label: 'Study notes & outlines',
                            meta: 'Soon',
                            icon: Feather,
                        },
                    ],
                },
            }),
        ],
    };
}
