import {
    createContext,
    useCallback,
    useContext,
    useMemo,
    useState,
} from 'react';
import type { ReactNode } from 'react';
import type { AdminAddAnchorContext } from './add-anchor-context';
import type {
    AdminOrderGroupContext,
    AdminOrderItemPositionContext,
} from './order-group-context';
import type { AdminOrderingDiagnostic } from './ordering-awareness-types';

export type AdminOrderingManifestContextValue = {
    orderGroups: readonly AdminOrderGroupContext[];
    items: readonly AdminOrderItemPositionContext[];
    anchors: readonly AdminAddAnchorContext[];
    registerOrderGroup: (group: AdminOrderGroupContext) => string;
    updateOrderGroup: (
        key: string,
        group: Partial<AdminOrderGroupContext>,
    ) => void;
    unregisterOrderGroup: (key: string) => void;
    registerItemPosition: (item: AdminOrderItemPositionContext) => string;
    updateItemPosition: (
        key: string,
        item: Partial<AdminOrderItemPositionContext>,
    ) => void;
    unregisterItemPosition: (key: string) => void;
    registerAddAnchor: (anchor: AdminAddAnchorContext) => string;
    updateAddAnchor: (
        key: string,
        anchor: Partial<AdminAddAnchorContext>,
    ) => void;
    unregisterAddAnchor: (key: string) => void;
    listOrderGroups: () => readonly AdminOrderGroupContext[];
    getOrderGroup: (key: string) => AdminOrderGroupContext | null;
    listItemsForGroup: (
        key: string,
    ) => readonly AdminOrderItemPositionContext[];
    listAnchorsForGroup: (key: string) => readonly AdminAddAnchorContext[];
    listOrderingDiagnostics: () => readonly AdminOrderingDiagnostic[];
};

const AdminOrderingManifestContext =
    createContext<AdminOrderingManifestContextValue | null>(null);

function buildOrderingDiagnostics({
    anchors,
    items,
    orderGroups,
}: {
    orderGroups: readonly AdminOrderGroupContext[];
    items: readonly AdminOrderItemPositionContext[];
    anchors: readonly AdminAddAnchorContext[];
}): AdminOrderingDiagnostic[] {
    const diagnostics: AdminOrderingDiagnostic[] = [];
    const groupsByKey = new Map(
        orderGroups.map((group) => [group.orderGroupKey, group]),
    );
    const itemKeysByGroup = new Map<string, string[]>();

    items.forEach((item) => {
        const group = groupsByKey.get(item.orderGroupKey);
        const itemKeys = itemKeysByGroup.get(item.orderGroupKey) ?? [];

        itemKeysByGroup.set(item.orderGroupKey, [...itemKeys, item.itemKey]);

        if (!group && item.index !== null && item.index !== undefined) {
            diagnostics.push({
                key: `item-without-group:${item.itemKey}`,
                orderGroupKey: item.orderGroupKey,
                severity: 'warning',
                message: 'Order item has an index but no registered order group.',
            });
        }

        if (!item.itemKey) {
            diagnostics.push({
                key: `item-missing-key:${item.orderGroupKey}`,
                orderGroupKey: item.orderGroupKey,
                severity: 'warning',
                message: 'Order group item is missing a stable key.',
            });
        }
    });

    itemKeysByGroup.forEach((itemKeys, orderGroupKey) => {
        const duplicateKeys = itemKeys.filter(
            (itemKey, index) => itemKeys.indexOf(itemKey) !== index,
        );

        [...new Set(duplicateKeys)].forEach((itemKey) => {
            diagnostics.push({
                key: `duplicate-item:${orderGroupKey}:${itemKey}`,
                orderGroupKey,
                severity: 'warning',
                message: 'Duplicate item key emitted in the same order group.',
                reason: itemKey,
            });
        });
    });

    orderGroups.forEach((group) => {
        const groupItems = items.filter(
            (item) => item.orderGroupKey === group.orderGroupKey,
        );

        if (group.canReorder && groupItems.some((item) => !item.itemKey)) {
            diagnostics.push({
                key: `reorder-with-unstable-items:${group.orderGroupKey}`,
                orderGroupKey: group.orderGroupKey,
                severity: 'warning',
                message: 'Order group allows reorder but at least one item lacks a stable key.',
            });
        }

        if (group.orderFamily === 'canonical' && group.canReorder) {
            diagnostics.push({
                key: `canonical-casual-reorder:${group.orderGroupKey}`,
                orderGroupKey: group.orderGroupKey,
                severity: 'warning',
                message: 'Canonical order group exposes casual reorder.',
                reason:
                    group.protectedReason ??
                    'Canonical order should remain protected unless an explicit workflow owns it.',
            });
        }
    });

    anchors.forEach((anchor) => {
        const group = groupsByKey.get(anchor.orderGroupKey);

        if (!group) {
            diagnostics.push({
                key: `anchor-without-group:${anchor.anchorKey}`,
                orderGroupKey: anchor.orderGroupKey,
                severity: 'warning',
                message: 'Add anchor has no registered order group.',
            });
        }

        if (
            anchor.canCreate &&
            (anchor.allowedContentTypes?.length ?? 0) === 0
        ) {
            diagnostics.push({
                key: `anchor-without-types:${anchor.anchorKey}`,
                orderGroupKey: anchor.orderGroupKey,
                severity: 'info',
                message: 'Add anchor allows create but has no allowed content types.',
            });
        }

        if (
            anchor.preferredPlacement === 'between-items' &&
            !anchor.beforeItemKey &&
            !anchor.afterItemKey
        ) {
            diagnostics.push({
                key: `anchor-placement-conflict:${anchor.anchorKey}`,
                orderGroupKey: anchor.orderGroupKey,
                severity: 'info',
                message: 'Between-items add anchor has no neighboring item key.',
            });
        }
    });

    return diagnostics;
}

export function AdminOrderingManifestProvider({
    children,
}: {
    children: ReactNode;
}) {
    const [orderGroupsByKey, setOrderGroupsByKey] = useState<
        Record<string, AdminOrderGroupContext>
    >({});
    const [itemsByKey, setItemsByKey] = useState<
        Record<string, AdminOrderItemPositionContext>
    >({});
    const [anchorsByKey, setAnchorsByKey] = useState<
        Record<string, AdminAddAnchorContext>
    >({});

    const registerOrderGroup = useCallback((group: AdminOrderGroupContext) => {
        setOrderGroupsByKey((current) => ({
            ...current,
            [group.orderGroupKey]: group,
        }));

        return group.orderGroupKey;
    }, []);

    const updateOrderGroup = useCallback(
        (key: string, group: Partial<AdminOrderGroupContext>) => {
            setOrderGroupsByKey((current) => {
                const existing = current[key];

                if (!existing) {
                    return current;
                }

                return {
                    ...current,
                    [key]: {
                        ...existing,
                        ...group,
                        orderGroupKey: key,
                    },
                };
            });
        },
        [],
    );

    const unregisterOrderGroup = useCallback((key: string) => {
        setOrderGroupsByKey((current) => {
            const { [key]: _removed, ...rest } = current;

            return rest;
        });
    }, []);

    const registerItemPosition = useCallback(
        (item: AdminOrderItemPositionContext) => {
            setItemsByKey((current) => ({
                ...current,
                [item.itemKey]: item,
            }));

            return item.itemKey;
        },
        [],
    );

    const updateItemPosition = useCallback(
        (key: string, item: Partial<AdminOrderItemPositionContext>) => {
            setItemsByKey((current) => {
                const existing = current[key];

                if (!existing) {
                    return current;
                }

                return {
                    ...current,
                    [key]: {
                        ...existing,
                        ...item,
                        itemKey: key,
                    },
                };
            });
        },
        [],
    );

    const unregisterItemPosition = useCallback((key: string) => {
        setItemsByKey((current) => {
            const { [key]: _removed, ...rest } = current;

            return rest;
        });
    }, []);

    const registerAddAnchor = useCallback((anchor: AdminAddAnchorContext) => {
        setAnchorsByKey((current) => ({
            ...current,
            [anchor.anchorKey]: anchor,
        }));

        return anchor.anchorKey;
    }, []);

    const updateAddAnchor = useCallback(
        (key: string, anchor: Partial<AdminAddAnchorContext>) => {
            setAnchorsByKey((current) => {
                const existing = current[key];

                if (!existing) {
                    return current;
                }

                return {
                    ...current,
                    [key]: {
                        ...existing,
                        ...anchor,
                        anchorKey: key,
                    },
                };
            });
        },
        [],
    );

    const unregisterAddAnchor = useCallback((key: string) => {
        setAnchorsByKey((current) => {
            const { [key]: _removed, ...rest } = current;

            return rest;
        });
    }, []);

    const orderGroups = useMemo(
        () => Object.values(orderGroupsByKey),
        [orderGroupsByKey],
    );
    const items = useMemo(() => Object.values(itemsByKey), [itemsByKey]);
    const anchors = useMemo(() => Object.values(anchorsByKey), [anchorsByKey]);
    const diagnostics = useMemo(
        () => buildOrderingDiagnostics({ anchors, items, orderGroups }),
        [anchors, items, orderGroups],
    );

    const listOrderGroups = useCallback(() => orderGroups, [orderGroups]);
    const getOrderGroup = useCallback(
        (key: string) => orderGroupsByKey[key] ?? null,
        [orderGroupsByKey],
    );
    const listItemsForGroup = useCallback(
        (key: string) => items.filter((item) => item.orderGroupKey === key),
        [items],
    );
    const listAnchorsForGroup = useCallback(
        (key: string) =>
            anchors.filter((anchor) => anchor.orderGroupKey === key),
        [anchors],
    );
    const listOrderingDiagnostics = useCallback(
        () => diagnostics,
        [diagnostics],
    );

    const value = useMemo<AdminOrderingManifestContextValue>(
        () => ({
            orderGroups,
            items,
            anchors,
            registerOrderGroup,
            updateOrderGroup,
            unregisterOrderGroup,
            registerItemPosition,
            updateItemPosition,
            unregisterItemPosition,
            registerAddAnchor,
            updateAddAnchor,
            unregisterAddAnchor,
            listOrderGroups,
            getOrderGroup,
            listItemsForGroup,
            listAnchorsForGroup,
            listOrderingDiagnostics,
        }),
        [
            anchors,
            getOrderGroup,
            items,
            listAnchorsForGroup,
            listItemsForGroup,
            listOrderGroups,
            listOrderingDiagnostics,
            orderGroups,
            registerAddAnchor,
            registerItemPosition,
            registerOrderGroup,
            unregisterAddAnchor,
            unregisterItemPosition,
            unregisterOrderGroup,
            updateAddAnchor,
            updateItemPosition,
            updateOrderGroup,
        ],
    );

    return (
        <AdminOrderingManifestContext.Provider value={value}>
            {children}
        </AdminOrderingManifestContext.Provider>
    );
}

export function useAdminOrderingManifest(): AdminOrderingManifestContextValue {
    const context = useContext(AdminOrderingManifestContext);

    if (context) {
        return context;
    }

    return {
        orderGroups: [],
        items: [],
        anchors: [],
        registerOrderGroup: (group) => group.orderGroupKey,
        updateOrderGroup: () => undefined,
        unregisterOrderGroup: () => undefined,
        registerItemPosition: (item) => item.itemKey,
        updateItemPosition: () => undefined,
        unregisterItemPosition: () => undefined,
        registerAddAnchor: (anchor) => anchor.anchorKey,
        updateAddAnchor: () => undefined,
        unregisterAddAnchor: () => undefined,
        listOrderGroups: () => [],
        getOrderGroup: () => null,
        listItemsForGroup: () => [],
        listAnchorsForGroup: () => [],
        listOrderingDiagnostics: () => [],
    };
}
