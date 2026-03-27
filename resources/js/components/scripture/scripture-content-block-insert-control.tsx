import { ChevronDown, Plus } from 'lucide-react';
import { useCanSeeAdminControls } from '@/hooks/use-admin-context';
import { scriptureAdminStartCase } from '@/lib/scripture-admin-field-display';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';

type Props = {
    onSelectType: (blockType: string) => void;
    blockTypes: string[];
    className?: string;
    label?: string;
    placementLabel?: string;
    disabled?: boolean;
};

export function ScriptureContentBlockInsertControl({
    onSelectType,
    blockTypes,
    className,
    label = 'Add block',
    placementLabel,
    disabled = false,
}: Props) {
    const canSeeAdminControls = useCanSeeAdminControls();

    if (!canSeeAdminControls || blockTypes.length === 0) {
        return null;
    }

    return (
        <div className={cn('flex flex-wrap items-center gap-3', className)}>
            <div className="h-px flex-1 bg-border/70" />
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        className="h-8 rounded-full border-dashed px-3"
                        disabled={disabled}
                    >
                        <Plus className="size-3.5" />
                        {label}
                        <ChevronDown className="size-3.5" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="center" className="min-w-48">
                    <DropdownMenuLabel>Choose block type</DropdownMenuLabel>
                    {placementLabel && (
                        <p className="px-2 pb-2 text-xs leading-5 text-muted-foreground">
                            {placementLabel}
                        </p>
                    )}
                    {blockTypes.map((blockType) => (
                        <DropdownMenuItem
                            key={blockType}
                            onSelect={() => onSelectType(blockType)}
                        >
                            {scriptureAdminStartCase(blockType)}
                        </DropdownMenuItem>
                    ))}
                </DropdownMenuContent>
            </DropdownMenu>
            <div className="h-px flex-1 bg-border/70" />
            {placementLabel && (
                <p className="basis-full text-center text-[11px] leading-5 text-muted-foreground">
                    {placementLabel}
                </p>
            )}
        </div>
    );
}
