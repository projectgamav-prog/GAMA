import type { AdminOrderingContext } from '../../core/awareness-types';

export const cmsBlockOrderingRule = {
    orderFamily: 'cms',
    canReorder: true,
} satisfies Pick<AdminOrderingContext, 'orderFamily' | 'canReorder'>;
