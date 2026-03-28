import type { AdminSurfaceContract } from './surface-contracts';

type AdminSurfaceCallback = (...args: any[]) => void;

export type InlineEditorSurfaceMetadata<
    TSession,
    TOnSaveSuccess extends AdminSurfaceCallback | undefined = undefined,
    TExtra extends object = object,
> = {
    session: TSession | null;
    onCancel: () => void;
    onSaveSuccess?: TOnSaveSuccess;
} & TExtra;

export type SheetEditorSurfaceMetadata<
    TSession,
    TExtra extends object = object,
> = {
    session: TSession | null;
    onOpenChange: (open: boolean) => void;
} & TExtra;

export function isSurfaceMetadataObject(
    metadata: unknown,
): metadata is Record<string, unknown> {
    return typeof metadata === 'object' && metadata !== null;
}

export function getInlineEditorSurfaceMetadata<
    TSession,
    TOnSaveSuccess extends AdminSurfaceCallback | undefined = undefined,
    TExtra extends object = object,
>(
    surface: AdminSurfaceContract,
): InlineEditorSurfaceMetadata<TSession, TOnSaveSuccess, TExtra> | null {
    if (!isSurfaceMetadataObject(surface.metadata)) {
        return null;
    }

    const candidate = surface.metadata as Partial<
        InlineEditorSurfaceMetadata<TSession, TOnSaveSuccess, TExtra>
    >;

    return typeof candidate.onCancel === 'function'
        ? (candidate as InlineEditorSurfaceMetadata<
              TSession,
              TOnSaveSuccess,
              TExtra
          >)
        : null;
}

export function getSheetEditorSurfaceMetadata<
    TSession,
    TExtra extends object = object,
>(
    surface: AdminSurfaceContract,
): SheetEditorSurfaceMetadata<TSession, TExtra> | null {
    if (!isSurfaceMetadataObject(surface.metadata)) {
        return null;
    }

    const candidate = surface.metadata as Partial<
        SheetEditorSurfaceMetadata<TSession, TExtra>
    >;

    return typeof candidate.onOpenChange === 'function'
        ? (candidate as SheetEditorSurfaceMetadata<TSession, TExtra>)
        : null;
}
