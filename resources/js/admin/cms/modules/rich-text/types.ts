export type RichTextAlign = 'left' | 'center' | 'right';

export type RichTextWidth = 'content' | 'wide' | 'full';

export type RichTextData = {
    html: string;
};

export type RichTextConfig = {
    align: RichTextAlign;
    max_width: RichTextWidth;
};

export const getRichTextHtml = (data: Record<string, unknown>): string =>
    typeof data.html === 'string' ? data.html : '';

export const getRichTextAlign = (
    config: Record<string, unknown>,
): RichTextAlign => {
    const align = config.align;

    return align === 'center' || align === 'right' ? align : 'left';
};

export const getRichTextWidth = (
    config: Record<string, unknown>,
): RichTextWidth => {
    const width = config.max_width;

    return width === 'wide' || width === 'full' ? width : 'content';
};
