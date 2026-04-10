export type MediaType = 'image' | 'video';

export type MediaAspectRatio = 'auto' | 'landscape' | 'portrait' | 'square';

export type MediaWidth = 'content' | 'wide' | 'full';

export type MediaData = {
    media_type: MediaType;
    url: string;
    alt_text: string | null;
    caption: string | null;
};

export type MediaConfig = {
    aspect_ratio: MediaAspectRatio;
    width: MediaWidth;
};

export const getMediaType = (data: Record<string, unknown>): MediaType =>
    data.media_type === 'video' ? 'video' : 'image';

export const getMediaAspectRatio = (
    config: Record<string, unknown>,
): MediaAspectRatio => {
    const aspectRatio = config.aspect_ratio;

    return aspectRatio === 'landscape'
        || aspectRatio === 'portrait'
        || aspectRatio === 'square'
        ? aspectRatio
        : 'auto';
};

export const getMediaWidth = (
    config: Record<string, unknown>,
): MediaWidth => {
    const width = config.width;

    return width === 'content' || width === 'full' ? width : 'wide';
};
