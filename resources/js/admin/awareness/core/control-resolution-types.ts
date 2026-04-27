import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';
import type { AdminActionCapabilityContext } from './action-capability-context';
import type { AdminBlockContext } from './block-context';
import type { AdminEntityContext } from './entity-context';
import type { AdminLayoutPositionContext } from './layout-position-context';
import type { AdminOrderingContext } from './ordering-context';
import type { AdminQuickEditContext } from './quick-edit-context';
import type { AdminSchemaConstraintContext } from './schema-constraint-context';
import type { AdminSurfaceContext } from './surface-context';

export type AdminResolvedControlPlacement =
    | 'top-right'
    | 'bottom-edge'
    | 'inline-end'
    | 'section-header'
    | 'between-items'
    | 'floating-chip'
    | (string & {});

export type AdminResolvedControlMode =
    | 'quick_edit'
    | 'structured_editor'
    | 'drawer'
    | 'full_edit'
    | 'none';

export type AdminResolvedControlFamily =
    | 'edit'
    | 'create'
    | 'reorder'
    | 'delete'
    | 'manage'
    | 'navigate';

export type AdminControlResolutionInput = {
    entity: AdminEntityContext;
    surface?: AdminSurfaceContext | null;
    block?: AdminBlockContext | null;
    layout?: AdminLayoutPositionContext | null;
    actionCapabilities?: AdminActionCapabilityContext | null;
    quickEdit?: AdminQuickEditContext | null;
    ordering?: AdminOrderingContext | null;
    schemaConstraints?: AdminSchemaConstraintContext | null;
};

export type AdminResolvedControl = {
    key: string;
    label: ReactNode;
    iconKey?: string | null;
    icon?: LucideIcon;
    family: AdminResolvedControlFamily;
    mode: AdminResolvedControlMode;
    placement: AdminResolvedControlPlacement;
    priority: number;
    disabled?: boolean;
    reason?: string | null;
};
