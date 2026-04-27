import type { ReactNode } from 'react';
import PublicSiteLayout from '@/layouts/public-site-layout';
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
    return (
        <PublicSiteLayout
            title={title}
            breadcrumbs={breadcrumbs}
            contentClassName="max-w-6xl px-4 sm:px-6 lg:px-8"
        >
            <div className="space-y-6 sm:space-y-8">{children}</div>
        </PublicSiteLayout>
    );
}
