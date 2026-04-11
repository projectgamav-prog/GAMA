import {
    createDefaultLinkTarget,
    normalizeLinkTarget,
    resolveLinkTargetHref,
} from '@/lib/link-targets';
import type { LinkTarget } from '@/types';

export type CardListLayout = 'cards' | 'list';

export type CardListColumns = 'one' | 'two' | 'three';

export type CardListItem = {
    eyebrow: string;
    title: string;
    body: string;
    cta_label: string;
    target: LinkTarget | null;
};

export type CardListData = {
    eyebrow: string;
    title: string;
    intro: string;
    items: CardListItem[];
};

export type CardListConfig = {
    layout: CardListLayout;
    columns: CardListColumns;
};

export const createDefaultCardListItem = (): CardListItem => ({
    eyebrow: '',
    title: 'New card',
    body: '',
    cta_label: 'Learn more',
    target: createDefaultLinkTarget('url'),
});

export const getCardListEyebrow = (data: Record<string, unknown>): string =>
    typeof data.eyebrow === 'string' ? data.eyebrow : '';

export const getCardListTitle = (data: Record<string, unknown>): string =>
    typeof data.title === 'string' ? data.title : '';

export const getCardListIntro = (data: Record<string, unknown>): string =>
    typeof data.intro === 'string' ? data.intro : '';

export const getCardListItems = (
    data: Record<string, unknown>,
): CardListItem[] => {
    const items = Array.isArray(data.items) ? data.items : [];

    return items.map((item) => {
        if (!item || typeof item !== 'object') {
            return createDefaultCardListItem();
        }

        const record = item as Record<string, unknown>;

        return {
            eyebrow:
                typeof record.eyebrow === 'string' ? record.eyebrow : '',
            title: typeof record.title === 'string' ? record.title : 'New card',
            body: typeof record.body === 'string' ? record.body : '',
            cta_label:
                typeof record.cta_label === 'string'
                    ? record.cta_label
                    : 'Learn more',
            target:
                normalizeLinkTarget(record.target) ??
                (typeof record.url === 'string'
                    ? {
                          type: 'url',
                          value: { url: record.url.trim() || null },
                          behavior: { new_tab: false },
                      }
                    : null),
        };
    });
};

export const getCardListLayout = (
    config: Record<string, unknown>,
): CardListLayout => (config.layout === 'list' ? 'list' : 'cards');

export const getCardListColumns = (
    config: Record<string, unknown>,
): CardListColumns => {
    const columns = config.columns;

    return columns === 'one' || columns === 'three' ? columns : 'two';
};

export function resolveCardListItemHref(item: CardListItem): string | null {
    return item.target ? resolveLinkTargetHref(item.target) : null;
}
