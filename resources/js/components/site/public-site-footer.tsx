import { Link, usePage } from '@inertiajs/react';
import { ArrowUpRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { SiteNavigationItem, SiteNavigationSharedProps } from '@/types';

export function PublicSiteFooter() {
    const page = usePage();
    const { siteNavigation } = page.props as typeof page.props & {
        siteNavigation: SiteNavigationSharedProps;
    };
    const footerItems = siteNavigation?.footer ?? [];

    return (
        <footer className="border-t border-border/70 bg-muted/20">
            <div className="mx-auto flex w-full max-w-6xl flex-col gap-10 px-4 py-10 sm:px-6 lg:px-8">
                <div className="grid gap-8 lg:grid-cols-[1.25fr,1fr]">
                    <div className="space-y-3">
                        <p className="text-xs font-semibold tracking-[0.22em] text-muted-foreground uppercase">
                            Gama Scripture Platform
                        </p>
                        <h2 className="text-2xl font-semibold tracking-tight">
                            Stable shell, structured regions, protected canon.
                        </h2>
                        <p className="max-w-xl text-sm leading-7 text-muted-foreground">
                            The public frame stays stable while canonical
                            scripture remains schema-driven and future CMS
                            content grows only through declared global and
                            page-level regions.
                        </p>
                    </div>

                    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                        {footerItems.map((item) => (
                            <FooterNavigationGroup key={item.id} item={item} />
                        ))}
                    </div>
                </div>

                <div className="flex flex-col gap-2 border-t border-border/60 pt-4 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
                    <p>Shared footer navigation is managed globally through the structured navigation system.</p>
                    <p>Global regions stay declared and controlled.</p>
                </div>
            </div>
        </footer>
    );
}

function FooterNavigationGroup({ item }: { item: SiteNavigationItem }) {
    const hasChildren = item.children.length > 0;

    return (
        <section className="space-y-3">
            <div className="space-y-2">
                {item.href ? (
                    <Link
                        href={item.href}
                        className="inline-flex items-center gap-1 text-sm font-semibold hover:text-primary"
                    >
                        {item.label}
                        {!hasChildren && <ArrowUpRight className="size-3.5" />}
                    </Link>
                ) : (
                    <p className="text-sm font-semibold">{item.label}</p>
                )}
            </div>

            {hasChildren ? (
                <div className="flex flex-col gap-2 text-sm text-muted-foreground">
                    {item.children.map((child) => (
                        <FooterNavigationLink key={child.id} item={child} />
                    ))}
                </div>
            ) : !item.href ? (
                <p className="text-sm leading-6 text-muted-foreground">
                    This footer group is ready for structured links.
                </p>
            ) : null}
        </section>
    );
}

function FooterNavigationLink({ item }: { item: SiteNavigationItem }) {
    if (!item.href) {
        return (
            <p className={cn('text-sm text-muted-foreground')}>
                {item.label}
            </p>
        );
    }

    return (
        <Link href={item.href} className="hover:text-foreground">
            {item.label}
        </Link>
    );
}
