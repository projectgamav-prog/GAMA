import type { ScriptureChapter } from '@/types';

type Props = {
    chapter: ScriptureChapter;
    showAdminControls: boolean;
    returnToHref?: string | null;
    panelClassName?: string;
};

/**
 * @deprecated Legacy row-level module launchers are removed from public
 * scripture rows. Chapter title controls now come from schema-aware field
 * surfaces inside `ScriptureChapterTitleDisplay`.
 */
export function ScriptureBookChapterRowAdmin(_props: Props) {
    return null;
}
