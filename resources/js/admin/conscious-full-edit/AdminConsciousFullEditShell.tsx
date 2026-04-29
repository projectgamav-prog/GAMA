import { Link } from '@inertiajs/react';
import { ArrowLeft, ShieldAlert } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AdminConsciousFullEditSection } from './AdminConsciousFullEditSection';
import type {
    ConsciousFullEditField,
    ConsciousFullEditProps,
} from './types';

const CATEGORY_ORDER = [
    'Basic Content',
    'Canonical Identity',
    'Structure & Parentage',
    'Ordering',
    'Publishing / Visibility',
    'Media',
    'Relations',
    'Support Data',
    'Advanced / Technical',
];

function groupFields(
    fields: readonly ConsciousFullEditField[],
): [string, ConsciousFullEditField[]][] {
    const grouped = new Map<string, ConsciousFullEditField[]>();

    fields.forEach((field) => {
        const group = grouped.get(field.category) ?? [];
        group.push(field);
        grouped.set(field.category, group);
    });

    return [...grouped.entries()].sort(([a], [b]) => {
        const aIndex = CATEGORY_ORDER.indexOf(a);
        const bIndex = CATEGORY_ORDER.indexOf(b);

        if (aIndex === -1 && bIndex === -1) {
            return a.localeCompare(b);
        }

        if (aIndex === -1) {
            return 1;
        }

        if (bIndex === -1) {
            return -1;
        }

        return aIndex - bIndex;
    });
}

export function AdminConsciousFullEditShell({
    schema_family,
    entity_type,
    entity_id,
    label,
    description,
    public_href,
    fields,
}: ConsciousFullEditProps) {
    const groupedFields = groupFields(fields);

    return (
        <div className="space-y-6">
            <header className="chronicle-paper-panel px-5 py-5">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div className="max-w-3xl">
                        <p className="chronicle-kicker">
                            Conscious Admin Full Edit
                        </p>
                        <h1 className="mt-2 font-serif text-3xl text-[color:var(--chronicle-ink)] sm:text-4xl">
                            {label}
                        </h1>
                        {description && (
                            <p className="mt-3 text-sm leading-6 text-[color:var(--chronicle-brown)]">
                                {description}
                            </p>
                        )}
                        <p className="mt-3 text-xs tracking-wide text-[color:var(--chronicle-brown)]">
                            {schema_family}.{entity_type} #{entity_id}
                        </p>
                    </div>

                    <div className="flex flex-wrap gap-2">
                        {public_href && (
                            <Button asChild variant="outline" size="sm">
                                <Link href={public_href}>
                                    <ArrowLeft
                                        className="size-3.5"
                                        aria-hidden="true"
                                    />
                                    Public page
                                </Link>
                            </Button>
                        )}
                    </div>
                </div>
            </header>

            <div className="chronicle-paper-panel border-[color:var(--chronicle-gold)] px-5 py-4">
                <div className="flex gap-3">
                    <ShieldAlert
                        className="mt-0.5 size-5 shrink-0 text-[color:var(--chronicle-gold-strong)]"
                        aria-hidden="true"
                    />
                    <div>
                        <h2 className="font-serif text-lg text-[color:var(--chronicle-ink)]">
                            Protected canonical fields are visible, not casually
                            editable.
                        </h2>
                        <p className="mt-1 text-sm leading-6 text-[color:var(--chronicle-brown)]">
                            Quick edit remains for safe single fields. This
                            workspace shows the whole schema-aware record and
                            keeps slug, number, parentage, ordering, and
                            structural metadata separated.
                        </p>
                    </div>
                </div>
            </div>

            {groupedFields.length > 0 ? (
                groupedFields.map(([category, categoryFields]) => (
                    <AdminConsciousFullEditSection
                        key={category}
                        title={category}
                        fields={categoryFields}
                    />
                ))
            ) : (
                <div className="chronicle-paper-panel px-5 py-8">
                    <h2 className="font-serif text-2xl text-[color:var(--chronicle-ink)]">
                        No schema field module yet
                    </h2>
                    <p className="mt-2 text-sm leading-6 text-[color:var(--chronicle-brown)]">
                        This entity has reached the Conscious Full Edit shell,
                        but no schema-aware fields have been registered for this
                        entity type yet.
                    </p>
                </div>
            )}
        </div>
    );
}
