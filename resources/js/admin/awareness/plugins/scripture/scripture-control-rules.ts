import type { AdminResolvedControlFamily } from '../../core/awareness-types';

export const scriptureProtectedControlFamilies = [
    'edit',
    'create',
    'manage',
    'navigate',
] satisfies readonly AdminResolvedControlFamily[];
