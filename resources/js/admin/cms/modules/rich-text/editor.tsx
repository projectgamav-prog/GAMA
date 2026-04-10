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
import type { CmsModuleEditorProps } from '../../core/module-types';
import {
    getRichTextAlign,
    getRichTextHtml,
    getRichTextWidth,
} from './types';

export function RichTextEditor({
    value,
    onChange,
    idPrefix,
    errors,
}: CmsModuleEditorProps) {
    return (
        <div className="space-y-4">
            <div className="grid gap-2">
                <Label htmlFor={`${idPrefix}-rich-text-html`}>
                    HTML content
                </Label>
                <Textarea
                    id={`${idPrefix}-rich-text-html`}
                    className="min-h-40 font-mono text-xs"
                    value={getRichTextHtml(value.data)}
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
                    <Label htmlFor={`${idPrefix}-rich-text-align`}>
                        Alignment
                    </Label>
                    <Select
                        value={getRichTextAlign(value.config)}
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
                        <SelectTrigger
                            id={`${idPrefix}-rich-text-align`}
                            className="w-full"
                        >
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
                    <Label htmlFor={`${idPrefix}-rich-text-width`}>
                        Width
                    </Label>
                    <Select
                        value={getRichTextWidth(value.config)}
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
                        <SelectTrigger
                            id={`${idPrefix}-rich-text-width`}
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
                    <InputError message={errors['config_json.max_width']} />
                </div>
            </div>
        </div>
    );
}
