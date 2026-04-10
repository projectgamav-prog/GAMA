import {
    defineCmsModuleManifest,
    type CmsModulePayload,
} from '../../core/module-types';
import { mediaDefaultConfig, mediaDefaultData } from './defaults';
import { MediaEditor } from './editor';
import { MediaRenderer } from './renderer';
import {
    getMediaAspectRatio,
    getMediaType,
    getMediaWidth,
} from './types';

const validateMedia = (
    value: CmsModulePayload,
): Record<string, string | undefined> => {
    const errors: Record<string, string | undefined> = {};
    const url = typeof value.data.url === 'string' ? value.data.url.trim() : '';

    if (! ['image', 'video'].includes(getMediaType(value.data))) {
        errors['data_json.media_type'] = 'Choose a valid media type.';
    }

    if (url === '') {
        errors['data_json.url'] = 'Media URL is required.';
    }

    if (
        ! ['auto', 'landscape', 'portrait', 'square'].includes(
            getMediaAspectRatio(value.config),
        )
    ) {
        errors['config_json.aspect_ratio'] = 'Choose a valid aspect ratio.';
    }

    if (! ['content', 'wide', 'full'].includes(getMediaWidth(value.config))) {
        errors['config_json.width'] = 'Choose a valid media width.';
    }

    return errors;
};

export const mediaModuleManifest = defineCmsModuleManifest({
    key: 'media',
    label: 'Media',
    category: 'media',
    description:
        'Image or video content rendered inside the current container.',
    defaultData: mediaDefaultData,
    defaultConfig: mediaDefaultConfig,
    Renderer: MediaRenderer,
    Editor: MediaEditor,
    validate: validateMedia,
});
