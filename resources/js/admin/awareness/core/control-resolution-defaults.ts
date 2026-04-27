import type {
    AdminControlResolutionInput,
    AdminResolvedControl,
    AdminResolvedControlFamily,
    AdminResolvedControlMode,
} from './control-resolution-types';
import { resolveDefaultControlPlacement } from './control-placement-rules';
import { resolveControlPriority } from './control-resolution-priority';

type BuildControlArgs = {
    input: AdminControlResolutionInput;
    key: string;
    label: string;
    iconKey: string;
    family: AdminResolvedControlFamily;
    mode: AdminResolvedControlMode;
    priorityOffset?: number;
    disabled?: boolean;
    reason?: string | null;
};

export function buildResolvedControl({
    input,
    key,
    label,
    iconKey,
    family,
    mode,
    priorityOffset = 0,
    disabled = false,
    reason = null,
}: BuildControlArgs): AdminResolvedControl {
    return {
        key,
        label,
        iconKey,
        family,
        mode,
        placement: resolveDefaultControlPlacement(input, family),
        priority: resolveControlPriority(family, priorityOffset),
        disabled,
        reason,
    };
}
