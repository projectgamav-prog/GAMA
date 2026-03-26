import { Link } from '@inertiajs/react';
import { PencilLine, SquareArrowOutUpRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCanSeeAdminControls } from '@/hooks/use-admin-context';
import { cn } from '@/lib/utils';
import type {
    ScriptureAdminRegionConfig,
    ScriptureEntityRegionMeta,
} from '@/types';
import { useScriptureEntityRegion } from './scripture-entity-region';

type Props = {
    config: ScriptureAdminRegionConfig;
    className?: string;
    onEdit?: (
        meta: ScriptureEntityRegionMeta,
        config: ScriptureAdminRegionConfig,
    ) => void;
};

export function ScriptureAdminRegionToolbar({
    config,
    className,
    onEdit,
}: Props) {
    const meta = useScriptureEntityRegion();
    const canSeeAdminControls = useCanSeeAdminControls();

    if (!canSeeAdminControls || meta === null) {
        return null;
    }

    return (
        <div
            className={cn(
                'flex flex-wrap items-center gap-2 rounded-xl border border-amber-300/60 bg-amber-50/90 px-3 py-2 text-xs shadow-xs',
                className,
            )}
        >
            <span className="font-semibold tracking-[0.18em] text-amber-950 uppercase">
                Admin
            </span>

            {config.supportsEdit && config.contextualEditHref && onEdit && (
                <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    className="h-7 border-amber-300 bg-white text-amber-950 hover:bg-amber-100"
                    onClick={() => onEdit(meta, config)}
                >
                    <PencilLine className="size-3.5" />
                    Edit
                </Button>
            )}

            {config.supportsFullEdit && config.fullEditHref && (
                <Button
                    asChild
                    size="sm"
                    variant="outline"
                    className="h-7 border-amber-300 bg-white text-amber-950 hover:bg-amber-100"
                >
                    <Link href={config.fullEditHref}>
                        <SquareArrowOutUpRight className="size-3.5" />
                        Full edit
                    </Link>
                </Button>
            )}
        </div>
    );
}
