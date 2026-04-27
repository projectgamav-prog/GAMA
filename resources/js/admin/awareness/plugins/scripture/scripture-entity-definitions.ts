import type { AdminEntityDefinition } from '../../registries/AdminEntityRegistry';

export const scriptureEntityDefinitions = [
    {
        entityType: 'book',
        schemaFamily: 'scripture',
        label: 'Book',
    },
    {
        entityType: 'book_section',
        schemaFamily: 'scripture',
        label: 'Book Section',
    },
    {
        entityType: 'chapter',
        schemaFamily: 'scripture',
        label: 'Chapter',
    },
    {
        entityType: 'chapter_section',
        schemaFamily: 'scripture',
        label: 'Chapter Section',
    },
    {
        entityType: 'verse',
        schemaFamily: 'scripture',
        label: 'Verse',
    },
    {
        entityType: 'content_block',
        schemaFamily: 'scripture',
        label: 'Content Block',
    },
] satisfies readonly AdminEntityDefinition[];
