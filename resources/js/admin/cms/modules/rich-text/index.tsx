import InputError from '@/components/input-error';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import type {
    CmsModuleEditorProps,
    CmsModuleManifest,
    CmsModuleRendererProps,
} from '../../core/module-types';

const getHtml = (data: Record<string, unknown>): string =>
    typeof data.html === 'string' ? data.html : '';

const getAlign = (config: Record<string, unknown>): 'left' | 'center' | 'right' => {
    const align = config.align;

    return align === 'center' || align === 'right' ? align : 'left';
};

const getWidth = (
    config: Record<string, unknown>,
): 'content' | 'wide' | 'full' => {
    const width = config.max_width;

    return width === 'wide' || width === 'full' ? width : 'content';
};

function RichTextRenderer({ value, mode }: CmsModuleRendererProps) {
    return (
        <div
            className={cn(
                'w-full',
                getWidth(value.config) === 'content' && 'max-w-3xl',
                getWidth(value.config) === 'wide' && 'max-w-5xl',
                getAlign(value.config) === 'center' && 'mx-auto text-center',
                getAlign(value.config) === 'right' && 'ml-auto text-right',
                mode === 'admin' &&
                    'rounded-2xl border border-border/60 bg-background/70 px-5 py-4',
            )}
        >
            <div
                className="space-y-4 leading-7 text-foreground [&_a]:text-primary [&_a]:underline [&_h1]:text-3xl [&_h1]:font-semibold [&_h2]:text-2xl [&_h2]:font-semibold [&_h3]:text-xl [&_h3]:font-semibold [&_li]:ml-5 [&_li]:list-disc [&_p+p]:mt-4"
                dangerouslySetInnerHTML={{
                    __html: getHtml(value.data),
                }}
            />
        </div>
    );
}

function RichTextEditor({ value, onChange, errors }: CmsModuleEditorProps) {
    return (
        <div className="space-y-4">
            <div className="grid gap-2">
                <Label htmlFor="cms-rich-text-html">HTML content</Label>
                <Textarea
                    id="cms-rich-text-html"
                    className="min-h-40 font-mono text-xs"
                    value={getHtml(value.data)}
                    onChange={(event) =>
                        onChange({
                            ...value,
                            data: {
                                ...value.data,
                                html: event.target.value,
                            },
                        })
                    }
                />
                <p className="text-xs leading-5 text-muted-foreground">
                    This first pass keeps rich text narrow and HTML-based so
                    module experiments can move quickly before a richer editor
                    arrives.
                </p>
                <InputError message={errors['data_json.html']} />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
                <div className="grid gap-2">
                    <Label htmlFor="cms-rich-text-align">Alignment</Label>
                    <Select
                        value={getAlign(value.config)}
                        onValueChange={(nextValue) =>
                            onChange({
                                ...value,
                                config: {
                                    ...value.config,
                                    align: nextValue,
                                },
                            })
                        }
                    >
                        <SelectTrigger id="cms-rich-text-align" className="w-full">
                            <SelectValue placeholder="Choose alignment" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="left">Left</SelectItem>
                            <SelectItem value="center">Center</SelectItem>
                            <SelectItem value="right">Right</SelectItem>
                        </SelectContent>
                    </Select>
                    <InputError message={errors['config_json.align']} />
                </div>

                <div className="grid gap-2">
                    <Label htmlFor="cms-rich-text-width">Width</Label>
                    <Select
                        value={getWidth(value.config)}
                        onValueChange={(nextValue) =>
                            onChange({
                                ...value,
                                config: {
                                    ...value.config,
                                    max_width: nextValue,
                                },
                            })
                        }
                    >
                        <SelectTrigger id="cms-rich-text-width" className="w-full">
                            <SelectValue placeholder="Choose width" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="content">Content</SelectItem>
                            <SelectItem value="wide">Wide</SelectItem>
                            <SelectItem value="full">Full</SelectItem>
                        </SelectContent>
                    </Select>
                    <InputError message={errors['config_json.max_width']} />
                </div>
            </div>
        </div>
    );
}

export const richTextModule: CmsModuleManifest = {
    key: 'rich_text',
    label: 'Rich Text',
    category: 'text',
    description: 'Long-form text content that stays inside the current container.',
    defaultData: {
        html: '<p>New rich text block.</p>',
    },
    defaultConfig: {
        align: 'left',
        max_width: 'content',
    },
    Renderer: RichTextRenderer,
    Editor: RichTextEditor,
};
