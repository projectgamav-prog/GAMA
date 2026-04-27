import { useEffect } from 'react';
import type { DependencyList } from 'react';
import type { AdminCurrentVisibleControlSurface } from './control-comparison-types';
import { useAdminControlComparison } from './AdminControlComparisonProvider';

export function useRegisterCurrentAdminControls(
    summary: AdminCurrentVisibleControlSurface | null,
    dependencies: DependencyList = [],
): void {
    const { registerCurrentControls, unregisterCurrentControls } =
        useAdminControlComparison();

    useEffect(() => {
        if (!summary) {
            return undefined;
        }

        const key = registerCurrentControls(summary);

        return () => unregisterCurrentControls(key);
        // The caller owns the dependency list because current-control summaries
        // can be assembled from surface, module, and quick-edit state.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [registerCurrentControls, unregisterCurrentControls, ...dependencies]);
}
