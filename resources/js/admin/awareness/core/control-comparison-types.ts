import type { AdminSurfaceContract } from '@/admin/surfaces/core/surface-contracts';
import type {
    AdminControlOwnership,
    AdminResolvedSurfaceControls,
} from './control-ownership-types';
import type {
    AdminResolvedControlMode,
    AdminResolvedControlPlacement,
} from './control-resolution-types';

export type AdminControlComparisonState =
    | 'matched'
    | 'resolver_missing'
    | 'current_missing'
    | 'placement_mismatch'
    | 'mode_mismatch'
    | 'duplicate_risk'
    | 'missing_metadata'
    | 'ready_for_awareness_ownership'
    | 'not_ready';

export type AdminControlComparisonDiagnosticSeverity = 'info' | 'warning';

export type AdminCurrentVisibleControl = {
    key: string;
    label?: string | null;
    family?: string | null;
    mode?: AdminResolvedControlMode | string | null;
    placement?: AdminResolvedControlPlacement | string | null;
    source: 'module_host' | 'editable_surface' | (string & {});
};

export type AdminCurrentVisibleControlSurface = {
    surfaceId?: string | null;
    surface: AdminSurfaceContract;
    controls: readonly AdminCurrentVisibleControl[];
};

export type AdminControlComparisonReadiness = {
    ready: boolean;
    reasons: readonly string[];
};

export type AdminControlComparisonResult = {
    surfaceId: string;
    states: readonly AdminControlComparisonState[];
    currentControls: readonly AdminCurrentVisibleControl[];
    resolvedSurface: AdminResolvedSurfaceControls;
    ownership: AdminControlOwnership;
    readiness: AdminControlComparisonReadiness;
    mismatchReasons: readonly string[];
};

export type AdminControlComparisonDiagnostic = {
    key: string;
    surfaceId?: string | null;
    severity: AdminControlComparisonDiagnosticSeverity;
    message: string;
    reason?: string | null;
};
