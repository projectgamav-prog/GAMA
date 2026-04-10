import type { MediaConfig, MediaData } from './types';

export const mediaDefaultData: MediaData = {
    media_type: 'image',
    url: '',
    alt_text: null,
    caption: null,
};

export const mediaDefaultConfig: MediaConfig = {
    aspect_ratio: 'auto',
    width: 'wide',
};
