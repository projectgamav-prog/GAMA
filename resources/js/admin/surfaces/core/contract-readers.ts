import type {
    ScriptureAdminMediaAssignment,
    ScriptureAdminMediaSummary,
    ScriptureContentBlock,
} from '@/types';
import type {
    AdminSurfaceContract,
    AdminSurfaceContractKey,
} from './surface-contracts';
import { isSurfaceMetadataObject } from './surface-metadata';

type SurfaceMetadataRecord = Record<string, unknown>;

function getContractMetadata<TMetadata>(
    surface: AdminSurfaceContract,
    contractKey: AdminSurfaceContractKey,
    isValid: (metadata: SurfaceMetadataRecord) => boolean,
): TMetadata | null {
    if (surface.contractKey !== contractKey) {
        return null;
    }

    if (!isSurfaceMetadataObject(surface.metadata)) {
        return null;
    }

    return isValid(surface.metadata)
        ? (surface.metadata as TMetadata)
        : null;
}

export type IdentityContractMetadata<TEntity> = {
    entityRecord: TEntity;
    updateHref: string;
    fullEditHref: string;
};

export type IntroContractMetadata<TEntity> = {
    introKind: 'field' | 'registered_block';
    entityRecord: TEntity;
    entityLabel: string;
    textValue: string | null;
    block: ScriptureContentBlock | null;
    blockTypes: string[];
    updateHref: string | null;
    storeHref: string | null;
    fullEditHref: string;
};

export type StructuredMetaContractMetadata<TValue, TOptions = unknown> = {
    value: TValue | null;
    options: TOptions;
    updateHref: string;
    fullEditHref: string;
};

export type MediaSlotsContractMetadata = {
    entityLabel: string;
    storeHref: string;
    fullEditHref: string;
    assignments: ScriptureAdminMediaAssignment[];
    availableMedia: ScriptureAdminMediaSummary[];
    nextSortOrder: number;
};

export function getIdentityContractMetadata<TEntity>(
    surface: AdminSurfaceContract,
): IdentityContractMetadata<TEntity> | null {
    return getContractMetadata<IdentityContractMetadata<TEntity>>(
        surface,
        'identity',
        (metadata) =>
            typeof metadata.updateHref === 'string' &&
            typeof metadata.fullEditHref === 'string' &&
            typeof metadata.entityRecord === 'object' &&
            metadata.entityRecord !== null,
    );
}

export function getIntroContractMetadata<TEntity>(
    surface: AdminSurfaceContract,
): IntroContractMetadata<TEntity> | null {
    return getContractMetadata<IntroContractMetadata<TEntity>>(
        surface,
        'intro',
        (metadata) =>
            (metadata.introKind === 'field' ||
                metadata.introKind === 'registered_block') &&
            typeof metadata.entityLabel === 'string' &&
            typeof metadata.fullEditHref === 'string' &&
            Array.isArray(metadata.blockTypes) &&
            (typeof metadata.textValue === 'string' ||
                metadata.textValue === null ||
                metadata.textValue === undefined) &&
            (typeof metadata.updateHref === 'string' ||
                metadata.updateHref === null) &&
            (typeof metadata.storeHref === 'string' ||
                metadata.storeHref === null ||
                metadata.storeHref === undefined) &&
            (typeof metadata.block === 'object' ||
                metadata.block === null ||
                metadata.block === undefined) &&
            typeof metadata.entityRecord === 'object' &&
            metadata.entityRecord !== null,
    );
}

export function getStructuredMetaContractMetadata<TValue, TOptions = unknown>(
    surface: AdminSurfaceContract,
): StructuredMetaContractMetadata<TValue, TOptions> | null {
    return getContractMetadata<StructuredMetaContractMetadata<TValue, TOptions>>(
        surface,
        'structured_meta',
        (metadata) =>
            typeof metadata.updateHref === 'string' &&
            typeof metadata.fullEditHref === 'string' &&
            'value' in metadata &&
            'options' in metadata,
    );
}

export function getMediaSlotsContractMetadata(
    surface: AdminSurfaceContract,
): MediaSlotsContractMetadata | null {
    return getContractMetadata<MediaSlotsContractMetadata>(
        surface,
        'media_slots',
        (metadata) =>
            typeof metadata.entityLabel === 'string' &&
            typeof metadata.storeHref === 'string' &&
            typeof metadata.fullEditHref === 'string' &&
            Array.isArray(metadata.assignments) &&
            Array.isArray(metadata.availableMedia) &&
            typeof metadata.nextSortOrder === 'number',
    );
}
