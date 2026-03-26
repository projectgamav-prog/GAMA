import type {
    ScriptureContentBlock,
    ScriptureContentBlockInsertionMode,
    ScriptureEntityRegionMeta,
} from '@/types';

export type BookContextualContentBlockType = 'text' | 'quote';

export type BookDetailsDraft = {
    description: string;
};

export type ContentBlockEditDraft = {
    block_type: BookContextualContentBlockType;
    title: string;
    body: string;
    region: string;
    sort_order: number;
    status: 'draft' | 'published';
};

export type ContentBlockCreateDraft = {
    block_type: BookContextualContentBlockType;
    title: string;
    body: string;
    region: string;
    status: 'published';
    insertion_mode: ScriptureContentBlockInsertionMode;
    relative_block_id: number | null;
};

export type ScriptureBookAdminEditSession =
    | {
          kind: 'entity_details';
          meta: ScriptureEntityRegionMeta;
          updateHref: string;
          fullEditHref: string;
          bookTitle: string;
          bookDescription: string | null;
          values: BookDetailsDraft;
      }
    | {
          kind: 'content_block';
          meta: ScriptureEntityRegionMeta;
          updateHref: string;
          fullEditHref: string;
          bookTitle: string;
          block: ScriptureContentBlock;
          values: ContentBlockEditDraft;
      }
    | {
          kind: 'create_content_block';
          meta: ScriptureEntityRegionMeta;
          storeHref: string;
          fullEditHref: string;
          bookTitle: string;
          allowedBlockTypes: BookContextualContentBlockType[];
          allowedRegions: string[];
          insertionLabel: string;
          values: ContentBlockCreateDraft;
      };

export const DEFAULT_BOOK_CONTEXTUAL_BLOCK_TYPES: BookContextualContentBlockType[] =
    ['text', 'quote'];

export const DEFAULT_BOOK_CONTENT_BLOCK_REGION = 'overview';
