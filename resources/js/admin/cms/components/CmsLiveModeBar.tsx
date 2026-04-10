import { router } from '@inertiajs/react';
import { Eye, EyeOff, Layers3, SquareArrowOutUpRight } from 'lucide-react';
import { useAdminContext } from '@/hooks/use-admin-context';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

export function CmsLiveModeBar({
    workspaceHref,
}: {
    workspaceHref: string;
}) {
    const adminContext = useAdminContext();

    if (!adminContext.canAccess) {
        return null;
    }

    return (
        <div className="rounded-[2rem] border border-border/70 bg-background/90 px-5 py-4 shadow-sm backdrop-blur">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                        <Badge variant="outline">CMS Live Composition</Badge>
                        <Badge
                            variant={
                                adminContext.isVisible ? 'secondary' : 'outline'
                            }
                        >
                            {adminContext.isVisible
                                ? 'Controls visible'
                                : 'Controls hidden'}
                        </Badge>
                    </div>
                    <p className="text-sm leading-6 text-muted-foreground">
                        Compose this page in place. Show the controls to add a
                        new section, add content inside a section, or open the
                        full CMS workspace when you need deeper record work.
                    </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                    {adminContext.visibilityUrl && (
                        <Button
                            type="button"
                            variant={
                                adminContext.isVisible ? 'default' : 'outline'
                            }
                            onClick={() =>
                                router.post(
                                    adminContext.visibilityUrl!,
                                    {
                                        visible: !adminContext.isVisible,
                                    },
                                    {
                                        preserveScroll: true,
                                    },
                                )
                            }
                        >
                            {adminContext.isVisible ? (
                                <EyeOff className="size-4" />
                            ) : (
                                <Eye className="size-4" />
                            )}
                            {adminContext.isVisible
                                ? 'Hide controls'
                                : 'Show controls'}
                        </Button>
                    )}
                    <Button asChild variant="outline">
                        <a href={workspaceHref}>
                            <Layers3 className="size-4" />
                            Open workspace
                            <SquareArrowOutUpRight className="size-4" />
                        </a>
                    </Button>
                </div>
            </div>
        </div>
    );
}
