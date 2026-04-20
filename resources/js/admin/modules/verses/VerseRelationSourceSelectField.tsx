import InputError from '@/components/input-error';
import { ScriptureAdminSourceLabel } from '@/components/scripture/scripture-admin-source-label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import type { ScriptureRegisteredAdminField } from '@/types';
import type { VerseRelationSourceOption } from './verse-relation-editor-shared';

type Props = {
    field: ScriptureRegisteredAdminField;
    htmlFor: string;
    value: string;
    error?: string;
    labelOverride: string;
    helperTextOverride: string;
    sourceOptions: VerseRelationSourceOption[];
    noneLabel: string;
    placeholder: string;
    onValueChange: (value: string) => void;
    optionLabel: (source: VerseRelationSourceOption) => string;
};

export function VerseRelationSourceSelectField({
    field,
    htmlFor,
    value,
    error,
    labelOverride,
    helperTextOverride,
    sourceOptions,
    noneLabel,
    placeholder,
    onValueChange,
    optionLabel,
}: Props) {
    return (
        <div className="grid gap-2">
            <ScriptureAdminSourceLabel
                field={field}
                htmlFor={htmlFor}
                labelOverride={labelOverride}
                helperTextOverride={helperTextOverride}
                showSchemaMeta={false}
                showValidation={false}
            />
            <Select value={value} onValueChange={onValueChange}>
                <SelectTrigger id={htmlFor}>
                    <SelectValue placeholder={placeholder} />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="__none__">{noneLabel}</SelectItem>
                    {sourceOptions.map((source) => (
                        <SelectItem key={source.id} value={String(source.id)}>
                            {optionLabel(source)}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
            <InputError message={error} />
        </div>
    );
}
