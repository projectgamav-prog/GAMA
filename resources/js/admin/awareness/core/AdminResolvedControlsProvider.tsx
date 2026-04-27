import {
    createContext,
    useCallback,
    useContext,
    useMemo,
} from 'react';
import type { ReactNode } from 'react';
import { resolveAdminControls } from './AdminControlResolver';
import { useAdminSurfaceManifest } from './AdminSurfaceManifestProvider';
import type {
    AdminControlDiagnostic,
    AdminControlOwnership,
    AdminResolvedSurfaceControls,
} from './control-ownership-types';
import type { AdminResolvedControl } from './control-resolution-types';
import {
    buildAdminControlDiagnostics,
    duplicateSurfaceIds,
    resolveAdminControlOwnership,
} from './resolved-control-diagnostics';

export type AdminResolvedControlsContextValue = {
    resolvedSurfaces: readonly AdminResolvedSurfaceControls[];
    diagnostics: readonly AdminControlDiagnostic[];
    getControlsForSurface: (
        surfaceId: string,
    ) => readonly AdminResolvedControl[];
    getOwnershipForSurface: (
        surfaceId: string,
    ) => AdminControlOwnership | null;
    listResolvedSurfaces: () => readonly AdminResolvedSurfaceControls[];
    listDiagnostics: () => readonly AdminControlDiagnostic[];
};

const AdminResolvedControlsContext =
    createContext<AdminResolvedControlsContextValue | null>(null);

export function AdminResolvedControlsProvider({
    children,
}: {
    children: ReactNode;
}) {
    const { entries } = useAdminSurfaceManifest();

    const resolvedSurfaces = useMemo<AdminResolvedSurfaceControls[]>(() => {
        const duplicateIds = duplicateSurfaceIds(entries);

        return entries.map((entry) => {
            const controls = resolveAdminControls(entry);
            const ownership = resolveAdminControlOwnership({
                surfaceId: entry.key,
                input: entry,
                controls,
                duplicateSurface: duplicateIds.has(entry.key),
            });

            return {
                surfaceId: entry.key,
                input: entry,
                controls,
                ownership,
            };
        });
    }, [entries]);

    const diagnostics = useMemo(
        () => buildAdminControlDiagnostics(resolvedSurfaces, entries),
        [entries, resolvedSurfaces],
    );

    const getResolvedSurface = useCallback(
        (surfaceId: string) =>
            resolvedSurfaces.find((surface) => surface.surfaceId === surfaceId) ??
            null,
        [resolvedSurfaces],
    );

    const getControlsForSurface = useCallback(
        (surfaceId: string) => getResolvedSurface(surfaceId)?.controls ?? [],
        [getResolvedSurface],
    );

    const getOwnershipForSurface = useCallback(
        (surfaceId: string) =>
            getResolvedSurface(surfaceId)?.ownership ?? null,
        [getResolvedSurface],
    );

    const listResolvedSurfaces = useCallback(
        () => resolvedSurfaces,
        [resolvedSurfaces],
    );

    const listDiagnostics = useCallback(() => diagnostics, [diagnostics]);

    const value = useMemo<AdminResolvedControlsContextValue>(
        () => ({
            resolvedSurfaces,
            diagnostics,
            getControlsForSurface,
            getOwnershipForSurface,
            listResolvedSurfaces,
            listDiagnostics,
        }),
        [
            diagnostics,
            getControlsForSurface,
            getOwnershipForSurface,
            listDiagnostics,
            listResolvedSurfaces,
            resolvedSurfaces,
        ],
    );

    return (
        <AdminResolvedControlsContext.Provider value={value}>
            {children}
        </AdminResolvedControlsContext.Provider>
    );
}

export function useAdminResolvedControls(): AdminResolvedControlsContextValue {
    const context = useContext(AdminResolvedControlsContext);

    if (context) {
        return context;
    }

    return {
        resolvedSurfaces: [],
        diagnostics: [],
        getControlsForSurface: () => [],
        getOwnershipForSurface: () => null,
        listResolvedSurfaces: () => [],
        listDiagnostics: () => [],
    };
}
