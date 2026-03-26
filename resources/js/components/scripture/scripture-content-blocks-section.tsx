import { ContentBlockRenderer } from '@/components/scripture/content-block-renderer';
import type { ScriptureContentBlock } from '@/types/scripture';
import { ScriptureSection } from './scripture-section';

type Props = {
    title: string;
    description: string;
    blocks: ScriptureContentBlock[];
    id?: string;
};

export function ScriptureContentBlocksSection({
    title,
    description,
    blocks,
    id,
}: Props) {
    if (blocks.length === 0) {
        return null;
    }

    return (
        <ScriptureSection id={id} title={title} description={description}>
            <div className="space-y-4">
                {blocks.map((block) => (
                    <ContentBlockRenderer key={block.id} block={block} />
                ))}
            </div>
        </ScriptureSection>
    );
}
