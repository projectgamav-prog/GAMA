import type { ReactNode } from 'react';
import type { AdminSurfaceContract } from '@/admin/surfaces/core/surface-contracts';
import { AdminEditableSurface } from './AdminEditableSurface';

type Props = {
    surface?: AdminSurfaceContract | null;
    children: ReactNode;
    emptyPlaceholder?: ReactNode;
    className?: string;
};

export function AdminSurfaceBoundary({
    surface = null,
    children,
    className,
    emptyPlaceholder = null,
}: Props) {
    if (!surface) {
        return <>{children}</>;
    }

    return (
        <AdminEditableSurface
            surface={surface}
            className={className}
            emptyPlaceholder={emptyPlaceholder}
        >
            {children}
        </AdminEditableSurface>
    );
}
