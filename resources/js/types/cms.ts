export type CmsPageStatus = 'draft' | 'published';

export type CmsContainerType = 'card' | 'section';

export type CmsInsertionMode = 'start' | 'before' | 'after' | 'end';

export type CmsModuleCategory = 'text' | 'actions' | 'media';

export type CmsModuleKey = 'rich_text' | 'button_group' | 'media';

export type CmsModulePayload = {
    data: Record<string, unknown>;
    config: Record<string, unknown>;
};

export type CmsPageSummary = {
    id: number;
    title: string;
    slug: string;
    status: CmsPageStatus;
    layout_key: string | null;
    workspace_href: string;
    public_href: string;
    container_count: number;
    block_count: number;
};

export type CmsPage = CmsPageSummary & {
    created_at: string | null;
    updated_at: string | null;
    container_store_href: string;
};

export type CmsPublicPage = {
    id: number;
    title: string;
    slug: string;
    layout_key: string | null;
};

export type CmsAdminBlock = {
    id: number;
    module_key: string;
    data_json: Record<string, unknown>;
    config_json: Record<string, unknown>;
    sort_order: number;
    update_href: string;
    destroy_href: string;
};

export type CmsPublicBlock = {
    id: number;
    module_key: string;
    data_json: Record<string, unknown>;
    config_json: Record<string, unknown>;
    sort_order: number;
};

export type CmsAdminContainer = {
    id: number;
    label: string | null;
    container_type: string;
    sort_order: number;
    update_href: string;
    destroy_href: string;
    block_store_href: string;
    blocks: CmsAdminBlock[];
};

export type CmsPublicContainer = {
    id: number;
    label: string | null;
    container_type: string;
    sort_order: number;
    blocks: CmsPublicBlock[];
};

export type CmsPagesIndexProps = {
    pages: CmsPageSummary[];
    page_count: number;
    published_page_count: number;
};

export type CmsPageShowProps = {
    page: CmsPage;
    containers: CmsAdminContainer[];
};

export type CmsPublicPageShowProps = {
    page: CmsPublicPage;
    containers: CmsPublicContainer[];
};
