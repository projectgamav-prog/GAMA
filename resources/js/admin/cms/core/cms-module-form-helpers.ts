import { cmsModules } from './module-registry';
import type {
    CmsContainerType,
    CmsModuleKey,
    CmsModulePayload,
} from '@/types';

type ModulePayloadFormShape = {
    data_json: Record<string, any>;
    config_json: Record<string, any>;
};

export const defaultModuleKey: CmsModuleKey = 'rich_text';

const moduleKeys = new Set<CmsModuleKey>(cmsModules.map((module) => module.key));

export const resolveModuleKey = (moduleKey: string): CmsModuleKey =>
    moduleKeys.has(moduleKey as CmsModuleKey)
        ? (moduleKey as CmsModuleKey)
        : defaultModuleKey;

export const resolveCmsContainerType = (
    containerType: string,
): CmsContainerType => (containerType === 'section' ? 'section' : 'card');

export const modulePayloadFromForm = (
    form: ModulePayloadFormShape,
): CmsModulePayload => ({
    data: form.data_json,
    config: form.config_json,
});
