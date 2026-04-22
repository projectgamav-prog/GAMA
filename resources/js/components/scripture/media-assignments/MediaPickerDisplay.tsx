import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import type { ScriptureAdminMediaSummary } from '@/types';

export function findAvailableMedia(
    availableMedia: ScriptureAdminMediaSummary[],
    mediaId: string,
): ScriptureAdminMediaSummary | null {
    return (
        availableMedia.find((media) => String(media.id) === mediaId) ?? null
    );
}

export function resolveMediaDisplayTitle(
    media: ScriptureAdminMediaSummary,
): string {
    return media.title?.trim() || `Media ${media.id}`;
}

function resolveMediaSourceCue(media: ScriptureAdminMediaSummary): string | null {
    const source = media.path ?? media.url;

    if (!source) {
        return null;
    }

    const normalizedSource = source.split('?')[0] ?? source;
    const segments = normalizedSource.split('/').filter(Boolean);
    const lastSegment = segments[segments.length - 1];

    return lastSegment ?? normalizedSource;
}

function resolveMediaDetailCue(media: ScriptureAdminMediaSummary): string | null {
    const sourceCue = resolveMediaSourceCue(media);

    if (sourceCue) {
        return sourceCue;
    }

    if (media.alt_text?.trim()) {
        return `Alt: ${media.alt_text.trim()}`;
    }

    if (media.caption?.trim()) {
        return `Caption: ${media.caption.trim()}`;
    }

    return null;
}

export function resolveMediaPickerLabel(
    media: ScriptureAdminMediaSummary,
): string {
    const segments = [resolveMediaDisplayTitle(media), media.media_type];
    const detailCue = resolveMediaDetailCue(media);

    if (detailCue) {
        segments.push(detailCue);
    }

    return segments.join(' - ');
}

export function MediaSelectionSummary({
    media,
    label,
}: {
    media: ScriptureAdminMediaSummary | null;
    label: string;
}) {
    if (media === null) {
        return (
            <div className="rounded-xl border border-dashed border-border/80 bg-muted/10 px-4 py-3 text-sm leading-6 text-muted-foreground">
                {label}
            </div>
        );
    }

    const detailCue = resolveMediaDetailCue(media);
    const hasCaption = Boolean(media.caption?.trim());

    return (
        <div className="rounded-xl border border-border/70 bg-muted/20 px-4 py-3">
            <div className="flex flex-wrap items-center gap-2">
                <Badge variant="secondary">{resolveMediaDisplayTitle(media)}</Badge>
                <Badge variant="outline">{media.media_type}</Badge>
                <Badge variant="outline">#{media.id}</Badge>
                {hasCaption && <Badge variant="outline">Has caption</Badge>}
            </div>
            {detailCue && (
                <p className="mt-3 text-sm leading-6 text-muted-foreground">
                    {detailCue}
                </p>
            )}
        </div>
    );
}

export function MediaPreviewCard({
    media,
    title,
    caption,
    fallbackLabel,
}: {
    media: ScriptureAdminMediaSummary | null;
    title?: string | null;
    caption?: string | null;
    fallbackLabel: string;
}) {
    if (media === null) {
        return (
            <div className="rounded-xl border border-dashed border-border/80 bg-muted/20 px-4 py-4 text-sm leading-6 text-muted-foreground">
                No media record is currently linked to this slot.
            </div>
        );
    }

    const mediaUrl = media.url ?? media.path;
    const resolvedTitle = title ?? media.title;
    const resolvedCaption = caption ?? media.caption;

    return (
        <div className="space-y-4 rounded-xl border border-border/70 bg-muted/20 px-4 py-4">
            <div className="flex flex-wrap items-center gap-2">
                <Badge variant="outline">{media.media_type}</Badge>
                {resolvedTitle && (
                    <Badge variant="secondary" className="max-w-full truncate">
                        {resolvedTitle}
                    </Badge>
                )}
            </div>

            {mediaUrl ? (
                media.media_type === 'video' ? (
                    <video
                        controls
                        preload="none"
                        className="aspect-video w-full rounded-lg border bg-black"
                        src={mediaUrl}
                    />
                ) : media.media_type === 'image' ? (
                    <img
                        src={mediaUrl}
                        alt={media.alt_text ?? resolvedTitle ?? fallbackLabel}
                        className="w-full rounded-lg border object-cover"
                    />
                ) : (
                    <Button asChild variant="outline" size="sm">
                        <a href={mediaUrl} target="_blank" rel="noreferrer">
                            Open media
                        </a>
                    </Button>
                )
            ) : (
                <div className="rounded-lg border border-dashed border-border/80 px-3 py-3 text-sm text-muted-foreground">
                    No media URL or file path is recorded yet.
                </div>
            )}

            {resolvedCaption && (
                <p className="text-sm leading-6 text-muted-foreground">
                    {resolvedCaption}
                </p>
            )}
        </div>
    );
}
