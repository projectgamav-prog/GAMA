import type { ScriptureEntityType } from '@/types';
import type {
    AdminSurfaceCapability,
    AdminSurfaceContract,
    AdminSurfaceContractKey,
    AdminSurfaceIdentifier,
    AdminSurfaceOwner,
    AdminSurfacePresentation,
    AdminSurfaceQuickEdit,
    AdminSurfaceSlot,
} from './surface-contracts';
import type { AdminSurfaceKey } from './surface-keys';
import type {
    InlineEditorSurfaceMetadata,
    SheetEditorSurfaceMetadata,
} from './surface-metadata';
import { resolveSemanticSurfaceKey } from './surface-keys';

export const EDITOR_SURFACE_CAPABILITIES = ['edit', 'full_edit'] as const;

type AdminSurfaceCallback = (...args: any[]) => void;

type BuildSurfaceArgs<TMetadata> = {
    surfaceKey?: AdminSurfaceKey | null;
    contractKey?: AdminSurfaceContractKey | null;
    entity: ScriptureEntityType;
    entityId: AdminSurfaceIdentifier;
    slot: AdminSurfaceSlot;
    capabilities: readonly AdminSurfaceCapability[];
    regionKey?: string | null;
    blockType?: string | null;
    owner?: AdminSurfaceOwner | null;
    presentation?: AdminSurfacePresentation | null;
    quickEdit?: AdminSurfaceQuickEdit | null;
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
    surfaceKey = null,
    contractKey = null,
    entity,
    entityId,
    slot,
    capabilities,
    regionKey = null,
    blockType = null,
    owner = null,
    presentation = null,
    quickEdit = null,
    label = null,
    metadata,
}: BuildSurfaceArgs<TMetadata>): AdminSurfaceContract<TMetadata> {
    return {
        surfaceKey: surfaceKey ?? resolveSemanticSurfaceKey(entity, regionKey),
        contractKey,
        entity,
        entityId,
        slot,
        regionKey,
        blockType,
        owner,
        capabilities,
        presentation,
        quickEdit,
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
        presentation: args.presentation ?? {
            placement: 'inline',
            variant: 'full',
        },
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
        presentation: args.presentation ?? {
            placement: 'drawer',
            variant: 'full',
        },
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
