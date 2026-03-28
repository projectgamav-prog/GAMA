import { useEffect, useMemo, useState } from 'react';
import { adminModuleRegistry } from './module-registry';
import type { AdminModuleDefinition } from './module-types';
import type { AdminSurfaceContract } from '../surfaces/core/surface-contracts';
import { getQualifyingAdminModules } from './qualify-module';
import {
    findFirstModuleAction,
    findModuleActionByKey,
    resolveAdminModuleActions,
} from './module-actions';
import { AdminModuleActionRenderer } from './AdminModuleActionRenderer';
import { cn } from '@/lib/utils';

type Props = {
    surface: AdminSurfaceContract;
    modules?: readonly AdminModuleDefinition[];
    className?: string;
};

/**
 * Shared host for capability-driven admin modules.
 *
 * Pages and shared renderers hand the host a surface contract. The host then
 * resolves qualifying modules from the central registry and renders them in
 * deterministic order, keeping concrete editor imports out of page files.
 */
export function AdminModuleHost({
    surface,
    modules = adminModuleRegistry,
    className,
}: Props) {
    const qualifyingModules = useMemo(
        () => getQualifyingAdminModules(surface, modules),
        [surface, modules],
    );
    const resolvedActions = useMemo(
        () => resolveAdminModuleActions(surface, qualifyingModules),
        [surface, qualifyingModules],
    );
    const [activeActionKey, setActiveActionKey] = useState<string | null>(null);

    useEffect(() => {
        if (
            activeActionKey !== null &&
            !resolvedActions.some((action) => action.key === activeActionKey)
        ) {
            setActiveActionKey(null);
        }
    }, [activeActionKey, resolvedActions]);

    if (qualifyingModules.length === 0) {
        return null;
    }

    const handleAction = (action: typeof resolvedActions[number]) => {
        setActiveActionKey((current) =>
            current === action.key ? null : action.key,
        );
    };

    const content = qualifyingModules.map((module) => {
        const EditorComponent = module.EditorComponent;
        const activeAction = findModuleActionByKey(resolvedActions, activeActionKey);
        const moduleActivation =
            module.actions && module.actions.length > 0
                ? {
                      activeActionKey,
                      isActive: activeAction?.module.key === module.key,
                      action:
                          activeAction?.module.key === module.key
                              ? activeAction
                              : null,
                      activate: (actionKey?: string) => {
                          const targetAction = findFirstModuleAction(
                              resolvedActions,
                              module.key,
                              actionKey,
                          );

                          if (targetAction) {
                              setActiveActionKey(targetAction.key);
                          }
                      },
                      deactivate: () => {
                          setActiveActionKey((current) =>
                              current !== null &&
                              current.startsWith(`${module.key}:`)
                                  ? null
                                  : current,
                          );
                      },
                  }
                : {
                      activeActionKey,
                      isActive: true,
                      action: null,
                      activate: () => undefined,
                      deactivate: () => undefined,
                  };

        return (
            <EditorComponent
                key={module.key}
                module={module}
                surface={surface}
                activation={moduleActivation}
            />
        );
    });

    const resolvedActionContent =
        resolvedActions.length > 0 ? (
            <AdminModuleActionRenderer
                actions={resolvedActions}
                activeActionKey={activeActionKey}
                onAction={handleAction}
            />
        ) : null;

    const combinedContent = (
        <>
            {resolvedActionContent}
            {content}
        </>
    );

    if (!className) {
        return combinedContent;
    }

    return (
        <div className={cn(className)}>
            {combinedContent}
        </div>
    );
}

