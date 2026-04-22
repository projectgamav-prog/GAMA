import InputError from '@/components/input-error';
import { resolveMediaPickerLabel } from '@/components/scripture/media-assignments/MediaPickerDisplay';
import { ScriptureAdminSourceLabel } from '@/components/scripture/scripture-admin-source-label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import type {
    ScriptureAdminMediaSummary,
    ScriptureRegisteredAdminField,
} from '@/types';

type SlotOption = {
    role: string;
    label: string;
};

type Props = {
    mediaField: ScriptureRegisteredAdminField;
    mediaHtmlFor: string;
    mediaValue: string;
    onMediaChange: (value: string) => void;
    mediaError?: string;
    mediaHelpText?: string;
    availableMedia: ScriptureAdminMediaSummary[];
    roleField: ScriptureRegisteredAdminField;
    roleHtmlFor: string;
    roleValue: string;
    onRoleChange: (value: string) => void;
    roleError?: string;
    slotOptions: SlotOption[];
};

export function MediaAssignmentSelectFields({
    mediaField,
    mediaHtmlFor,
    mediaValue,
    onMediaChange,
    mediaError,
    mediaHelpText,
    availableMedia,
    roleField,
    roleHtmlFor,
    roleValue,
    onRoleChange,
    roleError,
    slotOptions,
}: Props) {
    return (
        <div className="grid gap-4 md:grid-cols-2">
            <div className="grid gap-2">
                <ScriptureAdminSourceLabel
                    field={mediaField}
                    htmlFor={mediaHtmlFor}
                />
                <Select value={mediaValue} onValueChange={onMediaChange}>
                    <SelectTrigger id={mediaHtmlFor} className="w-full">
                        <SelectValue placeholder="Choose media" />
                    </SelectTrigger>
                    <SelectContent>
                        {availableMedia.map((media) => (
                            <SelectItem key={media.id} value={String(media.id)}>
                                {resolveMediaPickerLabel(media)}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                {mediaHelpText && (
                    <p className="text-xs leading-5 text-muted-foreground">
                        {mediaHelpText}
                    </p>
                )}
                <InputError message={mediaError} />
            </div>

            <div className="grid gap-2">
                <ScriptureAdminSourceLabel
                    field={roleField}
                    htmlFor={roleHtmlFor}
                />
                <Select value={roleValue} onValueChange={onRoleChange}>
                    <SelectTrigger id={roleHtmlFor} className="w-full">
                        <SelectValue placeholder="Choose slot" />
                    </SelectTrigger>
                    <SelectContent>
                        {slotOptions.map((option) => (
                            <SelectItem key={option.role} value={option.role}>
                                {option.label}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                <InputError message={roleError} />
            </div>
        </div>
    );
}
