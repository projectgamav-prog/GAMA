import type {
    ScriptureContentBlockInsertionMode,
    ScriptureContentBlockInsertionPoint,
} from '@/types';

/**
 * Shared session helpers for inline text-block creation.
 *
 * These helpers keep the public-page create flow lightweight: once an editor
 * chooses an insertion point and the `text` block type, the page can open a
 * stable inline create session immediately without involving the sheet editor.
 */
type InlineTextContentBlockCreateValues = {
    title: string;
    body: string;
    region: string;
    status: 'draft' | 'published';
    insertion_mode: ScriptureContentBlockInsertionMode;
    relative_block_id: number | null;
};

export type InlineTextContentBlockCreateSession = {
    storeHref: string;
    fullEditHref: string;
    editorKey: string;
    insertionPoint: ScriptureContentBlockInsertionPoint;
    values: InlineTextContentBlockCreateValues;
};

type CreateInlineTextContentBlockSessionInput = {
    storeHref: string;
    fullEditHref: string;
    defaultRegion: string;
    insertionPoint: ScriptureContentBlockInsertionPoint;
};

export function createInlineTextContentBlockCreateSession({
    storeHref,
    fullEditHref,
    defaultRegion,
    insertionPoint,
}: CreateInlineTextContentBlockSessionInput): InlineTextContentBlockCreateSession {
    // The insertion point carries both ordering context and the most useful
    // default region for the new inline block.
    const region = insertionPoint.suggested_region ?? defaultRegion;

    return {
        storeHref,
        fullEditHref,
        editorKey: `new-${insertionPoint.insertion_mode}-${insertionPoint.relative_block_id ?? 'section'}-${region}`,
        insertionPoint,
        values: {
            title: '',
            body: '',
            region,
            status: 'published',
            insertion_mode: insertionPoint.insertion_mode,
            relative_block_id: insertionPoint.relative_block_id,
        },
    };
}

export function isInlineTextContentBlockType(blockType: string): boolean {
    return blockType === 'text';
}
