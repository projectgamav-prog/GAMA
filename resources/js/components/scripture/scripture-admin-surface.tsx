import { Link } from '@inertiajs/react';
import { PencilLine, SquareArrowOutUpRight } from 'lucide-react';
import { useEffect, useRef } from 'react';
import type { ReactNode } from 'react';
import { useCanSeeAdminControls } from '@/hooks/use-admin-context';
import { scriptureAdminStartCase } from '@/lib/scripture-admin-field-display';
import { cn } from '@/lib/utils';
import type {
    ScriptureAdminRegionConfig,
    ScriptureEntityRegionMeta,
} from '@/types';
import { Button } from '@/components/ui/button';
import { useScriptureEntityRegion } from './scripture-entity-region';

/**
 * Shared wrapper for page-attached admin controls on public scripture pages.
 *
 * This component does not decide whether a region should edit inline or fall
 * back to a sheet. Session hooks own that state and pass in the current surface
 * config, active label, feedback badge, and any extra block-local actions.
 */
export type ScriptureAdminSurfaceOptions = {
    config?: ScriptureAdminRegionConfig | null;
    onEdit?: (
        meta: ScriptureEntityRegionMeta,
        config: ScriptureAdminRegionConfig,
    ) => void;
    actions?: ReactNode;
    label?: string;
    highlight?: boolean;
    showFullEditAction?: boolean;
    isActive?: boolean;
    activeLabel?: string;
    statusLabel?: string;
    statusTone?: 'success';
};

type Props = ScriptureAdminSurfaceOptions & {
    children: ReactNode;
    className?: string;
};

const hasActionableConfig = (
    config: ScriptureAdminRegionConfig | null | undefined,
    onEdit?: (
        meta: ScriptureEntityRegionMeta,
        config: ScriptureAdminRegionConfig,
    ) => void,
): boolean =>
    Boolean(
        (config?.supportsEdit && config.contextualEditHref && onEdit) ||
            (config?.supportsFullEdit && config.fullEditHref),
    );

const getSurfaceLabel = (
    meta: ScriptureEntityRegionMeta,
    label?: string,
): string => {
    if (label) {
        return label;
    }

    if (meta.entityLabel && meta.entityLabel.trim().length > 0) {
        return meta.entityLabel;
    }

    return scriptureAdminStartCase(meta.region);
};

export function ScriptureAdminSurface({
    config,
    onEdit,
    actions,
    label,
    highlight = true,
    showFullEditAction = true,
    isActive = false,
    activeLabel = 'Editing',
    statusLabel,
    statusTone = 'success',
    children,
    className,
}: Props) {
    const meta = useScriptureEntityRegion();
    const canSeeAdminControls = useCanSeeAdminControls();
    const surfaceRef = useRef<HTMLDivElement | null>(null);
    const previousActiveRef = useRef(isActive);
    const previousStatusLabelRef = useRef<string | undefined>(statusLabel);
    // The surface appears only when admin visibility is enabled and there is a
    // meaningful local affordance to render for this region.
    const shouldRenderSurface =
        canSeeAdminControls &&
        meta !== null &&
        (
            hasActionableConfig(config, onEdit) ||
            Boolean(actions) ||
            Boolean(statusLabel) ||
            isActive
        );

    useEffect(() => {
        const statusJustChanged =
            statusLabel !== undefined &&
            statusLabel !== previousStatusLabelRef.current;

        // When a region becomes active, pull it into view so the editor feels
        // attached to the content that is being changed.
        if (
            shouldRenderSurface &&
            ((isActive && !previousActiveRef.current) || statusJustChanged)
        ) {
            surfaceRef.current?.scrollIntoView({
                behavior: 'smooth',
                block: 'center',
            });
        }

        previousActiveRef.current = isActive;
        previousStatusLabelRef.current = statusLabel;
    }, [isActive, shouldRenderSurface, statusLabel]);

    if (!shouldRenderSurface || meta === null) {
        return children;
    }

    const surfaceLabel = getSurfaceLabel(meta, label);

    return (
        <div ref={surfaceRef} className={cn('relative scroll-mt-24 pt-5', className)}>
            <div className="absolute top-0 right-4 z-10 flex max-w-[calc(100%-2rem)] justify-end">
                <div className="flex max-w-full flex-wrap items-center justify-end gap-1 rounded-full border border-border/80 bg-background/95 p-1 shadow-sm backdrop-blur supports-[backdrop-filter]:bg-background/80">
                    <span className="hidden rounded-full px-2.5 text-[10px] font-semibold tracking-[0.22em] text-muted-foreground uppercase md:inline-flex">
                        {surfaceLabel}
                    </span>

                    {isActive && (
                        <span className="inline-flex items-center rounded-full bg-primary px-2.5 py-1 text-[10px] font-semibold tracking-[0.18em] text-primary-foreground uppercase">
                            {activeLabel}
                        </span>
                    )}

                    {statusLabel && (
                        <span
                            className={cn(
                                'inline-flex items-center rounded-full border px-2.5 py-1 text-[10px] font-semibold tracking-[0.18em] uppercase',
                                statusTone === 'success' &&
                                    'border-emerald-200 bg-emerald-500/10 text-emerald-700',
                            )}
                        >
                            {statusLabel}
                        </span>
                    )}

                    {config?.supportsEdit &&
                        config.contextualEditHref &&
                        onEdit &&
                        !isActive && (
                            <Button
                                type="button"
                                size="sm"
                                className="h-8 rounded-full px-3"
                                onClick={() => onEdit(meta, config)}
                            >
                                <PencilLine className="size-3.5" />
                                Edit
                            </Button>
                        )}

                    {config?.supportsFullEdit &&
                        config.fullEditHref &&
                        showFullEditAction &&
                        !isActive && (
                        <Button
                            asChild
                            size="sm"
                            variant="outline"
                            className="h-8 rounded-full px-3"
                        >
                            <Link href={config.fullEditHref}>
                                <SquareArrowOutUpRight className="size-3.5" />
                                Full edit
                            </Link>
                        </Button>
                    )}

                    {actions}
                </div>
            </div>

            <div
                className={cn(
                    highlight &&
                        'rounded-[1.5rem] ring-offset-4 ring-offset-background',
                    highlight &&
                        !isActive &&
                        !statusLabel &&
                        'ring-1 ring-border/70',
                    highlight &&
                        isActive &&
                        'bg-primary/[0.03] ring-2 ring-primary/30 shadow-sm',
                    highlight &&
                        !isActive &&
                        statusLabel &&
                        statusTone === 'success' &&
                        'bg-emerald-500/[0.04] ring-2 ring-emerald-300/70 shadow-sm',
                )}
            >
                {children}
            </div>
        </div>
    );
}
