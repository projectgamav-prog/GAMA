import InputError from '@/components/input-error';
import { ScriptureAdminSourceLabel } from '@/components/scripture/scripture-admin-source-label';
import { Input } from '@/components/ui/input';
import type { ScriptureRegisteredAdminField } from '@/types';

type Props = {
    mediaUrlField?: ScriptureRegisteredAdminField | null;
    mediaUrlHtmlFor: string;
    mediaUrlValue: string;
    onMediaUrlChange: (value: string) => void;
    mediaUrlError?: string;
    altTextField?: ScriptureRegisteredAdminField | null;
    altTextHtmlFor: string;
    altTextValue: string;
    onAltTextChange: (value: string) => void;
    altTextError?: string;
};

export function ContentBlockImageFields({
    mediaUrlField,
    mediaUrlHtmlFor,
    mediaUrlValue,
    onMediaUrlChange,
    mediaUrlError,
    altTextField,
    altTextHtmlFor,
    altTextValue,
    onAltTextChange,
    altTextError,
}: Props) {
    return (
        <>
            {mediaUrlField && (
                <div className="grid gap-2">
                    <ScriptureAdminSourceLabel
                        field={mediaUrlField}
                        htmlFor={mediaUrlHtmlFor}
                    />
                    <Input
                        id={mediaUrlHtmlFor}
                        value={mediaUrlValue}
                        onChange={(event) => onMediaUrlChange(event.target.value)}
                        placeholder="https://example.test/image.jpg"
                    />
                    <InputError message={mediaUrlError} />
                </div>
            )}

            {altTextField && (
                <div className="grid gap-2">
                    <ScriptureAdminSourceLabel
                        field={altTextField}
                        htmlFor={altTextHtmlFor}
                    />
                    <Input
                        id={altTextHtmlFor}
                        value={altTextValue}
                        onChange={(event) => onAltTextChange(event.target.value)}
                        placeholder="Helpful description for the image"
                    />
                    <InputError message={altTextError} />
                </div>
            )}
        </>
    );
}
