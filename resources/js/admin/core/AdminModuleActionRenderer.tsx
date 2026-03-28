import { MoreHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
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
                    className="h-8 rounded-full px-3"
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
                            className="h-8 rounded-full px-3"
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
