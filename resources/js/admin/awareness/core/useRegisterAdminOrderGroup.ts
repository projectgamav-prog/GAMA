import { useEffect } from 'react';
import type { DependencyList } from 'react';
import type {
    AdminOrderGroupContext,
    AdminOrderItemPositionContext,
} from './order-group-context';
import { useAdminOrderingManifest } from './AdminOrderingManifestProvider';

export function useRegisterAdminOrderGroup(
    group: AdminOrderGroupContext | null,
    dependencies: DependencyList = [],
): void {
    const { registerOrderGroup, unregisterOrderGroup } =
        useAdminOrderingManifest();

    useEffect(() => {
        if (!group) {
            return undefined;
        }

        const key = registerOrderGroup(group);

        return () => unregisterOrderGroup(key);
        // The caller owns the dependency list because ordering facts can be
        // assembled from several focused contexts.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [registerOrderGroup, unregisterOrderGroup, ...dependencies]);
}

export function useRegisterAdminOrderItem(
    item: AdminOrderItemPositionContext | null,
    dependencies: DependencyList = [],
): void {
    const { registerItemPosition, unregisterItemPosition } =
        useAdminOrderingManifest();

    useEffect(() => {
        if (!item) {
            return undefined;
        }

        const key = registerItemPosition(item);

        return () => unregisterItemPosition(key);
        // The caller owns the dependency list because ordering facts can be
        // assembled from several focused contexts.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [registerItemPosition, unregisterItemPosition, ...dependencies]);
}
