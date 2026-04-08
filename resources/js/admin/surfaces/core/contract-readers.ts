import type {
    ScriptureAdminVerseCommentary,
    ScriptureAdminVerseTranslation,
    ScriptureAdminMediaAssignment,
    ScriptureAdminMediaSummary,
    ScriptureCommentarySourceOption,
    ScriptureContentBlock,
    ScriptureRegisteredAdminField,
    ScriptureTranslationSourceOption,
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
    destroyHref?: string | null;
    storeHref: string | null;
    fullEditHref: string;
};

export type EntityActionsContractMetadata = {
    entityLabel: string;
    parentLabel: string | null;
    createHref: string | null;
    destroyHref: string | null;
    fullEditHref: string | null;
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

export type RelationRowsContractMetadata<
    TRow = unknown,
    TSource = unknown,
    TFields = Record<string, ScriptureRegisteredAdminField>,
> = {
    relationKey: string;
    relationLabel: string;
    entityLabel: string;
    storeHref: string;
    fullEditHref?: string | null;
    rows: TRow[];
    sourceOptions: TSource[];
    nextSortOrder: number;
    fields: TFields;
};

export type VerseTranslationsContractMetadata = RelationRowsContractMetadata<
    ScriptureAdminVerseTranslation,
    ScriptureTranslationSourceOption
>;

export type VerseCommentariesContractMetadata = RelationRowsContractMetadata<
    ScriptureAdminVerseCommentary,
    ScriptureCommentarySourceOption
>;

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
            (typeof metadata.destroyHref === 'string' ||
                metadata.destroyHref === null ||
                metadata.destroyHref === undefined) &&
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

export function getEntityActionsContractMetadata(
    surface: AdminSurfaceContract,
): EntityActionsContractMetadata | null {
    return getContractMetadata<EntityActionsContractMetadata>(
        surface,
        'entity_actions',
        (metadata) =>
            typeof metadata.entityLabel === 'string' &&
            (typeof metadata.parentLabel === 'string' ||
                metadata.parentLabel === null ||
                metadata.parentLabel === undefined) &&
            (typeof metadata.createHref === 'string' ||
                metadata.createHref === null ||
                metadata.createHref === undefined) &&
            (typeof metadata.destroyHref === 'string' ||
                metadata.destroyHref === null ||
                metadata.destroyHref === undefined) &&
            (typeof metadata.fullEditHref === 'string' ||
                metadata.fullEditHref === null ||
                metadata.fullEditHref === undefined),
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

export function getRelationRowsContractMetadata<
    TRow = unknown,
    TSource = unknown,
    TFields = Record<string, ScriptureRegisteredAdminField>,
>(
    surface: AdminSurfaceContract,
): RelationRowsContractMetadata<TRow, TSource, TFields> | null {
    return getContractMetadata<
        RelationRowsContractMetadata<TRow, TSource, TFields>
    >(
        surface,
        'relation_rows',
        (metadata) =>
            typeof metadata.relationKey === 'string' &&
            typeof metadata.relationLabel === 'string' &&
            typeof metadata.entityLabel === 'string' &&
            typeof metadata.storeHref === 'string' &&
            (typeof metadata.fullEditHref === 'string' ||
                metadata.fullEditHref === null ||
                metadata.fullEditHref === undefined) &&
            typeof metadata.nextSortOrder === 'number' &&
            Array.isArray(metadata.rows) &&
            Array.isArray(metadata.sourceOptions) &&
            typeof metadata.fields === 'object' &&
            metadata.fields !== null,
    );
}
