import { scriptureAdminStartCase } from '@/lib/scripture-admin-field-display';
import type { ScriptureEntityRegionMeta } from '@/types';

export function isSameScriptureRegionMeta(
    left: ScriptureEntityRegionMeta | null | undefined,
    right: ScriptureEntityRegionMeta | null | undefined,
): boolean {
    if (!left || !right) {
        return false;
    }

    return (
        left.entityType === right.entityType &&
        left.entityId === right.entityId &&
        left.region === right.region
    );
}

export function scriptureInlineRegionLabel(
    region: string,
    fallback?: string | null,
): string {
    if (fallback && fallback.trim().length > 0) {
        return fallback;
    }

    switch (region) {
        case 'page_intro':
        case 'book_intro':
            return 'Intro';
        case 'content_blocks':
            return 'Content blocks';
        case 'study_notes':
            return 'Verse notes';
        case 'media_slots':
        case 'book_media_slots':
            return 'Media slots';
        default:
            return scriptureAdminStartCase(region);
    }
}
