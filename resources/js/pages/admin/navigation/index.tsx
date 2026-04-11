import { Head, router, useForm } from '@inertiajs/react';
import { ChevronDown, ChevronUp, Plus, Trash2 } from 'lucide-react';
import { useEffect } from 'react';
import { LinkTargetFields } from '@/components/navigation/link-target-fields';
import Heading from '@/components/heading';
import InputError from '@/components/input-error';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import AppLayout from '@/layouts/app-layout';
import { createSuggestedLinkTarget, createDefaultLinkTarget } from '@/lib/link-targets';
import type {
    BreadcrumbItem,
    LinkTarget,
    LinkTargetType,
    SiteNavigationWorkspaceItem,
    SiteNavigationWorkspaceProps,
} from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Navigation',
        href: '/admin/navigation',
    },
];

export default function SiteNavigationWorkspace({
    menus,
    target_options,
}: SiteNavigationWorkspaceProps) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Navigation" />

            <div className="space-y-8 px-4 py-6 md:px-6">
                <div className="space-y-4">
                    <div className="flex flex-wrap items-center gap-2">
                        <Badge variant="outline">Global navigation</Badge>
                        <Badge variant="secondary">{menus.length} menus</Badge>
                    </div>

                    <Heading
                        title="Site navigation"
                        description="Manage the structured global header and footer menus. Both use the shared link-target contract and stable global shell seams."
                    />
                </div>

                <div className="space-y-8">
                    {menus.map((menu) => (
                        <section
                            key={menu.menu_key}
                            className="space-y-4"
                            data-navigation-menu={menu.menu_key}
                        >
                            <div className="space-y-3">
                                <div className="flex flex-wrap items-center gap-2">
                                    <Badge variant="outline">{menu.label}</Badge>
                                    <Badge variant="secondary">{menu.menu_key}</Badge>
                                </div>

                                <p className="max-w-3xl text-sm leading-7 text-muted-foreground">
                                    {menu.description}
                                </p>
                            </div>

                            <div className="flex flex-wrap gap-3">
                                <Button
                                    type="button"
                                    onClick={() =>
                                        router.post(
                                            menu.workspace.store_href,
                                            {
                                                menu_key: menu.menu_key,
                                                label: 'New item',
                                                target: null,
                                            },
                                            { preserveScroll: true },
                                        )
                                    }
                                >
                                    <Plus className="size-4" />
                                    Add top-level item
                                </Button>
                            </div>

                            <div className="space-y-4">
                                {menu.items.map((item) => (
                                    <NavigationItemEditor
                                        key={item.id}
                                        item={item}
                                        menuKey={menu.menu_key}
                                        storeHref={menu.workspace.store_href}
                                        targetOptions={target_options}
                                    />
                                ))}
                            </div>
                        </section>
                    ))}
                </div>
            </div>
        </AppLayout>
    );
}

function NavigationItemEditor({
    item,
    menuKey,
    storeHref,
    targetOptions,
    depth = 0,
}: {
    item: SiteNavigationWorkspaceItem;
    menuKey: string;
    storeHref: string;
    targetOptions: SiteNavigationWorkspaceProps['target_options'];
    depth?: number;
}) {
    const form = useForm<{
        label: string;
        menu_key: string;
        target: LinkTarget | null;
    }>({
        label: item.label,
        menu_key: item.menu_key,
        target: item.target,
    });
    const formErrors = form.errors as Record<string, string | undefined>;

    useEffect(() => {
        form.setData({
            label: item.label,
            menu_key: item.menu_key,
            target: item.target,
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [item.id, item.label, item.menu_key, item.target]);

    const targetType = form.data.target?.type ?? 'none';

    return (
        <Card className={depth > 0 ? 'border-dashed' : undefined}>
            <CardHeader className="gap-3">
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <CardTitle className="text-base">
                        {depth === 0 ? item.label : `Child: ${item.label}`}
                    </CardTitle>
                    <div className="flex flex-wrap gap-2">
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() =>
                                router.post(
                                    storeHref,
                                    {
                                        menu_key: menuKey,
                                        parent_id: item.id,
                                        label: 'New child',
                                        target: null,
                                    },
                                    { preserveScroll: true },
                                )
                            }
                        >
                            <Plus className="size-4" />
                            Add child
                        </Button>
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() =>
                                router.post(item.move_up_href, {}, { preserveScroll: true })
                            }
                        >
                            <ChevronUp className="size-4" />
                            Up
                        </Button>
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() =>
                                router.post(item.move_down_href, {}, { preserveScroll: true })
                            }
                        >
                            <ChevronDown className="size-4" />
                            Down
                        </Button>
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() =>
                                router.delete(item.destroy_href, {
                                    preserveScroll: true,
                                })
                            }
                        >
                            <Trash2 className="size-4" />
                            Delete
                        </Button>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="space-y-5">
                <div className="grid gap-4 md:grid-cols-2">
                    <div className="grid gap-2">
                        <Label htmlFor={`navigation-item-label-${item.id}`}>
                            Label
                        </Label>
                        <Input
                            id={`navigation-item-label-${item.id}`}
                            value={form.data.label}
                            onChange={(event) =>
                                form.setData('label', event.target.value)
                            }
                        />
                        <InputError message={formErrors.label} />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor={`navigation-item-target-type-${item.id}`}>
                            Target behavior
                        </Label>
                        <Select
                            value={targetType}
                            onValueChange={(nextValue) =>
                                form.setData(
                                    'target',
                                    nextValue === 'none'
                                        ? null
                                        : createSuggestedLinkTarget(
                                              nextValue as LinkTargetType,
                                              targetOptions,
                                          ),
                                )
                            }
                        >
                            <SelectTrigger
                                id={`navigation-item-target-type-${item.id}`}
                                className="w-full"
                            >
                                <SelectValue placeholder="Choose target behavior" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="none">
                                    Parent only
                                </SelectItem>
                                <SelectItem value="url">
                                    Direct URL
                                </SelectItem>
                                <SelectItem value="cms_page">
                                    CMS page
                                </SelectItem>
                                <SelectItem value="route">
                                    Internal route
                                </SelectItem>
                                <SelectItem value="scripture">
                                    Scripture target
                                </SelectItem>
                            </SelectContent>
                        </Select>
                        <InputError message={formErrors.target} />
                    </div>
                </div>

                {form.data.target && (
                    <LinkTargetFields
                        idPrefix={`navigation-item-target-${item.id}`}
                        value={form.data.target}
                        onChange={(target) => form.setData('target', target)}
                        errors={{
                            url: formErrors['target.value.url'],
                            slug: formErrors['target.value.slug'],
                            key: formErrors['target.value.key'],
                            kind: formErrors['target.value.kind'],
                            book_slug: formErrors['target.value.book_slug'],
                            book_section_slug:
                                formErrors['target.value.book_section_slug'],
                            chapter_slug:
                                formErrors['target.value.chapter_slug'],
                            chapter_section_slug:
                                formErrors['target.value.chapter_section_slug'],
                            verse_slug: formErrors['target.value.verse_slug'],
                            entry_slug: formErrors['target.value.entry_slug'],
                        }}
                        cmsPages={targetOptions.cms_pages}
                        routeOptions={targetOptions.route_options}
                        scriptureTargetKinds={
                            targetOptions.scripture_target_kinds
                        }
                    />
                )}

                <div className="flex justify-end">
                    <Button
                        type="button"
                        onClick={() =>
                            form.patch(item.update_href, {
                                preserveScroll: true,
                            })
                        }
                        disabled={form.processing}
                    >
                        Save item
                    </Button>
                </div>

                {item.children.length > 0 && (
                    <div className="space-y-4 border-l border-border/70 pl-4">
                        {(item.children as SiteNavigationWorkspaceItem[]).map((child) => (
                            <NavigationItemEditor
                                key={child.id}
                                item={child}
                                menuKey={menuKey}
                                storeHref={storeHref}
                                targetOptions={targetOptions}
                                depth={depth + 1}
                            />
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
