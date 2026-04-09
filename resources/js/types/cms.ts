import type { PublicContentBlock } from './content-blocks';

export type CmsPageStatus = 'draft' | 'published';

export type CmsPageSummary = {
    id: number;
    title: string;
    slug: string;
    status: CmsPageStatus;
    layout_key: string | null;
    workspace_href: string;
    public_href: string;
    content_block_count: number;
    published_content_block_count: number;
};

export type CmsPage = CmsPageSummary & {
    created_at: string | null;
    updated_at: string | null;
};

export type CmsPublicPage = {
    id: number;
    title: string;
    slug: string;
    layout_key: string | null;
};

export type CmsPagesIndexProps = {
    pages: CmsPageSummary[];
    page_count: number;
    published_page_count: number;
};

export type CmsPageShowProps = {
    page: CmsPage;
    content_blocks: PublicContentBlock[];
};

export type CmsPublicPageShowProps = {
    page: CmsPublicPage;
    content_blocks: PublicContentBlock[];
};
