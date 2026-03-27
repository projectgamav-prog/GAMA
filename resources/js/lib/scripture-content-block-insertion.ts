import type {
    ScriptureContentBlock,
    ScriptureContentBlockInsertionPoint,
} from '@/types';

const blockLabel = (block: ScriptureContentBlock): string =>
    block.title ?? `${block.block_type} block`;

export function createSectionStartContentBlockInsertionPoint(
    suggestedRegion: string | null,
): ScriptureContentBlockInsertionPoint {
    return {
        insertion_mode: 'start',
        relative_block_id: null,
        suggested_region: suggestedRegion,
        label: 'At the start of this section',
    };
}

export function createBeforeFirstContentBlockInsertionPoint(
    firstBlock: ScriptureContentBlock,
): ScriptureContentBlockInsertionPoint {
    return {
        insertion_mode: 'start',
        relative_block_id: null,
        suggested_region: firstBlock.region,
        label: 'Before the first block',
    };
}

export function createAfterContentBlockInsertionPoint(
    block: ScriptureContentBlock,
): ScriptureContentBlockInsertionPoint {
    return {
        insertion_mode: 'after',
        relative_block_id: block.id,
        suggested_region: block.region,
        label: `After ${blockLabel(block)}`,
    };
}

export function createAfterLastContentBlockInsertionPoint(
    lastBlock: ScriptureContentBlock,
): ScriptureContentBlockInsertionPoint {
    return {
        insertion_mode: 'end',
        relative_block_id: null,
        suggested_region: lastBlock.region,
        label: 'After the last block',
    };
}

export function matchesContentBlockInsertionPoint(
    first: ScriptureContentBlockInsertionPoint,
    second: ScriptureContentBlockInsertionPoint,
): boolean {
    return (
        first.insertion_mode === second.insertion_mode &&
        first.relative_block_id === second.relative_block_id
    );
}
