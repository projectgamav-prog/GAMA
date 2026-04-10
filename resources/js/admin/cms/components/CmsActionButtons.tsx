import { router } from '@inertiajs/react';
import type { LucideIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';

type CmsPostActionButtonProps = {
    href: string | null;
    label: string;
    icon?: LucideIcon;
};

export function CmsPostActionButton({
    href,
    label,
    icon: Icon,
}: CmsPostActionButtonProps) {
    return (
        <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={! href}
            onClick={() => {
                if (! href) {
                    return;
                }

                router.post(href, {}, {
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
};

export function CmsDeleteActionButton({
    href,
    label,
    confirmMessage,
    icon: Icon,
}: CmsDeleteActionButtonProps) {
    return (
        <Button
            type="button"
            variant="destructive"
            onClick={() => {
                if (! window.confirm(confirmMessage)) {
                    return;
                }

                router.delete(href, {
                    preserveScroll: true,
                });
            }}
        >
            {Icon && <Icon className="size-4" />}
            {label}
        </Button>
    );
}
