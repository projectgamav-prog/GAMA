import type { AdminSurfaceContract } from '@/admin/surfaces/core/surface-contracts';
import { isSurfaceMetadataObject } from '@/admin/surfaces/core/surface-metadata';
import type { ScriptureContentBlock } from '@/types';

export type SectionCreateFieldKey = 'slug' | 'number' | 'title' | 'text';

export type SectionCreateFieldMetadata = {
    key: SectionCreateFieldKey;
    label: string;
    placeholder: string;
    required: boolean;
    multiline?: boolean;
};

export type SectionCreateMetadata = {
    createHref: string;
    entityLabel: string;
    parentLabel: string | null;
    fields: readonly SectionCreateFieldMetadata[];
};

export type SectionCollectionSurfaceMetadata = {
    title: string;
    groupLabel: string;
    groupCount: number;
    itemLabel: string;
    itemCount: number;
    openHref: string | null;
    openLabel: string | null;
    structureHref: string | null;
    structureLabel: string | null;
    create?: SectionCreateMetadata | null;
};

export type SectionGroupSurfaceMetadata = {
    title: string;
    groupLabel: string;
    rowNumber: string | null;
    rowTitle: string | null;
    primaryCount: number;
    primaryLabel: string;
    secondaryCount: number | null;
    secondaryLabel: string | null;
    openHref: string | null;
    openLabel: string | null;
    updateHref: string | null;
    introBlock: ScriptureContentBlock | null;
    introBlockTypes: string[];
    introStoreHref: string | null;
    introUpdateHref: string | null;
    introDefaultRegion: string | null;
    create?: SectionCreateMetadata | null;
};

function isSectionCreateFieldMetadata(
    value: unknown,
): value is SectionCreateFieldMetadata {
    if (!isSurfaceMetadataObject(value)) {
        return false;
    }

    return (
        (value.key === 'slug' ||
            value.key === 'number' ||
            value.key === 'title' ||
            value.key === 'text') &&
        typeof value.label === 'string' &&
        typeof value.placeholder === 'string' &&
        typeof value.required === 'boolean' &&
        (typeof value.multiline === 'boolean' || value.multiline === undefined)
    );
}

function isSectionCreateMetadata(value: unknown): value is SectionCreateMetadata {
    if (!isSurfaceMetadataObject(value)) {
        return false;
    }

    return (
        typeof value.createHref === 'string' &&
        typeof value.entityLabel === 'string' &&
        (typeof value.parentLabel === 'string' || value.parentLabel === null) &&
        Array.isArray(value.fields) &&
        value.fields.every(isSectionCreateFieldMetadata)
    );
}

function getSurfaceMetadata<TMetadata>(
    surface: AdminSurfaceContract,
    isValid: (metadata: Record<string, unknown>) => boolean,
): TMetadata | null {
    if (!isSurfaceMetadataObject(surface.metadata)) {
        return null;
    }

    return isValid(surface.metadata)
        ? (surface.metadata as TMetadata)
        : null;
}

export function getSectionCollectionMetadata(
    surface: AdminSurfaceContract,
): SectionCollectionSurfaceMetadata | null {
    return getSurfaceMetadata<SectionCollectionSurfaceMetadata>(
        surface,
        (metadata) =>
            typeof metadata.title === 'string' &&
            typeof metadata.groupLabel === 'string' &&
            typeof metadata.groupCount === 'number' &&
            typeof metadata.itemLabel === 'string' &&
            typeof metadata.itemCount === 'number' &&
            (metadata.create === undefined ||
                metadata.create === null ||
                isSectionCreateMetadata(metadata.create)),
    );
}

export function getSectionGroupMetadata(
    surface: AdminSurfaceContract,
): SectionGroupSurfaceMetadata | null {
    return getSurfaceMetadata<SectionGroupSurfaceMetadata>(
        surface,
        (metadata) =>
            typeof metadata.title === 'string' &&
            typeof metadata.groupLabel === 'string' &&
            (typeof metadata.rowNumber === 'string' ||
                metadata.rowNumber === null ||
                metadata.rowNumber === undefined) &&
            (typeof metadata.rowTitle === 'string' ||
                metadata.rowTitle === null ||
                metadata.rowTitle === undefined) &&
            typeof metadata.primaryCount === 'number' &&
            typeof metadata.primaryLabel === 'string' &&
            (typeof metadata.secondaryCount === 'number' ||
                metadata.secondaryCount === null ||
                metadata.secondaryCount === undefined) &&
            (typeof metadata.secondaryLabel === 'string' ||
                metadata.secondaryLabel === null ||
                metadata.secondaryLabel === undefined) &&
            (typeof metadata.updateHref === 'string' ||
                metadata.updateHref === null ||
                metadata.updateHref === undefined) &&
            (typeof metadata.introStoreHref === 'string' ||
                metadata.introStoreHref === null ||
                metadata.introStoreHref === undefined) &&
            (typeof metadata.introUpdateHref === 'string' ||
                metadata.introUpdateHref === null ||
                metadata.introUpdateHref === undefined) &&
            (typeof metadata.introDefaultRegion === 'string' ||
                metadata.introDefaultRegion === null ||
                metadata.introDefaultRegion === undefined) &&
            (Array.isArray(metadata.introBlockTypes) ||
                metadata.introBlockTypes === undefined) &&
            (metadata.create === undefined ||
                metadata.create === null ||
                isSectionCreateMetadata(metadata.create)),
    );
}

export function getSectionCreateMetadata(
    surface: AdminSurfaceContract,
): SectionCreateMetadata | null {
    const collectionMetadata = getSectionCollectionMetadata(surface);

    if (collectionMetadata?.create && isSectionCreateMetadata(collectionMetadata.create)) {
        return collectionMetadata.create;
    }

    const groupMetadata = getSectionGroupMetadata(surface);

    if (groupMetadata?.create && isSectionCreateMetadata(groupMetadata.create)) {
        return groupMetadata.create;
    }

    return null;
}

