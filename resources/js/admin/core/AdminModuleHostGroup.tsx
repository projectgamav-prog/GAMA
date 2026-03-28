import { AdminModuleHost } from './AdminModuleHost';
import type { AdminSurfaceContract } from '../surfaces/core/surface-contracts';
import { cn } from '@/lib/utils';

type Props = {
    surfaces: Array<AdminSurfaceContract | null | undefined>;
    className?: string;
};

const DEFAULT_CLASS_NAME = 'flex flex-wrap items-start gap-1.5';

export function AdminModuleHostGroup({
    surfaces,
    className,
}: Props) {
    const activeSurfaces = surfaces.filter(
        (surface): surface is AdminSurfaceContract => surface !== null && surface !== undefined,
    );

    if (activeSurfaces.length === 0) {
        return null;
    }

    return (
        <div className={cn(DEFAULT_CLASS_NAME, className)}>
            {activeSurfaces.map((surface) => (
                <AdminModuleHost
                    key={`${surface.surfaceKey}:${surface.entity}:${surface.entityId}:${surface.regionKey}`}
                    surface={surface}
                />
            ))}
        </div>
    );
}
