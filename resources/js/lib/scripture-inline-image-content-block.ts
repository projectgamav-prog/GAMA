import type {
    ScriptureContentBlockInsertionMode,
    ScriptureContentBlockInsertionPoint,
} from '@/types';

type InlineImageContentBlockCreateValues = {
    title: string;
    body: string;
    region: string;
    status: 'draft' | 'published';
    media_url: string;
    alt_text: string;
    insertion_mode: ScriptureContentBlockInsertionMode;
    relative_block_id: number | null;
};

export type InlineImageContentBlockCreateSession = {
    storeHref: string;
    fullEditHref: string;
    editorKey: string;
    insertionPoint: ScriptureContentBlockInsertionPoint;
    values: InlineImageContentBlockCreateValues;
};

type CreateInlineImageContentBlockSessionInput = {
    storeHref: string;
    fullEditHref: string;
    defaultRegion: string;
    insertionPoint: ScriptureContentBlockInsertionPoint;
};

export function createInlineImageContentBlockCreateSession({
    storeHref,
    fullEditHref,
    defaultRegion,
    insertionPoint,
}: CreateInlineImageContentBlockSessionInput): InlineImageContentBlockCreateSession {
    const region = insertionPoint.suggested_region ?? defaultRegion;

    return {
        storeHref,
        fullEditHref,
        editorKey: `new-image-${insertionPoint.insertion_mode}-${insertionPoint.relative_block_id ?? 'section'}-${region}`,
        insertionPoint,
        values: {
            title: '',
            body: '',
            region,
            status: 'published',
            media_url: '',
            alt_text: '',
            insertion_mode: insertionPoint.insertion_mode,
            relative_block_id: insertionPoint.relative_block_id,
        },
    };
}

export function isInlineImageContentBlockType(blockType: string): boolean {
    return blockType === 'image';
}
