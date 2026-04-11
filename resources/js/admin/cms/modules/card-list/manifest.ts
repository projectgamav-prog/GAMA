import {
    defineCmsModuleManifest,
    type CmsModulePayload,
} from '../../core/module-types';
import { cardListDefaultConfig, cardListDefaultData } from './defaults';
import { CardListEditor } from './editor';
import { CardListRenderer } from './renderer';
import {
    getCardListColumns,
    getCardListItems,
    getCardListLayout,
} from './types';

const validateCardList = (
    value: CmsModulePayload,
): Record<string, string | undefined> => {
    const errors: Record<string, string | undefined> = {};
    const items = getCardListItems(value.data);

    if (items.length === 0) {
        errors['data_json.items'] = 'Add at least one card.';

        return errors;
    }

    items.forEach((item, index) => {
        if (item.title.trim() === '') {
            errors[`data_json.items.${index}.title`] = 'Card title is required.';
        }

        if (item.target) {
            if (
                item.target.type === 'url' &&
                (item.target.value.url === null ||
                    item.target.value.url.trim() === '')
            ) {
                errors[`data_json.items.${index}.target.value.url`] =
                    'Card URL is required.';
            }

            if (
                item.target.type === 'cms_page' &&
                (item.target.value.slug === null ||
                    item.target.value.slug.trim() === '')
            ) {
                errors[`data_json.items.${index}.target.value.slug`] =
                    'Choose a CMS page.';
            }

            if (
                item.target.type === 'route' &&
                (item.target.value.key === null ||
                    item.target.value.key.trim() === '')
            ) {
                errors[`data_json.items.${index}.target.value.key`] =
                    'Choose an internal route.';
            }

            if (
                item.target.type === 'scripture' &&
                (item.target.value.kind === null ||
                    item.target.value.kind.trim() === '')
            ) {
                errors[`data_json.items.${index}.target.value.kind`] =
                    'Choose a scripture target.';
            }
        }
    });

    if (!['cards', 'list'].includes(getCardListLayout(value.config))) {
        errors['config_json.layout'] = 'Choose a valid card-list layout.';
    }

    if (!['one', 'two', 'three'].includes(getCardListColumns(value.config))) {
        errors['config_json.columns'] = 'Choose a valid card-list column count.';
    }

    return errors;
};

export const cardListModuleManifest = defineCmsModuleManifest({
    key: 'card_list',
    label: 'Card List',
    category: 'collections',
    description:
        'Repeatable cards or list items for grouped highlights, resources, or reading paths.',
    defaultData: cardListDefaultData,
    defaultConfig: cardListDefaultConfig,
    Renderer: CardListRenderer,
    Editor: CardListEditor,
    validate: validateCardList,
});
