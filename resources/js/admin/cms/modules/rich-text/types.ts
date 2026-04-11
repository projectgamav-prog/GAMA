export type RichTextAlign = 'left' | 'center' | 'right';

export type RichTextWidth = 'content' | 'wide' | 'full';

export type RichTextBodyBlock =
    | {
          type: 'paragraph';
          text: string;
      }
    | {
          type: 'heading';
          level: 2 | 3;
          text: string;
      }
    | {
          type: 'quote';
          text: string;
      }
    | {
          type: 'list';
          items: string[];
      };

export type RichTextData = {
    eyebrow?: string | null;
    title?: string | null;
    lead?: string | null;
    body?: string | null;
    blocks?: RichTextBodyBlock[] | null;
    html?: string | null;
};

export type RichTextConfig = {
    align: RichTextAlign;
    max_width: RichTextWidth;
};

export const getRichTextHtml = (data: Record<string, unknown>): string =>
    typeof data.html === 'string' ? data.html : '';

export const getRichTextBody = (data: Record<string, unknown>): string =>
    typeof data.body === 'string' ? data.body : '';

export const getRichTextEyebrow = (data: Record<string, unknown>): string =>
    typeof data.eyebrow === 'string' ? data.eyebrow : '';

export const getRichTextTitle = (data: Record<string, unknown>): string =>
    typeof data.title === 'string' ? data.title : '';

export const getRichTextLead = (data: Record<string, unknown>): string =>
    typeof data.lead === 'string' ? data.lead : '';

export const getRichTextBlocks = (
    data: Record<string, unknown>,
): RichTextBodyBlock[] => {
    const blocks = data.blocks;

    if (!Array.isArray(blocks)) {
        return [];
    }

    return blocks.flatMap((block): RichTextBodyBlock[] => {
        if (!block || typeof block !== 'object') {
            return [];
        }

        const entry = block as Record<string, unknown>;
        const type = entry.type;

        if (type === 'paragraph' || type === 'quote') {
            return typeof entry.text === 'string' && entry.text.trim() !== ''
                ? [{ type, text: entry.text }]
                : [];
        }

        if (type === 'heading') {
            return typeof entry.text === 'string' && entry.text.trim() !== ''
                ? [
                      {
                          type,
                          level: entry.level === 3 ? 3 : 2,
                          text: entry.text,
                      },
                  ]
                : [];
        }

        if (type === 'list') {
            const items = Array.isArray(entry.items)
                ? entry.items.filter(
                      (item): item is string =>
                          typeof item === 'string' && item.trim() !== '',
                  )
                : [];

            return items.length > 0 ? [{ type, items }] : [];
        }

        return [];
    });
};

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
