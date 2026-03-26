import { ScriptureAdminSourceLabel } from '@/components/scripture/scripture-admin-source-label';
import type { ScriptureRegisteredAdminField } from '@/types';

type Props = {
    field: ScriptureRegisteredAdminField;
    htmlFor: string;
};

export function BookAdminSourceLabel({ field, htmlFor }: Props) {
    return <ScriptureAdminSourceLabel field={field} htmlFor={htmlFor} />;
}
