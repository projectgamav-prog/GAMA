import type { AdminAddAnchorContext } from './add-anchor-context';
import type {
    AdminOrderGroupContext,
    AdminOrderItemPositionContext,
} from './order-group-context';

export type AdminOrderingDiagnosticSeverity = 'info' | 'warning';

export type AdminOrderingDiagnostic = {
    key: string;
    orderGroupKey?: string | null;
    severity: AdminOrderingDiagnosticSeverity;
    message: string;
    reason?: string | null;
};

export type AdminOrderingManifestSnapshot = {
    orderGroups: readonly AdminOrderGroupContext[];
    items: readonly AdminOrderItemPositionContext[];
    anchors: readonly AdminAddAnchorContext[];
};
