import { cn } from '@/lib/utils';
import type { CmsModuleRendererProps } from '../../core/module-types';
import {
    getMediaAspectRatio,
    getMediaType,
    getMediaWidth,
} from './types';

export function MediaRenderer({ value, mode }: CmsModuleRendererProps) {
    const mediaType = getMediaType(value.data);
    const url = typeof value.data.url === 'string' ? value.data.url : '';
    const altText =
        typeof value.data.alt_text === 'string' ? value.data.alt_text : '';
    const caption =
        typeof value.data.caption === 'string' ? value.data.caption : '';
    const aspectRatio = getMediaAspectRatio(value.config);
    const width = getMediaWidth(value.config);

    const body = ! url ? (
        <div className="flex min-h-48 items-center justify-center rounded-2xl border border-dashed border-border/70 bg-muted/20 px-6 text-center text-sm text-muted-foreground">
            Add a media URL to render this block.
        </div>
    ) : mediaType === 'video' ? (
        <video
            className={cn(
                'w-full rounded-2xl bg-black object-cover',
                aspectRatio === 'landscape' && 'aspect-video',
                aspectRatio === 'portrait' && 'aspect-[3/4]',
                aspectRatio === 'square' && 'aspect-square',
            )}
            controls
            src={url}
        />
    ) : (
        <img
            className={cn(
                'w-full rounded-2xl object-cover',
                aspectRatio === 'landscape' && 'aspect-video',
                aspectRatio === 'portrait' && 'aspect-[3/4]',
                aspectRatio === 'square' && 'aspect-square',
            )}
            src={url}
            alt={altText}
        />
    );

    return (
        <figure
            className={cn(
                'space-y-3',
                width === 'content' && 'max-w-3xl',
                width === 'wide' && 'max-w-5xl',
                mode === 'admin'
                    && 'rounded-2xl border border-border/60 bg-background/70 p-4',
            )}
        >
            {body}
            {caption && (
                <figcaption className="text-sm leading-6 text-muted-foreground">
                    {caption}
                </figcaption>
            )}
        </figure>
    );
}
