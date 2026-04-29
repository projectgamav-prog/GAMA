import type { ReactNode } from 'react';
import { AdminSchemaFieldDisplay } from '@/admin/core/AdminSchemaFieldDisplay';
import {
    assertSchemaFieldSurfaceCoverage,
    createSchemaFieldDisplayDescriptor,
    isStoredSchemaDisplay,
} from '@/admin/schema/fields';
import type {
    ScriptureBook,
    ScriptureBookAdmin,
    ScriptureBookSection,
    ScriptureChapter,
    ScriptureChapterAdmin,
    ScriptureChapterSection,
} from '@/types';

type FieldDisplayProps = {
    children: ReactNode;
    className?: string;
};

type SectionTitleDisplayProps = FieldDisplayProps & {
    renderedTitle?: string | null;
    isComputedDisplay?: boolean;
};

const displaysStoredSchemaValue = ({
    entityType,
    fieldName,
    storedValue,
    renderedValue,
    isComputedDisplay = false,
}: {
    entityType: 'book_section' | 'chapter_section';
    fieldName: 'title';
    storedValue: string | null | undefined;
    renderedValue?: string | null;
    isComputedDisplay?: boolean;
}): boolean => {
    const descriptor = createSchemaFieldDisplayDescriptor({
        schemaFamily: 'scripture',
        entityType,
        fieldName,
        storedValue: storedValue ?? null,
        displayValue: renderedValue ?? storedValue ?? null,
        displayKind: isComputedDisplay
            ? 'computed_schema_display'
            : 'stored_schema_value',
        reason: isComputedDisplay
            ? 'Rendered section heading is computed or presentational.'
            : null,
    });

    assertSchemaFieldSurfaceCoverage(descriptor);

    return isStoredSchemaDisplay(descriptor);
};

export function ScriptureBookTitleDisplay({
    book,
    admin = null,
    showAdminControls,
    children,
    className,
}: FieldDisplayProps & {
    book: Pick<ScriptureBook, 'id' | 'slug' | 'number' | 'title'>;
    admin?: Partial<
        Pick<
            ScriptureBookAdmin,
            'identity_update_href' | 'details_update_href' | 'full_edit_href'
        >
    > | null;
    showAdminControls: boolean;
}) {
    return (
        <AdminSchemaFieldDisplay
            entityType="book"
            entityId={book.id}
            fieldName="title"
            value={book.title}
            displayValue={book.title}
            updateHref={
                showAdminControls
                    ? (admin?.identity_update_href ??
                      admin?.details_update_href ??
                      null)
                    : null
            }
            enableConsciousQuickEdit={showAdminControls}
            fullEditHref={admin?.full_edit_href ?? null}
            hiddenPayloadFields={[
                { name: 'slug', value: book.slug },
                { name: 'number', value: book.number ?? '' },
            ]}
            className={className}
        >
            {children}
        </AdminSchemaFieldDisplay>
    );
}

export function ScriptureBookDescriptionDisplay({
    book,
    admin = null,
    showAdminControls,
    children,
    className,
}: FieldDisplayProps & {
    book: Pick<ScriptureBook, 'id' | 'description'>;
    admin?: Pick<ScriptureBookAdmin, 'details_update_href' | 'full_edit_href'> | null;
    showAdminControls: boolean;
}) {
    return (
        <AdminSchemaFieldDisplay
            entityType="book"
            entityId={book.id}
            fieldName="description"
            value={book.description ?? ''}
            displayValue={book.description ?? ''}
            updateHref={showAdminControls ? admin?.details_update_href : null}
            enableConsciousQuickEdit={showAdminControls}
            fullEditHref={admin?.full_edit_href ?? null}
            className={className}
        >
            {children}
        </AdminSchemaFieldDisplay>
    );
}

export function ScriptureChapterTitleDisplay({
    chapter,
    admin = null,
    showAdminControls,
    children,
    className,
}: FieldDisplayProps & {
    chapter: Pick<ScriptureChapter, 'id' | 'slug' | 'number' | 'title'>;
    admin?: Pick<ScriptureChapterAdmin, 'identity_update_href' | 'full_edit_href'> | null;
    showAdminControls: boolean;
}) {
    return (
        <AdminSchemaFieldDisplay
            entityType="chapter"
            entityId={chapter.id}
            fieldName="title"
            value={chapter.title ?? ''}
            displayValue={chapter.title ?? ''}
            updateHref={showAdminControls ? admin?.identity_update_href : null}
            enableConsciousQuickEdit={showAdminControls}
            fullEditHref={admin?.full_edit_href ?? null}
            hiddenPayloadFields={[
                { name: 'slug', value: chapter.slug },
                { name: 'number', value: chapter.number ?? '' },
            ]}
            className={className}
        >
            {children}
        </AdminSchemaFieldDisplay>
    );
}

export function ScriptureBookSectionTitleDisplay({
    section,
    renderedTitle,
    isComputedDisplay = false,
    children,
    className,
}: SectionTitleDisplayProps & {
    section: Pick<ScriptureBookSection, 'id' | 'number' | 'title' | 'admin'>;
}) {
    if (
        !displaysStoredSchemaValue({
            entityType: 'book_section',
            fieldName: 'title',
            storedValue: section.title,
            renderedValue: renderedTitle,
            isComputedDisplay,
        })
    ) {
        return <>{children}</>;
    }

    return (
        <AdminSchemaFieldDisplay
            entityType="book_section"
            entityId={section.id}
            fieldName="title"
            value={section.title ?? ''}
            displayValue={section.title ?? ''}
            updateHref={section.admin?.details_update_href ?? null}
            enableConsciousQuickEdit={Boolean(section.admin)}
            hiddenPayloadFields={[
                { name: 'number', value: section.number ?? '' },
            ]}
            className={className}
        >
            {children}
        </AdminSchemaFieldDisplay>
    );
}

export function ScriptureChapterSectionTitleDisplay({
    section,
    renderedTitle,
    isComputedDisplay = false,
    children,
    className,
}: SectionTitleDisplayProps & {
    section: Pick<ScriptureChapterSection, 'id' | 'number' | 'title' | 'admin'>;
}) {
    if (
        !displaysStoredSchemaValue({
            entityType: 'chapter_section',
            fieldName: 'title',
            storedValue: section.title,
            renderedValue: renderedTitle,
            isComputedDisplay,
        })
    ) {
        return <>{children}</>;
    }

    return (
        <AdminSchemaFieldDisplay
            entityType="chapter_section"
            entityId={section.id}
            fieldName="title"
            value={section.title ?? ''}
            displayValue={section.title ?? ''}
            updateHref={section.admin?.details_update_href ?? null}
            enableConsciousQuickEdit={Boolean(section.admin)}
            hiddenPayloadFields={[
                { name: 'number', value: section.number ?? '' },
            ]}
            className={className}
        >
            {children}
        </AdminSchemaFieldDisplay>
    );
}
