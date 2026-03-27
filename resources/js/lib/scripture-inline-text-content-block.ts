import type {
    ScriptureContentBlockInsertionMode,
    ScriptureContentBlockInsertionPoint,
} from '@/types';

/**
 * Shared session helpers for inline textual-block creation.
 *
 * These helpers keep the public-page create flow lightweight: once an editor
 * chooses an insertion point and a supported textual block type, the page can
 * open a stable inline create session immediately without involving the
 * protected full editor.
 */
type InlineTextContentBlockCreateValues = {
    block_type?: string;
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
    blockType?: string;
};

export function createInlineTextContentBlockCreateSession({
    storeHref,
    fullEditHref,
    defaultRegion,
    insertionPoint,
    blockType,
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
            block_type: blockType,
            title: '',
            body: '',
            region,
            status: 'published',
            insertion_mode: insertionPoint.insertion_mode,
            relative_block_id: insertionPoint.relative_block_id,
        },
    };
}

export function isInlineTextualContentBlockType(blockType: string): boolean {
    return blockType === 'text' || blockType === 'quote';
}
