import { AdminSchemaFieldDisplay } from '@/admin/core/AdminSchemaFieldDisplay';
import { cn } from '@/lib/utils';
import type {
    ScriptureReaderVerseAdmin,
    ScriptureVerse,
    ScriptureVerseAdmin,
} from '@/types';

type VerseTextRecord = Pick<ScriptureVerse, 'id' | 'slug' | 'number' | 'text'>;

type Props = {
    verse: VerseTextRecord;
    admin?:
        | Pick<
              ScriptureVerseAdmin | ScriptureReaderVerseAdmin,
              'identity_update_href' | 'full_edit_href'
          >
        | null;
    showAdminControls: boolean;
    className?: string;
    surfaceClassName?: string;
};

export function ScriptureVerseTextDisplay({
    verse,
    admin = null,
    showAdminControls,
    className,
    surfaceClassName,
}: Props) {
    return (
        <AdminSchemaFieldDisplay
            entityType="verse"
            entityId={verse.id}
            fieldName="text"
            value={verse.text}
            displayValue={verse.text}
            updateHref={showAdminControls ? admin?.identity_update_href : null}
            fullEditHref={admin?.full_edit_href ?? null}
            hiddenPayloadFields={[
                {
                    name: 'slug',
                    value: verse.slug,
                },
                {
                    name: 'number',
                    value: verse.number ?? '',
                },
            ]}
            className={surfaceClassName}
        >
            <p className={cn('font-serif text-lg leading-8', className)}>
                {verse.text}
            </p>
        </AdminSchemaFieldDisplay>
    );
}
