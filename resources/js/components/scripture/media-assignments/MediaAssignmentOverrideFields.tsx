import InputError from '@/components/input-error';
import { ScriptureAdminSourceLabel } from '@/components/scripture/scripture-admin-source-label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import type { ScriptureRegisteredAdminField } from '@/types';

type Props = {
    mode?: 'all' | 'title' | 'caption';
    titleField: ScriptureRegisteredAdminField;
    titleHtmlFor: string;
    titleValue: string;
    onTitleChange: (value: string) => void;
    titleError?: string;
    captionField: ScriptureRegisteredAdminField;
    captionHtmlFor: string;
    captionValue: string;
    onCaptionChange: (value: string) => void;
    captionError?: string;
};

export function MediaAssignmentOverrideFields({
    mode = 'all',
    titleField,
    titleHtmlFor,
    titleValue,
    onTitleChange,
    titleError,
    captionField,
    captionHtmlFor,
    captionValue,
    onCaptionChange,
    captionError,
}: Props) {
    return (
        <>
            {(mode === 'all' || mode === 'title') && (
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
            )}

            {(mode === 'all' || mode === 'caption') && (
                <div className="grid gap-2">
                    <ScriptureAdminSourceLabel
                        field={captionField}
                        htmlFor={captionHtmlFor}
                    />
                    <Textarea
                        id={captionHtmlFor}
                        value={captionValue}
                        onChange={(event) => onCaptionChange(event.target.value)}
                        rows={4}
                    />
                    <InputError message={captionError} />
                </div>
            )}
        </>
    );
}
