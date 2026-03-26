import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

type Props = {
    title: ReactNode;
    description?: ReactNode;
    action?: ReactNode;
    icon?: LucideIcon;
    children: ReactNode;
    id?: string;
    className?: string;
};

export function ScriptureSection({
    title,
    description,
    action,
    icon: Icon,
    children,
    id,
    className,
}: Props) {
    return (
        <section id={id} className={cn('space-y-4', className)}>
            <div
                className={
                    action
                        ? 'flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between'
                        : 'space-y-1'
                }
            >
                <div className="space-y-1">
                    <div className="flex items-center gap-2">
                        {Icon && (
                            <Icon className="size-5 text-muted-foreground" />
                        )}
                        <h2 className="text-xl font-semibold">{title}</h2>
                    </div>
                    {description &&
                        (typeof description === 'string' ? (
                            <p className="text-sm text-muted-foreground">
                                {description}
                            </p>
                        ) : (
                            <div className="text-sm text-muted-foreground">
                                {description}
                            </div>
                        ))}
                </div>

                {action}
            </div>

            {children}
        </section>
    );
}
