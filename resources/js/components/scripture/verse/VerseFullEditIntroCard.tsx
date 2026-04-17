import { Link } from '@inertiajs/react';
import { SquareArrowOutUpRight } from 'lucide-react';
import { ScripturePageIntroCard } from '@/components/scripture/scripture-page-intro-card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import type { VerseFullEditProps } from '@/types';

type Props = {
    bookTitle: string;
    verseTitle: string;
    verse: VerseFullEditProps['verse'];
};

export function VerseFullEditIntroCard({
    bookTitle,
    verseTitle,
    verse,
}: Props) {
    return (
        <ScripturePageIntroCard
            badges={
                <>
                    <Badge variant="outline">Protected editor</Badge>
                    <Badge variant="secondary">{bookTitle}</Badge>
                    <Badge variant="secondary">{verseTitle}</Badge>
                </>
            }
            title={`Full edit: ${verseTitle}`}
            description="Use this deeper workspace to manage verse identity, verse notes, translations, commentaries, and attached note blocks in one protected place."
            headerAction={
                <Button asChild variant="outline" size="sm">
                    <Link href={verse.href}>
                        <SquareArrowOutUpRight className="size-4" />
                        Back to verse page
                    </Link>
                </Button>
            }
            contentClassName="space-y-5"
        >
            <div className="rounded-2xl border border-border/70 bg-muted/20 px-5 py-5 sm:px-6 sm:py-6">
                <p className="text-xs font-semibold tracking-[0.2em] text-muted-foreground uppercase">
                    Canonical verse
                </p>
                <p className="mt-4 text-xl leading-10 sm:text-2xl sm:leading-[3rem]">
                    {verse.text}
                </p>
            </div>
        </ScripturePageIntroCard>
    );
}
