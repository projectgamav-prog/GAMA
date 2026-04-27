import { AdminFieldQuickEditSurface } from '@/admin/core/AdminFieldQuickEditSurface';
import { resolveVerseTextFieldSurface } from '@/admin/integrations/scripture/verses';
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
    const verseTextSurface = resolveVerseTextFieldSurface({
        verse,
        admin,
        enabled: showAdminControls,
    });

    return (
        <AdminFieldQuickEditSurface
            surface={verseTextSurface}
            className={surfaceClassName}
            manifestKey={`verse-text:${verse.id}`}
            block={{
                blockType: 'text_field',
                contentKind: 'long_text',
                fieldKind: 'text',
            }}
            layout={{
                layoutZone: 'inline_prose',
                visualRole: 'field',
                preferredPlacement: 'top-right',
            }}
            schemaConstraints={{
                quickEditAllowedFields: ['text'],
                structuredOnlyFields: ['slug', 'number'],
            }}
        >
            <p className={cn('font-serif text-lg leading-8', className)}>
                {verse.text}
            </p>
        </AdminFieldQuickEditSurface>
    );
}
