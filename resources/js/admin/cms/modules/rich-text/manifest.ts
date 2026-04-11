import {
    defineCmsModuleManifest,
    type CmsModulePayload,
} from '../../core/module-types';
import { richTextDefaultConfig, richTextDefaultData } from './defaults';
import { parseRichTextDocument } from './document';
import { RichTextEditor } from './editor';
import { RichTextRenderer } from './renderer';
import {
    getRichTextAlign,
    getRichTextBody,
    getRichTextBlocks,
    getRichTextEyebrow,
    getRichTextLead,
    getRichTextTitle,
    getRichTextWidth,
} from './types';

const validateRichText = (
    value: CmsModulePayload,
): Record<string, string | undefined> => {
    const errors: Record<string, string | undefined> = {};
    const body = getRichTextBody(value.data);
    const blocks = getRichTextBlocks(value.data);
    const normalizedBlocks =
        blocks.length > 0 ? blocks : parseRichTextDocument(body);

    if (
        getRichTextEyebrow(value.data).trim() === '' &&
        getRichTextTitle(value.data).trim() === '' &&
        getRichTextLead(value.data).trim() === '' &&
        body.trim() === '' &&
        normalizedBlocks.length === 0
    ) {
        errors['data_json.body'] =
            'Add at least a title, lead, or body for this prose section.';
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
