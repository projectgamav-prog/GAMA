import type { ComponentProps, ReactNode } from 'react';
import { cn } from '@/lib/utils';
import type { AdminOverlayPlacement } from './admin-overlay-types';
import type { AdminAnchorLevel } from './AdminLayoutAnchors';

type Props = ComponentProps<'div'> & {
    active?: boolean;
    anchorKey?: string | null;
    anchorLevel?: AdminAnchorLevel | null;
    controls?: ReactNode;
    controlsMode?: 'overlay' | 'raw';
    footer?: ReactNode;
    placement?: AdminOverlayPlacement;
};

export function AdminOverlayFrame({
    active = false,
    anchorKey = null,
    anchorLevel = null,
    children,
    className,
    controls,
    controlsMode = 'overlay',
    footer,
    placement = 'top-right',
    ...props
}: Props) {
    return (
        <div
            className={cn(
                'chronicle-admin-overlay-frame',
                anchorLevel && 'chronicle-admin-anchor-boundary',
                active && 'chronicle-admin-overlay-active',
                className,
            )}
            data-admin-anchor-level={anchorLevel ?? undefined}
            data-admin-anchor-key={anchorKey ?? undefined}
            data-admin-overlay-placement={placement}
            {...props}
        >
            {controls && controlsMode === 'raw' ? controls : null}
            {controls && controlsMode === 'overlay' && (
                <div
                    className="chronicle-admin-overlay-strip"
                    data-admin-overlay-strip={placement}
                >
                    {controls}
                </div>
            )}
            {children}
            {footer && (
                <div className="chronicle-admin-edit-footer">{footer}</div>
            )}
        </div>
    );
}
