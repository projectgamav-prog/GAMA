import { Link } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { resolveScriptureNavigationActions } from '@/lib/scripture-navigation-actions';
import type { ScriptureNavigationActionDefinition } from '@/lib/scripture-navigation-actions';
import { ScriptureActionRow } from './scripture-action-row';

type Props = {
    actions: ScriptureNavigationActionDefinition[];
    className?: string;
};

export function ScriptureReadingNavigationActions({
    actions,
    className,
}: Props) {
    if (actions.length === 0) {
        return null;
    }

    const resolvedActions = resolveScriptureNavigationActions(actions);

    return (
        <ScriptureActionRow className={className}>
            {resolvedActions.map((action) => {
                const Icon = action.icon;

                return (
                    <Button
                        key={action.key}
                        asChild
                        variant={
                            action.variant === 'link'
                                ? 'outline'
                                : action.variant
                        }
                    >
                        <Link href={action.href}>
                            {action.iconPosition === 'start' && (
                                <Icon className="size-4" />
                            )}
                            {action.label}
                            {action.iconPosition === 'end' && (
                                <Icon className="size-4" />
                            )}
                        </Link>
                    </Button>
                );
            })}
        </ScriptureActionRow>
    );
}
