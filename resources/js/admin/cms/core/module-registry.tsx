import type { CmsModuleKey, CmsModulePayload } from '@/types';
import { buttonGroupModule } from '../modules/button-group';
import { cardListModule } from '../modules/card-list';
import { mediaModule } from '../modules/media';
import { richTextModule } from '../modules/rich-text';
import type { CmsModuleManifest } from './module-types';

const manifests = [
    richTextModule,
    cardListModule,
    buttonGroupModule,
    mediaModule,
] satisfies
    CmsModuleManifest[];

const manifestMap = new Map<string, CmsModuleManifest>(
    manifests.map((manifest) => [manifest.key, manifest]),
);

const clonePayloadValue = (
    value: Record<string, unknown>,
): Record<string, unknown> => JSON.parse(JSON.stringify(value));

export const cmsModules = manifests;

export function getCmsModuleManifest(
    moduleKey: string,
): CmsModuleManifest | null {
    return manifestMap.get(moduleKey) ?? null;
}

export function defaultCmsModuleValue(moduleKey: CmsModuleKey): CmsModulePayload {
    const manifest = manifestMap.get(moduleKey);

    if (! manifest) {
        return {
            data: {},
            config: {},
        };
    }

    return {
        data: clonePayloadValue(manifest.defaultData),
        config: clonePayloadValue(manifest.defaultConfig),
    };
}
