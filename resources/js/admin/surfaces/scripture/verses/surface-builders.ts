import {
    VERSE_INTRO_SURFACE_KEY,
    VERSE_META_SURFACE_KEY,
    VERSE_NOTES_SURFACE_KEY,
} from '@/admin/surfaces/core/surface-keys';
import {
    createInlineEditorSurface,
} from '@/admin/surfaces/core/surface-builders';
import type { AdminSurfaceContract } from '@/admin/surfaces/core/surface-contracts';
import type {
    ScriptureVerse,
    ScriptureVerseCharacterAssignment,
    ScriptureVerseMeta,
} from '@/types';
import type {
    IdentityContractMetadata,
    StructuredMetaContractMetadata,
} from '@/admin/surfaces/core/contract-readers';

type VerseIdentitySurfaceArgs = {
    verse: ScriptureVerse;
    updateHref: string;
    fullEditHref: string;
};

type VerseMetaSurfaceArgs = {
    verse: ScriptureVerse;
    verseMeta: ScriptureVerseMeta | null;
    characters: ScriptureVerseCharacterAssignment[];
    updateHref: string;
    fullEditHref: string;
};

export function createVerseIdentitySurface({
    verse,
    updateHref,
    fullEditHref,
}: VerseIdentitySurfaceArgs): AdminSurfaceContract<IdentityContractMetadata<ScriptureVerse>> {
    return createInlineEditorSurface({
        surfaceKey: VERSE_INTRO_SURFACE_KEY,
        contractKey: 'identity',
        entity: 'verse',
        entityId: verse.id,
        regionKey: 'verse_intro',
        capabilities: ['edit', 'full_edit'],
        metadata: {
            entityRecord: verse,
            updateHref,
            fullEditHref,
        },
    });
}

export function createVerseMetaSurface({
    verse,
    verseMeta,
    characters,
    updateHref,
    fullEditHref,
}: VerseMetaSurfaceArgs): AdminSurfaceContract<
    StructuredMetaContractMetadata<
        ScriptureVerseMeta,
        { characters: ScriptureVerseCharacterAssignment[]; verse: ScriptureVerse }
    >
> {
    return createInlineEditorSurface({
        surfaceKey: VERSE_META_SURFACE_KEY,
        contractKey: 'structured_meta',
        entity: 'verse',
        entityId: verse.id,
        regionKey: 'verse_notes',
        capabilities: ['edit', 'full_edit'],
        metadata: {
            value: verseMeta,
            options: {
                characters,
                verse,
            },
            updateHref,
            fullEditHref,
        },
    });
}

