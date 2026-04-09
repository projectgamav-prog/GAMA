import { Head, Link, usePage } from '@inertiajs/react';
import {
    BookOpenText,
    FileText,
    Home,
    Settings,
    ShieldCheck,
    Sparkles,
} from 'lucide-react';
import Heading from '@/components/heading';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { home } from '@/routes';
import { index as cmsPagesIndex } from '@/routes/cms/pages';
import { edit as appearanceEdit } from '@/routes/appearance';
import { edit as profileEdit } from '@/routes/profile';
import { index as scriptureBooksIndex } from '@/routes/scripture/books';
import { edit as securityEdit } from '@/routes/security';
import type { BreadcrumbItem } from '@/types';

type Props = {
    bookCount: number;
    pageCount: number;
    publishedPageCount: number;
};

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
    },
];

export default function Dashboard({
    bookCount,
    pageCount,
    publishedPageCount,
}: Props) {
    const { auth } = usePage().props;
    const canAccessAdminContext = Boolean(auth.user?.can_access_admin_context);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard" />

            <div className="space-y-8 px-4 py-6 md:px-6">
                <div className="space-y-4">
                    <div className="flex flex-wrap items-center gap-2">
                        <Badge variant="outline">Workspace</Badge>
                        {canAccessAdminContext && (
                            <Badge variant="secondary">
                                Admin context enabled
                            </Badge>
                        )}
                    </div>

                    <Heading
                        title="Dashboard"
                        description="Use this workspace as the utility hub for navigation, settings, and jumping into contextual scripture editing surfaces."
                    />
                </div>

                <div className="grid gap-4 xl:grid-cols-4">
                    <Card>
                        <CardHeader className="gap-3">
                            <CardTitle className="flex items-center gap-2">
                                <BookOpenText className="size-5" />
                                Scripture workspace
                            </CardTitle>
                            <CardDescription>
                                Enter the public scripture flow, then use local
                                admin controls where permitted.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <p className="text-sm leading-6 text-muted-foreground">
                                {bookCount} scripture
                                {bookCount === 1 ? ' book is' : ' books are'} in
                                the current library.
                            </p>
                            <div className="flex flex-wrap gap-2">
                                <Button asChild>
                                    <Link href={scriptureBooksIndex()}>
                                        Browse scripture
                                    </Link>
                                </Button>
                                <Button asChild variant="outline">
                                    <Link href={home()}>
                                        <Home className="size-4" />
                                        Public home
                                    </Link>
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                    {canAccessAdminContext && (
                        <Card>
                            <CardHeader className="gap-3">
                                <CardTitle className="flex items-center gap-2">
                                    <FileText className="size-5" />
                                    CMS pages
                                </CardTitle>
                                <CardDescription>
                                    Create universal pages as CMS records, then
                                    grow them with content blocks.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <p className="text-sm leading-6 text-muted-foreground">
                                    {pageCount} CMS{' '}
                                    {pageCount === 1 ? 'page is' : 'pages are'}{' '}
                                    in the workspace, with{' '}
                                    {publishedPageCount} published for the
                                    public `/pages/{'{slug}'}` path.
                                </p>
                                <div className="flex flex-wrap gap-2">
                                    <Button asChild>
                                        <Link href={cmsPagesIndex()}>
                                            Open page workspace
                                        </Link>
                                    </Button>
                                    <Button asChild variant="outline">
                                        <Link
                                            href={`${cmsPagesIndex().url}#create-page`}
                                        >
                                            Add page
                                        </Link>
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    <Card>
                        <CardHeader className="gap-3">
                            <CardTitle className="flex items-center gap-2">
                                <Settings className="size-5" />
                                Account utilities
                            </CardTitle>
                            <CardDescription>
                                Manage your workspace profile and visual
                                preferences.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            <Button asChild className="w-full justify-start" variant="outline">
                                <Link href={profileEdit()}>Profile settings</Link>
                            </Button>
                            <Button asChild className="w-full justify-start" variant="outline">
                                <Link href={appearanceEdit()}>
                                    Appearance settings
                                </Link>
                            </Button>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="gap-3">
                            <CardTitle className="flex items-center gap-2">
                                <ShieldCheck className="size-5" />
                                Security and editing
                            </CardTitle>
                            <CardDescription>
                                Keep account access healthy and understand how
                                content editing works now.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <Button asChild className="w-full justify-start" variant="outline">
                                <Link href={securityEdit()}>
                                    Security settings
                                </Link>
                            </Button>

                            <div className="rounded-xl border border-border/70 bg-muted/30 px-4 py-4 text-sm leading-6 text-muted-foreground">
                                <p className="font-medium text-foreground">
                                    Contextual editing model
                                </p>
                                <p className="mt-2">
                                    Content editing stays attached to scripture
                                    pages. Use this dashboard as your utility
                                    hub, then open verse pages for block-level
                                    editing.
                                </p>
                                {canAccessAdminContext && (
                                    <div className="mt-3 flex items-center gap-2 text-foreground">
                                        <Sparkles className="size-4" />
                                        <span>
                                            Your account can access admin-context
                                            verse editing.
                                        </span>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}
