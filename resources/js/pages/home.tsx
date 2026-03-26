import { Head, Link, usePage } from '@inertiajs/react';
import { AuthenticatedUtilityNav } from '@/components/authenticated-utility-nav';
import { Button } from '@/components/ui/button';
import { login, register } from '@/routes';
import { index as scriptureBooksIndex } from '@/routes/scripture/books';

type HomeProps = {
    canRegister: boolean;
    featured_book: {
        title: string;
        description: string | null;
        href: string;
    } | null;
};

export default function Home({ canRegister, featured_book }: HomeProps) {
    const { auth, name } = usePage().props;

    return (
        <>
            <Head title="Home" />

            <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(176,122,30,0.12),transparent_35%),linear-gradient(180deg,#fffaf3_0%,#ffffff_55%,#f6efe2_100%)] text-foreground dark:bg-[radial-gradient(circle_at_top,_rgba(217,119,6,0.16),transparent_28%),linear-gradient(180deg,#120e08_0%,#0f0d0a_55%,#15110c_100%)]">
                <div className="mx-auto flex min-h-screen max-w-6xl flex-col px-6 py-6 lg:px-8">
                    <header className="flex flex-col gap-4 rounded-full border border-border/70 bg-background/80 px-5 py-3 backdrop-blur sm:flex-row sm:items-center sm:justify-between dark:border-white/10 dark:bg-white/5">
                        <div>
                            <p className="text-sm font-semibold tracking-[0.2em] text-muted-foreground uppercase">
                                {name}
                            </p>
                        </div>

                        <nav className="flex flex-wrap items-center gap-2">
                            {auth.user ? (
                                <AuthenticatedUtilityNav showHome={false}>
                                    <Button asChild variant="outline">
                                        <Link href={scriptureBooksIndex()}>
                                            Browse Scripture
                                        </Link>
                                    </Button>
                                </AuthenticatedUtilityNav>
                            ) : (
                                <>
                                    <Button asChild variant="ghost">
                                        <Link href={login()}>Log in</Link>
                                    </Button>

                                    {canRegister && (
                                        <Button asChild variant="outline">
                                            <Link href={register()}>Register</Link>
                                        </Button>
                                    )}
                                </>
                            )}
                        </nav>
                    </header>

                    <main className="grid flex-1 items-center gap-10 py-12 lg:grid-cols-[1.15fr_0.85fr]">
                        <section className="space-y-8">
                            <div className="space-y-5">
                                <p className="text-sm font-medium tracking-[0.24em] text-amber-800 uppercase dark:text-amber-300">
                                    Scripture Reading Platform
                                </p>

                                <div className="space-y-4">
                                    <h1 className="max-w-3xl text-4xl font-semibold tracking-tight text-balance sm:text-5xl lg:text-6xl">
                                        Read scripture in a calm, canonical
                                        flow.
                                    </h1>

                                    <p className="max-w-2xl text-lg leading-8 text-muted-foreground">
                                        The visible app is fully React and
                                        Inertia, while Laravel continues to
                                        handle authentication, sessions, and
                                        protected routes underneath. Start with
                                        the featured book, open a chapter, and
                                        continue into the verse reader.
                                    </p>
                                </div>
                            </div>

                            <div className="flex flex-col gap-3 sm:flex-row">
                                {featured_book ? (
                                    <Button asChild size="lg">
                                        <Link href={featured_book.href}>
                                            Start Reading
                                        </Link>
                                    </Button>
                                ) : (
                                    <Button size="lg" disabled>
                                        Scripture Coming Soon
                                    </Button>
                                )}

                                <Button asChild size="lg" variant="outline">
                                    <Link href={scriptureBooksIndex()}>
                                        Browse Scripture Library
                                    </Link>
                                </Button>

                                {!auth.user && (
                                    <Button asChild size="lg" variant="outline">
                                        <Link href={login()}>Sign In</Link>
                                    </Button>
                                )}
                            </div>

                            <div className="grid gap-4 sm:grid-cols-3">
                                <div className="rounded-3xl border border-border/70 bg-background/85 p-5 shadow-sm dark:border-white/10 dark:bg-white/5">
                                    <p className="text-sm font-semibold text-foreground">
                                        1. Open the book
                                    </p>
                                    <p className="mt-2 text-sm leading-6 text-muted-foreground">
                                        Begin from the featured scripture entry
                                        point on the public homepage.
                                    </p>
                                </div>

                                <div className="rounded-3xl border border-border/70 bg-background/85 p-5 shadow-sm dark:border-white/10 dark:bg-white/5">
                                    <p className="text-sm font-semibold text-foreground">
                                        2. Choose a chapter
                                    </p>
                                    <p className="mt-2 text-sm leading-6 text-muted-foreground">
                                        Move through the canonical hierarchy
                                        without skipping structure.
                                    </p>
                                </div>

                                <div className="rounded-3xl border border-border/70 bg-background/85 p-5 shadow-sm dark:border-white/10 dark:bg-white/5">
                                    <p className="text-sm font-semibold text-foreground">
                                        3. Read the verses
                                    </p>
                                    <p className="mt-2 text-sm leading-6 text-muted-foreground">
                                        Continue into the existing verse reader
                                        and verse detail flow.
                                    </p>
                                </div>
                            </div>
                        </section>

                        <aside className="rounded-[2rem] border border-amber-200/80 bg-white/90 p-7 shadow-[0_24px_80px_-40px_rgba(120,79,21,0.45)] backdrop-blur dark:border-amber-500/20 dark:bg-white/5 dark:shadow-[0_24px_80px_-40px_rgba(0,0,0,0.75)]">
                            <p className="text-sm font-semibold tracking-[0.22em] text-amber-800 uppercase dark:text-amber-300">
                                Featured Scripture
                            </p>

                            {featured_book ? (
                                <div className="mt-5 space-y-5">
                                    <div className="space-y-3">
                                        <h2 className="text-3xl font-semibold tracking-tight">
                                            {featured_book.title}
                                        </h2>

                                        <p className="text-sm leading-7 text-muted-foreground">
                                            {featured_book.description ??
                                                'Begin with the current featured scripture and continue into chapters and verse reading.'}
                                        </p>
                                    </div>

                                    <div className="rounded-2xl bg-amber-50 px-4 py-3 text-sm leading-6 text-amber-950 dark:bg-amber-500/12 dark:text-amber-100">
                                        Public path: Homepage to book to chapter
                                        to verse reader.
                                    </div>

                                    <Button asChild className="w-full">
                                        <Link href={featured_book.href}>
                                            Explore {featured_book.title}
                                        </Link>
                                    </Button>
                                </div>
                            ) : (
                                <div className="mt-5 space-y-4">
                                    <h2 className="text-2xl font-semibold tracking-tight">
                                        Scripture is being prepared
                                    </h2>

                                    <p className="text-sm leading-7 text-muted-foreground">
                                        The public reading path is ready. Once a
                                        book is available, this homepage will
                                        link directly into scripture browsing.
                                    </p>
                                </div>
                            )}
                        </aside>
                    </main>
                </div>
            </div>
        </>
    );
}
