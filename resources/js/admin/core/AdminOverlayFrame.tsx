import type { ComponentProps, ReactNode } from 'react';
import { cn } from '@/lib/utils';
import type { AdminOverlayPlacement } from './admin-overlay-types';

type Props = ComponentProps<'div'> & {
    active?: boolean;
    controls?: ReactNode;
    footer?: ReactNode;
    placement?: AdminOverlayPlacement;
};

export function AdminOverlayFrame({
    active = false,
    children,
    className,
    controls,
    footer,
    placement = 'top-right',
    ...props
}: Props) {
    return (
        <div
            className={cn(
                'chronicle-admin-overlay-frame',
                active && 'chronicle-admin-overlay-active',
                className,
            )}
            data-admin-overlay-placement={placement}
            {...props}
        >
            {controls && (
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
