import type { AdminResolvedControlFamily } from '../../core/awareness-types';

export const cmsBlockControlFamilies = [
    'edit',
    'create',
    'reorder',
    'delete',
    'manage',
] satisfies readonly AdminResolvedControlFamily[];
