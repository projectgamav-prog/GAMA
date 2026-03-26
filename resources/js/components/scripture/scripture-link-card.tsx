import { Link } from '@inertiajs/react';
import type { InertiaLinkProps } from '@inertiajs/react';
import type { ReactNode } from 'react';

type Props = {
    href: NonNullable<InertiaLinkProps['href']>;
    title: ReactNode;
    description?: ReactNode;
    meta?: ReactNode;
    ctaLabel: ReactNode;
    titleClassName?: string;
};

export function ScriptureLinkCard({
    href,
    title,
    description,
    meta,
    ctaLabel,
    titleClassName,
}: Props) {
    return (
        <Link
            href={href}
            className="block rounded-lg border bg-card p-4 transition-colors hover:border-primary"
        >
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="space-y-2">
                    <div className="space-y-1">
                        <p className={titleClassName ?? 'font-medium'}>
                            {title}
                        </p>
                        {meta}
                    </div>

                    {description && (
                        <p className="text-sm leading-6 text-muted-foreground">
                            {description}
                        </p>
                    )}
                </div>

                <span className="text-sm font-medium text-primary">
                    {ctaLabel}
                </span>
            </div>
        </Link>
    );
}
