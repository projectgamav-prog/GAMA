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
import type { ScriptureRegisteredAdminField } from '@/types';

type Props = {
    mode?: 'all' | 'sort' | 'status';
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

export function MediaAssignmentMetaFields({
    mode = 'all',
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
        <>
            {(mode === 'all' || mode === 'sort') && (
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
                        onChange={(event) =>
                            onSortOrderChange(event.target.value)
                        }
                    />
                    <InputError message={sortOrderError} />
                </div>
            )}

            {(mode === 'all' || mode === 'status') && (
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
                                    {option}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <InputError message={statusError} />
                </div>
            )}
        </>
    );
}
