import {
    BookOpenText,
    CalendarDays,
    Crown,
    Flame,
    History,
    Library,
    ScrollText,
    Sparkles,
} from 'lucide-react';
import { createCompactListSection } from '@/rendering/core';
import type { BreadcrumbItem, ScriptureBook } from '@/types';

const bookGroups = [
    {
        label: 'Torah',
        icon: ScrollText,
        titles: ['Genesis', 'Exodus', 'Leviticus', 'Numbers', 'Deuteronomy'],
    },
    {
        label: 'History',
        icon: History,
        titles: [
            'Joshua',
            'Judges',
            'Ruth',
            '1 Samuel',
            '2 Samuel',
            '1 Kings',
            '2 Kings',
            '1 Chronicles',
            '2 Chronicles',
            'Ezra',
            'Nehemiah',
            'Esther',
        ],
    },
    {
        label: 'Poetry & Wisdom',
        icon: Sparkles,
        titles: ['Job', 'Psalms', 'Proverbs', 'Ecclesiastes', 'Song of Songs'],
    },
    {
        label: 'Prophets',
        icon: Flame,
        titles: [
            'Isaiah',
            'Jeremiah',
            'Lamentations',
            'Ezekiel',
            'Daniel',
            'Hosea',
            'Joel',
            'Amos',
            'Obadiah',
            'Jonah',
            'Micah',
            'Nahum',
            'Habakkuk',
            'Zephaniah',
            'Haggai',
            'Zechariah',
            'Malachi',
        ],
    },
    {
        label: 'Gospels',
        icon: Crown,
        titles: ['Matthew', 'Mark', 'Luke', 'John'],
    },
    {
        label: 'Epistles',
        icon: BookOpenText,
        titles: [
            'Romans',
            '1 Corinthians',
            '2 Corinthians',
            'Galatians',
            'Ephesians',
            'Philippians',
            'Colossians',
            '1 Thessalonians',
            '2 Thessalonians',
            '1 Timothy',
            '2 Timothy',
            'Titus',
            'Philemon',
            'Hebrews',
            'James',
            '1 Peter',
            '2 Peter',
            '1 John',
            '2 John',
            '3 John',
            'Jude',
        ],
    },
    {
        label: 'Apocalypse',
        icon: Library,
        titles: ['Revelation'],
    },
];

function groupBooks(books: ScriptureBook[]) {
    const remaining = new Set(books.map((book) => book.id));
    const groups = bookGroups
        .map((group) => {
            const groupBooks = books.filter((book) =>
                group.titles.some(
                    (title) => title.toLowerCase() === book.title.toLowerCase(),
                ),
            );

            groupBooks.forEach((book) => remaining.delete(book.id));

            return {
                ...group,
                books: groupBooks,
            };
        })
        .filter((group) => group.books.length > 0);

    const uncategorized = books.filter((book) => remaining.has(book.id));

    if (uncategorized.length > 0) {
        groups.push({
            label: 'Additional Books',
            icon: Library,
            titles: [],
            books: uncategorized,
        });
    }

    return groups;
}

export function buildBooksIndexDescriptorModel({
    books,
    breadcrumbs,
}: {
    books: ScriptureBook[];
    breadcrumbs: BreadcrumbItem[];
}) {
    const groupedBooks = groupBooks(books);

    return {
        groupedBooks,
        featuredBook:
            books.find((book) => /matthew|john|psalms/i.test(book.title)) ??
            books[0] ??
            null,
        railRenderContext: {
            page: {
                pageKey: 'scripture.books.index.rail',
                title: 'Books',
                breadcrumbs,
                layout: 'scripture' as const,
            },
        },
        railSections: [
            createCompactListSection({
                id: 'books-browse-by-category',
                content: {
                    eyebrow: 'Browse by Category',
                    items: groupedBooks.map((group) => ({
                        label: group.label,
                        meta: group.books.length,
                        icon: group.icon,
                    })),
                },
            }),
            createCompactListSection({
                id: 'books-reading-plans',
                content: {
                    eyebrow: 'Reading Plans',
                    items: [
                        {
                            label: 'Chronological Plan',
                            meta: 'Start',
                            icon: CalendarDays,
                        },
                        {
                            label: '365 Daily Readings',
                            meta: 'Year',
                            icon: CalendarDays,
                        },
                        {
                            label: 'New Believer Plan',
                            meta: 'Guide',
                            icon: BookOpenText,
                        },
                    ],
                },
            }),
            createCompactListSection({
                id: 'books-recently-visited',
                content: {
                    eyebrow: 'Recently Visited',
                    items: books.slice(0, 4).map((book) => ({
                        label: book.title,
                        meta: 'Open',
                        icon: BookOpenText,
                        href: book.href,
                    })),
                },
            }),
        ],
    };
}
