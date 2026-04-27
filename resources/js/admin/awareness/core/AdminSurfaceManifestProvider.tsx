import {
    createContext,
    useCallback,
    useContext,
    useMemo,
    useState,
} from 'react';
import type { ReactNode } from 'react';
import type { AdminControlResolutionInput } from './control-resolution-types';

export type AdminSurfaceManifestEntry = AdminControlResolutionInput & {
    key: string;
};

export type AdminSurfaceManifestRegistration = Omit<
    AdminSurfaceManifestEntry,
    'key'
> & {
    key?: string;
};

export type AdminSurfaceManifestContextValue = {
    entries: readonly AdminSurfaceManifestEntry[];
    registerSurface: (entry: AdminSurfaceManifestRegistration) => string;
    updateSurface: (
        key: string,
        entry: Partial<AdminSurfaceManifestRegistration>,
    ) => void;
    unregisterSurface: (key: string) => void;
    getSurface: (key: string) => AdminSurfaceManifestEntry | null;
};

const AdminSurfaceManifestContext =
    createContext<AdminSurfaceManifestContextValue | null>(null);

const createManifestKey = (entry: AdminSurfaceManifestRegistration): string => {
    if (entry.key) {
        return entry.key;
    }

    const entity = entry.entity;
    const region = entry.surface?.regionKey ?? 'surface';
    const block = entry.block?.blockId ? `:${entry.block.blockId}` : '';

    return `${entity.schemaFamily}:${entity.entityType}:${entity.entityId}:${region}${block}`;
};

export function AdminSurfaceManifestProvider({
    children,
}: {
    children: ReactNode;
}) {
    const [entriesByKey, setEntriesByKey] = useState<
        Record<string, AdminSurfaceManifestEntry>
    >({});

    const registerSurface = useCallback(
        (entry: AdminSurfaceManifestRegistration) => {
            const key = createManifestKey(entry);

            setEntriesByKey((current) => ({
                ...current,
                [key]: {
                    ...entry,
                    key,
                },
            }));

            return key;
        },
        [],
    );

    const updateSurface = useCallback(
        (
            key: string,
            entry: Partial<AdminSurfaceManifestRegistration>,
        ) => {
            setEntriesByKey((current) => {
                const existing = current[key];

                if (!existing) {
                    return current;
                }

                return {
                    ...current,
                    [key]: {
                        ...existing,
                        ...entry,
                        key,
                    },
                };
            });
        },
        [],
    );

    const unregisterSurface = useCallback((key: string) => {
        setEntriesByKey((current) => {
            const { [key]: _removed, ...rest } = current;

            return rest;
        });
    }, []);

    const getSurface = useCallback(
        (key: string) => entriesByKey[key] ?? null,
        [entriesByKey],
    );

    const value = useMemo<AdminSurfaceManifestContextValue>(
        () => ({
            entries: Object.values(entriesByKey),
            registerSurface,
            updateSurface,
            unregisterSurface,
            getSurface,
        }),
        [entriesByKey, getSurface, registerSurface, unregisterSurface, updateSurface],
    );

    return (
        <AdminSurfaceManifestContext.Provider value={value}>
            {children}
        </AdminSurfaceManifestContext.Provider>
    );
}

export function useAdminSurfaceManifest(): AdminSurfaceManifestContextValue {
    const context = useContext(AdminSurfaceManifestContext);

    if (context) {
        return context;
    }

    return {
        entries: [],
        registerSurface: (entry) => createManifestKey(entry),
        updateSurface: () => undefined,
        unregisterSurface: () => undefined,
        getSurface: () => null,
    };
}
