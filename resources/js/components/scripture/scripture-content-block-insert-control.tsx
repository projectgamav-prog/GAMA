import { Plus } from 'lucide-react';
import { useCanSeeAdminControls } from '@/hooks/use-admin-context';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

type Props = {
    onClick: () => void;
    className?: string;
    label?: string;
};

export function ScriptureContentBlockInsertControl({
    onClick,
    className,
    label = 'Add block',
}: Props) {
    const canSeeAdminControls = useCanSeeAdminControls();

    if (!canSeeAdminControls) {
        return null;
    }

    return (
        <div className={cn('flex items-center gap-3', className)}>
            <div className="h-px flex-1 bg-amber-300/60" />
            <Button
                type="button"
                size="sm"
                variant="outline"
                className="border-dashed border-amber-300 bg-amber-50/80 text-amber-950 hover:bg-amber-100"
                onClick={onClick}
            >
                <Plus className="size-3.5" />
                {label}
            </Button>
            <div className="h-px flex-1 bg-amber-300/60" />
        </div>
    );
}
