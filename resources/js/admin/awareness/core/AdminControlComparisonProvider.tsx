import {
    createContext,
    useCallback,
    useContext,
    useMemo,
    useState,
} from 'react';
import type { ReactNode } from 'react';
import { useAdminResolvedControls } from './AdminResolvedControlsProvider';
import {
    currentSurfaceMatchesResolvedSurface,
    surfaceContractSignature,
} from './control-comparison-helpers';
import {
    buildControlComparisonDiagnostics,
    buildControlComparisonResult,
} from './control-comparison-diagnostics';
import type {
    AdminControlComparisonDiagnostic,
    AdminControlComparisonResult,
    AdminCurrentVisibleControlSurface,
} from './control-comparison-types';

export type AdminControlComparisonContextValue = {
    comparisons: readonly AdminControlComparisonResult[];
    diagnostics: readonly AdminControlComparisonDiagnostic[];
    currentSurfaces: readonly AdminCurrentVisibleControlSurface[];
    registerCurrentControls: (
        summary: AdminCurrentVisibleControlSurface,
    ) => string;
    unregisterCurrentControls: (key: string) => void;
    getComparisonForSurface: (
        surfaceId: string,
    ) => AdminControlComparisonResult | null;
    listComparisons: () => readonly AdminControlComparisonResult[];
    listReadyForAwarenessOwnership: () => readonly AdminControlComparisonResult[];
    listComparisonDiagnostics: () => readonly AdminControlComparisonDiagnostic[];
};

const AdminControlComparisonContext =
    createContext<AdminControlComparisonContextValue | null>(null);

function currentControlKey(summary: AdminCurrentVisibleControlSurface): string {
    return summary.surfaceId ?? surfaceContractSignature(summary.surface);
}

export function AdminControlComparisonProvider({
    children,
}: {
    children: ReactNode;
}) {
    const { resolvedSurfaces } = useAdminResolvedControls();
    const [currentSurfacesByKey, setCurrentSurfacesByKey] = useState<
        Record<string, AdminCurrentVisibleControlSurface>
    >({});

    const registerCurrentControls = useCallback(
        (summary: AdminCurrentVisibleControlSurface) => {
            const key = currentControlKey(summary);

            setCurrentSurfacesByKey((current) => ({
                ...current,
                [key]: summary,
            }));

            return key;
        },
        [],
    );

    const unregisterCurrentControls = useCallback((key: string) => {
        setCurrentSurfacesByKey((current) => {
            const { [key]: _removed, ...rest } = current;

            return rest;
        });
    }, []);

    const currentSurfaces = useMemo(
        () => Object.values(currentSurfacesByKey),
        [currentSurfacesByKey],
    );

    const comparisons = useMemo<AdminControlComparisonResult[]>(
        () =>
            resolvedSurfaces.map((resolvedSurface) => {
                const current = currentSurfaces.find((candidate) =>
                    currentSurfaceMatchesResolvedSurface(
                        candidate,
                        resolvedSurface.input,
                    ),
                );

                return buildControlComparisonResult({
                    currentControls: current?.controls ?? [],
                    resolvedSurface,
                });
            }),
        [currentSurfaces, resolvedSurfaces],
    );

    const diagnostics = useMemo(
        () => buildControlComparisonDiagnostics(comparisons),
        [comparisons],
    );

    const getComparisonForSurface = useCallback(
        (surfaceId: string) =>
            comparisons.find(
                (comparison) => comparison.surfaceId === surfaceId,
            ) ?? null,
        [comparisons],
    );

    const listComparisons = useCallback(() => comparisons, [comparisons]);

    const listReadyForAwarenessOwnership = useCallback(
        () => comparisons.filter((comparison) => comparison.readiness.ready),
        [comparisons],
    );

    const listComparisonDiagnostics = useCallback(
        () => diagnostics,
        [diagnostics],
    );

    const value = useMemo<AdminControlComparisonContextValue>(
        () => ({
            comparisons,
            diagnostics,
            currentSurfaces,
            registerCurrentControls,
            unregisterCurrentControls,
            getComparisonForSurface,
            listComparisons,
            listReadyForAwarenessOwnership,
            listComparisonDiagnostics,
        }),
        [
            comparisons,
            currentSurfaces,
            diagnostics,
            getComparisonForSurface,
            listComparisonDiagnostics,
            listComparisons,
            listReadyForAwarenessOwnership,
            registerCurrentControls,
            unregisterCurrentControls,
        ],
    );

    return (
        <AdminControlComparisonContext.Provider value={value}>
            {children}
        </AdminControlComparisonContext.Provider>
    );
}

export function useAdminControlComparison(): AdminControlComparisonContextValue {
    const context = useContext(AdminControlComparisonContext);

    if (context) {
        return context;
    }

    return {
        comparisons: [],
        diagnostics: [],
        currentSurfaces: [],
        registerCurrentControls: (summary) => currentControlKey(summary),
        unregisterCurrentControls: () => undefined,
        getComparisonForSurface: () => null,
        listComparisons: () => [],
        listReadyForAwarenessOwnership: () => [],
        listComparisonDiagnostics: () => [],
    };
}
