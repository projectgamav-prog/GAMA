import type { CardListConfig, CardListData } from './types';
import { createDefaultCardListItem } from './types';

export const cardListDefaultData: CardListData = {
    eyebrow: '',
    title: 'Guided cards',
    intro: '',
    items: [createDefaultCardListItem()],
};

export const cardListDefaultConfig: CardListConfig = {
    layout: 'cards',
    columns: 'two',
};
