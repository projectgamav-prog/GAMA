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
import type { CmsModuleEditorProps } from '../../core/module-types';
import {
    getMediaAspectRatio,
    getMediaType,
    getMediaWidth,
} from './types';

export function MediaEditor({
    value,
    onChange,
    idPrefix,
    errors,
}: CmsModuleEditorProps) {
    const mediaType = getMediaType(value.data);
    const aspectRatio = getMediaAspectRatio(value.config);
    const width = getMediaWidth(value.config);

    return (
        <div className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
                <div className="grid gap-2">
                    <Label htmlFor={`${idPrefix}-media-type`}>
                        Media type
                    </Label>
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
                        <SelectTrigger
                            id={`${idPrefix}-media-type`}
                            className="w-full"
                        >
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
                    <Label htmlFor={`${idPrefix}-media-width`}>Width</Label>
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
                        <SelectTrigger
                            id={`${idPrefix}-media-width`}
                            className="w-full"
                        >
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
                <Label htmlFor={`${idPrefix}-media-url`}>Media URL</Label>
                <Input
                    id={`${idPrefix}-media-url`}
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
                    <Label htmlFor={`${idPrefix}-media-alt-text`}>
                        Alt text
                    </Label>
                    <Input
                        id={`${idPrefix}-media-alt-text`}
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
                    <Label htmlFor={`${idPrefix}-media-aspect-ratio`}>
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
                            id={`${idPrefix}-media-aspect-ratio`}
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
                    <InputError
                        message={errors['config_json.aspect_ratio']}
                    />
                </div>
            </div>

            <div className="grid gap-2">
                <Label htmlFor={`${idPrefix}-media-caption`}>Caption</Label>
                <Input
                    id={`${idPrefix}-media-caption`}
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
