import type { RichTextConfig, RichTextData } from './types';

export const richTextDefaultData: RichTextData = {
    eyebrow: '',
    title: '',
    lead: '',
    body: 'New rich text block.',
    blocks: [
        {
            type: 'paragraph',
            text: 'New rich text block.',
        },
    ],
    html: '',
};

export const richTextDefaultConfig: RichTextConfig = {
    align: 'left',
    max_width: 'content',
};
