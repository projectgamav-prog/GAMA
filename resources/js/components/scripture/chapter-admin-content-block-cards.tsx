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
    titleField: ScriptureRegisteredAdminField;
    bodyField: ScriptureRegisteredAdminField;
    regionField: ScriptureRegisteredAdminField;
    sortOrderField: ScriptureRegisteredAdminField;
    statusField: ScriptureRegisteredAdminField;
};

export function CreateChapterContentBlockCard({
    storeHref,
    nextSortOrder,
    titleField,
    bodyField,
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
            fixedBlockType="text"
            defaultRegion="study"
            titleField={titleField}
            bodyField={bodyField}
            regionField={regionField}
            sortOrderField={sortOrderField}
            statusField={statusField}
            createBadgeLabel="Add note block"
            scopeBadgeLabel="Text only"
            createTitle="Create Chapter Note"
            createActionLabel="Add note block"
        />
    );
}

export function ChapterContentBlockEditorCard({
    block,
    titleField,
    bodyField,
    regionField,
    sortOrderField,
    statusField,
}: SharedProps & {
    block: ScriptureAdminContentBlock;
}) {
    return (
        <ScriptureAdminContentBlockEditorCard
            block={block}
            fixedBlockType="text"
            titleField={titleField}
            bodyField={bodyField}
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
