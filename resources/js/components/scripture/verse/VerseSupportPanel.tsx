import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';
import { ChroniclePaperPanel } from '@/components/site/chronicle-primitives';
import { cn } from '@/lib/utils';

type Props = {
    title: ReactNode;
    eyebrow?: ReactNode;
    icon?: LucideIcon;
    action?: ReactNode;
    children: ReactNode;
    className?: string;
    contentClassName?: string;
};

export function VerseSupportPanel({
    title,
    eyebrow,
    icon: Icon,
    action,
    children,
    className,
    contentClassName,
}: Props) {
    return (
        <ChroniclePaperPanel variant="panel" className={cn('p-0', className)}>
            <div className="flex flex-wrap items-start justify-between gap-3 border-b border-[color:var(--chronicle-border)] px-4 py-3">
                <div className="flex items-start gap-2">
                    {Icon && (
                        <Icon className="mt-1 size-4 text-[color:var(--chronicle-gold)]" />
                    )}
                    <div>
                        {eyebrow && (
                            <p className="chronicle-kicker">{eyebrow}</p>
                        )}
                        <h2 className="chronicle-title text-2xl leading-tight">
                            {title}
                        </h2>
                    </div>
                </div>
                {action}
            </div>
            <div className={cn('px-4 py-4', contentClassName)}>{children}</div>
        </ChroniclePaperPanel>
    );
}
