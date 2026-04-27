import { useEffect, useMemo, useState } from 'react';
import { usePage } from '@inertiajs/react';
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
import { getAdminQuickEditAdapter } from './AdminQuickEditRegistry';
import {
    shouldDeferStructuredIdentityToQuickEditFields,
    useAdminResolvedControls,
    useRegisterCurrentAdminControls,
} from '@/admin/awareness/core';
import { parseScriptureAdminNavigationTarget } from '@/lib/scripture-admin-navigation';
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
    const page = usePage();
    const qualifyingModules = useMemo(
        () => getQualifyingAdminModules(surface, modules),
        [surface, modules],
    );
    const resolvedActions = useMemo(
        () => resolveAdminModuleActions(surface, qualifyingModules),
        [surface, qualifyingModules],
    );
    const { resolvedSurfaces } = useAdminResolvedControls();
    const defersStructuredIdentityToFieldQuickEdit = useMemo(
        () =>
            shouldDeferStructuredIdentityToQuickEditFields({
                surface,
                resolvedSurfaces,
            }),
        [resolvedSurfaces, surface],
    );
    const visibleActions = useMemo(
        () =>
            resolvedActions.filter(
                (action) =>
                    !(
                        defersStructuredIdentityToFieldQuickEdit &&
                        action.action.actionKey === 'edit_identity'
                    ),
            ),
        [defersStructuredIdentityToFieldQuickEdit, resolvedActions],
    );
    const currentControlSummary = useMemo(
        () =>
            visibleActions.length > 0
                ? {
                      surface,
                      controls: visibleActions.map((action) => ({
                          key: action.key,
                          label: action.label,
                          family: action.action.actionFamily ?? null,
                          mode:
                              action.action.actionFamily === 'full_edit'
                                  ? 'full_edit'
                                  : action.openMode === 'drawer'
                                    ? 'drawer'
                                    : 'structured_editor',
                          placement:
                              action.placement === 'header'
                                  ? 'section-header'
                                  : action.placement === 'dropdown'
                                    ? 'floating-chip'
                                    : 'top-right',
                          source: 'module_host' as const,
                      })),
                  }
                : null,
        [surface, visibleActions],
    );
    const [activeActionKey, setActiveActionKey] = useState<string | null>(null);

    useRegisterCurrentAdminControls(currentControlSummary, [
        currentControlSummary,
    ]);

    useEffect(() => {
        if (
            activeActionKey !== null &&
            !visibleActions.some((action) => action.key === activeActionKey)
        ) {
            setActiveActionKey(null);
        }
    }, [activeActionKey, visibleActions]);

    useEffect(() => {
        const target = parseScriptureAdminNavigationTarget(page.url);

        if (
            target === null ||
            target.section !== surface.regionKey ||
            visibleActions.length === 0
        ) {
            return;
        }

        setActiveActionKey((current) => current ?? visibleActions[0].key);
    }, [page.url, surface.regionKey, visibleActions]);

    if (qualifyingModules.length === 0) {
        return null;
    }

    if (getAdminQuickEditAdapter(surface) !== null) {
        return null;
    }

    const handleAction = (action: typeof resolvedActions[number]) => {
        setActiveActionKey((current) =>
            current === action.key ? null : action.key,
        );
    };

    const content = qualifyingModules.map((module) => {
        const EditorComponent = module.EditorComponent;
        const activeAction = findModuleActionByKey(visibleActions, activeActionKey);
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
                                  visibleActions,
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
        visibleActions.length > 0 ? (
            <AdminModuleActionRenderer
                surface={surface}
                actions={visibleActions}
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

