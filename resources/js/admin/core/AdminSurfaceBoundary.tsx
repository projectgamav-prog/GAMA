import type { ReactNode } from 'react';
import type { AdminSurfaceContract } from '@/admin/surfaces/core/surface-contracts';
import { AdminEditableSurface } from './AdminEditableSurface';

type Props = {
    surface?: AdminSurfaceContract | null;
    children: ReactNode;
    emptyPlaceholder?: ReactNode;
};

export function AdminSurfaceBoundary({
    surface = null,
    children,
    emptyPlaceholder = null,
}: Props) {
    if (!surface) {
        return <>{children}</>;
    }

    return (
        <AdminEditableSurface
            surface={surface}
            emptyPlaceholder={emptyPlaceholder}
        >
            {children}
        </AdminEditableSurface>
    );
}
