import type { InertiaLinkProps } from '@inertiajs/react';
import type { LucideIcon } from 'lucide-react';

export type BreadcrumbItem = {
    title: string;
    href: NonNullable<InertiaLinkProps['href']>;
};

export type NavItem = {
    title: string;
    href: NonNullable<InertiaLinkProps['href']>;
    icon?: LucideIcon | null;
    isActive?: boolean;
};

export type LinkTargetType = 'url' | 'cms_page' | 'route' | 'scripture';

export type RouteTargetKey =
    | 'home'
    | 'scripture.books.index'
    | 'scripture.dictionary.index'
    | 'scripture.topics.index'
    | 'scripture.characters.index';

export type ScriptureTargetKind =
    | 'book'
    | 'chapter'
    | 'verse'
    | 'dictionary_entry'
    | 'topic'
    | 'character';

export type LinkTarget =
    | {
          type: 'url';
          value: {
              url: string | null;
          };
          behavior?: {
              new_tab?: boolean;
          };
      }
    | {
          type: 'cms_page';
          value: {
              slug: string | null;
          };
          behavior?: {
              new_tab?: boolean;
          };
      }
    | {
          type: 'route';
          value: {
              key: RouteTargetKey | null;
          };
          behavior?: {
              new_tab?: boolean;
          };
      }
    | {
          type: 'scripture';
          value: {
              kind: ScriptureTargetKind | null;
              book_slug?: string | null;
              book_section_slug?: string | null;
              chapter_slug?: string | null;
              chapter_section_slug?: string | null;
              verse_slug?: string | null;
              entry_slug?: string | null;
          };
          behavior?: {
              new_tab?: boolean;
          };
      };

export type SiteNavigationItem = {
    id: number;
    menu_key: string;
    label: string;
    target: LinkTarget | null;
    href: string | null;
    children: SiteNavigationItem[];
    sort_order: number;
};

export type SiteNavigationWorkspaceItem = SiteNavigationItem & {
    update_href: string;
    destroy_href: string;
    move_up_href: string;
    move_down_href: string;
    children: SiteNavigationWorkspaceItem[];
};

export type SiteNavigationAuthoring = {
    menu_key: string;
    store_href: string;
    items: SiteNavigationWorkspaceItem[];
    target_options: SharedLinkTargetOptions;
};

export type SiteNavigationSharedProps = {
    header: SiteNavigationItem[];
    footer: SiteNavigationItem[];
    headerAdmin: SiteNavigationAuthoring | null;
};

export type SharedLinkTargetOptions = {
    route_options: Record<RouteTargetKey, string>;
    scripture_target_kinds: Record<ScriptureTargetKind, string>;
    cms_pages: Array<{
        slug: string;
        title: string;
    }>;
    books: Array<{
        slug: string;
        title: string;
    }>;
    dictionary_entries: Array<{
        slug: string;
        title: string;
    }>;
    topics: Array<{
        slug: string;
        title: string;
    }>;
    characters: Array<{
        slug: string;
        title: string;
    }>;
};

export type SiteNavigationTargetOptions = SharedLinkTargetOptions;

export type SiteNavigationWorkspaceProps = {
    menus: Array<{
        menu_key: string;
        label: string;
        description: string;
        workspace: {
            store_href: string;
        };
        items: SiteNavigationWorkspaceItem[];
    }>;
    target_options: SharedLinkTargetOptions;
};
