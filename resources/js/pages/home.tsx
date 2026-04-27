import { Link, usePage } from '@inertiajs/react';
import {
    BookMarked,
    BookOpenText,
    ChevronRight,
    Flame,
    Languages,
    MessageSquareText,
    ScrollText,
    Search,
    Sparkles,
} from 'lucide-react';
import { CmsExposedRegion } from '@/admin/cms/components/CmsExposedRegion';
import {
    ChronicleEditorialGrid,
    ChroniclePaperPanel,
    ChronicleSectionHeading,
    ChronicleSideRail,
} from '@/components/site/chronicle-primitives';
import { Button } from '@/components/ui/button';
import PublicSiteLayout from '@/layouts/public-site-layout';
import { buildHomeRailDescriptorModel } from '@/rendering/adapters/home-page-adapter';
import { UniversalSectionStack } from '@/rendering/core';
import { login, register } from '@/routes';
import { index as scriptureBooksIndex } from '@/routes/scripture/books';
import type { CmsExposedRegion as CmsExposedRegionPayload } from '@/types';

type HomeProps = {
    canRegister: boolean;
    featured_book: {
        title: string;
        description: string | null;
        href: string;
    } | null;
    cms_regions: CmsExposedRegionPayload[];
};

const libraryPreviewItems = [
    {
        title: 'Torah',
        count: '5 Books',
        description: 'Genesis to Deuteronomy',
        icon: ScrollText,
    },
    {
        title: 'Psalms',
        count: '1 Book',
        description: 'Songs and prayers',
        icon: Sparkles,
    },
    {
        title: 'Gospels',
        count: '4 Books',
        description: 'Matthew, Mark, Luke, John',
        icon: BookOpenText,
    },
    {
        title: 'Epistles',
        count: '21 Books',
        description: 'Letters to early churches',
        icon: MessageSquareText,
    },
    {
        title: 'Revelation',
        count: '1 Book',
        description: "God's eternal purpose",
        icon: Flame,
    },
];

const studyResources = [
    {
        title: 'Translations',
        description: 'Compare versions in parallel.',
        icon: Languages,
    },
    {
        title: 'Commentaries',
        description: 'Insights from trusted scholars.',
        icon: MessageSquareText,
    },
    {
        title: 'Dictionary',
        description: 'Explore words and meanings.',
        icon: Search,
    },
    {
        title: 'Recitations',
        description: 'Listen, reflect, and memorize.',
        icon: BookMarked,
    },
    {
        title: 'Related Topics',
        description: 'Themes across Scripture.',
        icon: Sparkles,
    },
];

export default function Home({
    canRegister,
    featured_book,
    cms_regions,
}: HomeProps) {
    const { auth } = usePage().props;
    const homePrimaryRegion = cms_regions[0] ?? null;
    const shouldShowHomePrimaryRegion =
        homePrimaryRegion !== null &&
        (homePrimaryRegion.containers.length > 0 ||
            homePrimaryRegion.admin !== null);
    const railModel = buildHomeRailDescriptorModel();

    return (
        <PublicSiteLayout
            title="Home"
            mainClassName="py-5 sm:py-7"
            contentClassName="max-w-6xl"
        >
            <div className="space-y-5">
                <ChronicleEditorialGrid>
                    <div className="space-y-5">
                        <ChroniclePaperPanel
                            variant="feature"
                            className="grid min-h-[23rem] items-center gap-6 p-6 sm:p-8 lg:grid-cols-[0.95fr_1.05fr]"
                        >
                            <div className="space-y-6">
                                <div className="space-y-3">
                                    <p className="chronicle-kicker">
                                        Featured Reading
                                    </p>
                                    <h2 className="chronicle-feature-title max-w-xl">
                                        Blessed Are the Peacemakers
                                    </h2>
                                    <div className="flex items-center gap-3 text-sm text-[color:var(--chronicle-brown)]">
                                        <span className="h-px w-16 bg-[color:var(--chronicle-rule)]" />
                                        <span>Matthew 5:9</span>
                                    </div>
                                </div>

                                <p className="max-w-md text-base leading-7 text-[color:var(--chronicle-ink)]">
                                    They shall be called sons of God. Discover
                                    the heart of Jesus in this teaching on
                                    peace, righteousness, and the Kingdom that
                                    transforms the world.
                                </p>

                                <div className="flex flex-wrap gap-3">
                                    <Button
                                        asChild
                                        className="chronicle-button rounded-sm px-6"
                                    >
                                        <Link
                                            href={
                                                featured_book?.href ??
                                                scriptureBooksIndex()
                                            }
                                        >
                                            Read Chapter
                                            <ChevronRight className="size-4" />
                                        </Link>
                                    </Button>
                                    <Button
                                        asChild
                                        variant="outline"
                                        className="chronicle-button-outline rounded-sm px-6"
                                    >
                                        <Link href={scriptureBooksIndex()}>
                                            View in Context
                                        </Link>
                                    </Button>
                                </div>
                            </div>

                            <div
                                aria-hidden="true"
                                className="min-h-56 rounded-sm border border-[color:var(--chronicle-border)] bg-[radial-gradient(circle_at_72%_24%,rgba(173,122,44,0.28),transparent_0.55rem),radial-gradient(circle_at_44%_72%,rgba(104,69,31,0.18),transparent_0.45rem),radial-gradient(circle_at_70%_70%,rgba(104,69,31,0.12),transparent_5rem),linear-gradient(135deg,rgba(255,248,235,0.25),rgba(173,122,44,0.12))] opacity-90"
                            />
                        </ChroniclePaperPanel>

                        <ChroniclePaperPanel className="space-y-5 p-5">
                            <ChronicleSectionHeading
                                title="Scripture Library"
                                eyebrow="Explore the sacred texts"
                                action={
                                    <Link
                                        href={scriptureBooksIndex()}
                                        className="chronicle-link text-xs"
                                    >
                                        View All
                                    </Link>
                                }
                            />

                            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
                                {libraryPreviewItems.map((item) => {
                                    const Icon = item.icon;

                                    return (
                                        <Link
                                            key={item.title}
                                            href={scriptureBooksIndex()}
                                            className="chronicle-panel flex min-h-40 flex-col items-center justify-between rounded-sm p-4 text-center transition hover:-translate-y-0.5 hover:border-[color:var(--chronicle-gold)]"
                                        >
                                            <Icon className="size-9 text-[color:var(--chronicle-gold)]" />
                                            <div>
                                                <p className="chronicle-title text-2xl leading-tight">
                                                    {item.title}
                                                </p>
                                                <p className="text-sm text-[color:var(--chronicle-brown)]">
                                                    {item.count}
                                                </p>
                                                <p className="mt-2 text-xs leading-5 text-[color:var(--chronicle-ink)]">
                                                    {item.description}
                                                </p>
                                            </div>
                                            <span className="chronicle-link text-[0.65rem]">
                                                Explore
                                            </span>
                                        </Link>
                                    );
                                })}
                            </div>
                        </ChroniclePaperPanel>

                        <ChroniclePaperPanel className="space-y-5 p-5">
                            <ChronicleSectionHeading
                                title="Study Resources"
                                eyebrow="Dig deeper with trusted tools"
                                action={
                                    <Link
                                        href={scriptureBooksIndex()}
                                        className="chronicle-link text-xs"
                                    >
                                        View All
                                    </Link>
                                }
                            />
                            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
                                {studyResources.map((item) => {
                                    const Icon = item.icon;

                                    return (
                                        <div
                                            key={item.title}
                                            className="chronicle-panel rounded-sm p-4 text-center"
                                        >
                                            <Icon className="mx-auto size-8 text-[color:var(--chronicle-gold)]" />
                                            <p className="chronicle-title mt-3 text-xl">
                                                {item.title}
                                            </p>
                                            <p className="mt-1 text-xs leading-5 text-[color:var(--chronicle-ink)]">
                                                {item.description}
                                            </p>
                                        </div>
                                    );
                                })}
                            </div>
                        </ChroniclePaperPanel>
                    </div>

                    <ChronicleSideRail>
                        <UniversalSectionStack
                            sections={railModel.sections}
                            renderContext={railModel.renderContext}
                        />
                    </ChronicleSideRail>
                </ChronicleEditorialGrid>

                {!auth.user && (
                    <ChroniclePaperPanel className="grid gap-4 p-5 sm:grid-cols-[1fr_auto] sm:items-center">
                        <div>
                            <p className="chronicle-title text-3xl">
                                Build a life in the Word
                            </p>
                            <p className="text-sm text-[color:var(--chronicle-brown)]">
                                Create a free account to save notes, track your
                                progress, and personalize your study experience.
                            </p>
                        </div>
                        <div className="flex flex-wrap gap-3">
                            {canRegister && (
                                <Button
                                    asChild
                                    className="chronicle-button rounded-sm"
                                >
                                    <Link href={register()}>
                                        Create Free Account
                                    </Link>
                                </Button>
                            )}
                            <Button
                                asChild
                                variant="outline"
                                className="chronicle-button-outline rounded-sm"
                            >
                                <Link href={login()}>Sign In</Link>
                            </Button>
                        </div>
                    </ChroniclePaperPanel>
                )}

                {shouldShowHomePrimaryRegion && homePrimaryRegion && (
                    <section className="space-y-4">
                        <ChronicleSectionHeading
                            title="Supplemental Paths"
                            eyebrow="CMS-managed supporting content"
                        />
                        <CmsExposedRegion region={homePrimaryRegion} />
                    </section>
                )}
            </div>
        </PublicSiteLayout>
    );
}
