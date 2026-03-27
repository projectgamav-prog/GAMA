import { usePage } from '@inertiajs/react';
import type { AdminContext } from '@/types';

export function useAdminContext(): AdminContext {
    const { adminContext } = usePage().props;

    return adminContext;
}

export function useCanSeeAdminControls(): boolean {
    const page = usePage<{ adminContext: AdminContext; isAdmin?: boolean }>();

    if (page.props.isAdmin === true) {
        return true;
    }

    const adminContext = page.props.adminContext;

    return adminContext.canAccess && adminContext.isVisible;
}
