import { AdminConsciousFullEditField } from './AdminConsciousFullEditField';
import type { ConsciousFullEditField } from './types';

type Props = {
    title: string;
    fields: ConsciousFullEditField[];
};

export function AdminConsciousFullEditSection({ title, fields }: Props) {
    return (
        <section
            id={`conscious-section-${title.toLowerCase().replace(/\W+/g, '-')}`}
            className="chronicle-paper-panel overflow-hidden"
        >
            <div className="border-b border-[color:var(--chronicle-border)] px-5 py-4">
                <p className="chronicle-kicker">Schema category</p>
                <h2 className="mt-1 font-serif text-2xl text-[color:var(--chronicle-ink)]">
                    {title}
                </h2>
            </div>
            <div className="px-5">
                {fields.map((field) => (
                    <AdminConsciousFullEditField
                        key={`${field.category}:${field.name}`}
                        field={field}
                    />
                ))}
            </div>
        </section>
    );
}
