import { scriptureAdminStartCase } from '@/lib/scripture-admin-field-display';

export type BookMediaSlotMeta = {
    label: string;
    description: string;
};

export const BOOK_MEDIA_SLOT_META: Record<string, BookMediaSlotMeta> = {
    hero_media: {
        label: 'Hero Media',
        description:
            'Primary book-level media shown first on the public canonical book page.',
    },
    supporting_media: {
        label: 'Supporting Media',
        description:
            'Additional media cards shown after the primary media slot on public Book pages.',
    },
};

export function getBookMediaSlotMeta(role: string): BookMediaSlotMeta {
    return (
        BOOK_MEDIA_SLOT_META[role] ?? {
            label: scriptureAdminStartCase(role),
            description:
                'Registered media slot configured through the Book admin registry.',
        }
    );
}

export function getBookMediaSlotOptions(
    roles: string[] | null | undefined,
): Array<BookMediaSlotMeta & { role: string }> {
    return (roles ?? []).map((role) => ({
        role,
        ...getBookMediaSlotMeta(role),
    }));
}
