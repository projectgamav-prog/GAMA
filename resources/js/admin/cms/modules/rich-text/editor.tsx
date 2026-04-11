import { useMemo, useState } from 'react';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
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
    htmlToRichTextDocumentSource,
    parseRichTextDocument,
} from './document';
import { RichTextRenderer } from './renderer';
import {
    getRichTextAlign,
    getRichTextBlocks,
    getRichTextBody,
    getRichTextEyebrow,
    getRichTextLead,
    getRichTextTitle,
    getRichTextWidth,
} from './types';

export function RichTextEditor({
    value,
    onChange,
    idPrefix,
    errors,
}: CmsModuleEditorProps) {
    const [bodyView, setBodyView] = useState<'write' | 'preview'>('write');
    const bodySource = useMemo(() => {
        const explicitBody = getRichTextBody(value.data);

        if (explicitBody.trim() !== '') {
            return explicitBody;
        }

        const blocks = getRichTextBlocks(value.data);

        if (blocks.length > 0) {
            return blocks
                .map((block) =>
                    block.type === 'heading'
                        ? `${block.level === 3 ? '###' : '##'} ${block.text}`
                        : block.type === 'quote'
                          ? `> ${block.text}`
                          : block.type === 'list'
                            ? block.items.map((item) => `- ${item}`).join('\n')
                            : block.text,
                )
                .join('\n\n');
        }

        return htmlToRichTextDocumentSource(
            typeof value.data.html === 'string' ? value.data.html : '',
        );
    }, [value.data]);

    const updateBody = (nextBody: string) =>
        onChange({
            ...value,
            data: {
                ...value.data,
                body: nextBody,
                blocks: parseRichTextDocument(nextBody),
                html: '',
            },
        });

    const appendSnippet = (snippet: string) => {
        const prefix = bodySource.trim() === '' ? '' : '\n\n';

        updateBody(`${bodySource}${prefix}${snippet}`);
        setBodyView('write');
    };

    return (
        <div className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
                <div className="grid gap-2">
                    <Label htmlFor={`${idPrefix}-rich-text-eyebrow`}>
                        Eyebrow
                    </Label>
                    <Textarea
                        id={`${idPrefix}-rich-text-eyebrow`}
                        className="min-h-20"
                        value={getRichTextEyebrow(value.data)}
                        onChange={(event) =>
                            onChange({
                                ...value,
                                data: {
                                    ...value.data,
                                    eyebrow: event.target.value,
                                },
                            })
                        }
                        placeholder="Supplementary reading"
                    />
                </div>

                <div className="grid gap-2">
                    <Label htmlFor={`${idPrefix}-rich-text-title`}>
                        Title
                    </Label>
                    <Textarea
                        id={`${idPrefix}-rich-text-title`}
                        className="min-h-20"
                        value={getRichTextTitle(value.data)}
                        onChange={(event) =>
                            onChange({
                                ...value,
                                data: {
                                    ...value.data,
                                    title: event.target.value,
                                },
                            })
                        }
                        placeholder="A stronger prose section title"
                    />
                </div>
            </div>

            <div className="grid gap-2">
                <Label htmlFor={`${idPrefix}-rich-text-lead`}>
                    Lead text
                </Label>
                <Textarea
                    id={`${idPrefix}-rich-text-lead`}
                    className="min-h-24"
                    value={getRichTextLead(value.data)}
                    onChange={(event) =>
                        onChange({
                            ...value,
                            data: {
                                ...value.data,
                                lead: event.target.value,
                            },
                        })
                    }
                    placeholder="Add a short opening paragraph before the main prose."
                />
            </div>

            <div className="grid gap-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                    <Label htmlFor={`${idPrefix}-rich-text-body`}>Body</Label>
                    <div className="flex flex-wrap gap-2">
                        <Button
                            type="button"
                            size="sm"
                            variant={bodyView === 'write' ? 'default' : 'outline'}
                            onClick={() => setBodyView('write')}
                        >
                            Write
                        </Button>
                        <Button
                            type="button"
                            size="sm"
                            variant={bodyView === 'preview' ? 'default' : 'outline'}
                            onClick={() => setBodyView('preview')}
                        >
                            Preview
                        </Button>
                    </div>
                </div>

                <div className="flex flex-wrap gap-2">
                    <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={() => appendSnippet('## Section heading')}
                    >
                        Heading
                    </Button>
                    <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={() =>
                            appendSnippet(
                                '- First point\n- Second point\n- Third point',
                            )
                        }
                    >
                        Bullets
                    </Button>
                    <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={() =>
                            appendSnippet('> Add a highlighted quotation here.')
                        }
                    >
                        Quote
                    </Button>
                </div>

                {bodyView === 'write' ? (
                    <Textarea
                        id={`${idPrefix}-rich-text-body`}
                        className="min-h-56 text-sm leading-7"
                        value={bodySource}
                        onChange={(event) => updateBody(event.target.value)}
                        placeholder={`Write naturally here.\n\nUse blank lines for new paragraphs.\nUse ## or ### for headings.\nUse - for bullet lists.\nUse > for quotes.\nUse **bold** or *italic* for emphasis.`}
                    />
                ) : (
                    <div className="rounded-2xl border border-border/70 bg-background p-4">
                        <RichTextRenderer
                            value={{
                                data: {
                                    ...value.data,
                                    body: bodySource,
                                    blocks: parseRichTextDocument(bodySource),
                                    html: '',
                                },
                                config: value.config,
                            }}
                            mode="admin"
                        />
                    </div>
                )}

                <p className="text-xs leading-5 text-muted-foreground">
                    Write with light markdown-style structure instead of raw
                    HTML. The CMS keeps the body in predictable block form for
                    safe rendering.
                </p>
                <InputError message={errors['data_json.body']} />
                <InputError message={errors['data_json.blocks']} />
                <InputError message={errors['data_json.html']} />
                <p className="text-xs leading-5 text-muted-foreground">
                    Existing legacy HTML content is still rendered, but new
                    edits now flow through the structured writing format.
                </p>
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
