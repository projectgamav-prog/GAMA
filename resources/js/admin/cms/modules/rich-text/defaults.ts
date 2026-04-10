import type { RichTextConfig, RichTextData } from './types';

export const richTextDefaultData: RichTextData = {
    html: '<p>New rich text block.</p>',
};

export const richTextDefaultConfig: RichTextConfig = {
    align: 'left',
    max_width: 'content',
};
