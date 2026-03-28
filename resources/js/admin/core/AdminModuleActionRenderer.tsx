import { MoreHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import type { AdminResolvedModuleAction } from './module-types';

type Props = {
    actions: readonly AdminResolvedModuleAction[];
    activeActionKey: string | null;
    onAction: (action: AdminResolvedModuleAction) => void;
};

export function AdminModuleActionRenderer({
    actions,
    activeActionKey,
    onAction,
}: Props) {
    if (actions.length === 0) {
        return null;
    }

    const directActions = actions.filter(
        (action) =>
            action.placement === 'header' || action.placement === 'inline',
    );
    const dropdownActions = actions.filter(
        (action) => action.placement === 'dropdown',
    );

    return (
        <>
            {directActions.map((action) => (
                <Button
                    key={action.key}
                    type="button"
                    size="sm"
                    variant={
                        activeActionKey === action.key
                            ? 'secondary'
                            : action.variant
                    }
                    className={cn(
                        'h-7 rounded-md border border-border/80 bg-background px-2.5 text-xs font-medium text-foreground shadow-sm hover:bg-background',
                        activeActionKey === action.key &&
                            'border-border bg-foreground text-background hover:bg-foreground/90',
                        activeActionKey !== action.key &&
                            action.variant === 'ghost' &&
                            'bg-background text-foreground hover:bg-muted',
                    )}
                    aria-pressed={activeActionKey === action.key}
                    onClick={() => onAction(action)}
                >
                    {action.label}
                </Button>
            ))}

            {dropdownActions.length > 0 && (
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            className="h-7 rounded-md border border-border/80 bg-background px-2.5 text-xs font-medium text-foreground shadow-sm hover:bg-muted"
                        >
                            <MoreHorizontal className="size-3.5" />
                            More
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        {dropdownActions.map((action) => (
                            <DropdownMenuItem
                                key={action.key}
                                onSelect={() => onAction(action)}
                            >
                                {action.label}
                            </DropdownMenuItem>
                        ))}
                    </DropdownMenuContent>
                </DropdownMenu>
            )}
        </>
    );
}
