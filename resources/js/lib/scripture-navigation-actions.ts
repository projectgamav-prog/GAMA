import {
    ArrowLeft,
    ArrowRight,
    BookOpenText,
    MessageSquareQuote,
    PlayCircle,
    type LucideIcon,
} from 'lucide-react';

export type ScriptureNavigationActionKey =
    | 'go_to_structure_overview'
    | 'open_book'
    | 'open_book_overview'
    | 'open_chapter'
    | 'open_verse_detail'
    | 'open_verse_notes_video'
    | 'back_to_chapter_list'
    | 'back_to_verse_list'
    | 'go_to_previous_verse'
    | 'go_to_next_verse';

export type ScriptureNavigationActionDefinition = {
    actionKey: ScriptureNavigationActionKey;
    href: string;
    priority?: number;
    visible?: boolean;
};

export type ScriptureNavigationActionVariant = 'default' | 'outline' | 'link';

export type ResolvedScriptureNavigationAction = {
    key: string;
    actionKey: ScriptureNavigationActionKey;
    href: string;
    label: string;
    variant: ScriptureNavigationActionVariant;
    icon: LucideIcon;
    iconPosition: 'start' | 'end';
    priority: number;
};

type NavigationPresentation = Omit<
    ResolvedScriptureNavigationAction,
    'key' | 'href' | 'priority'
>;

const NAVIGATION_PRESENTATIONS: Record<
    ScriptureNavigationActionKey,
    NavigationPresentation
> = {
    go_to_structure_overview: {
        actionKey: 'go_to_structure_overview',
        label: 'Continue to Scripture Structure',
        variant: 'default',
        icon: ArrowRight,
        iconPosition: 'end',
    },
    open_book: {
        actionKey: 'open_book',
        label: 'Open Book',
        variant: 'link',
        icon: ArrowRight,
        iconPosition: 'end',
    },
    open_book_overview: {
        actionKey: 'open_book_overview',
        label: 'Read Overview',
        variant: 'outline',
        icon: ArrowRight,
        iconPosition: 'end',
    },
    open_chapter: {
        actionKey: 'open_chapter',
        label: 'Read Chapter',
        variant: 'link',
        icon: ArrowRight,
        iconPosition: 'end',
    },
    open_verse_detail: {
        actionKey: 'open_verse_detail',
        label: 'Verse Details',
        variant: 'outline',
        icon: MessageSquareQuote,
        iconPosition: 'start',
    },
    open_verse_notes_video: {
        actionKey: 'open_verse_notes_video',
        label: 'Notes & Video',
        variant: 'outline',
        icon: PlayCircle,
        iconPosition: 'start',
    },
    back_to_chapter_list: {
        actionKey: 'back_to_chapter_list',
        label: 'Back to Chapter List',
        variant: 'outline',
        icon: BookOpenText,
        iconPosition: 'start',
    },
    back_to_verse_list: {
        actionKey: 'back_to_verse_list',
        label: 'Back to Verse List',
        variant: 'outline',
        icon: ArrowLeft,
        iconPosition: 'start',
    },
    go_to_previous_verse: {
        actionKey: 'go_to_previous_verse',
        label: 'Previous Verse',
        variant: 'outline',
        icon: ArrowLeft,
        iconPosition: 'start',
    },
    go_to_next_verse: {
        actionKey: 'go_to_next_verse',
        label: 'Next Verse',
        variant: 'default',
        icon: ArrowRight,
        iconPosition: 'end',
    },
};

export function resolveScriptureNavigationAction(
    action: ScriptureNavigationActionDefinition,
): ResolvedScriptureNavigationAction | null {
    if (action.visible === false) {
        return null;
    }

    const presentation = NAVIGATION_PRESENTATIONS[action.actionKey];

    return {
        key: `${action.actionKey}:${action.href}`,
        href: action.href,
        priority: action.priority ?? 0,
        ...presentation,
    };
}

export function resolveScriptureNavigationActions(
    actions: readonly ScriptureNavigationActionDefinition[],
): ResolvedScriptureNavigationAction[] {
    return actions
        .map(resolveScriptureNavigationAction)
        .filter(
            (
                action,
            ): action is ResolvedScriptureNavigationAction => action !== null,
        )
        .sort((left, right) => left.priority - right.priority);
}
