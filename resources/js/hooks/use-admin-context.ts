import { usePage } from '@inertiajs/react';
import type { AdminContext } from '@/types';

export function useAdminContext(): AdminContext {
    const { adminContext } = usePage().props;

    return adminContext;
}

export function useCanSeeAdminControls(): boolean {
    const adminContext = useAdminContext();

    return adminContext.canAccess && adminContext.isVisible;
}
