import type { AdminOrderingContext } from '../../core/awareness-types';

export const scriptureCanonicalOrderingRule = {
    orderFamily: 'canonical',
    canReorder: false,
    protectedReason:
        'Canonical scripture order is protected outside structured canonical editors.',
} satisfies Pick<
    AdminOrderingContext,
    'orderFamily' | 'canReorder' | 'protectedReason'
>;
