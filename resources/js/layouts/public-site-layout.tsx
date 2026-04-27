import { Head } from '@inertiajs/react';
import type { ReactNode } from 'react';
import { AdminAwarenessProvider } from '@/admin/awareness/core';
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
            <AdminAwarenessProvider>
                <div
                    className={cn(
                        'chronicle-shell min-h-screen text-[color:var(--chronicle-ink)]',
                        backgroundClassName,
                    )}
                >
                    <div
                        className={cn(
                            'chronicle-page-frame relative z-0 mx-auto flex min-h-screen w-full max-w-[92rem] flex-col border-x',
                            shellClassName,
                        )}
                    >
                        <PublicSiteHeader />

                        <main
                            className={cn(
                                'flex-1 py-6 sm:py-8',
                                mainClassName,
                            )}
                        >
                            <div
                                className={cn(
                                    'mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8',
                                    contentClassName,
                                )}
                            >
                                {breadcrumbs.length > 0 && (
                                    <div className="mb-5 border-b border-[color:var(--chronicle-border)] pb-3 text-sm text-[color:var(--chronicle-brown)]">
                                        <Breadcrumbs
                                            breadcrumbs={breadcrumbs}
                                        />
                                    </div>
                                )}
                                {children}
                            </div>
                        </main>

                        <PublicSiteFooter />
                    </div>
                </div>
            </AdminAwarenessProvider>
        </>
    );
}
