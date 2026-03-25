import { Link } from '@inertiajs/react';
import { Badge } from '@/components/ui/badge';
import {
    Card,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import ScriptureLayout from '@/layouts/scripture-layout';
import type { BreadcrumbItem, CharactersIndexProps } from '@/types';

export default function CharactersIndex({
    characters,
}: CharactersIndexProps) {
    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Characters',
            href: '/characters',
        },
    ];

    return (
        <ScriptureLayout title="Characters" breadcrumbs={breadcrumbs}>
            <Card>
                <CardHeader className="gap-4">
                    <div className="flex flex-wrap items-center gap-2">
                        <Badge variant="outline">Study Guide</Badge>
                        <Badge variant="secondary">
                            {`${characters.length} ${
                                characters.length === 1
                                    ? 'character'
                                    : 'characters'
                            }`}
                        </Badge>
                    </div>

                    <div className="space-y-2">
                        <CardTitle className="text-3xl">Characters</CardTitle>
                        <CardDescription className="max-w-3xl text-base leading-7">
                            Browse key figures and open each character for a
                            public overview and linked verses.
                        </CardDescription>
                    </div>
                </CardHeader>
            </Card>

            <section className="space-y-3">
                <div className="space-y-1">
                    <h2 className="text-xl font-semibold">
                        Available Characters
                    </h2>
                    <p className="text-sm text-muted-foreground">
                        Explore the public character library in browse order.
                    </p>
                </div>

                {characters.length > 0 ? (
                    <div className="space-y-3">
                        {characters.map((character) => (
                            <Link
                                key={character.id}
                                href={character.href}
                                className="block rounded-lg border bg-card p-4 transition-colors hover:border-primary"
                            >
                                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                                    <div className="space-y-2">
                                        <p className="text-lg font-semibold">
                                            {character.name}
                                        </p>

                                        {character.description && (
                                            <p className="text-sm leading-6 text-muted-foreground">
                                                {character.description}
                                            </p>
                                        )}
                                    </div>

                                    <span className="text-sm font-medium text-primary">
                                        Open character
                                    </span>
                                </div>
                            </Link>
                        ))}
                    </div>
                ) : (
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">
                                No Characters Yet
                            </CardTitle>
                            <CardDescription className="leading-7">
                                Public characters will appear here once they are
                                available for browsing.
                            </CardDescription>
                        </CardHeader>
                    </Card>
                )}
            </section>
        </ScriptureLayout>
    );
}
