import type {
    AdminControlResolutionInput,
    AdminResolvedControl,
    AdminResolvedControlPlacement,
} from './control-resolution-types';

export type AdminControlOwnerKind =
    | 'quick_edit_overlay'
    | 'structured_editor'
    | 'full_edit'
    | 'mixed'
    | 'none'
    | 'unresolved';

export type AdminControlDiagnosticSeverity = 'info' | 'warning';

export type AdminControlDiagnostic = {
    key: string;
    surfaceId?: string | null;
    severity: AdminControlDiagnosticSeverity;
    message: string;
    reason?: string | null;
};

export type AdminControlOwnership = {
    surfaceId: string;
    ownerKind: AdminControlOwnerKind;
    preferredPlacement?: AdminResolvedControlPlacement | null;
    hasDuplicateRisk: boolean;
    reasons: readonly string[];
};

export type AdminResolvedSurfaceControls = {
    surfaceId: string;
    input: AdminControlResolutionInput;
    controls: readonly AdminResolvedControl[];
    ownership: AdminControlOwnership;
};
