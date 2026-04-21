import type { CmsContainerType, CmsModuleKey } from '@/types';
import {
    modulePayloadFromForm,
    resolveCmsContainerType as resolveLiveContainerType,
    resolveModuleKey,
} from '../../core/cms-module-form-helpers';

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

export { modulePayloadFromForm, resolveLiveContainerType, resolveModuleKey };
