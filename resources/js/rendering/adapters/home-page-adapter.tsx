import { Bookmark, CalendarDays, History, ScrollText, Share2 } from 'lucide-react';
import {
    createCompactListSection,
    createPaperPanelSection,
} from '@/rendering/core';

export function buildHomeRailDescriptorModel() {
    return {
        renderContext: {
            page: {
                pageKey: 'home.rail',
                title: 'Home',
                layout: 'public' as const,
            },
        },
        sections: [
            createPaperPanelSection({
                id: 'home-verse-of-the-day',
                content: {
                    children: (
                        <>
                            <p className="chronicle-kicker">Verse of the Day</p>
                            <blockquote className="mt-5 text-2xl leading-9">
                                "Your word is a lamp to my feet and a light to
                                my path."
                            </blockquote>
                            <p className="mt-4 text-center text-sm text-[color:var(--chronicle-brown)]">
                                Psalm 119:105
                            </p>
                            <div className="chronicle-rule my-5" />
                            <div className="grid grid-cols-3 gap-2 text-center text-xs text-[color:var(--chronicle-brown)]">
                                <span className="flex items-center justify-center gap-1">
                                    <Share2 className="size-3.5" />
                                    Share
                                </span>
                                <span>Favorite</span>
                                <span>Notes</span>
                            </div>
                        </>
                    ),
                },
            }),
            createCompactListSection({
                id: 'home-study-desk',
                content: {
                    title: 'Study Desk',
                    description: 'Your daily study companion',
                    items: [
                        {
                            label: 'My Notes',
                            meta: 12,
                            icon: ScrollText,
                        },
                        {
                            label: 'Bookmarks',
                            meta: 8,
                            icon: Bookmark,
                        },
                        {
                            label: 'Reading History',
                            icon: History,
                        },
                        {
                            label: 'Study Plans',
                            meta: 3,
                            icon: CalendarDays,
                        },
                    ],
                },
            }),
            createPaperPanelSection({
                id: 'home-daily-reading-goal',
                content: {
                    children: (
                        <>
                            <p className="chronicle-kicker">
                                Daily Reading Goal
                            </p>
                            <div className="mt-4 flex items-center gap-4">
                                <div className="flex size-16 items-center justify-center rounded-full border-4 border-[color:var(--chronicle-gold)] text-sm font-bold text-[color:var(--chronicle-brown)]">
                                    65%
                                </div>
                                <div>
                                    <p className="text-lg">3 of 5 days</p>
                                    <p className="text-sm text-[color:var(--chronicle-brown)]">
                                        You are on track.
                                    </p>
                                </div>
                            </div>
                        </>
                    ),
                },
            }),
            createCompactListSection({
                id: 'home-popular-this-week',
                content: {
                    eyebrow: 'Popular This Week',
                    items: [
                        {
                            label: 'The Lord is My Shepherd',
                            meta: 'Psalm 23',
                        },
                        {
                            label: 'Love Your Enemies',
                            meta: 'Luke 6',
                        },
                        {
                            label: 'Faith Without Works',
                            meta: 'James 2',
                        },
                    ],
                },
            }),
        ],
    };
}
