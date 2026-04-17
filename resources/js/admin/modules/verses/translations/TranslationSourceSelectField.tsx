import InputError from '@/components/input-error';
import { ScriptureAdminSourceLabel } from '@/components/scripture/scripture-admin-source-label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import type { VerseTranslationsContractMetadata } from '@/admin/surfaces/core/contract-readers';
import {
    applySourceToForm,
    type TranslationForm,
    getFieldCopy,
    NONE_VALUE,
    selectSourceOptionLabel,
} from './translation-editor-helpers';

type Props = {
    metadata: VerseTranslationsContractMetadata;
    form: TranslationForm;
    htmlFor: string;
};

export function TranslationSourceSelectField({
    metadata,
    form,
    htmlFor,
}: Props) {
    return (
        <div className="grid gap-2">
            <ScriptureAdminSourceLabel
                field={metadata.fields.translation_source_id}
                htmlFor={htmlFor}
                labelOverride={getFieldCopy('translation_source_id').label}
                helperTextOverride={getFieldCopy('translation_source_id').helpText}
                showSchemaMeta={false}
                showValidation={false}
            />
            <Select
                value={form.data.translation_source_id}
                onValueChange={(value) =>
                    applySourceToForm(form, metadata.sourceOptions, value)
                }
            >
                <SelectTrigger id={htmlFor}>
                    <SelectValue placeholder="Choose a source" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value={NONE_VALUE}>
                        Not linked to a saved source
                    </SelectItem>
                    {metadata.sourceOptions.map((source) => (
                        <SelectItem key={source.id} value={String(source.id)}>
                            {selectSourceOptionLabel(source)}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
            <InputError message={form.errors.translation_source_id} />
        </div>
    );
}
