import type { ComponentProps } from 'react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

type Props = ComponentProps<typeof Input>;

export function AdminEditableText({ className, ...props }: Props) {
    return (
        <Input
            className={cn(
                'chronicle-admin-edit-field chronicle-admin-edit-field-text h-auto min-h-9 border-[color:var(--chronicle-border)] bg-[rgba(255,248,235,0.72)] text-[color:var(--chronicle-ink)] shadow-none focus-visible:ring-[color:var(--chronicle-gold)]',
                className,
            )}
            {...props}
        />
    );
}
