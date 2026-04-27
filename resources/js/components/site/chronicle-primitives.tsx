import { Link } from '@inertiajs/react';
import { BookOpenText } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import type { ComponentProps, ReactNode } from 'react';
import { cn } from '@/lib/utils';

type ChroniclePaperPanelProps = ComponentProps<'section'> & {
    children: ReactNode;
    variant?: 'paper' | 'panel' | 'feature';
};

export function ChroniclePaperPanel({
    children,
    className,
    variant = 'paper',
    ...props
}: ChroniclePaperPanelProps) {
    return (
        <section
            className={cn(
                variant === 'paper' && 'chronicle-paper rounded-sm',
                variant === 'panel' && 'chronicle-panel rounded-sm',
                variant === 'feature' &&
                    'chronicle-paper overflow-hidden rounded-sm',
                className,
            )}
            {...props}
        >
            {children}
        </section>
    );
}

export function ChronicleOrnament({ className }: { className?: string }) {
    return (
        <span
            aria-hidden="true"
            className={cn(
                'inline-flex items-center gap-2 text-[color:var(--chronicle-gold)]',
                className,
            )}
        >
            <span className="h-px w-10 bg-[color:var(--chronicle-rule)]" />
            <span className="text-lg leading-none">*</span>
            <span className="h-px w-10 bg-[color:var(--chronicle-rule)]" />
        </span>
    );
}

export function ChronicleMasthead({ className }: { className?: string }) {
    return (
        <div className={cn('text-center', className)}>
            <p className="chronicle-kicker">Soli Deo Gloria</p>
            <div className="mt-2 flex items-center justify-center gap-3 sm:gap-5">
                <div className="hidden size-16 items-center justify-center rounded-full border border-[color:var(--chronicle-rule)] text-[color:var(--chronicle-gold)] sm:flex">
                    <BookOpenText className="size-8" />
                </div>
                <h1 className="chronicle-masthead text-5xl leading-none sm:text-7xl lg:text-8xl">
                    Scripture Chronicle
                </h1>
            </div>
            <div className="mt-3 flex items-center justify-center gap-4">
                <ChronicleOrnament className="hidden sm:inline-flex" />
                <p className="chronicle-kicker text-[0.7rem] sm:text-xs">
                    Know the Word. Live the Word.
                </p>
                <ChronicleOrnament className="hidden sm:inline-flex" />
            </div>
        </div>
    );
}

export function ChronicleEditorialGrid({
    children,
    className,
}: {
    children: ReactNode;
    className?: string;
}) {
    return (
        <div
            className={cn(
                'grid gap-5 lg:grid-cols-[minmax(0,1fr)_17rem] xl:grid-cols-[minmax(0,1fr)_19rem]',
                className,
            )}
        >
            {children}
        </div>
    );
}

export function ChronicleSideRail({
    children,
    className,
}: {
    children: ReactNode;
    className?: string;
}) {
    return (
        <aside
            className={cn(
                'space-y-4 lg:sticky lg:top-4 lg:self-start',
                className,
            )}
        >
            {children}
        </aside>
    );
}

export function ChronicleSectionHeading({
    title,
    eyebrow,
    action,
    className,
}: {
    title: ReactNode;
    eyebrow?: ReactNode;
    action?: ReactNode;
    className?: string;
}) {
    return (
        <div
            className={cn(
                'flex flex-col gap-2 border-b border-[color:var(--chronicle-border)] pb-2 sm:flex-row sm:items-end sm:justify-between',
                className,
            )}
        >
            <div>
                {eyebrow && <p className="chronicle-kicker">{eyebrow}</p>}
                <h2 className="chronicle-title text-2xl leading-tight">
                    {title}
                </h2>
            </div>
            {action}
        </div>
    );
}

export function ChronicleStatRow({
    items,
    className,
}: {
    items: Array<{
        label: string;
        value: ReactNode;
        icon?: LucideIcon;
    }>;
    className?: string;
}) {
    return (
        <dl
            className={cn(
                'grid gap-3 sm:grid-cols-2 lg:grid-cols-4 lg:gap-4',
                className,
            )}
        >
            {items.map((item) => {
                const Icon = item.icon;

                return (
                    <div
                        key={item.label}
                        className="flex items-center gap-3 border-b border-[color:var(--chronicle-border)] pb-3 last:border-b-0 lg:border-r lg:border-b-0 lg:pr-3 lg:pb-0 lg:last:border-r-0"
                    >
                        {Icon && (
                            <Icon className="size-5 shrink-0 text-[color:var(--chronicle-gold)]" />
                        )}
                        <div>
                            <dt className="chronicle-kicker text-[0.65rem]">
                                {item.label}
                            </dt>
                            <dd className="text-sm leading-5 text-[color:var(--chronicle-ink)]">
                                {item.value}
                            </dd>
                        </div>
                    </div>
                );
            })}
        </dl>
    );
}

export function ChronicleCompactList({
    items,
    className,
}: {
    items: Array<{
        label: ReactNode;
        meta?: ReactNode;
        icon?: LucideIcon;
        href?: string;
    }>;
    className?: string;
}) {
    return (
        <div
            className={cn(
                'divide-y divide-[color:var(--chronicle-border)]',
                className,
            )}
        >
            {items.map((item, index) => {
                const Icon = item.icon;
                const content = (
                    <div className="flex items-center justify-between gap-3 py-2.5 text-sm">
                        <span className="flex min-w-0 items-center gap-2">
                            {Icon && (
                                <Icon className="size-4 shrink-0 text-[color:var(--chronicle-gold)]" />
                            )}
                            <span className="truncate text-[color:var(--chronicle-ink)]">
                                {item.label}
                            </span>
                        </span>
                        {item.meta && (
                            <span className="shrink-0 rounded-full bg-[color:var(--chronicle-paper-soft)] px-2 py-0.5 text-xs text-[color:var(--chronicle-brown)]">
                                {item.meta}
                            </span>
                        )}
                    </div>
                );

                if (item.href) {
                    return (
                        <Link
                            key={`${String(item.label)}-${index}`}
                            href={item.href}
                            className="block hover:bg-[rgba(173,122,44,0.08)]"
                        >
                            {content}
                        </Link>
                    );
                }

                return (
                    <div key={`${String(item.label)}-${index}`}>{content}</div>
                );
            })}
        </div>
    );
}
