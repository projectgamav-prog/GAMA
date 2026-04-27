import type { AdminResolvedControlFamily } from './control-resolution-types';

const FAMILY_PRIORITY: Record<AdminResolvedControlFamily, number> = {
    edit: 10,
    create: 30,
    reorder: 40,
    manage: 50,
    navigate: 80,
    delete: 100,
};

export function resolveControlPriority(
    family: AdminResolvedControlFamily,
    offset = 0,
): number {
    return FAMILY_PRIORITY[family] + offset;
}
