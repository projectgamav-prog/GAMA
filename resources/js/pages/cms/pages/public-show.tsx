import { CmsLiveModeBar } from '@/admin/cms/components/CmsLiveModeBar';
import {
    CmsLivePageComposer,
    CmsPublicContainerStack,
} from '@/admin/cms/components/CmsLivePageComposer';
import { Badge } from '@/components/ui/badge';
import { useVisibleAdminControls } from '@/hooks/use-admin-context';
import PublicSiteLayout from '@/layouts/public-site-layout';
import type { CmsPublicPageShowProps } from '@/types';

export default function CmsPublicPageShow({
    page,
    containers,
    isAdmin,
    admin,
}: CmsPublicPageShowProps) {
    const showAdminControls = useVisibleAdminControls();

    return (
        <PublicSiteLayout
            title={page.title}
            backgroundClassName="bg-[radial-gradient(circle_at_top,_rgba(15,118,110,0.14),transparent_34%),linear-gradient(180deg,#f7fbfb_0%,#ffffff_55%,#eef6f4_100%)]"
            mainClassName="py-12"
            contentClassName="max-w-6xl px-6 lg:px-8"
        >
            <div className="space-y-8">
                {isAdmin && admin && (
                    <CmsLiveModeBar workspaceHref={admin.page.workspace_href} />
                )}

                <div className="space-y-4">
                    <div className="flex flex-wrap items-center gap-2">
                        <Badge variant="outline">CMS Page</Badge>
                        <Badge variant="secondary">
                            {containers.length}{' '}
                            {containers.length === 1 ? 'container' : 'containers'}
                        </Badge>
                        {page.layout_key && (
                            <Badge variant="secondary">{page.layout_key}</Badge>
                        )}
                    </div>

                    <div className="space-y-3">
                        <h1 className="max-w-4xl text-4xl font-semibold tracking-tight text-balance sm:text-5xl">
                            {page.title}
                        </h1>
                        <p className="max-w-2xl text-base leading-7 text-muted-foreground">
                            This public page uses the shared site frame while
                            its supplemental content stays inside the
                            independent CMS page container and block system.
                        </p>
                    </div>
                </div>

                {showAdminControls && admin ? (
                    <CmsLivePageComposer
                        page={admin.page}
                        containers={admin.containers}
                    />
                ) : (
                    <CmsPublicContainerStack containers={containers} />
                )}
            </div>
        </PublicSiteLayout>
    );
}
