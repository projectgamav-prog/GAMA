import type { ScriptureEntityType } from '@/types';
import type {
    AdminSurfaceCapability,
    AdminSurfaceContract,
    AdminSurfaceIdentifier,
    AdminSurfaceOwner,
    AdminSurfaceSlot,
} from './surface-contracts';
import type {
    InlineEditorSurfaceMetadata,
    SheetEditorSurfaceMetadata,
} from './surface-metadata';

export const EDITOR_SURFACE_CAPABILITIES = ['edit', 'full_edit'] as const;
export const BLOCK_CREATE_SURFACE_CAPABILITIES = [
    'add_block',
    'full_edit',
] as const;

type AdminSurfaceCallback = (...args: any[]) => void;

type BuildSurfaceArgs<TMetadata> = {
    entity: ScriptureEntityType;
    entityId: AdminSurfaceIdentifier;
    slot: AdminSurfaceSlot;
    capabilities: readonly AdminSurfaceCapability[];
    regionKey?: string | null;
    blockType?: string | null;
    owner?: AdminSurfaceOwner | null;
    label?: string | null;
    metadata?: TMetadata;
};

type BuildInlineEditorSurfaceArgs<
    TSession,
    TOnSaveSuccess extends AdminSurfaceCallback | undefined = undefined,
    TExtra extends object = object,
> = Omit<
    BuildSurfaceArgs<
        InlineEditorSurfaceMetadata<TSession, TOnSaveSuccess, TExtra>
    >,
    'slot' | 'metadata'
> & {
    session: TSession | null;
    onCancel: () => void;
    onSaveSuccess?: TOnSaveSuccess;
    metadata?: TExtra;
};

type BuildSheetEditorSurfaceArgs<
    TSession,
    TExtra extends object = object,
> = Omit<
    BuildSurfaceArgs<SheetEditorSurfaceMetadata<TSession, TExtra>>,
    'slot' | 'metadata'
> & {
    session: TSession | null;
    onOpenChange: (open: boolean) => void;
    metadata?: TExtra;
};

export function createSurfaceOwner(
    entity: ScriptureEntityType,
    entityId: AdminSurfaceIdentifier,
): AdminSurfaceOwner {
    return { entity, entityId };
}

/**
 * Lowest-level builder for module-host surfaces.
 */
export function createAdminSurface<TMetadata>({
    entity,
    entityId,
    slot,
    capabilities,
    regionKey = null,
    blockType = null,
    owner = null,
    label = null,
    metadata,
}: BuildSurfaceArgs<TMetadata>): AdminSurfaceContract<TMetadata> {
    return {
        entity,
        entityId,
        slot,
        regionKey,
        blockType,
        owner,
        capabilities,
        label,
        metadata,
    };
}

export function createInlineEditorSurface<TMetadata>(
    args: Omit<BuildSurfaceArgs<TMetadata>, 'slot'>,
): AdminSurfaceContract<TMetadata> {
    return createAdminSurface({
        ...args,
        slot: 'inline_editor',
    });
}

export function createInlineEditorModuleSurface<
    TSession,
    TOnSaveSuccess extends AdminSurfaceCallback | undefined = undefined,
    TExtra extends object = object,
>({
    session,
    onCancel,
    onSaveSuccess,
    metadata,
    ...surface
}: BuildInlineEditorSurfaceArgs<TSession, TOnSaveSuccess, TExtra>): AdminSurfaceContract<
    InlineEditorSurfaceMetadata<TSession, TOnSaveSuccess, TExtra>
> {
    return createInlineEditorSurface({
        ...surface,
        metadata: {
            ...(metadata ?? ({} as TExtra)),
            session,
            onCancel,
            onSaveSuccess,
        },
    });
}

export function createSheetEditorSurface<TMetadata>(
    args: Omit<BuildSurfaceArgs<TMetadata>, 'slot'>,
): AdminSurfaceContract<TMetadata> {
    return createAdminSurface({
        ...args,
        slot: 'sheet_editor',
    });
}

/**
 * Wraps the common session/open-close metadata used by sheet fallback modules.
 */
export function createSheetEditorModuleSurface<
    TSession,
    TExtra extends object = object,
>({
    session,
    onOpenChange,
    metadata,
    ...surface
}: BuildSheetEditorSurfaceArgs<TSession, TExtra>): AdminSurfaceContract<
    SheetEditorSurfaceMetadata<TSession, TExtra>
> {
    return createSheetEditorSurface({
        ...surface,
        metadata: {
            ...(metadata ?? ({} as TExtra)),
            session,
            onOpenChange,
        },
    });
}

export function createInsertControlSurface<TMetadata>(
    args: Omit<BuildSurfaceArgs<TMetadata>, 'slot'>,
): AdminSurfaceContract<TMetadata> {
    return createAdminSurface({
        ...args,
        slot: 'insert_control',
    });
}

export function createBlockActionsSurface<TMetadata>(
    args: Omit<BuildSurfaceArgs<TMetadata>, 'slot'>,
): AdminSurfaceContract<TMetadata> {
    return createAdminSurface({
        ...args,
        slot: 'block_actions',
    });
}
