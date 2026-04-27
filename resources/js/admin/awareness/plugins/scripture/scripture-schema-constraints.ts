import type { AdminSchemaConstraintContext } from '../../core/awareness-types';

export const scriptureCanonicalSchemaConstraints = {
    isCanonical: true,
    isProtected: true,
    protectedMutationReasons: [
        'Canonical scripture hierarchy changes must use protected structured editors.',
    ],
} satisfies AdminSchemaConstraintContext;
