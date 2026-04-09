import { Head, Link, usePage } from '@inertiajs/react';
import { CmsContainerRenderer } from '@/admin/cms/components/CmsContainerRenderer';
import { AuthenticatedUtilityNav } from '@/components/authenticated-utility-nav';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { home, login } from '@/routes';
import type { CmsPublicPageShowProps } from '@/types';

export default function CmsPublicPageShow({
    page,
    containers,
}: CmsPublicPageShowProps) {
    const { auth, name } = usePage().props;

    return (
        <>
            <Head title={page.title} />

            <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(15,118,110,0.14),transparent_34%),linear-gradient(180deg,#f7fbfb_0%,#ffffff_55%,#eef6f4_100%)] text-foreground">
                <div className="mx-auto flex min-h-screen max-w-6xl flex-col px-6 py-6 lg:px-8">
                    <header className="flex flex-col gap-4 rounded-full border border-border/70 bg-background/85 px-5 py-3 backdrop-blur sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <p className="text-sm font-semibold tracking-[0.2em] text-muted-foreground uppercase">
                                {name}
                            </p>
                        </div>

                        <nav className="flex flex-wrap items-center gap-2">
                            {auth.user ? (
                                <AuthenticatedUtilityNav showHome />
                            ) : (
                                <>
                                    <Button asChild variant="ghost">
                                        <Link href={home()}>Home</Link>
                                    </Button>
                                    <Button asChild variant="outline">
                                        <Link href={login()}>Log in</Link>
                                    </Button>
                                </>
                            )}
                        </nav>
                    </header>

                    <main className="flex-1 py-12">
                        <div className="space-y-8">
                            <div className="space-y-4">
                                <div className="flex flex-wrap items-center gap-2">
                                    <Badge variant="outline">CMS Page</Badge>
                                    <Badge variant="secondary">
                                        {containers.length}{' '}
                                        {containers.length === 1
                                            ? 'container'
                                            : 'containers'}
                                    </Badge>
                                    {page.layout_key && (
                                        <Badge variant="secondary">
                                            {page.layout_key}
                                        </Badge>
                                    )}
                                </div>

                                <div className="space-y-3">
                                    <h1 className="max-w-4xl text-4xl font-semibold tracking-tight text-balance sm:text-5xl">
                                        {page.title}
                                    </h1>
                                    <p className="max-w-2xl text-base leading-7 text-muted-foreground">
                                        Independent CMS page composition. This
                                        page renders ordered containers, and
                                        each container renders its own ordered
                                        CMS blocks.
                                    </p>
                                </div>
                            </div>

                            {containers.length > 0 ? (
                                <div className="space-y-6">
                                    {containers.map((container) => (
                                        <CmsContainerRenderer
                                            key={container.id}
                                            container={container}
                                        />
                                    ))}
                                </div>
                            ) : (
                                <div className="rounded-[2rem] border border-dashed border-border/70 bg-background/85 p-8 text-sm leading-7 text-muted-foreground">
                                    This page is published, but it does not
                                    have any containers yet.
                                </div>
                            )}
                        </div>
                    </main>
                </div>
            </div>
        </>
    );
}
