import InputError from '@/components/input-error';
import { ScriptureAdminSourceLabel } from '@/components/scripture/scripture-admin-source-label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import type { ScriptureRegisteredAdminField } from '@/types';

type Props = {
    titleField: ScriptureRegisteredAdminField;
    titleHtmlFor: string;
    titleValue: string;
    onTitleChange: (value: string) => void;
    titleError?: string;
    bodyField: ScriptureRegisteredAdminField;
    bodyHtmlFor: string;
    bodyValue: string;
    onBodyChange: (value: string) => void;
    bodyError?: string;
};

export function ContentBlockCoreFields({
    titleField,
    titleHtmlFor,
    titleValue,
    onTitleChange,
    titleError,
    bodyField,
    bodyHtmlFor,
    bodyValue,
    onBodyChange,
    bodyError,
}: Props) {
    return (
        <>
            <div className="grid gap-2">
                <ScriptureAdminSourceLabel
                    field={titleField}
                    htmlFor={titleHtmlFor}
                />
                <Input
                    id={titleHtmlFor}
                    value={titleValue}
                    onChange={(event) => onTitleChange(event.target.value)}
                />
                <InputError message={titleError} />
            </div>

            <div className="grid gap-2">
                <ScriptureAdminSourceLabel
                    field={bodyField}
                    htmlFor={bodyHtmlFor}
                />
                <Textarea
                    id={bodyHtmlFor}
                    value={bodyValue}
                    onChange={(event) => onBodyChange(event.target.value)}
                    rows={6}
                />
                <InputError message={bodyError} />
            </div>
        </>
    );
}
