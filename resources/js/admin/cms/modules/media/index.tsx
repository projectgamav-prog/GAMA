import InputError from '@/components/input-error';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import type {
    CmsModuleEditorProps,
    CmsModuleManifest,
    CmsModuleRendererProps,
} from '../../core/module-types';

type MediaType = 'image' | 'video';

type MediaAspectRatio = 'auto' | 'landscape' | 'portrait' | 'square';

type MediaWidth = 'content' | 'wide' | 'full';

const getMediaType = (data: Record<string, unknown>): MediaType =>
    data.media_type === 'video' ? 'video' : 'image';

const getAspectRatio = (
    config: Record<string, unknown>,
): MediaAspectRatio => {
    const aspectRatio = config.aspect_ratio;

    return aspectRatio === 'landscape'
        || aspectRatio === 'portrait'
        || aspectRatio === 'square'
        ? aspectRatio
        : 'auto';
};

const getWidth = (config: Record<string, unknown>): MediaWidth => {
    const width = config.width;

    return width === 'content' || width === 'full' ? width : 'wide';
};

function MediaRenderer({ value, mode }: CmsModuleRendererProps) {
    const mediaType = getMediaType(value.data);
    const url = typeof value.data.url === 'string' ? value.data.url : '';
    const altText =
        typeof value.data.alt_text === 'string' ? value.data.alt_text : '';
    const caption =
        typeof value.data.caption === 'string' ? value.data.caption : '';
    const aspectRatio = getAspectRatio(value.config);
    const width = getWidth(value.config);

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
                mode === 'admin' &&
                    'rounded-2xl border border-border/60 bg-background/70 p-4',
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

function MediaEditor({ value, onChange, errors }: CmsModuleEditorProps) {
    const mediaType = getMediaType(value.data);
    const aspectRatio = getAspectRatio(value.config);
    const width = getWidth(value.config);

    return (
        <div className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
                <div className="grid gap-2">
                    <Label htmlFor="cms-media-type">Media type</Label>
                    <Select
                        value={mediaType}
                        onValueChange={(nextValue) =>
                            onChange({
                                ...value,
                                data: {
                                    ...value.data,
                                    media_type: nextValue,
                                },
                            })
                        }
                    >
                        <SelectTrigger id="cms-media-type" className="w-full">
                            <SelectValue placeholder="Choose media type" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="image">Image</SelectItem>
                            <SelectItem value="video">Video</SelectItem>
                        </SelectContent>
                    </Select>
                    <InputError message={errors['data_json.media_type']} />
                </div>

                <div className="grid gap-2">
                    <Label htmlFor="cms-media-width">Width</Label>
                    <Select
                        value={width}
                        onValueChange={(nextValue) =>
                            onChange({
                                ...value,
                                config: {
                                    ...value.config,
                                    width: nextValue,
                                },
                            })
                        }
                    >
                        <SelectTrigger id="cms-media-width" className="w-full">
                            <SelectValue placeholder="Choose width" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="content">Content</SelectItem>
                            <SelectItem value="wide">Wide</SelectItem>
                            <SelectItem value="full">Full</SelectItem>
                        </SelectContent>
                    </Select>
                    <InputError message={errors['config_json.width']} />
                </div>
            </div>

            <div className="grid gap-2">
                <Label htmlFor="cms-media-url">Media URL</Label>
                <Input
                    id="cms-media-url"
                    value={typeof value.data.url === 'string' ? value.data.url : ''}
                    onChange={(event) =>
                        onChange({
                            ...value,
                            data: {
                                ...value.data,
                                url: event.target.value,
                            },
                        })
                    }
                    placeholder="https://example.com/image.jpg"
                />
                <InputError message={errors['data_json.url']} />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
                <div className="grid gap-2">
                    <Label htmlFor="cms-media-alt-text">Alt text</Label>
                    <Input
                        id="cms-media-alt-text"
                        value={
                            typeof value.data.alt_text === 'string'
                                ? value.data.alt_text
                                : ''
                        }
                        onChange={(event) =>
                            onChange({
                                ...value,
                                data: {
                                    ...value.data,
                                    alt_text: event.target.value,
                                },
                            })
                        }
                        placeholder="Describe the image for accessibility"
                    />
                </div>

                <div className="grid gap-2">
                    <Label htmlFor="cms-media-aspect-ratio">
                        Aspect ratio
                    </Label>
                    <Select
                        value={aspectRatio}
                        onValueChange={(nextValue) =>
                            onChange({
                                ...value,
                                config: {
                                    ...value.config,
                                    aspect_ratio: nextValue,
                                },
                            })
                        }
                    >
                        <SelectTrigger
                            id="cms-media-aspect-ratio"
                            className="w-full"
                        >
                            <SelectValue placeholder="Choose aspect ratio" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="auto">Auto</SelectItem>
                            <SelectItem value="landscape">Landscape</SelectItem>
                            <SelectItem value="portrait">Portrait</SelectItem>
                            <SelectItem value="square">Square</SelectItem>
                        </SelectContent>
                    </Select>
                    <InputError message={errors['config_json.aspect_ratio']} />
                </div>
            </div>

            <div className="grid gap-2">
                <Label htmlFor="cms-media-caption">Caption</Label>
                <Input
                    id="cms-media-caption"
                    value={
                        typeof value.data.caption === 'string'
                            ? value.data.caption
                            : ''
                    }
                    onChange={(event) =>
                        onChange({
                            ...value,
                            data: {
                                ...value.data,
                                caption: event.target.value,
                            },
                        })
                    }
                    placeholder="Optional supporting caption"
                />
            </div>
        </div>
    );
}

export const mediaModule: CmsModuleManifest = {
    key: 'media',
    label: 'Media',
    category: 'media',
    description: 'Image or video content rendered inside the current container.',
    defaultData: {
        media_type: 'image',
        url: '',
        alt_text: null,
        caption: null,
    },
    defaultConfig: {
        aspect_ratio: 'auto',
        width: 'wide',
    },
    Renderer: MediaRenderer,
    Editor: MediaEditor,
};
