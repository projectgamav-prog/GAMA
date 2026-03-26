import { Fragment } from 'react';
import type { ReactNode } from 'react';
import { ContentBlockRenderer } from '@/components/scripture/content-block-renderer';
import { ScriptureContentBlockInsertControl } from '@/components/scripture/scripture-content-block-insert-control';
import {
    createAfterContentBlockInsertionPoint,
    createAfterLastContentBlockInsertionPoint,
    createBeforeFirstContentBlockInsertionPoint,
    createSectionStartContentBlockInsertionPoint,
} from '@/lib/scripture-content-block-insertion';
import type {
    ScriptureContentBlock,
    ScriptureContentBlockInsertionPoint,
    ScriptureEntityRegionInput,
} from '@/types/scripture';
import { ScriptureSection } from './scripture-section';

type Props = {
    title: string;
    description: string;
    blocks: ScriptureContentBlock[];
    id?: string;
    entityMeta?: ScriptureEntityRegionInput;
    renderBlockHeaderAction?: (block: ScriptureContentBlock) => ReactNode;
    onInsertBlock?: (position: ScriptureContentBlockInsertionPoint) => void;
};

export function ScriptureContentBlocksSection({
    title,
    description,
    blocks,
    id,
    entityMeta,
    renderBlockHeaderAction,
    onInsertBlock,
}: Props) {
    if (blocks.length === 0) {
        if (!onInsertBlock) {
            return null;
        }

        return (
            <ScriptureSection
                id={id}
                title={title}
                description={description}
                entityMeta={entityMeta}
            >
                <div className="space-y-4">
                    <p className="text-sm text-muted-foreground">
                        No published blocks are in this region yet.
                    </p>
                    <ScriptureContentBlockInsertControl
                        onClick={() =>
                            onInsertBlock(
                                createSectionStartContentBlockInsertionPoint(
                                    null,
                                ),
                            )
                        }
                    />
                </div>
            </ScriptureSection>
        );
    }

    return (
        <ScriptureSection
            id={id}
            title={title}
            description={description}
            entityMeta={entityMeta}
        >
            <div className="space-y-4">
                {onInsertBlock && (
                    <ScriptureContentBlockInsertControl
                        onClick={() =>
                            onInsertBlock(
                                createBeforeFirstContentBlockInsertionPoint(
                                    blocks[0],
                                ),
                            )
                        }
                    />
                )}

                {blocks.map((block, index) => {
                    const isLastBlock = index === blocks.length - 1;

                    return (
                        <Fragment key={block.id}>
                            <ContentBlockRenderer
                                block={block}
                                headerAction={renderBlockHeaderAction?.(block)}
                            />

                            {onInsertBlock && (
                                <ScriptureContentBlockInsertControl
                                    onClick={() =>
                                        onInsertBlock(
                                            isLastBlock
                                                ? createAfterLastContentBlockInsertionPoint(
                                                      block,
                                                  )
                                                : createAfterContentBlockInsertionPoint(
                                                      block,
                                                  ),
                                        )
                                    }
                                />
                            )}
                        </Fragment>
                    );
                })}
            </div>
        </ScriptureSection>
    );
}
