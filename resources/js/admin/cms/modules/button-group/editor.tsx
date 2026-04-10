import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
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
    createDefaultButton,
    type ButtonItem,
    type ButtonVariant,
    getButtonGroupAlignment,
    getButtonGroupButtons,
    getButtonGroupLayout,
} from './types';

export function ButtonGroupEditor({
    value,
    onChange,
    idPrefix,
    errors,
}: CmsModuleEditorProps) {
    const buttons = getButtonGroupButtons(value.data);
    const layout = getButtonGroupLayout(value.config);
    const alignment = getButtonGroupAlignment(value.config);

    const updateButtons = (nextButtons: ButtonItem[]) =>
        onChange({
            ...value,
            data: {
                ...value.data,
                buttons: nextButtons,
            },
        });

    return (
        <div className="space-y-5">
            <div className="grid gap-4 md:grid-cols-2">
                <div className="grid gap-2">
                    <Label htmlFor={`${idPrefix}-button-layout`}>Layout</Label>
                    <Select
                        value={layout}
                        onValueChange={(nextValue) =>
                            onChange({
                                ...value,
                                config: {
                                    ...value.config,
                                    layout: nextValue,
                                },
                            })
                        }
                    >
                        <SelectTrigger
                            id={`${idPrefix}-button-layout`}
                            className="w-full"
                        >
                            <SelectValue placeholder="Choose layout" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="auto">Auto grid</SelectItem>
                            <SelectItem value="stack">Stacked</SelectItem>
                            <SelectItem value="inline">Inline wrap</SelectItem>
                        </SelectContent>
                    </Select>
                    <InputError message={errors['config_json.layout']} />
                </div>

                <div className="grid gap-2">
                    <Label htmlFor={`${idPrefix}-button-alignment`}>
                        Alignment
                    </Label>
                    <Select
                        value={alignment}
                        onValueChange={(nextValue) =>
                            onChange({
                                ...value,
                                config: {
                                    ...value.config,
                                    alignment: nextValue,
                                },
                            })
                        }
                    >
                        <SelectTrigger
                            id={`${idPrefix}-button-alignment`}
                            className="w-full"
                        >
                            <SelectValue placeholder="Choose alignment" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="start">Start</SelectItem>
                            <SelectItem value="center">Center</SelectItem>
                            <SelectItem value="end">End</SelectItem>
                            <SelectItem value="stretch">Stretch</SelectItem>
                        </SelectContent>
                    </Select>
                    <InputError message={errors['config_json.alignment']} />
                </div>
            </div>

            <div className="space-y-4">
                <div className="flex items-center justify-between gap-3">
                    <div>
                        <p className="text-sm font-medium text-foreground">
                            Buttons
                        </p>
                        <p className="text-xs leading-5 text-muted-foreground">
                            Keep action buttons together inside the current
                            container. Create a new container instead when the
                            action set should become its own card.
                        </p>
                    </div>
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() =>
                            updateButtons([...buttons, createDefaultButton()])
                        }
                    >
                        Add button
                    </Button>
                </div>

                <InputError message={errors['data_json.buttons']} />

                {buttons.map((button, index) => (
                    <div
                        key={`button-${index}`}
                        className="space-y-4 rounded-2xl border border-border/70 bg-muted/20 p-4"
                    >
                        <div className="flex items-center justify-between gap-3">
                            <p className="text-sm font-medium text-foreground">
                                Button {index + 1}
                            </p>
                            <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                disabled={buttons.length === 1}
                                onClick={() =>
                                    updateButtons(
                                        buttons.filter(
                                            (_, buttonIndex) =>
                                                buttonIndex !== index,
                                        ),
                                    )
                                }
                            >
                                Remove
                            </Button>
                        </div>

                        <div className="grid gap-4 md:grid-cols-2">
                            <div className="grid gap-2">
                                <Label htmlFor={`${idPrefix}-button-label-${index}`}>
                                    Label
                                </Label>
                                <Input
                                    id={`${idPrefix}-button-label-${index}`}
                                    value={button.label}
                                    onChange={(event) =>
                                        updateButtons(
                                            buttons.map((entry, buttonIndex) =>
                                                buttonIndex === index
                                                    ? {
                                                          ...entry,
                                                          label: event.target.value,
                                                      }
                                                    : entry,
                                            ),
                                        )
                                    }
                                />
                                <InputError
                                    message={
                                        errors[
                                            `data_json.buttons.${index}.label`
                                        ]
                                    }
                                />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor={`${idPrefix}-button-href-${index}`}>
                                    Destination
                                </Label>
                                <Input
                                    id={`${idPrefix}-button-href-${index}`}
                                    value={button.href}
                                    onChange={(event) =>
                                        updateButtons(
                                            buttons.map((entry, buttonIndex) =>
                                                buttonIndex === index
                                                    ? {
                                                          ...entry,
                                                          href: event.target.value,
                                                      }
                                                    : entry,
                                            ),
                                        )
                                    }
                                    placeholder="/pages/about"
                                />
                                <InputError
                                    message={
                                        errors[
                                            `data_json.buttons.${index}.href`
                                        ]
                                    }
                                />
                            </div>
                        </div>

                        <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_auto] md:items-end">
                            <div className="grid gap-2">
                                <Label htmlFor={`${idPrefix}-button-variant-${index}`}>
                                    Style
                                </Label>
                                <Select
                                    value={button.variant}
                                    onValueChange={(nextValue) =>
                                        updateButtons(
                                            buttons.map((entry, buttonIndex) =>
                                                buttonIndex === index
                                                    ? {
                                                          ...entry,
                                                          variant:
                                                              nextValue as ButtonVariant,
                                                      }
                                                    : entry,
                                            ),
                                        )
                                    }
                                >
                                    <SelectTrigger
                                        id={`${idPrefix}-button-variant-${index}`}
                                        className="w-full"
                                    >
                                        <SelectValue placeholder="Choose style" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="default">
                                            Default
                                        </SelectItem>
                                        <SelectItem value="secondary">
                                            Secondary
                                        </SelectItem>
                                        <SelectItem value="outline">
                                            Outline
                                        </SelectItem>
                                        <SelectItem value="ghost">
                                            Ghost
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                                <InputError
                                    message={
                                        errors[
                                            `data_json.buttons.${index}.variant`
                                        ]
                                    }
                                />
                            </div>

                            <label className="flex items-center gap-3 rounded-xl border border-border/70 px-4 py-2 text-sm text-foreground">
                                <Checkbox
                                    checked={button.open_in_new_tab}
                                    onCheckedChange={(checked) =>
                                        updateButtons(
                                            buttons.map((entry, buttonIndex) =>
                                                buttonIndex === index
                                                    ? {
                                                          ...entry,
                                                          open_in_new_tab:
                                                              checked === true,
                                                      }
                                                    : entry,
                                            ),
                                        )
                                    }
                                />
                                Open in new tab
                            </label>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
