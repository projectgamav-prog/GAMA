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
    mediaUrlField?: ScriptureRegisteredAdminField;
    altTextField?: ScriptureRegisteredAdminField;
    regionField: ScriptureRegisteredAdminField;
    sortOrderField: ScriptureRegisteredAdminField;
    statusField: ScriptureRegisteredAdminField;
};

export function CreateChapterContentBlockCard({
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
            defaultRegion="study"
            titleField={titleField}
            bodyField={bodyField}
            mediaUrlField={mediaUrlField}
            altTextField={altTextField}
            regionField={regionField}
            sortOrderField={sortOrderField}
            statusField={statusField}
            createBadgeLabel="Add note block"
            scopeBadgeLabel="Text + Quote + Image"
            createTitle="Create Chapter Block"
            createActionLabel="Add note block"
        />
    );
}

export function ChapterContentBlockEditorCard({
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
            editorTitle={(currentBlock) =>
                currentBlock.title ?? `Chapter note ${currentBlock.id}`
            }
        />
    );
}

export function ProtectedChapterContentBlockCard({
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
