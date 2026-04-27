import {
    currentHasComparableMode,
    currentHasComparablePlacement,
    hasKnownMode,
    hasKnownPlacement,
} from './control-comparison-helpers';
import type {
    AdminControlComparisonDiagnostic,
    AdminControlComparisonReadiness,
    AdminControlComparisonResult,
    AdminControlComparisonState,
    AdminCurrentVisibleControl,
} from './control-comparison-types';
import type { AdminResolvedSurfaceControls } from './control-ownership-types';

function readinessForSurface({
    currentControls,
    resolvedSurface,
}: {
    currentControls: readonly AdminCurrentVisibleControl[];
    resolvedSurface: AdminResolvedSurfaceControls;
}): AdminControlComparisonReadiness {
    const reasons: string[] = [];
    const resolvedControls = resolvedSurface.controls;
    const ownership = resolvedSurface.ownership;

    if (resolvedControls.length === 0) {
        reasons.push('Resolver produced no controls.');
    }

    if (ownership.hasDuplicateRisk) {
        reasons.push('Ownership diagnostics report duplicate-control risk.');
    }

    if (!hasKnownPlacement(resolvedControls)) {
        reasons.push('Resolver controls do not have a known placement.');
    }

    if (!hasKnownMode(resolvedControls)) {
        reasons.push('Resolver controls do not have a known edit mode.');
    }

    if (ownership.ownerKind === 'none' || ownership.ownerKind === 'unresolved') {
        reasons.push('Resolver ownership is not clear enough for handoff.');
    }

    if (ownership.ownerKind === 'mixed') {
        reasons.push('Multiple incompatible edit owners are active.');
    }

    if (currentControls.length === 0) {
        reasons.push('Current visible control metadata has not been observed.');
    }

    if (
        !currentHasComparableMode(currentControls, resolvedControls) ||
        !currentHasComparablePlacement(currentControls, resolvedControls)
    ) {
        reasons.push('Current controls and resolver controls do not fully match.');
    }

    const schemaBlocks =
        resolvedSurface.input.schemaConstraints?.isProtected &&
        resolvedControls.some((control) => !control.disabled);

    if (schemaBlocks) {
        reasons.push('Schema constraints require protection review.');
    }

    return {
        ready: reasons.length === 0,
        reasons,
    };
}

export function buildControlComparisonResult({
    currentControls,
    resolvedSurface,
}: {
    currentControls: readonly AdminCurrentVisibleControl[];
    resolvedSurface: AdminResolvedSurfaceControls;
}): AdminControlComparisonResult {
    const states: AdminControlComparisonState[] = [];
    const mismatchReasons: string[] = [];
    const resolvedControls = resolvedSurface.controls;
    const ownership = resolvedSurface.ownership;
    const readiness = readinessForSurface({ currentControls, resolvedSurface });

    if (resolvedControls.length === 0) {
        states.push('resolver_missing');
        mismatchReasons.push('Resolver produced no controls.');
    }

    if (currentControls.length === 0) {
        states.push('current_missing');
        mismatchReasons.push('No current visible control metadata was observed.');
    }

    if (!hasKnownPlacement(resolvedControls)) {
        states.push('missing_metadata');
        mismatchReasons.push('Resolver control placement is missing.');
    } else if (
        !currentHasComparablePlacement(currentControls, resolvedControls)
    ) {
        states.push('placement_mismatch');
        mismatchReasons.push('Current and resolver placements differ.');
    }

    if (!hasKnownMode(resolvedControls)) {
        states.push('missing_metadata');
        mismatchReasons.push('Resolver control mode is missing.');
    } else if (!currentHasComparableMode(currentControls, resolvedControls)) {
        states.push('mode_mismatch');
        mismatchReasons.push('Current and resolver modes differ.');
    }

    if (ownership.hasDuplicateRisk) {
        states.push('duplicate_risk');
        mismatchReasons.push(...ownership.reasons);
    }

    if (states.length === 0) {
        states.push('matched');
    }

    states.push(
        readiness.ready ? 'ready_for_awareness_ownership' : 'not_ready',
    );

    return {
        surfaceId: resolvedSurface.surfaceId,
        states: [...new Set(states)],
        currentControls,
        resolvedSurface,
        ownership,
        readiness,
        mismatchReasons: [...new Set(mismatchReasons)],
    };
}

export function buildControlComparisonDiagnostics(
    comparisons: readonly AdminControlComparisonResult[],
): AdminControlComparisonDiagnostic[] {
    return comparisons.flatMap((comparison) => {
        const diagnostics: AdminControlComparisonDiagnostic[] = [];

        if (comparison.states.includes('current_missing')) {
            diagnostics.push({
                key: `current-missing:${comparison.surfaceId}`,
                surfaceId: comparison.surfaceId,
                severity: 'info',
                message: 'No current visible control metadata was observed for this surface.',
            });
        }

        if (comparison.states.includes('resolver_missing')) {
            diagnostics.push({
                key: `resolver-missing:${comparison.surfaceId}`,
                surfaceId: comparison.surfaceId,
                severity: 'warning',
                message: 'Resolver produced no controls for a surfaced admin region.',
            });
        }

        if (comparison.states.includes('placement_mismatch')) {
            diagnostics.push({
                key: `placement-mismatch:${comparison.surfaceId}`,
                surfaceId: comparison.surfaceId,
                severity: 'warning',
                message: 'Current visible controls and resolver controls disagree on placement.',
            });
        }

        if (comparison.states.includes('mode_mismatch')) {
            diagnostics.push({
                key: `mode-mismatch:${comparison.surfaceId}`,
                surfaceId: comparison.surfaceId,
                severity: 'warning',
                message: 'Current visible controls and resolver controls disagree on edit mode.',
            });
        }

        if (comparison.states.includes('duplicate_risk')) {
            diagnostics.push({
                key: `duplicate-risk:${comparison.surfaceId}`,
                surfaceId: comparison.surfaceId,
                severity: 'warning',
                message: 'Surface is not ready because duplicate-control risk exists.',
                reason: comparison.ownership.reasons.join(' '),
            });
        }

        if (comparison.states.includes('missing_metadata')) {
            diagnostics.push({
                key: `missing-metadata:${comparison.surfaceId}`,
                surfaceId: comparison.surfaceId,
                severity: 'warning',
                message: 'Surface is missing metadata needed for ownership handoff.',
                reason: comparison.mismatchReasons.join(' '),
            });
        }

        if (comparison.readiness.ready) {
            diagnostics.push({
                key: `ready:${comparison.surfaceId}`,
                surfaceId: comparison.surfaceId,
                severity: 'info',
                message: 'Surface is ready for a future awareness-owned overlay trial.',
            });
        }

        return diagnostics;
    });
}
