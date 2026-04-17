import { useForm } from '@inertiajs/react';
import { useEffect } from 'react';
import InputError from '@/components/input-error';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import type { VerseFullEditProps } from '@/types';

type VerseIdentityEditorFormData = {
    slug: string;
    number: string;
    text: string;
};

type Props = {
    updateHref: string;
    verse: VerseFullEditProps['verse'];
};

export function VerseIdentityEditorCard({ updateHref, verse }: Props) {
    const form = useForm<VerseIdentityEditorFormData>({
        slug: verse.slug,
        number: verse.number ?? '',
        text: verse.text,
    });

    useEffect(() => {
        form.setData({
            slug: verse.slug,
            number: verse.number ?? '',
            text: verse.text,
        });
        form.clearErrors();
    }, [form, verse.number, verse.slug, verse.text]);

    const submit = () => {
        form.patch(updateHref, {
            preserveScroll: true,
        });
    };

    return (
        <Card>
            <CardHeader className="gap-3">
                <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="outline">Verse identity</Badge>
                    <Badge variant="secondary">Canonical</Badge>
                </div>
                <CardTitle>Verse Identity</CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
                <div className="grid gap-2">
                    <Label htmlFor="identity_slug">Slug</Label>
                    <Input
                        id="identity_slug"
                        value={form.data.slug}
                        onChange={(event) =>
                            form.setData('slug', event.target.value)
                        }
                        placeholder="verse-slug"
                    />
                    <InputError message={form.errors.slug} />
                </div>

                <div className="grid gap-2">
                    <Label htmlFor="identity_number">Number</Label>
                    <Input
                        id="identity_number"
                        value={form.data.number}
                        onChange={(event) =>
                            form.setData('number', event.target.value)
                        }
                        placeholder="1"
                    />
                    <InputError message={form.errors.number} />
                </div>

                <div className="grid gap-2">
                    <Label htmlFor="identity_text">Verse text</Label>
                    <Textarea
                        id="identity_text"
                        value={form.data.text}
                        onChange={(event) =>
                            form.setData('text', event.target.value)
                        }
                        rows={7}
                        placeholder="Canonical verse text"
                    />
                    <InputError message={form.errors.text} />
                </div>

                <div className="flex items-center gap-3">
                    <Button
                        type="button"
                        onClick={submit}
                        disabled={form.processing}
                    >
                        Save verse identity
                    </Button>
                    {form.recentlySuccessful && (
                        <p className="text-sm text-muted-foreground">Saved.</p>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
