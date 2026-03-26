import type { ReactNode } from 'react';
import { ContentBlockRenderer } from '@/components/scripture/content-block-renderer';
import type {
    ScriptureContentBlock,
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
};

export function ScriptureContentBlocksSection({
    title,
    description,
    blocks,
    id,
    entityMeta,
    renderBlockHeaderAction,
}: Props) {
    if (blocks.length === 0) {
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
                {blocks.map((block) => (
                    <ContentBlockRenderer
                        key={block.id}
                        block={block}
                        headerAction={renderBlockHeaderAction?.(block)}
                    />
                ))}
            </div>
        </ScriptureSection>
    );
}
