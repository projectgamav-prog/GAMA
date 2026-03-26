import { Slot } from '@radix-ui/react-slot';
import { createContext, useContext } from 'react';
import type { ReactNode } from 'react';
import type {
    ScriptureEntityRegionInput,
    ScriptureEntityRegionMeta,
} from '@/types/scripture';

const ScriptureEntityRegionContext =
    createContext<ScriptureEntityRegionMeta | null>(null);

const normalizeValue = (
    value: string | number | null | undefined,
): string | undefined => {
    if (typeof value === 'number') {
        return String(value);
    }

    if (typeof value === 'string') {
        const trimmedValue = value.trim();

        return trimmedValue.length > 0 ? trimmedValue : undefined;
    }

    return undefined;
};

const getScriptureEntityRegionMeta = (
    meta: ScriptureEntityRegionInput,
    parentMeta: ScriptureEntityRegionMeta | null,
): ScriptureEntityRegionMeta => ({
    entityType: meta.entityType,
    entityId: normalizeValue(meta.entityId) ?? String(meta.entityId),
    entityLabel: normalizeValue(meta.entityLabel),
    parentEntityType: meta.parentEntityType ?? parentMeta?.entityType,
    parentEntityId:
        normalizeValue(meta.parentEntityId) ?? parentMeta?.entityId,
    region: meta.region.trim(),
    capabilityHint: normalizeValue(meta.capabilityHint),
});

const getScriptureEntityRegionAttributes = (
    meta: ScriptureEntityRegionMeta,
): Record<`data-${string}`, string | undefined> => ({
    'data-scripture-entity-type': meta.entityType,
    'data-scripture-entity-id': meta.entityId,
    'data-scripture-entity-label': meta.entityLabel,
    'data-scripture-parent-entity-type': meta.parentEntityType,
    'data-scripture-parent-entity-id': meta.parentEntityId,
    'data-scripture-region': meta.region,
    'data-scripture-capability': meta.capabilityHint,
});

type Props = {
    meta: ScriptureEntityRegionInput;
    asChild?: boolean;
    children: ReactNode;
};

export function useScriptureEntityRegion() {
    return useContext(ScriptureEntityRegionContext);
}

export function ScriptureEntityRegion({
    meta,
    asChild = false,
    children,
}: Props) {
    const parentMeta = useScriptureEntityRegion();
    const resolvedMeta = getScriptureEntityRegionMeta(meta, parentMeta);
    const Component = asChild ? Slot : 'div';

    return (
        <ScriptureEntityRegionContext.Provider value={resolvedMeta}>
            <Component {...getScriptureEntityRegionAttributes(resolvedMeta)}>
                {children}
            </Component>
        </ScriptureEntityRegionContext.Provider>
    );
}
