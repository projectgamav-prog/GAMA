import type {
    UniversalSectionDescriptor,
    UniversalSectionRendererKey,
} from './descriptor-types';
import type {
    UniversalActionPanelContent,
    UniversalCompactListContent,
    UniversalContentBlockItem,
    UniversalContentBlocksContent,
    UniversalIntroTextContent,
    UniversalPaperPanelContent,
    UniversalTemporaryPanelContent,
} from './section-content-types';

type BuildSectionArgs<TContent> = {
    id: string;
    renderer: UniversalSectionRendererKey;
    content: TContent;
    layout?: UniversalSectionDescriptor<TContent>['layout'];
    surface?: UniversalSectionDescriptor<TContent>['surface'];
    children?: UniversalSectionDescriptor[];
};

export function createUniversalSection<TContent>({
    id,
    renderer,
    content,
    layout,
    surface = null,
    children,
}: BuildSectionArgs<TContent>): UniversalSectionDescriptor<TContent> {
    return {
        id,
        renderer,
        content,
        layout,
        surface,
        children,
    };
}

export function createPaperPanelSection(
    args: Omit<BuildSectionArgs<UniversalPaperPanelContent>, 'renderer'>,
) {
    return createUniversalSection({
        ...args,
        renderer: 'paper_panel',
    });
}

export function createCompactListSection(
    args: Omit<BuildSectionArgs<UniversalCompactListContent>, 'renderer'>,
) {
    return createUniversalSection({
        ...args,
        renderer: 'compact_list',
    });
}

export function createActionPanelSection(
    args: Omit<BuildSectionArgs<UniversalActionPanelContent>, 'renderer'>,
) {
    return createUniversalSection({
        ...args,
        renderer: 'action_panel',
    });
}

export function createTemporaryPanelSection(
    args: Omit<BuildSectionArgs<UniversalTemporaryPanelContent>, 'renderer'>,
) {
    return createUniversalSection({
        ...args,
        renderer: 'temporary_panel',
    });
}

export function createSupportRailGroupSection({
    id,
    children,
    layout,
}: {
    id: string;
    children: UniversalSectionDescriptor[];
    layout?: UniversalSectionDescriptor['layout'];
}) {
    return createUniversalSection({
        id,
        renderer: 'support_rail_group',
        content: {},
        layout,
        children,
    });
}

export function createIntroTextSection(
    args: Omit<BuildSectionArgs<UniversalIntroTextContent>, 'renderer'>,
) {
    return createUniversalSection({
        ...args,
        renderer: 'intro_text',
    });
}

export function createContentBlockItemSection(
    args: Omit<BuildSectionArgs<UniversalContentBlockItem>, 'renderer'>,
) {
    return createUniversalSection({
        ...args,
        renderer: 'content_block_item',
    });
}

export function createContentBlocksSection(
    args: Omit<BuildSectionArgs<UniversalContentBlocksContent>, 'renderer'>,
) {
    return createUniversalSection({
        ...args,
        renderer: 'content_blocks',
    });
}
