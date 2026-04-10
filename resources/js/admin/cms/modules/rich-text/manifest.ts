import {
    defineCmsModuleManifest,
    type CmsModulePayload,
} from '../../core/module-types';
import { richTextDefaultConfig, richTextDefaultData } from './defaults';
import { RichTextEditor } from './editor';
import { RichTextRenderer } from './renderer';
import {
    getRichTextAlign,
    getRichTextHtml,
    getRichTextWidth,
} from './types';

const validateRichText = (
    value: CmsModulePayload,
): Record<string, string | undefined> => {
    const errors: Record<string, string | undefined> = {};

    if (getRichTextHtml(value.data).trim() === '') {
        errors['data_json.html'] = 'Rich text content is required.';
    }

    if (! ['left', 'center', 'right'].includes(getRichTextAlign(value.config))) {
        errors['config_json.align'] = 'Choose a valid text alignment.';
    }

    if (
        ! ['content', 'wide', 'full'].includes(getRichTextWidth(value.config))
    ) {
        errors['config_json.max_width'] = 'Choose a valid rich text width.';
    }

    return errors;
};

export const richTextModuleManifest = defineCmsModuleManifest({
    key: 'rich_text',
    label: 'Rich Text',
    category: 'text',
    description:
        'Long-form text content that stays inside the current container.',
    defaultData: richTextDefaultData,
    defaultConfig: richTextDefaultConfig,
    Renderer: RichTextRenderer,
    Editor: RichTextEditor,
    validate: validateRichText,
});
