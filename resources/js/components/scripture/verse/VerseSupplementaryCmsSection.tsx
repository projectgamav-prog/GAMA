import { CmsExposedRegion } from '@/admin/cms/components/CmsExposedRegion';
import { ScriptureEntityRegion } from '@/components/scripture/scripture-entity-region';
import { VerseSupportPanel } from '@/components/scripture/verse/VerseSupportPanel';
import type { VerseShowProps } from '@/types';
import type { ScriptureEntityRegionInput } from '@/types/scripture';

type Props = {
    entityMeta: Omit<ScriptureEntityRegionInput, 'region' | 'capabilityHint'>;
    region: NonNullable<VerseShowProps['cms_regions']>[number];
};

export function VerseSupplementaryCmsSection({ entityMeta, region }: Props) {
    return (
        <ScriptureEntityRegion
            meta={{
                ...entityMeta,
                region: 'universal_content_region',
                capabilityHint: 'cms',
            }}
            asChild
        >
            <VerseSupportPanel
                title="Supplementary Content"
                eyebrow="CMS Material"
            >
                <CmsExposedRegion region={region} />
            </VerseSupportPanel>
        </ScriptureEntityRegion>
    );
}
