import type { ComponentProps } from 'react';
import type { LucideIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { AdminOverlayTone } from './admin-overlay-types';

type Props = ComponentProps<typeof Button> & {
    active?: boolean;
    icon?: LucideIcon;
    iconOnly?: boolean;
    tone?: AdminOverlayTone;
};

export function AdminOverlayActionButton({
    active = false,
    children,
    className,
    icon: Icon,
    iconOnly = false,
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
                iconOnly && 'chronicle-admin-action-button-icon',
                active && 'chronicle-admin-action-button-active',
                tone === 'danger' && 'chronicle-admin-action-button-danger',
                tone === 'primary' && 'chronicle-admin-action-button-primary',
                tone === 'edit' && 'chronicle-admin-action-button-edit',
                tone === 'accept' && 'chronicle-admin-action-button-accept',
                tone === 'discard' && 'chronicle-admin-action-button-discard',
                tone === 'advanced' && 'chronicle-admin-action-button-advanced',
                tone === 'add' && 'chronicle-admin-action-button-add',
                tone === 'ordering' && 'chronicle-admin-action-button-ordering',
                className,
            )}
            data-admin-control-tone={tone}
            aria-pressed={active ? true : undefined}
            {...props}
        >
            {Icon && <Icon className="size-3.5" aria-hidden="true" />}
            <span className={iconOnly ? 'sr-only' : undefined}>
                {children}
            </span>
        </Button>
    );
}
