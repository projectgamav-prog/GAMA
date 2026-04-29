import type {
    ScriptureChapterVerseSharedAdmin,
    ScriptureReaderVerse,
} from '@/types';

type Props = {
    verse: ScriptureReaderVerse;
    sectionTitle: string;
    showAdminControls: boolean;
    returnToHref?: string | null;
    sharedAdmin?: ScriptureChapterVerseSharedAdmin | null;
    panelClassName?: string;
};

/**
 * @deprecated Legacy row-level module launchers are removed from public
 * scripture rows. Verse text controls now come from schema-aware field surfaces
 * inside `ScriptureVerseTextDisplay`.
 */
export function ScriptureChapterVerseRowAdmin(_props: Props) {
    return null;
}
