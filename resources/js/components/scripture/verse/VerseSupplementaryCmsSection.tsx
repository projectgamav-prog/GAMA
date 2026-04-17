import { CmsExposedRegion } from '@/admin/cms/components/CmsExposedRegion';
import { ScriptureSection } from '@/components/scripture/scripture-section';
import type { VerseShowProps } from '@/types';
import type { ScriptureEntityRegionInput } from '@/types/scripture';

type Props = {
    entityMeta: ScriptureEntityRegionInput;
    region: NonNullable<VerseShowProps['cms_regions']>[number];
};

export function VerseSupplementaryCmsSection({ entityMeta, region }: Props) {
    return (
        <ScriptureSection
            entityMeta={{
                ...entityMeta,
                region: 'universal_content_region',
                capabilityHint: 'cms',
            }}
            title="Supplementary Content"
            description="Additional CMS-managed content for verse detail. This stays separate from the canonical verse structure and its protected schema relationships."
        >
            <CmsExposedRegion region={region} />
        </ScriptureSection>
    );
}
