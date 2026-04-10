import {
    getIntroContractMetadata,
    getMediaSlotsContractMetadata,
    getRelationRowsContractMetadata,
    getStructuredMetaContractMetadata,
} from '@/admin/surfaces/core/contract-readers';
import {
    getSectionCreateMetadata,
    getSectionGroupMetadata,
} from '@/admin/surfaces/sections/surface-types';
import { scriptureAdminStartCase } from '@/lib/scripture-admin-field-display';
import type { AdminSurfaceContract } from '@/admin/surfaces/core/surface-contracts';
import type {
    AdminModuleActionDefinition,
    AdminSemanticActionKey,
} from './module-types';

function toTitleLabel(value: string): string {
    return value
        .split(/\s+/)
        .filter((part) => part.length > 0)
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
        .join(' ');
}

function hasIntroContent(surface: AdminSurfaceContract): boolean | null {
    const introMetadata = getIntroContractMetadata<unknown>(surface);

    if (introMetadata) {
        return introMetadata.introKind === 'field'
            ? Boolean(introMetadata.textValue?.trim())
            : introMetadata.block !== null;
    }

    const sectionMetadata = getSectionGroupMetadata(surface);

    if (sectionMetadata) {
        return sectionMetadata.introBlock !== null;
    }

    return null;
}

function getIdentityLabel(surface: AdminSurfaceContract): string {
    switch (surface.entity) {
        case 'book':
            return 'Edit Book';
        case 'chapter':
            return 'Edit Chapter';
        case 'verse':
            return 'Edit Verse';
        default:
            return 'Edit Identity';
    }
}

function resolveSemanticAdminActionLabel(
    surface: AdminSurfaceContract,
    actionKey: AdminSemanticActionKey,
): string | null {
    switch (actionKey) {
        case 'edit_intro': {
            const hasContent = hasIntroContent(surface);

            return hasContent === false ? 'Add Intro' : 'Edit Intro';
        }
        case 'edit_identity':
            return getIdentityLabel(surface);
        case 'edit_details': {
            const metadata = getSectionGroupMetadata(surface);

            return metadata?.groupLabel
                ? `Edit ${toTitleLabel(metadata.groupLabel)}`
                : 'Edit Details';
        }
        case 'edit_meta':
            return getStructuredMetaContractMetadata<unknown>(surface)?.value
                ? 'Edit Meta'
                : 'Add Meta';
        case 'edit_translations':
            return (getRelationRowsContractMetadata(surface)?.rows.length ?? 0) > 0
                ? 'Edit Translations'
                : 'Add Translation';
        case 'edit_commentaries':
            return (getRelationRowsContractMetadata(surface)?.rows.length ?? 0) > 0
                ? 'Edit Commentaries'
                : 'Add Commentary';
        case 'edit_media':
            return (getMediaSlotsContractMetadata(surface)?.assignments.length ??
                0) > 0
                ? 'Edit Media'
                : 'Add Media';
        case 'create_row': {
            const metadata = getSectionCreateMetadata(surface);

            return metadata ? `Add ${metadata.entityLabel}` : 'Add Row';
        }
        case 'delete_entity':
            return 'Delete';
        default:
            return null;
    }
}

export function resolveAdminActionLabel(
    surface: AdminSurfaceContract,
    action: AdminModuleActionDefinition,
): string {
    return (
        action.dynamicLabel?.(surface) ??
        resolveSemanticAdminActionLabel(
            surface,
            action.actionKey as AdminSemanticActionKey,
        ) ??
        action.defaultLabel ??
        scriptureAdminStartCase(action.actionKey.replaceAll('_', ' '))
    );
}
