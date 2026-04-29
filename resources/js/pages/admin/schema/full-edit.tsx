import { AdminConsciousFullEditShell } from '@/admin/conscious-full-edit/AdminConsciousFullEditShell';
import type { ConsciousFullEditProps } from '@/admin/conscious-full-edit/types';
import PublicSiteLayout from '@/layouts/public-site-layout';
import type { BreadcrumbItem } from '@/types';

export default function ConsciousSchemaFullEdit(props: ConsciousFullEditProps) {
    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Conscious Admin',
            href: `/admin/schema/${props.schema_family}/${props.entity_type}/${props.entity_id}/full-edit`,
        },
        {
            title: props.label,
            href: `/admin/schema/${props.schema_family}/${props.entity_type}/${props.entity_id}/full-edit`,
        },
    ];

    return (
        <PublicSiteLayout
            title={`Conscious full edit - ${props.label}`}
            breadcrumbs={breadcrumbs}
            contentClassName="max-w-5xl"
        >
            <AdminConsciousFullEditShell {...props} />
        </PublicSiteLayout>
    );
}
