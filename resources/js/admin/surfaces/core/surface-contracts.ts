import type { ScriptureEntityType } from '@/types';
import type { AdminSurfaceKey } from './surface-keys';

/**
 * Stable capability keys that a page surface can advertise to the shared
 * module engine.
 *
 * These are intentionally higher-level than route names or UI buttons so future
 * modules can qualify by behavior rather than by page-specific wiring.
 */
export type AdminSurfaceCapability =
    | 'edit'
    | 'create_row'
    | 'full_edit'
    | 'add_block'
    | 'delete'
    | 'manage_media'
    | 'manage_relations';

export type AdminSurfaceContractKey =
    | 'identity'
    | 'intro'
    | 'structured_meta'
    | 'entity_actions'
    | 'relation_rows'
    | 'media_slots'
    | 'section_collection'
    | 'section_group';

export type AdminSurfaceIdentifier = string | number;

export type AdminSurfaceSlot = 'inline_editor' | 'sheet_editor';

export type AdminSurfacePlacement =
    | 'inline'
    | 'sidebar'
    | 'drawer'
    | 'header_tools'
    | 'section_footer';

export type AdminSurfaceVariant = 'compact' | 'full';

export type AdminSurfacePresentation = {
    placement?: AdminSurfacePlacement | null;
    variant?: AdminSurfaceVariant | null;
};

export type AdminQuickEditMode =
    | 'same_layout'
    | 'panel'
    | 'full_edit_only';

export type AdminQuickEditMethod = 'post' | 'put' | 'patch';

export type AdminQuickEditInput = 'input' | 'textarea';

export type AdminQuickEditContentKind =
    | 'plain_text'
    | 'long_text'
    | 'rich_text_lite'
    | 'intro_block_text'
    | 'content_block_text'
    | 'content_block_quote'
    | 'card_title'
    | 'card_description'
    | (string & {});

export type AdminQuickEditField = {
    name: string;
    label: string;
    value: string | null;
    input?: AdminQuickEditInput;
    payloadKey?: string;
    placeholder?: string | null;
};

export type AdminQuickEditPayloadField = {
    name: string;
    value: string | null;
    payloadKey?: string;
};

export type AdminSurfaceQuickEdit = {
    mode: AdminQuickEditMode;
    contentKind: AdminQuickEditContentKind;
    fields: readonly AdminQuickEditField[];
    payloadFields?: readonly AdminQuickEditPayloadField[];
    updateHref?: string | null;
    method?: AdminQuickEditMethod;
    fullEditHref?: string | null;
};

export type AdminSurfaceOwner = {
    entity: ScriptureEntityType;
    entityId: AdminSurfaceIdentifier;
};

/**
 * Shared metadata contract that any editable page surface must expose.
 *
 * The host and qualification engine only depend on this contract. Pages can
 * keep their own rendering concerns, while modules decide whether they attach
 * based on semantic surface identity, entity ownership, capabilities, and
 * optional supporting metadata such as region or block type.
 */
export type AdminSurfaceContract<TMetadata = unknown> = {
    surfaceKey?: AdminSurfaceKey | null;
    contractKey?: AdminSurfaceContractKey | null;
    entity: ScriptureEntityType;
    entityId: AdminSurfaceIdentifier;
    slot: AdminSurfaceSlot;
    regionKey?: string | null;
    blockType?: string | null;
    owner?: AdminSurfaceOwner | null;
    capabilities: readonly AdminSurfaceCapability[];
    presentation?: AdminSurfacePresentation | null;
    quickEdit?: AdminSurfaceQuickEdit | null;
    label?: string | null;
    metadata?: TMetadata;
};
