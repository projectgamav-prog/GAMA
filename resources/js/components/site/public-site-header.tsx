import { Link, usePage } from '@inertiajs/react';
import { Search, UserRound } from 'lucide-react';
import { AuthenticatedUtilityNav } from '@/components/authenticated-utility-nav';
import { ScriptureAdminVisibilityToggle } from '@/components/scripture/scripture-admin-visibility-toggle';
import { ChronicleMasthead } from '@/components/site/chronicle-primitives';
import { PublicSiteNavigation } from '@/components/site/public-site-navigation';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { home, login } from '@/routes';
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
        <header
            className={cn(
                'border-b border-[color:var(--chronicle-border)] bg-[rgba(255,248,235,0.72)] backdrop-blur-sm',
                className,
            )}
        >
            <div className="mx-auto flex w-full max-w-6xl flex-col px-4 py-4 sm:px-6 lg:px-8 lg:py-5">
                <div className="hidden items-center justify-between text-xs text-[color:var(--chronicle-brown)] lg:flex">
                    <span>Thursday, May 22, 2025</span>
                    <span className="chronicle-kicker">Soli Deo Gloria</span>
                    <div className="flex items-center gap-3">
                        <div className="flex h-8 w-60 items-center justify-between rounded-full border border-[color:var(--chronicle-border)] bg-[rgba(255,248,235,0.72)] px-4">
                            <span className="text-[0.72rem] text-[color:var(--chronicle-brown-soft)]">
                                Search verses, topics...
                            </span>
                            <Search className="size-3.5" />
                        </div>
                        {auth.user ? (
                            <AuthenticatedUtilityNav showHome={false} />
                        ) : (
                            <Button
                                asChild
                                size="sm"
                                variant="ghost"
                                className="h-8 rounded-full px-2 text-[color:var(--chronicle-ink)] hover:bg-[rgba(173,122,44,0.08)]"
                            >
                                <Link href={login()}>
                                    Sign In
                                    <UserRound className="size-3.5" />
                                </Link>
                            </Button>
                        )}
                    </div>
                </div>

                <div className="mt-2 flex items-start justify-between gap-3 lg:block">
                    <Link href={home()} className="block flex-1">
                        <ChronicleMasthead className="lg:py-4" />
                    </Link>

                    <div className="mt-2 flex items-center gap-2 lg:hidden">
                        <Button
                            type="button"
                            size="icon"
                            variant="ghost"
                            className="size-9 text-[color:var(--chronicle-ink)]"
                            aria-label="Search"
                        >
                            <Search className="size-5" />
                        </Button>
                        {!auth.user && (
                            <Button
                                asChild
                                size="icon"
                                variant="ghost"
                                className="size-9 text-[color:var(--chronicle-ink)]"
                            >
                                <Link href={login()} aria-label="Sign in">
                                    <UserRound className="size-5" />
                                </Link>
                            </Button>
                        )}
                        {auth.user && (
                            <AuthenticatedUtilityNav showHome={false} />
                        )}
                    </div>
                </div>

                <div className="mt-4 border-y border-[color:var(--chronicle-border)] py-2">
                    <div className="flex items-center justify-between gap-3">
                        <PublicSiteNavigation
                            items={headerItems}
                            currentUrl={currentUrl}
                            authoring={headerAuthoring}
                        />

                        <div className="hidden shrink-0 lg:block">
                            <ScriptureAdminVisibilityToggle />
                        </div>
                    </div>
                </div>

                <div className="mt-3 lg:hidden">
                    <ScriptureAdminVisibilityToggle />
                </div>
            </div>
        </header>
    );
}
