import { Link } from '@inertiajs/react';
import {
    ArrowLeft,
    ArrowRight,
    BookOpenText,
    type LucideIcon,
} from 'lucide-react';
import type { ComponentProps } from 'react';
import { Button } from '@/components/ui/button';
import { ScriptureActionRow } from './scripture-action-row';

type ButtonVariant = ComponentProps<typeof Button>['variant'];

type ReadingNavigationActionKind =
    | 'continue_to_structure'
    | 'back_to_chapter_list'
    | 'back_to_verse_list'
    | 'previous_verse'
    | 'next_verse';

type ReadingNavigationAction = {
    kind: ReadingNavigationActionKind;
    href: string;
};

type ReadingNavigationActionDefinition = {
    label: string;
    variant: ButtonVariant;
    icon: LucideIcon;
    iconPosition: 'start' | 'end';
};

const ACTION_DEFINITIONS: Record<
    ReadingNavigationActionKind,
    ReadingNavigationActionDefinition
> = {
    continue_to_structure: {
        label: 'Continue to Scripture Structure',
        variant: 'default',
        icon: ArrowRight,
        iconPosition: 'end',
    },
    back_to_chapter_list: {
        label: 'Back to Chapter List',
        variant: 'outline',
        icon: BookOpenText,
        iconPosition: 'start',
    },
    back_to_verse_list: {
        label: 'Back to Verse List',
        variant: 'outline',
        icon: ArrowLeft,
        iconPosition: 'start',
    },
    previous_verse: {
        label: 'Previous Verse',
        variant: 'outline',
        icon: ArrowLeft,
        iconPosition: 'start',
    },
    next_verse: {
        label: 'Next Verse',
        variant: 'default',
        icon: ArrowRight,
        iconPosition: 'end',
    },
};

type Props = {
    actions: ReadingNavigationAction[];
    className?: string;
};

export function ScriptureReadingNavigationActions({
    actions,
    className,
}: Props) {
    if (actions.length === 0) {
        return null;
    }

    return (
        <ScriptureActionRow className={className}>
            {actions.map((action) => {
                const definition = ACTION_DEFINITIONS[action.kind];
                const Icon = definition.icon;

                return (
                    <Button
                        key={`${action.kind}:${action.href}`}
                        asChild
                        variant={definition.variant}
                    >
                        <Link href={action.href}>
                            {definition.iconPosition === 'start' && (
                                <Icon className="size-4" />
                            )}
                            {definition.label}
                            {definition.iconPosition === 'end' && (
                                <Icon className="size-4" />
                            )}
                        </Link>
                    </Button>
                );
            })}
        </ScriptureActionRow>
    );
}
