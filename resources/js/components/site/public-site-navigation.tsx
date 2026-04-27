import { Link, router, useForm } from '@inertiajs/react';
import {
    Check,
    ChevronDown,
    ChevronLeft,
    ChevronRight,
    ChevronUp,
    Link2,
    Menu,
    Pencil,
    Plus,
    Trash2,
    X,
} from 'lucide-react';
import { useMemo, useState } from 'react';
import type { ComponentProps } from 'react';
import { LinkTargetFields } from '@/components/navigation/link-target-fields';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from '@/components/ui/sheet';
import { useVisibleAdminControls } from '@/hooks/use-admin-context';
import { createSuggestedLinkTarget } from '@/lib/link-targets';
import { cn } from '@/lib/utils';
import type {
    LinkTarget,
    LinkTargetType,
    SiteNavigationAuthoring,
    SiteNavigationItem,
    SiteNavigationTargetOptions,
    SiteNavigationWorkspaceItem,
} from '@/types';

type Props = {
    items: SiteNavigationItem[];
    currentUrl: string;
    authoring?: SiteNavigationAuthoring | null;
};

type ListPlacement = 'root' | 'submenu';

export function PublicSiteNavigation({
    items,
    currentUrl,
    authoring = null,
}: Props) {
    const showAdminControls = useVisibleAdminControls();

    return (
        <>
            <div className="hidden lg:block">
                {showAdminControls && authoring ? (
                    <DesktopNavigationAuthoring
                        currentUrl={currentUrl}
                        authoring={authoring}
                    />
                ) : (
                    <DesktopNavigation items={items} currentUrl={currentUrl} />
                )}
            </div>
            <div className="lg:hidden">
                <MobileNavigation items={items} currentUrl={currentUrl} />
            </div>
        </>
    );
}

function DesktopNavigation({ items, currentUrl }: Omit<Props, 'authoring'>) {
    return (
        <nav className="flex flex-wrap items-center gap-6">
            {items.map((item) => (
                <DesktopNavigationItem
                    key={item.id}
                    item={item}
                    currentUrl={currentUrl}
                />
            ))}
        </nav>
    );
}

function DesktopNavigationItem({
    item,
    currentUrl,
}: {
    item: SiteNavigationItem;
    currentUrl: string;
}) {
    const active = isNavigationItemActive(item, currentUrl);
    const [open, setOpen] = useState(false);

    if (item.children.length === 0) {
        return (
            <Button
                asChild
                size="sm"
                variant={active ? 'default' : 'ghost'}
                className={cn(
                    'h-8 rounded-none border-b-2 bg-transparent px-1 font-serif text-xs tracking-[0.12em] text-[color:var(--chronicle-ink)] uppercase shadow-none hover:bg-transparent hover:text-[color:var(--chronicle-brown)]',
                    active
                        ? 'border-[color:var(--chronicle-gold)]'
                        : 'border-transparent',
                )}
            >
                <Link href={item.href ?? '#'}>{item.label}</Link>
            </Button>
        );
    }

    return (
        <div className="group relative">
            <Button
                type="button"
                size="sm"
                variant={active ? 'default' : 'ghost'}
                className={cn(
                    'h-8 rounded-none border-b-2 bg-transparent px-1 font-serif text-xs tracking-[0.12em] text-[color:var(--chronicle-ink)] uppercase shadow-none hover:bg-transparent hover:text-[color:var(--chronicle-brown)]',
                    active
                        ? 'border-[color:var(--chronicle-gold)]'
                        : 'border-transparent',
                )}
                data-site-nav-trigger={`desktop-${item.id}`}
                onClick={() => setOpen((current) => !current)}
            >
                {item.label}
            </Button>

            {open && (
                <div
                    className="chronicle-paper absolute left-0 z-40 mt-2 min-w-60 rounded-sm p-2"
                    data-site-nav-dropdown={item.id}
                >
                    {item.href && (
                        <>
                            <Link
                                href={item.href}
                                className="block rounded-sm px-3 py-2 text-sm hover:bg-[rgba(173,122,44,0.1)]"
                            >
                                Open {item.label}
                            </Link>
                            <div className="my-1 border-t border-border/60" />
                        </>
                    )}

                    <div className="space-y-1">
                        {item.children.map((child) => (
                            <DesktopDropdownChild key={child.id} item={child} />
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

function DesktopDropdownChild({ item }: { item: SiteNavigationItem }) {
    const [open, setOpen] = useState(false);

    if (item.children.length === 0) {
        return (
            <Link
                href={item.href ?? '#'}
                className="block rounded-sm px-3 py-2 text-sm hover:bg-[rgba(173,122,44,0.1)]"
            >
                {item.label}
            </Link>
        );
    }

    return (
        <div className="group relative">
            <button
                type="button"
                className="flex w-full cursor-pointer items-center justify-between rounded-sm px-3 py-2 text-sm hover:bg-[rgba(173,122,44,0.1)]"
                onClick={() => setOpen((current) => !current)}
            >
                <span>{item.label}</span>
                <ChevronRight className="size-4 text-muted-foreground" />
            </button>

            {open && (
                <div
                    className="chronicle-paper absolute top-0 left-full z-40 ml-2 min-w-56 rounded-sm p-2"
                    data-site-nav-submenu={item.id}
                >
                    {item.href && (
                        <>
                            <Link
                                href={item.href}
                                className="block rounded-sm px-3 py-2 text-sm hover:bg-[rgba(173,122,44,0.1)]"
                            >
                                Open {item.label}
                            </Link>
                            <div className="my-1 border-t border-border/60" />
                        </>
                    )}

                    <div className="space-y-1">
                        {item.children.map((child) => (
                            <DesktopDropdownChild key={child.id} item={child} />
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

function DesktopNavigationAuthoring({
    currentUrl,
    authoring,
}: {
    currentUrl: string;
    authoring: SiteNavigationAuthoring;
}) {
    return (
        <nav className="flex items-start gap-3">
            <NavigationListAuthoring
                items={authoring.items}
                currentUrl={currentUrl}
                menuKey={authoring.menu_key}
                storeHref={authoring.store_href}
                targetOptions={authoring.target_options}
                placement="root"
                dataListKey="root"
            />
        </nav>
    );
}

function NavigationListAuthoring({
    items,
    currentUrl,
    menuKey,
    storeHref,
    targetOptions,
    parentId = null,
    placement,
    dataListKey,
    addRequestToken = 0,
}: {
    items: SiteNavigationWorkspaceItem[];
    currentUrl: string;
    menuKey: string;
    storeHref: string;
    targetOptions: SiteNavigationTargetOptions;
    parentId?: number | null;
    placement: ListPlacement;
    dataListKey: string;
    addRequestToken?: number;
}) {
    const [adding, setAdding] = useState(addRequestToken > 0);
    const [draftAutoFocus, setDraftAutoFocus] = useState(addRequestToken > 0);

    return (
        <div
            className={cn(
                placement === 'root'
                    ? 'flex flex-wrap items-start gap-3'
                    : 'space-y-2',
            )}
            data-header-nav-list={dataListKey}
        >
            {items.map((item) => (
                <NavigationItemAuthoring
                    key={item.id}
                    item={item}
                    currentUrl={currentUrl}
                    menuKey={menuKey}
                    storeHref={storeHref}
                    targetOptions={targetOptions}
                    placement={placement}
                    onAddToThisList={() => setAdding(true)}
                />
            ))}

            {adding ? (
                <NavigationDraftRow
                    menuKey={menuKey}
                    storeHref={storeHref}
                    parentId={parentId}
                    targetOptions={targetOptions}
                    placement={placement}
                    autoFocus={draftAutoFocus}
                    onCancel={() => {
                        setAdding(false);
                        setDraftAutoFocus(false);
                    }}
                    onSaved={() => {
                        setAdding(false);
                        setDraftAutoFocus(false);
                    }}
                />
            ) : (
                <CompactHeaderActionButton
                    label={placement === 'root' ? 'Add item' : 'Add list item'}
                    icon={Plus}
                    onClick={() => {
                        setAdding(true);
                        setDraftAutoFocus(true);
                    }}
                    data-header-nav-action={
                        placement === 'root' ? 'add-root-item' : 'add-list-item'
                    }
                    data-header-nav-parent-id={
                        parentId === null ? 'root' : String(parentId)
                    }
                />
            )}
        </div>
    );
}

function NavigationItemAuthoring({
    item,
    currentUrl,
    menuKey,
    storeHref,
    targetOptions,
    placement,
    onAddToThisList,
}: {
    item: SiteNavigationWorkspaceItem;
    currentUrl: string;
    menuKey: string;
    storeHref: string;
    targetOptions: SiteNavigationTargetOptions;
    placement: ListPlacement;
    onAddToThisList: () => void;
}) {
    const active = isNavigationItemActive(item, currentUrl);
    const [editing, setEditing] = useState(false);
    const [showTargetEditor, setShowTargetEditor] = useState(false);
    const [childrenOpen, setChildrenOpen] = useState(false);
    const [childAddToken, setChildAddToken] = useState(0);
    const form = useForm<{
        label: string;
        menu_key: string;
        target: LinkTarget | null;
    }>({
        label: item.label,
        menu_key: item.menu_key,
        target: item.target,
    });
    const errors = form.errors as Record<string, string | undefined>;

    const beginEdit = () => {
        form.clearErrors();
        form.setData({
            label: item.label,
            menu_key: item.menu_key,
            target: item.target,
        });
        setShowTargetEditor(false);
        setEditing(true);
    };

    const saveEdit = () => {
        form.patch(item.update_href, {
            preserveScroll: true,
            onSuccess: () => {
                setEditing(false);
                setShowTargetEditor(false);
            },
        });
    };

    const cancelEdit = () => {
        setEditing(false);
        setShowTargetEditor(false);
        form.clearErrors();
        form.setData({
            label: item.label,
            menu_key: item.menu_key,
            target: item.target,
        });
    };

    const removeItem = () => {
        if (!window.confirm(`Delete navigation item "${item.label}"?`)) {
            return;
        }

        router.delete(item.destroy_href, { preserveScroll: true });
    };

    const childListKey = `children-${item.id}`;

    return (
        <div
            className="relative flex flex-col items-start gap-2"
            data-header-nav-item={item.id}
            data-header-nav-label={item.label}
        >
            <div className="flex flex-wrap items-center gap-1">
                {editing ? (
                    <div className="flex flex-col gap-2 rounded-2xl border border-border/70 bg-background px-3 py-3 shadow-sm">
                        <Input
                            value={form.data.label}
                            onChange={(event) =>
                                form.setData('label', event.target.value)
                            }
                            className="h-9 min-w-48"
                            placeholder="Navigation label"
                            data-header-nav-edit-label={item.id}
                        />

                        <div className="flex flex-wrap items-center gap-2">
                            <CompactHeaderActionButton
                                label={
                                    showTargetEditor
                                        ? 'Hide target'
                                        : 'Edit target'
                                }
                                icon={Link2}
                                onClick={() =>
                                    setShowTargetEditor((current) => !current)
                                }
                                variant="outline"
                                data-header-nav-action="toggle-target"
                                data-header-nav-item-id={String(item.id)}
                            />
                            <CompactHeaderActionButton
                                label="Save"
                                icon={Check}
                                onClick={saveEdit}
                                disabled={form.processing}
                                data-header-nav-action="save-edit"
                                data-header-nav-item-id={String(item.id)}
                            />
                            <CompactHeaderActionButton
                                label="Cancel"
                                icon={X}
                                variant="outline"
                                onClick={cancelEdit}
                                disabled={form.processing}
                                data-header-nav-action="cancel-edit"
                                data-header-nav-item-id={String(item.id)}
                            />
                        </div>

                        {errors.label ? (
                            <p className="text-xs text-destructive">
                                {errors.label}
                            </p>
                        ) : null}

                        {errors.target ? (
                            <p className="text-xs text-destructive">
                                {errors.target}
                            </p>
                        ) : null}

                        {showTargetEditor ? (
                            <NavigationTargetEditor
                                idPrefix={`header-nav-item-${item.id}`}
                                target={form.data.target}
                                onChange={(target) =>
                                    form.setData('target', target)
                                }
                                targetOptions={targetOptions}
                                errors={errors}
                            />
                        ) : null}
                    </div>
                ) : (
                    <NavigationItemLauncher
                        item={item}
                        active={active}
                        onToggleChildren={() =>
                            setChildrenOpen((current) => !current)
                        }
                    />
                )}

                <div className="flex items-center gap-1 rounded-full border border-border/70 bg-background/95 p-1 shadow-sm">
                    <CompactHeaderActionButton
                        label="Edit item"
                        icon={Pencil}
                        variant="ghost"
                        onClick={beginEdit}
                        data-header-nav-action="edit-item"
                        data-header-nav-item-id={String(item.id)}
                    />
                    <CompactHeaderActionButton
                        label="Add child"
                        icon={Plus}
                        variant="ghost"
                        onClick={() => {
                            setChildrenOpen(true);
                            setChildAddToken((current) => current + 1);
                        }}
                        data-header-nav-action="add-child"
                        data-header-nav-item-id={String(item.id)}
                    />
                    <CompactHeaderActionButton
                        label="Add item in this list"
                        icon={Plus}
                        variant="ghost"
                        onClick={onAddToThisList}
                        data-header-nav-action="add-sibling"
                        data-header-nav-item-id={String(item.id)}
                    />
                    <CompactHeaderActionButton
                        label="Move up"
                        icon={ChevronUp}
                        variant="ghost"
                        onClick={() =>
                            router.post(
                                item.move_up_href,
                                {},
                                { preserveScroll: true },
                            )
                        }
                        data-header-nav-action="move-up"
                        data-header-nav-item-id={String(item.id)}
                    />
                    <CompactHeaderActionButton
                        label="Move down"
                        icon={ChevronDown}
                        variant="ghost"
                        onClick={() =>
                            router.post(
                                item.move_down_href,
                                {},
                                { preserveScroll: true },
                            )
                        }
                        data-header-nav-action="move-down"
                        data-header-nav-item-id={String(item.id)}
                    />
                    <CompactHeaderActionButton
                        label="Delete item"
                        icon={Trash2}
                        variant="ghost"
                        onClick={removeItem}
                        data-header-nav-action="delete-item"
                        data-header-nav-item-id={String(item.id)}
                    />
                </div>
            </div>

            {childrenOpen && (
                <div
                    className={cn(
                        'z-40 min-w-72 rounded-2xl border border-border/70 bg-background p-3 shadow-xl',
                        placement === 'root'
                            ? 'absolute top-full left-0 mt-2'
                            : 'absolute top-0 left-full ml-3',
                    )}
                    data-header-nav-children={item.id}
                >
                    {item.href ? (
                        <div className="mb-3 rounded-xl border border-border/60 bg-muted/20 px-3 py-2">
                            <Link
                                href={item.href}
                                className="text-sm font-medium hover:text-primary"
                            >
                                Open {item.label}
                            </Link>
                        </div>
                    ) : null}

                    <NavigationListAuthoring
                        key={`${childListKey}-${childAddToken}`}
                        items={item.children}
                        currentUrl={currentUrl}
                        menuKey={menuKey}
                        storeHref={storeHref}
                        targetOptions={targetOptions}
                        parentId={item.id}
                        placement="submenu"
                        dataListKey={childListKey}
                        addRequestToken={childAddToken}
                    />
                </div>
            )}
        </div>
    );
}

function NavigationItemLauncher({
    item,
    active,
    onToggleChildren,
}: {
    item: SiteNavigationWorkspaceItem;
    active: boolean;
    onToggleChildren: () => void;
}) {
    if (item.children.length === 0) {
        if (item.href) {
            return (
                <Button
                    asChild
                    size="sm"
                    variant={active ? 'default' : 'ghost'}
                    className="h-8 rounded-full px-3"
                >
                    <Link href={item.href}>{item.label}</Link>
                </Button>
            );
        }

        return (
            <Button
                type="button"
                size="sm"
                variant={active ? 'default' : 'ghost'}
                className="h-8 rounded-full px-3"
            >
                {item.label}
            </Button>
        );
    }

    return (
        <Button
            type="button"
            size="sm"
            variant={active ? 'default' : 'ghost'}
            className="h-8 rounded-full px-3"
            onClick={onToggleChildren}
            data-header-nav-toggle-children={item.id}
        >
            {item.label}
            <ChevronDown className="size-4" />
        </Button>
    );
}

function NavigationDraftRow({
    menuKey,
    storeHref,
    parentId,
    targetOptions,
    placement,
    onCancel,
    onSaved,
    autoFocus = false,
}: {
    menuKey: string;
    storeHref: string;
    parentId: number | null;
    targetOptions: SiteNavigationTargetOptions;
    placement: ListPlacement;
    onCancel: () => void;
    onSaved: () => void;
    autoFocus?: boolean;
}) {
    const [showTargetEditor, setShowTargetEditor] = useState(false);
    const form = useForm<{
        menu_key: string;
        parent_id: number | null;
        label: string;
        target: LinkTarget | null;
    }>({
        menu_key: menuKey,
        parent_id: parentId,
        label: '',
        target: null,
    });
    const errors = form.errors as Record<string, string | undefined>;

    const saveDraft = () => {
        form.post(storeHref, {
            preserveScroll: true,
            onSuccess: () => {
                form.reset();
                form.clearErrors();
                setShowTargetEditor(false);
                onSaved();
            },
        });
    };

    return (
        <div
            className={cn(
                'rounded-2xl border border-dashed border-border bg-background/95 p-3 shadow-sm',
                placement === 'root' && 'min-w-60',
            )}
            data-header-nav-draft-parent={
                parentId === null ? 'root' : String(parentId)
            }
        >
            <div className="space-y-2">
                <Input
                    value={form.data.label}
                    onChange={(event) =>
                        form.setData('label', event.target.value)
                    }
                    placeholder="New navigation label"
                    autoFocus={autoFocus}
                    data-header-nav-draft-label={
                        parentId === null ? 'root' : String(parentId)
                    }
                />

                <div className="flex flex-wrap items-center gap-2">
                    <CompactHeaderActionButton
                        label={showTargetEditor ? 'Hide target' : 'Edit target'}
                        icon={Link2}
                        variant="outline"
                        onClick={() =>
                            setShowTargetEditor((current) => !current)
                        }
                        data-header-nav-action="toggle-draft-target"
                        data-header-nav-parent-id={
                            parentId === null ? 'root' : String(parentId)
                        }
                    />
                    <CompactHeaderActionButton
                        label="Save"
                        icon={Check}
                        onClick={saveDraft}
                        disabled={form.processing}
                        data-header-nav-action="save-draft"
                        data-header-nav-parent-id={
                            parentId === null ? 'root' : String(parentId)
                        }
                    />
                    <CompactHeaderActionButton
                        label="Cancel"
                        icon={X}
                        variant="outline"
                        onClick={onCancel}
                        disabled={form.processing}
                        data-header-nav-action="cancel-draft"
                        data-header-nav-parent-id={
                            parentId === null ? 'root' : String(parentId)
                        }
                    />
                </div>

                {errors.label ? (
                    <p className="text-xs text-destructive">{errors.label}</p>
                ) : null}

                {errors.target ? (
                    <p className="text-xs text-destructive">{errors.target}</p>
                ) : null}
            </div>

            {showTargetEditor ? (
                <div className="mt-3">
                    <NavigationTargetEditor
                        idPrefix={`header-nav-draft-${parentId === null ? 'root' : parentId}`}
                        target={form.data.target}
                        onChange={(target) => form.setData('target', target)}
                        targetOptions={targetOptions}
                        errors={errors}
                    />
                </div>
            ) : null}
        </div>
    );
}

function NavigationTargetEditor({
    idPrefix,
    target,
    onChange,
    targetOptions,
    errors,
}: {
    idPrefix: string;
    target: LinkTarget | null;
    onChange: (target: LinkTarget | null) => void;
    targetOptions: SiteNavigationTargetOptions;
    errors: Record<string, string | undefined>;
}) {
    const targetType = target?.type ?? 'none';

    return (
        <div className="space-y-3 rounded-2xl border border-border/70 bg-muted/20 p-3">
            <div className="grid gap-2">
                <p className="text-xs font-semibold tracking-[0.18em] text-muted-foreground uppercase">
                    Link target
                </p>
                <Select
                    value={targetType}
                    onValueChange={(nextValue) =>
                        onChange(
                            nextValue === 'none'
                                ? null
                                : createSuggestedLinkTarget(
                                      nextValue as LinkTargetType,
                                      targetOptions,
                                  ),
                        )
                    }
                >
                    <SelectTrigger className="w-full">
                        <SelectValue placeholder="Choose a target type" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="none">Parent only</SelectItem>
                        <SelectItem value="url">Direct URL</SelectItem>
                        <SelectItem value="cms_page">CMS page</SelectItem>
                        <SelectItem value="route">Internal route</SelectItem>
                        <SelectItem value="scripture">
                            Scripture target
                        </SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {target ? (
                <LinkTargetFields
                    idPrefix={idPrefix}
                    value={target}
                    onChange={onChange}
                    errors={{
                        url: errors['target.value.url'],
                        slug: errors['target.value.slug'],
                        key: errors['target.value.key'],
                        kind: errors['target.value.kind'],
                        book_slug: errors['target.value.book_slug'],
                        book_section_slug:
                            errors['target.value.book_section_slug'],
                        chapter_slug: errors['target.value.chapter_slug'],
                        chapter_section_slug:
                            errors['target.value.chapter_section_slug'],
                        verse_slug: errors['target.value.verse_slug'],
                        entry_slug: errors['target.value.entry_slug'],
                    }}
                    cmsPages={targetOptions.cms_pages}
                    routeOptions={targetOptions.route_options}
                    scriptureTargetKinds={targetOptions.scripture_target_kinds}
                />
            ) : null}
        </div>
    );
}

function CompactHeaderActionButton({
    label,
    icon: Icon,
    onClick,
    variant = 'outline',
    disabled = false,
    ...props
}: ComponentProps<'button'> & {
    label: string;
    icon: typeof Pencil;
    variant?: 'outline' | 'ghost' | 'default';
}) {
    return (
        <Button
            type="button"
            size="icon"
            variant={variant}
            className={cn(
                'size-7 rounded-full',
                variant === 'ghost' && 'shadow-none',
            )}
            onClick={onClick}
            disabled={disabled}
            title={label}
            aria-label={label}
            {...props}
        >
            <Icon className="size-3.5" />
        </Button>
    );
}

function MobileNavigation({ items, currentUrl }: Omit<Props, 'authoring'>) {
    const [open, setOpen] = useState(false);
    const [path, setPath] = useState<SiteNavigationItem[]>([]);
    const panels = useMemo(
        () => [items, ...path.map((item) => item.children)],
        [items, path],
    );
    const depth = path.length;

    const close = () => {
        setOpen(false);
        setPath([]);
    };

    return (
        <Sheet
            open={open}
            onOpenChange={(nextOpen) => {
                setOpen(nextOpen);

                if (!nextOpen) {
                    setPath([]);
                }
            }}
        >
            <SheetTrigger asChild>
                <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    className="chronicle-button-outline h-9 rounded-sm px-3 font-serif text-xs tracking-[0.14em] uppercase"
                    data-site-nav-trigger="mobile"
                >
                    <Menu className="size-4" />
                    Menu
                </Button>
            </SheetTrigger>
            <SheetContent
                side="right"
                className="w-full max-w-sm border-[color:var(--chronicle-border)] bg-[color:var(--chronicle-paper)] p-0 text-[color:var(--chronicle-ink)]"
            >
                <SheetHeader className="border-b border-[color:var(--chronicle-border)] px-5 py-4 text-left">
                    <SheetTitle>Navigation</SheetTitle>
                </SheetHeader>

                <div className="relative h-full overflow-hidden">
                    {panels.map((panelItems, panelIndex) => (
                        <div
                            key={`panel-${panelIndex}`}
                            className={cn(
                                'absolute inset-0 overflow-y-auto bg-[color:var(--chronicle-paper)] px-5 py-5 transition-transform duration-300',
                                panelIndex > 0 &&
                                    'border-l border-[color:var(--chronicle-border)]',
                            )}
                            style={{
                                transform: `translateX(${(panelIndex - depth) * 100}%)`,
                            }}
                            data-site-nav-panel={panelIndex}
                        >
                            {panelIndex > 0 && (
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    className="mb-4 h-8 rounded-sm px-3"
                                    onClick={() =>
                                        setPath((current) =>
                                            current.slice(0, -1),
                                        )
                                    }
                                >
                                    <ChevronLeft className="size-4" />
                                    Back
                                </Button>
                            )}

                            <div className="space-y-2">
                                {panelItems.map((item) => {
                                    const hasChildren =
                                        item.children.length > 0;
                                    const active = isNavigationItemActive(
                                        item,
                                        currentUrl,
                                    );
                                    const canOpen = item.href !== null;

                                    return (
                                        <div
                                            key={item.id}
                                            className="flex items-center gap-2 rounded-sm border border-[color:var(--chronicle-border)] bg-[rgba(255,248,235,0.72)] p-2"
                                            data-site-nav-item={item.id}
                                        >
                                            {canOpen ? (
                                                <Button
                                                    asChild
                                                    variant={
                                                        active
                                                            ? 'default'
                                                            : 'ghost'
                                                    }
                                                    className="min-h-11 flex-1 justify-start rounded-sm px-4 text-left whitespace-normal"
                                                >
                                                    <Link
                                                        href={item.href ?? '#'}
                                                        onClick={() => close()}
                                                    >
                                                        {item.label}
                                                    </Link>
                                                </Button>
                                            ) : (
                                                <Button
                                                    type="button"
                                                    variant={
                                                        active
                                                            ? 'default'
                                                            : 'ghost'
                                                    }
                                                    className="min-h-11 flex-1 justify-start rounded-sm px-4 text-left whitespace-normal"
                                                    onClick={() => {
                                                        if (hasChildren) {
                                                            setPath(
                                                                (current) => [
                                                                    ...current,
                                                                    item,
                                                                ],
                                                            );
                                                        }
                                                    }}
                                                >
                                                    {item.label}
                                                </Button>
                                            )}

                                            {hasChildren && (
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    size="icon"
                                                    className="size-11 rounded-sm"
                                                    onClick={() =>
                                                        setPath((current) => [
                                                            ...current,
                                                            item,
                                                        ])
                                                    }
                                                    data-site-nav-open-children={
                                                        item.id
                                                    }
                                                >
                                                    <ChevronRight className="size-4" />
                                                </Button>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </div>
            </SheetContent>
        </Sheet>
    );
}

function isNavigationItemActive(
    item: SiteNavigationItem,
    currentUrl: string,
): boolean {
    if (item.href && hrefMatchesCurrentUrl(item.href, currentUrl)) {
        return true;
    }

    return item.children.some((child) =>
        isNavigationItemActive(child, currentUrl),
    );
}

function normalizeUrl(value: string): string {
    return value.replace(/#.*$/, '').replace(/\/+$/, '') || '/';
}

function hrefMatchesCurrentUrl(href: string, currentUrl: string): boolean {
    const normalizedHref = normalizeUrl(href);
    const normalizedCurrentUrl = normalizeUrl(currentUrl);

    if (normalizedHref === '/') {
        return normalizedCurrentUrl === '/';
    }

    return (
        normalizedCurrentUrl === normalizedHref ||
        normalizedCurrentUrl.startsWith(`${normalizedHref}/`)
    );
}
