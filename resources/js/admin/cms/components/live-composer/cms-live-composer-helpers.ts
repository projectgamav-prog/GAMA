import { cmsModules } from '../../core/module-registry';
import type { CmsContainerType, CmsModuleKey } from '@/types';

export type ContainerFormData = {
    label: string;
    container_type: CmsContainerType;
    return_to: string;
};

export type BlockFormData = {
    module_key: CmsModuleKey;
    return_to: string;
    data_json: Record<string, any>;
    config_json: Record<string, any>;
};

const moduleKeys = new Set<CmsModuleKey>(cmsModules.map((module) => module.key));

export const resolveModuleKey = (moduleKey: string): CmsModuleKey =>
    moduleKeys.has(moduleKey as CmsModuleKey)
        ? (moduleKey as CmsModuleKey)
        : 'rich_text';

export const resolveLiveContainerType = (
    containerType: string,
): CmsContainerType => (containerType === 'section' ? 'section' : 'card');

export const modulePayloadFromForm = (
    form: Pick<BlockFormData, 'data_json' | 'config_json'>,
) => ({
    data: form.data_json,
    config: form.config_json,
});
