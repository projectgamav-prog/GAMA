import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';
import { ScriptureEntityRegion } from '@/components/scripture/scripture-entity-region';
import { getScriptureAdminSectionElementId } from '@/lib/scripture-admin-navigation';
import type { ScriptureAdminTargetSection } from '@/lib/scripture-admin-navigation';
import { cn } from '@/lib/utils';
import type { ScriptureEntityRegionInput } from '@/types/scripture';

type Props = {
    title: ReactNode;
    description?: ReactNode;
    action?: ReactNode;
    icon?: LucideIcon;
    children: ReactNode;
    id?: string;
    adminTargetSection?: ScriptureAdminTargetSection;
    className?: string;
    entityMeta?: ScriptureEntityRegionInput;
};

export function ScriptureSection({
    title,
    description,
    action,
    icon: Icon,
    children,
    id,
    adminTargetSection,
    className,
    entityMeta,
}: Props) {
    const resolvedId =
        adminTargetSection !== undefined
            ? (id ?? getScriptureAdminSectionElementId(adminTargetSection))
            : id;
    const section = (
        <section
            id={resolvedId}
            data-admin-target-section={adminTargetSection}
            className={cn('space-y-4', className)}
        >
            <div
                className={
                    action
                        ? 'flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between'
                        : 'space-y-1'
                }
            >
                <div className="space-y-1">
                    <div className="flex items-center gap-2">
                        {Icon && (
                            <Icon className="size-5 text-muted-foreground" />
                        )}
                        <h2 className="text-xl font-semibold">{title}</h2>
                    </div>
                    {description &&
                        (typeof description === 'string' ? (
                            <p className="text-sm text-muted-foreground">
                                {description}
                            </p>
                        ) : (
                            <div className="text-sm text-muted-foreground">
                                {description}
                            </div>
                        ))}
                </div>

                {action}
            </div>

            {children}
        </section>
    );

    if (!entityMeta) {
        return section;
    }

    return (
        <ScriptureEntityRegion meta={entityMeta} asChild>
            {section}
        </ScriptureEntityRegion>
    );
}
