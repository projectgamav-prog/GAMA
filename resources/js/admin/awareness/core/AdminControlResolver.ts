import type {
    AdminControlResolutionInput,
    AdminResolvedControl,
} from './control-resolution-types';
import { buildResolvedControl } from './control-resolution-defaults';
import {
    actionCapabilitiesFromSurface,
    getFullEditHref,
    isCasualMutationProtected,
    protectedMutationReason,
    resolveEditMode,
} from './control-resolution-helpers';

export type AdminControlResolverRule = (
    input: AdminControlResolutionInput,
    controls: readonly AdminResolvedControl[],
) => readonly AdminResolvedControl[];

const sortControls = (
    controls: readonly AdminResolvedControl[],
): AdminResolvedControl[] =>
    [...controls].sort((left, right) => {
        const priorityDifference = left.priority - right.priority;

        if (priorityDifference !== 0) {
            return priorityDifference;
        }

        return left.key.localeCompare(right.key);
    });

function resolveEditControls(
    input: AdminControlResolutionInput,
): AdminResolvedControl[] {
    const controls: AdminResolvedControl[] = [];
    const editMode = resolveEditMode(input);
    const fullEditHref = getFullEditHref(input);

    if (editMode) {
        controls.push(
            buildResolvedControl({
                input,
                key: `edit:${editMode}`,
                label:
                    editMode === 'quick_edit'
                        ? 'Edit'
                        : editMode === 'structured_editor'
                          ? 'Edit'
                          : 'Full edit',
                iconKey: editMode === 'full_edit' ? 'external-link' : 'edit',
                family: editMode === 'full_edit' ? 'navigate' : 'edit',
                mode: editMode,
            }),
        );
    }

    if (fullEditHref && editMode !== 'full_edit') {
        controls.push(
            buildResolvedControl({
                input,
                key: 'navigate:full-edit',
                label: 'Full edit',
                iconKey: 'external-link',
                family: 'navigate',
                mode: 'full_edit',
            }),
        );
    }

    return controls;
}

function resolveCreateControls(
    input: AdminControlResolutionInput,
): AdminResolvedControl[] {
    const capabilities = actionCapabilitiesFromSurface(input);
    const protectedMutation = isCasualMutationProtected(input);
    const reason = protectedMutation ? protectedMutationReason(input) : null;
    const controls: AdminResolvedControl[] = [];

    if (capabilities.canCreateBefore) {
        controls.push(
            buildResolvedControl({
                input,
                key: 'create:before',
                label: 'Add before',
                iconKey: 'plus',
                family: 'create',
                mode: 'structured_editor',
                disabled: protectedMutation,
                reason,
            }),
        );
    }

    if (capabilities.canCreateAfter) {
        controls.push(
            buildResolvedControl({
                input,
                key: 'create:after',
                label: 'Add after',
                iconKey: 'plus',
                family: 'create',
                mode: 'structured_editor',
                priorityOffset: 1,
                disabled: protectedMutation,
                reason,
            }),
        );
    }

    if (capabilities.canCreateInside) {
        controls.push(
            buildResolvedControl({
                input,
                key: 'create:inside',
                label: 'Add inside',
                iconKey: 'plus',
                family: 'create',
                mode: 'structured_editor',
                priorityOffset: 2,
                disabled: protectedMutation,
                reason,
            }),
        );
    }

    return controls;
}

function resolveOrderingControls(
    input: AdminControlResolutionInput,
): AdminResolvedControl[] {
    const ordering = input.ordering;

    if (!ordering) {
        return [];
    }

    const isCanonicalProtected =
        ordering.orderFamily === 'canonical' && !ordering.canReorder;

    if (isCanonicalProtected) {
        return [];
    }

    if (!ordering.canReorder) {
        return [];
    }

    return [
        buildResolvedControl({
            input,
            key: 'reorder:earlier',
            label: 'Move earlier',
            iconKey: 'arrow-up',
            family: 'reorder',
            mode: 'structured_editor',
            disabled: ordering.isFirst ?? false,
            reason: ordering.isFirst ? 'Already first in this group.' : null,
        }),
        buildResolvedControl({
            input,
            key: 'reorder:later',
            label: 'Move later',
            iconKey: 'arrow-down',
            family: 'reorder',
            mode: 'structured_editor',
            priorityOffset: 1,
            disabled: ordering.isLast ?? false,
            reason: ordering.isLast ? 'Already last in this group.' : null,
        }),
    ];
}

function resolveManageControls(
    input: AdminControlResolutionInput,
): AdminResolvedControl[] {
    const capabilities = actionCapabilitiesFromSurface(input);
    const controls: AdminResolvedControl[] = [];

    if (capabilities.canManageMedia) {
        controls.push(
            buildResolvedControl({
                input,
                key: 'manage:media',
                label: 'Media',
                iconKey: 'image',
                family: 'manage',
                mode: 'structured_editor',
            }),
        );
    }

    if (capabilities.canManageRelations) {
        controls.push(
            buildResolvedControl({
                input,
                key: 'manage:relations',
                label: 'Relations',
                iconKey: 'links',
                family: 'manage',
                mode: 'structured_editor',
                priorityOffset: 1,
            }),
        );
    }

    return controls;
}

function resolveDeleteControls(
    input: AdminControlResolutionInput,
): AdminResolvedControl[] {
    const capabilities = actionCapabilitiesFromSurface(input);

    if (!capabilities.canDelete) {
        return [];
    }

    const protectedMutation = isCasualMutationProtected(input);

    return [
        buildResolvedControl({
            input,
            key: 'delete',
            label: 'Delete',
            iconKey: 'trash',
            family: 'delete',
            mode: 'structured_editor',
            disabled: protectedMutation,
            reason: protectedMutation ? protectedMutationReason(input) : null,
        }),
    ];
}

export function resolveAdminControls(
    input: AdminControlResolutionInput,
    rules: readonly AdminControlResolverRule[] = [],
): AdminResolvedControl[] {
    const baseControls = [
        ...resolveEditControls(input),
        ...resolveCreateControls(input),
        ...resolveOrderingControls(input),
        ...resolveManageControls(input),
        ...resolveDeleteControls(input),
    ];

    const resolvedControls = rules.reduce<readonly AdminResolvedControl[]>(
        (controls, rule) => rule(input, controls),
        baseControls,
    );

    return sortControls(resolvedControls);
}
