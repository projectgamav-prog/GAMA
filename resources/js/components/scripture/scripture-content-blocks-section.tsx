import { ScriptureSection } from '@/components/scripture/scripture-section';
import { UniversalSectionStack } from '@/rendering/core';
import { createScriptureContentBlocksSection } from '@/rendering/scripture/scripture-section-descriptors';
import type {
    ScriptureContentBlock,
    ScriptureEntityRegionInput,
} from '@/types/scripture';

type Props = {
    title: string;
    description: string;
    blocks: ScriptureContentBlock[];
    id?: string;
    entityMeta?: ScriptureEntityRegionInput;
};

export function ScriptureContentBlocksSection({
    title,
    description,
    blocks,
    id,
    entityMeta,
}: Props) {
    if (blocks.length === 0) {
        return null;
    }

    const renderContext = {
        page: {
            pageKey: id ?? 'scripture.content-blocks',
            title,
            layout: 'scripture' as const,
        },
    };
    const sections = [
        createScriptureContentBlocksSection({
            id: `${id ?? 'scripture-content-blocks'}-content`,
            blocks,
        }),
    ];

    return (
        <ScriptureSection
            id={id}
            title={title}
            description={description}
            entityMeta={entityMeta}
        >
            <UniversalSectionStack
                sections={sections}
                renderContext={renderContext}
            />
        </ScriptureSection>
    );
}
