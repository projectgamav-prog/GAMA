import InputError from '@/components/input-error';
import { ScriptureAdminSourceLabel } from '@/components/scripture/scripture-admin-source-label';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { scriptureAdminStartCase } from '@/lib/scripture-admin-field-display';
import type { ScriptureRegisteredAdminField } from '@/types';

type Props = {
    sortOrderField: ScriptureRegisteredAdminField;
    sortOrderHtmlFor: string;
    sortOrderValue: string;
    onSortOrderChange: (value: string) => void;
    sortOrderError?: string;
    statusField: ScriptureRegisteredAdminField;
    statusHtmlFor: string;
    statusValue: 'draft' | 'published';
    onStatusChange: (value: 'draft' | 'published') => void;
    statusError?: string;
};

export function ContentBlockMetaFields({
    sortOrderField,
    sortOrderHtmlFor,
    sortOrderValue,
    onSortOrderChange,
    sortOrderError,
    statusField,
    statusHtmlFor,
    statusValue,
    onStatusChange,
    statusError,
}: Props) {
    return (
        <div className="grid gap-4 md:grid-cols-2">
            <div className="grid gap-2">
                <ScriptureAdminSourceLabel
                    field={sortOrderField}
                    htmlFor={sortOrderHtmlFor}
                />
                <Input
                    id={sortOrderHtmlFor}
                    type="number"
                    min={0}
                    value={sortOrderValue}
                    onChange={(event) => onSortOrderChange(event.target.value)}
                />
                <InputError message={sortOrderError} />
            </div>

            <div className="grid gap-2">
                <ScriptureAdminSourceLabel
                    field={statusField}
                    htmlFor={statusHtmlFor}
                />
                <Select value={statusValue} onValueChange={onStatusChange}>
                    <SelectTrigger id={statusHtmlFor} className="w-full">
                        <SelectValue placeholder="Choose status" />
                    </SelectTrigger>
                    <SelectContent>
                        {(statusField.options ?? []).map((option) => (
                            <SelectItem key={option} value={option}>
                                {scriptureAdminStartCase(option)}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                <InputError message={statusError} />
            </div>
        </div>
    );
}
