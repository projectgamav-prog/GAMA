import { router } from '@inertiajs/react';
import type { RequestPayload } from '@inertiajs/core';
import type { LucideIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';

type CmsPostActionButtonProps = {
    href: string | null;
    label: string;
    icon?: LucideIcon;
    size?: 'default' | 'sm' | 'lg' | 'icon';
    data?: RequestPayload;
};

export function CmsPostActionButton({
    href,
    label,
    icon: Icon,
    size = 'sm',
    data = {},
}: CmsPostActionButtonProps) {
    return (
        <Button
            type="button"
            variant="outline"
            size={size}
            disabled={! href}
            onClick={() => {
                if (! href) {
                    return;
                }

                router.post(href, data, {
                    preserveScroll: true,
                });
            }}
        >
            {Icon && <Icon className="size-4" />}
            {label}
        </Button>
    );
}

type CmsDeleteActionButtonProps = {
    href: string;
    label: string;
    confirmMessage: string;
    icon?: LucideIcon;
    size?: 'default' | 'sm' | 'lg' | 'icon';
    data?: RequestPayload;
};

export function CmsDeleteActionButton({
    href,
    label,
    confirmMessage,
    icon: Icon,
    size = 'default',
    data = {},
}: CmsDeleteActionButtonProps) {
    return (
        <Button
            type="button"
            variant="destructive"
            size={size}
            onClick={() => {
                if (! window.confirm(confirmMessage)) {
                    return;
                }

                router.delete(href, {
                    data,
                    preserveScroll: true,
                });
            }}
        >
            {Icon && <Icon className="size-4" />}
            {label}
        </Button>
    );
}
