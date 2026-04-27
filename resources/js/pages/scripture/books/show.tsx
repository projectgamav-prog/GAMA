import { Link } from '@inertiajs/react';
import { ChevronRight } from 'lucide-react';
import { AdminModuleHostGroup } from '@/admin/core/AdminModuleHostGroup';
import { resolveBookHeaderSurfaces } from '@/admin/integrations/scripture/books';
import { BookPublicMediaSection } from '@/components/scripture/book-public-media-section';
import { ScriptureBookChapterList } from '@/components/scripture/scripture-book-chapter-list';
import {
    ChronicleEditorialGrid,
    ChronicleOrnament,
    ChroniclePaperPanel,
    ChronicleSideRail,
    ChronicleStatRow,
} from '@/components/site/chronicle-primitives';
import { Button } from '@/components/ui/button';
import { useVisibleAdminControls } from '@/hooks/use-admin-context';
import ScriptureLayout from '@/layouts/scripture-layout';
import { UniversalSectionStack } from '@/rendering/core';
import { buildBookShowDescriptorModel } from '@/rendering/scripture/adapters/book-show-page-adapter';
import type { BookShowProps, BreadcrumbItem } from '@/types';

const ADMIN_PANEL_CLASS_NAME =
    'chronicle-admin-surface flex flex-wrap items-center gap-1.5 p-1';

export default function BookShow({
    book,
    admin,
    book_sections,
}: BookShowProps) {
    const showAdminControls = useVisibleAdminControls();
    const { identitySurface, introSurface, actionsSurface } =
        resolveBookHeaderSurfaces({
            book,
            admin,
            enabled: showAdminControls,
        });
    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: book.title,
            href: book.href,
        },
    ];
    const pageModel = buildBookShowDescriptorModel({
        book,
        bookSections: book_sections,
        breadcrumbs,
    });

    return (
        <ScriptureLayout title={book.title} breadcrumbs={breadcrumbs}>
            <ChronicleEditorialGrid>
                <main className="space-y-5">
                    <ChroniclePaperPanel
                        variant="feature"
                        className="grid gap-6 p-5 sm:p-7 lg:grid-cols-[15rem_minmax(0,1fr)]"
                    >
                        <div
                            aria-hidden="true"
                            className="min-h-52 rounded-sm border border-[color:var(--chronicle-border)] bg-[radial-gradient(circle_at_32%_24%,rgba(173,122,44,0.28),transparent_0.45rem),radial-gradient(circle_at_60%_72%,rgba(104,69,31,0.16),transparent_0.55rem),linear-gradient(145deg,rgba(255,248,235,0.35),rgba(173,122,44,0.13))]"
                        />

                        <div className="space-y-5">
                            <div className="space-y-3">
                                <p className="chronicle-kicker">Book Feature</p>
                                <h1 className="chronicle-feature-title">
                                    {book.title}
                                </h1>
                                <ChronicleOrnament />
                                {book.description && (
                                    <p className="max-w-3xl text-base leading-7 text-[color:var(--chronicle-ink)]">
                                        {book.description}
                                    </p>
                                )}
                            </div>

                            <ChronicleStatRow items={pageModel.statItems} />

                            <div className="flex flex-wrap gap-3">
                                {pageModel.firstChapter && (
                                    <Button
                                        asChild
                                        className="chronicle-button rounded-sm px-5"
                                    >
                                        <Link href={pageModel.firstChapter.href}>
                                            Read Introduction
                                            <ChevronRight className="size-4" />
                                        </Link>
                                    </Button>
                                )}
                                <Button
                                    asChild
                                    variant="outline"
                                    className="chronicle-button-outline rounded-sm px-5"
                                >
                                    <a href="#chapter-list">
                                        Browse Chapters
                                        <ChevronRight className="size-4" />
                                    </a>
                                </Button>
                            </div>

                            <AdminModuleHostGroup
                                surfaces={[
                                    identitySurface,
                                    introSurface,
                                    actionsSurface,
                                ]}
                                className={ADMIN_PANEL_CLASS_NAME}
                            />
                        </div>
                    </ChroniclePaperPanel>

                    <BookPublicMediaSection
                        book={book}
                        admin={admin}
                        isAdmin={showAdminControls}
                    />

                    <ScriptureBookChapterList
                        book={book}
                        bookSections={book_sections}
                        showAdminControls={showAdminControls}
                        admin={admin}
                        panelClassName={ADMIN_PANEL_CLASS_NAME}
                    />
                </main>

                <ChronicleSideRail>
                    <UniversalSectionStack
                        sections={pageModel.railSections}
                        renderContext={pageModel.railRenderContext}
                    />
                </ChronicleSideRail>
            </ChronicleEditorialGrid>
        </ScriptureLayout>
    );
}
