import type { AdminEntityContext, AdminOrderFamily } from './awareness-types';

export type AdminOrderGroupContext = {
    orderGroupKey: string;
    orderFamily: AdminOrderFamily;
    owner?: AdminEntityContext | null;
    itemType?: string | null;
    sortField?: string | null;
    totalItemCount?: number | null;
    canReorder: boolean;
    canCreate: boolean;
    canDelete: boolean;
    protectedReason?: string | null;
    acceptedContentTypes?: readonly string[];
};

export type AdminOrderItemPositionContext = {
    orderGroupKey: string;
    itemKey: string;
    itemType: string;
    itemId?: string | number | null;
    index?: number | null;
    isFirst?: boolean | null;
    isLast?: boolean | null;
    canMoveEarlier?: boolean;
    canMoveLater?: boolean;
    canDelete?: boolean;
    protectedReason?: string | null;
};
