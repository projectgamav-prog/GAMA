import type { ComponentProps, ReactNode } from 'react';
import { cn } from '@/lib/utils';

type Props = ComponentProps<'div'> & {
    children: ReactNode;
};

export function AdminOverlayControlStrip({
    children,
    className,
    ...props
}: Props) {
    return (
        <div
            className={cn('chronicle-admin-overlay-strip', className)}
            {...props}
        >
            {children}
        </div>
    );
}
