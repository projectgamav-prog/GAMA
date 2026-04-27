import { useMemo } from 'react';
import type { AdminControlResolutionInput } from './control-resolution-types';
import type { AdminSurfaceManifestRegistration } from './AdminSurfaceManifestProvider';
import { useAdminPositionContext } from './AdminPositionProvider';
import { useRegisterAdminSurface } from './useRegisterAdminSurface';

type Props = Partial<AdminControlResolutionInput> & {
    entity: AdminControlResolutionInput['entity'];
    manifestKey?: string;
    enabled?: boolean;
};

export function AdminSurfaceEmitter({
    actionCapabilities,
    block,
    enabled = true,
    entity,
    layout,
    manifestKey,
    ordering,
    quickEdit,
    schemaConstraints,
    surface,
}: Props) {
    const inheritedLayout = useAdminPositionContext();
    const entry = useMemo<AdminSurfaceManifestRegistration | null>(() => {
        if (!enabled) {
            return null;
        }

        return {
            key: manifestKey,
            entity,
            surface,
            block,
            layout: layout ?? inheritedLayout,
            actionCapabilities,
            ordering,
            quickEdit,
            schemaConstraints,
        };
    }, [
        actionCapabilities,
        block,
        enabled,
        entity,
        inheritedLayout,
        layout,
        manifestKey,
        ordering,
        quickEdit,
        schemaConstraints,
        surface,
    ]);

    useRegisterAdminSurface(entry, [entry]);

    return null;
}
