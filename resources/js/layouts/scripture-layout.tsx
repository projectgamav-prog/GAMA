import { Head, usePage } from '@inertiajs/react';
import type { ReactNode } from 'react';
import { AuthenticatedUtilityNav } from '@/components/authenticated-utility-nav';
import { Breadcrumbs } from '@/components/breadcrumbs';
import type { BreadcrumbItem } from '@/types';

type Props = {
    children: ReactNode;
    breadcrumbs?: BreadcrumbItem[];
    title: string;
};

export default function ScriptureLayout({
    children,
    breadcrumbs = [],
    title,
}: Props) {
    const { auth } = usePage().props;

    return (
        <>
            <Head title={title} />
            <div className="min-h-screen bg-background text-foreground">
                <header className="border-b border-border/70">
                    <div className="mx-auto flex max-w-5xl flex-col gap-4 px-4 py-5 sm:px-6 md:flex-row md:items-center md:justify-between">
                        <div>
                            <p className="text-xs font-semibold tracking-[0.22em] text-muted-foreground uppercase">
                                Scripture
                            </p>
                            <h1 className="mt-1 text-lg font-semibold">
                                Canonical Reading
                            </h1>
                        </div>

                        {auth.user && <AuthenticatedUtilityNav />}
                    </div>
                </header>

                <main className="mx-auto flex w-full max-w-5xl flex-col gap-8 px-4 py-8 sm:px-6">
                    {breadcrumbs.length > 0 && (
                        <div className="text-sm text-muted-foreground">
                            <Breadcrumbs breadcrumbs={breadcrumbs} />
                        </div>
                    )}
                    {children}
                </main>
            </div>
        </>
    );
}
