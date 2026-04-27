import { Link, usePage } from '@inertiajs/react';
import { BookOpenText, Mail, Youtube } from 'lucide-react';
import { ChronicleOrnament } from '@/components/site/chronicle-primitives';
import { cn } from '@/lib/utils';
import type { SiteNavigationItem, SiteNavigationSharedProps } from '@/types';

export function PublicSiteFooter() {
    const page = usePage();
    const { siteNavigation } = page.props as typeof page.props & {
        siteNavigation: SiteNavigationSharedProps;
    };
    const footerItems = siteNavigation?.footer ?? [];

    return (
        <footer className="border-t border-[color:var(--chronicle-border)] bg-[rgba(255,248,235,0.52)]">
            <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-4 py-8 sm:px-6 lg:px-8">
                <div className="grid gap-8 lg:grid-cols-[1.1fr_1.2fr_1fr]">
                    <div className="space-y-4">
                        <div className="flex items-center gap-3">
                            <div className="flex size-14 items-center justify-center rounded-full border border-[color:var(--chronicle-rule)] text-[color:var(--chronicle-gold)]">
                                <BookOpenText className="size-7" />
                            </div>
                            <p className="chronicle-title text-2xl leading-none">
                                Scripture
                                <br />
                                Chronicle
                            </p>
                        </div>
                        <p className="max-w-xs text-sm leading-6 text-[color:var(--chronicle-brown)]">
                            A digital library for Scripture study, reflection,
                            and spiritual growth.
                        </p>
                        <div className="flex items-center gap-4 text-[color:var(--chronicle-brown)]">
                            <span className="text-sm font-bold">f</span>
                            <span className="text-sm font-bold">ig</span>
                            <Youtube className="size-4" />
                            <Mail className="size-4" />
                        </div>
                    </div>

                    <div className="grid gap-6 sm:grid-cols-3">
                        {footerItems.map((item) => (
                            <FooterNavigationGroup key={item.id} item={item} />
                        ))}
                    </div>

                    <div className="chronicle-panel flex min-h-36 flex-col items-center justify-center rounded-sm px-6 py-5 text-center">
                        <ChronicleOrnament />
                        <p className="mt-4 text-sm leading-6">
                            "Sanctify them in the truth;
                            <br />
                            your word is truth."
                        </p>
                        <p className="mt-2 text-sm text-[color:var(--chronicle-brown)]">
                            John 17:17
                        </p>
                    </div>
                </div>

                <div className="flex flex-col gap-2 border-t border-[color:var(--chronicle-border)] pt-4 text-xs text-[color:var(--chronicle-brown)] sm:flex-row sm:items-center sm:justify-between">
                    <p>(c) 2025 Scripture Chronicle. All rights reserved.</p>
                    <p>Privacy Policy / Terms of Service</p>
                </div>
            </div>
        </footer>
    );
}

function FooterNavigationGroup({ item }: { item: SiteNavigationItem }) {
    const hasChildren = item.children.length > 0;

    return (
        <section className="space-y-3">
            <div>
                {item.href ? (
                    <Link
                        href={item.href}
                        className="chronicle-kicker hover:text-[color:var(--chronicle-gold)]"
                    >
                        {item.label}
                    </Link>
                ) : (
                    <p className="chronicle-kicker">{item.label}</p>
                )}
            </div>

            {hasChildren ? (
                <div className="flex flex-col gap-2 text-sm text-[color:var(--chronicle-brown)]">
                    {item.children.map((child) => (
                        <FooterNavigationLink key={child.id} item={child} />
                    ))}
                </div>
            ) : !item.href ? (
                <p className="text-sm leading-6 text-[color:var(--chronicle-brown)]">
                    This group is ready for structured links.
                </p>
            ) : null}
        </section>
    );
}

function FooterNavigationLink({ item }: { item: SiteNavigationItem }) {
    if (!item.href) {
        return <p className={cn('text-sm')}>{item.label}</p>;
    }

    return (
        <Link
            href={item.href}
            className="hover:text-[color:var(--chronicle-ink)]"
        >
            {item.label}
        </Link>
    );
}
