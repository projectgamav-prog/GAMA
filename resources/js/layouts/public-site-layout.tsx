import { Head } from '@inertiajs/react';
import type { ReactNode } from 'react';
import { Breadcrumbs } from '@/components/breadcrumbs';
import { PublicSiteFooter } from '@/components/site/public-site-footer';
import { PublicSiteHeader } from '@/components/site/public-site-header';
import { cn } from '@/lib/utils';
import type { BreadcrumbItem } from '@/types';

type Props = {
    children: ReactNode;
    title: string;
    breadcrumbs?: BreadcrumbItem[];
    backgroundClassName?: string;
    shellClassName?: string;
    mainClassName?: string;
    contentClassName?: string;
};

export default function PublicSiteLayout({
    children,
    title,
    breadcrumbs = [],
    backgroundClassName,
    shellClassName,
    mainClassName,
    contentClassName,
}: Props) {
    return (
        <>
            <Head title={title} />
            <div
                className={cn(
                    'min-h-screen bg-background text-foreground',
                    backgroundClassName,
                )}
            >
                <div className={cn('flex min-h-screen flex-col', shellClassName)}>
                    <PublicSiteHeader />

                    <main className={cn('flex-1 py-8', mainClassName)}>
                        <div
                            className={cn(
                                'mx-auto w-full max-w-5xl px-4 sm:px-6 lg:px-8',
                                contentClassName,
                            )}
                        >
                            {breadcrumbs.length > 0 && (
                                <div className="mb-6 text-sm text-muted-foreground">
                                    <Breadcrumbs breadcrumbs={breadcrumbs} />
                                </div>
                            )}
                            {children}
                        </div>
                    </main>

                    <PublicSiteFooter />
                </div>
            </div>
        </>
    );
}
