import { Link, usePage } from '@inertiajs/react';
import { BookOpenText } from 'lucide-react';
import { AuthenticatedUtilityNav } from '@/components/authenticated-utility-nav';
import { PublicSiteNavigation } from '@/components/site/public-site-navigation';
import { ScriptureAdminVisibilityToggle } from '@/components/scripture/scripture-admin-visibility-toggle';
import { Button } from '@/components/ui/button';
import { login } from '@/routes';
import { home } from '@/routes';
import { cn } from '@/lib/utils';
import type { SiteNavigationSharedProps } from '@/types';

type Props = {
    className?: string;
};

export function PublicSiteHeader({ className }: Props) {
    const page = usePage();
    const { auth, siteNavigation } = page.props as typeof page.props & {
        siteNavigation: SiteNavigationSharedProps;
    };
    const currentUrl = page.url;
    const headerItems = siteNavigation?.header ?? [];
    const headerAuthoring = siteNavigation?.headerAdmin ?? null;

    return (
        <header className={cn('border-b border-border/70 bg-background/90 backdrop-blur', className)}>
            <div className="mx-auto flex w-full max-w-6xl flex-col gap-4 px-4 py-4 sm:px-6 lg:px-8 lg:py-5">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    <div className="flex items-center gap-4">
                        <Link href={home()} className="flex items-center gap-3">
                            <div className="flex size-11 items-center justify-center rounded-2xl border border-amber-300/70 bg-amber-50 text-amber-900 shadow-sm">
                                <BookOpenText className="size-5" />
                            </div>
                            <div className="space-y-1">
                                <p className="text-xs font-semibold tracking-[0.22em] text-muted-foreground uppercase">
                                    Gama
                                </p>
                                <p className="text-lg font-semibold tracking-tight">
                                    Scripture Platform
                                </p>
                            </div>
                        </Link>
                    </div>

                    <div className="flex flex-col gap-3 lg:flex-1 lg:items-end">
                        <div className="flex justify-end">
                            <PublicSiteNavigation
                                items={headerItems}
                                currentUrl={currentUrl}
                                authoring={headerAuthoring}
                            />
                        </div>

                        <div className="flex flex-wrap items-center gap-2">
                            <ScriptureAdminVisibilityToggle />

                            {auth.user ? (
                                <AuthenticatedUtilityNav showHome={false} />
                            ) : (
                                <Button asChild size="sm" variant="outline" className="h-8 rounded-full px-3">
                                    <Link href={login()}>Log in</Link>
                                </Button>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
}
