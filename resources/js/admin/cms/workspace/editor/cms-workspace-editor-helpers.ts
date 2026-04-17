import { cmsModules } from '../../core/module-registry';
import type {
    CmsContainerType,
    CmsInsertionMode,
    CmsModuleKey,
} from '@/types';

export type CmsFormRecord = Record<string, any>;

export type BlockFormData = {
    insertion_mode: CmsInsertionMode;
    relative_block_id: number | null;
    module_key: CmsModuleKey;
    data_json: CmsFormRecord;
    config_json: CmsFormRecord;
};

export type ContainerUpdateFormData = {
    label: string;
    container_type: CmsContainerType;
};

export const defaultModuleKey: CmsModuleKey = 'rich_text';

const moduleKeys = new Set<CmsModuleKey>(cmsModules.map((module) => module.key));

export const resolveModuleKey = (moduleKey: string): CmsModuleKey =>
    moduleKeys.has(moduleKey as CmsModuleKey)
        ? (moduleKey as CmsModuleKey)
        : defaultModuleKey;

export const resolveContainerType = (
    containerType: string,
): CmsContainerType => (containerType === 'section' ? 'section' : 'card');

export const modulePayloadFromForm = (
    form: Pick<BlockFormData, 'data_json' | 'config_json'>,
) => ({
    data: form.data_json,
    config: form.config_json,
});
