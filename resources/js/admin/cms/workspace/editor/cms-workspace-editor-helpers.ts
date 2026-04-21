import type {
    CmsContainerType,
    CmsInsertionMode,
    CmsModuleKey,
} from '@/types';
import {
    defaultModuleKey,
    modulePayloadFromForm,
    resolveCmsContainerType as resolveContainerType,
    resolveModuleKey,
} from '../../core/cms-module-form-helpers';

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

export { defaultModuleKey, modulePayloadFromForm, resolveContainerType, resolveModuleKey };
