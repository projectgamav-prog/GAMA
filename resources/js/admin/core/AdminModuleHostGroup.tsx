import type { AdminSurfaceContract } from '../surfaces/core/surface-contracts';

type Props = {
    surfaces: Array<AdminSurfaceContract | null | undefined>;
    className?: string;
};

/**
 * @deprecated Legacy public-page module UI is quarantined. Keep this grouped
 * host as a no-op compatibility shim until remaining old imports are removed
 * from shared scripture renderers.
 */
export function AdminModuleHostGroup(_props: Props) {
    return null;
}
