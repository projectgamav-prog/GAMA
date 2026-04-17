import type {
    CmsContainerType,
    CmsInsertionMode,
    CmsModuleKey,
    CmsModulePayload,
} from '@/types';
import { defaultCmsModuleValue } from '../../core/module-registry';

export type CmsFormRecord = Record<string, any>;

export type ContainerInsertFormData = {
    label: string;
    container_type: CmsContainerType;
    insertion_mode: CmsInsertionMode;
    relative_container_id: number | null;
    module_key: CmsModuleKey;
    return_to: string;
    data_json: CmsFormRecord;
    config_json: CmsFormRecord;
};

export type BlockFormData = {
    insertion_mode: CmsInsertionMode;
    relative_block_id: number | null;
    module_key: CmsModuleKey;
    return_to: string;
    data_json: CmsFormRecord;
    config_json: CmsFormRecord;
};

export const defaultModuleKey: CmsModuleKey = 'rich_text';

export const modulePayloadFromForm = (
    form: Pick<BlockFormData, 'data_json' | 'config_json'>,
): CmsModulePayload => ({
    data: form.data_json,
    config: form.config_json,
});

export function buildContainerInsertFormData({
    insertionMode,
    relativeContainerId,
    returnTo,
    moduleKey = defaultModuleKey,
}: {
    insertionMode: CmsInsertionMode;
    relativeContainerId: number | null;
    returnTo?: string | null;
    moduleKey?: CmsModuleKey;
}): ContainerInsertFormData {
    const defaults = defaultCmsModuleValue(moduleKey);

    return {
        label: '',
        container_type: 'card',
        insertion_mode: insertionMode,
        relative_container_id: relativeContainerId,
        module_key: moduleKey,
        return_to: returnTo ?? '',
        data_json: defaults.data,
        config_json: defaults.config,
    };
}

export function buildBlockInsertFormData({
    insertionMode,
    relativeBlockId,
    returnTo,
    moduleKey = defaultModuleKey,
}: {
    insertionMode: CmsInsertionMode;
    relativeBlockId: number | null;
    returnTo?: string | null;
    moduleKey?: CmsModuleKey;
}): BlockFormData {
    const defaults = defaultCmsModuleValue(moduleKey);

    return {
        insertion_mode: insertionMode,
        relative_block_id: relativeBlockId,
        module_key: moduleKey,
        return_to: returnTo ?? '',
        data_json: defaults.data,
        config_json: defaults.config,
    };
}

export function resetModuleFormData<
    T extends {
        module_key: CmsModuleKey;
        data_json: CmsFormRecord;
        config_json: CmsFormRecord;
    },
>(data: T, moduleKey: CmsModuleKey): T {
    const defaults = defaultCmsModuleValue(moduleKey);

    return {
        ...data,
        module_key: moduleKey,
        data_json: defaults.data,
        config_json: defaults.config,
    };
}
