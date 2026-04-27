import { useEffect } from 'react';
import type { DependencyList } from 'react';
import type { AdminAddAnchorContext } from './add-anchor-context';
import { useAdminOrderingManifest } from './AdminOrderingManifestProvider';

export function useRegisterAdminAddAnchor(
    anchor: AdminAddAnchorContext | null,
    dependencies: DependencyList = [],
): void {
    const { registerAddAnchor, unregisterAddAnchor } =
        useAdminOrderingManifest();

    useEffect(() => {
        if (!anchor) {
            return undefined;
        }

        const key = registerAddAnchor(anchor);

        return () => unregisterAddAnchor(key);
        // The caller owns the dependency list because anchor facts can be
        // assembled from several focused contexts.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [registerAddAnchor, unregisterAddAnchor, ...dependencies]);
}
