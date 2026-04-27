import { createContext, useContext } from 'react';
import type { ReactNode } from 'react';
import { AdminControlComparisonProvider } from './AdminControlComparisonProvider';
import type { AdminControlResolutionInput } from './control-resolution-types';
import { AdminOrderingManifestProvider } from './AdminOrderingManifestProvider';
import { AdminResolvedControlsProvider } from './AdminResolvedControlsProvider';
import { AdminSurfaceManifestProvider } from './AdminSurfaceManifestProvider';

export type AdminAwarenessProviderValue = {
    baseInput?: Partial<AdminControlResolutionInput>;
};

const AdminAwarenessContext = createContext<AdminAwarenessProviderValue>({});

export function AdminAwarenessProvider({
    children,
    value,
}: {
    children: ReactNode;
    value?: AdminAwarenessProviderValue;
}) {
    return (
        <AdminAwarenessContext.Provider value={value ?? {}}>
            <AdminOrderingManifestProvider>
                <AdminSurfaceManifestProvider>
                    <AdminResolvedControlsProvider>
                        <AdminControlComparisonProvider>
                            {children}
                        </AdminControlComparisonProvider>
                    </AdminResolvedControlsProvider>
                </AdminSurfaceManifestProvider>
            </AdminOrderingManifestProvider>
        </AdminAwarenessContext.Provider>
    );
}

export function useAdminAwareness(): AdminAwarenessProviderValue {
    return useContext(AdminAwarenessContext);
}
