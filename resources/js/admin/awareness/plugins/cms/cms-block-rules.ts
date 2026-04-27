import type { AdminActionCapabilityContext } from '../../core/awareness-types';

export const cmsDefaultBlockCapabilities = {
    canQuickEdit: true,
    canStructuredEdit: true,
    canFullEdit: true,
    canCreateBefore: true,
    canCreateAfter: true,
    canCreateInside: false,
    canReorder: true,
    canDelete: true,
} satisfies AdminActionCapabilityContext;
