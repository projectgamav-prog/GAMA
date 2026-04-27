import { useEffect } from 'react';
import type { DependencyList } from 'react';
import type { AdminSurfaceManifestRegistration } from './AdminSurfaceManifestProvider';
import { useAdminSurfaceManifest } from './AdminSurfaceManifestProvider';

export function useRegisterAdminSurface(
    entry: AdminSurfaceManifestRegistration | null,
    dependencies: DependencyList = [],
): void {
    const { registerSurface, unregisterSurface } = useAdminSurfaceManifest();

    useEffect(() => {
        if (!entry) {
            return undefined;
        }

        const key = registerSurface(entry);

        return () => unregisterSurface(key);
        // The caller owns the dependency list because emitted awareness facts
        // can be assembled from many focused contexts.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [registerSurface, unregisterSurface, ...dependencies]);
}
