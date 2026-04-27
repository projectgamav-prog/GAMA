import type { ComponentProps } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';

type Props = ComponentProps<typeof Textarea>;

export function AdminEditableTextarea({ className, ...props }: Props) {
    return (
        <Textarea
            className={cn(
                'chronicle-admin-edit-field chronicle-admin-edit-field-textarea min-h-24 resize-y border-[color:var(--chronicle-border)] bg-[rgba(255,248,235,0.72)] leading-7 text-[color:var(--chronicle-ink)] shadow-none focus-visible:ring-[color:var(--chronicle-gold)]',
                className,
            )}
            {...props}
        />
    );
}
