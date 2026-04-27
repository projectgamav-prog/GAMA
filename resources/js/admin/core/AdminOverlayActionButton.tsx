import type { ComponentProps } from 'react';
import type { LucideIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { AdminOverlayTone } from './admin-overlay-types';

type Props = ComponentProps<typeof Button> & {
    active?: boolean;
    icon?: LucideIcon;
    tone?: AdminOverlayTone;
};

export function AdminOverlayActionButton({
    active = false,
    children,
    className,
    icon: Icon,
    tone = 'neutral',
    ...props
}: Props) {
    return (
        <Button
            size="sm"
            type="button"
            variant={active ? 'secondary' : 'ghost'}
            className={cn(
                'chronicle-admin-action-button',
                active && 'chronicle-admin-action-button-active',
                tone === 'danger' && 'chronicle-admin-action-button-danger',
                tone === 'primary' && 'chronicle-admin-action-button-primary',
                className,
            )}
            aria-pressed={active ? true : undefined}
            {...props}
        >
            {Icon && <Icon className="size-3.5" aria-hidden="true" />}
            <span>{children}</span>
        </Button>
    );
}
