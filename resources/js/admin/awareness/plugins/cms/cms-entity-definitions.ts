import type { AdminEntityDefinition } from '../../registries/AdminEntityRegistry';

export const cmsEntityDefinitions = [
    {
        entityType: 'cms_page',
        schemaFamily: 'cms',
        label: 'CMS Page',
    },
    {
        entityType: 'cms_container',
        schemaFamily: 'cms',
        label: 'CMS Container',
    },
    {
        entityType: 'cms_block',
        schemaFamily: 'cms',
        label: 'CMS Block',
    },
] satisfies readonly AdminEntityDefinition[];
