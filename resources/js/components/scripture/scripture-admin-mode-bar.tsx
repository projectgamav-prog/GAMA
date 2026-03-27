import { Badge } from '@/components/ui/badge';
import { useAdminContext } from '@/hooks/use-admin-context';
import { cn } from '@/lib/utils';
import { ScriptureAdminVisibilityToggle } from './scripture-admin-visibility-toggle';

type Props = {
    className?: string;
};

export function ScriptureAdminModeBar({ className }: Props) {
    const adminContext = useAdminContext();

    if (!adminContext.canAccess) {
        return null;
    }

    return (
        <div
            className={cn(
                'rounded-2xl border border-border/70 bg-muted/20 px-4 py-4 sm:px-5',
                className,
            )}
        >
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div className="space-y-3">
                    <div className="flex flex-wrap items-center gap-2">
                        <Badge
                            variant={
                                adminContext.isVisible ? 'default' : 'outline'
                            }
                        >
                            Editor Mode
                        </Badge>
                        <Badge variant="secondary">
                            {adminContext.isVisible
                                ? 'Inline controls active'
                                : 'Inline controls hidden'}
                        </Badge>
                    </div>
                    <p className="max-w-3xl text-sm leading-6 text-muted-foreground">
                        {adminContext.isVisible
                            ? 'Edit controls are attached directly to editable book, chapter, and verse regions on this page.'
                            : 'Turn editor mode on to reveal the attached inline controls for editable scripture regions.'}
                    </p>
                </div>

                <ScriptureAdminVisibilityToggle />
            </div>
        </div>
    );
}
