import {
    CreateScriptureAdminContentBlockCard,
    ProtectedScriptureAdminContentBlockCard,
    ScriptureAdminContentBlockEditorCard,
} from '@/components/scripture/scripture-admin-content-block-cards';
import type {
    ScriptureAdminContentBlock,
    ScriptureProtectedAdminContentBlock,
    ScriptureRegisteredAdminField,
} from '@/types';

type SharedProps = {
    blockTypeField: ScriptureRegisteredAdminField;
    titleField: ScriptureRegisteredAdminField;
    bodyField: ScriptureRegisteredAdminField;
    mediaUrlField?: ScriptureRegisteredAdminField | null;
    altTextField?: ScriptureRegisteredAdminField | null;
    regionField: ScriptureRegisteredAdminField;
    sortOrderField: ScriptureRegisteredAdminField;
    statusField: ScriptureRegisteredAdminField;
};

export function CreateBookContentBlockCard({
    storeHref,
    nextSortOrder,
    blockTypeField,
    titleField,
    bodyField,
    mediaUrlField,
    altTextField,
    regionField,
    sortOrderField,
    statusField,
}: SharedProps & {
    storeHref: string;
    nextSortOrder: number;
}) {
    return (
        <CreateScriptureAdminContentBlockCard
            storeHref={storeHref}
            nextSortOrder={nextSortOrder}
            blockTypeField={blockTypeField}
            titleField={titleField}
            bodyField={bodyField}
            mediaUrlField={mediaUrlField}
            altTextField={altTextField}
            regionField={regionField}
            sortOrderField={sortOrderField}
            statusField={statusField}
            createBadgeLabel="Create block"
            scopeBadgeLabel="Supporting editorial"
            createTitle="Registered Book Content Block"
            createActionLabel="Add content block"
        />
    );
}

export function BookContentBlockEditorCard({
    block,
    blockTypeField,
    titleField,
    bodyField,
    mediaUrlField,
    altTextField,
    regionField,
    sortOrderField,
    statusField,
}: SharedProps & {
    block: ScriptureAdminContentBlock;
}) {
    return (
        <ScriptureAdminContentBlockEditorCard
            block={block}
            blockTypeField={blockTypeField}
            titleField={titleField}
            bodyField={bodyField}
            mediaUrlField={mediaUrlField}
            altTextField={altTextField}
            regionField={regionField}
            sortOrderField={sortOrderField}
            statusField={statusField}
            saveActionLabel="Save block"
        />
    );
}

export function ProtectedContentBlockCard({
    block,
}: {
    block: ScriptureProtectedAdminContentBlock;
}) {
    return (
        <ProtectedScriptureAdminContentBlockCard
            block={block}
            protectedBadgeLabel="Protected"
        />
    );
}
