import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

type Props = {
    children: ReactNode;
    className?: string;
};

export function ScriptureActionRow({ children, className }: Props) {
    return (
        <div className={cn('flex flex-wrap gap-3', className)}>{children}</div>
    );
}
