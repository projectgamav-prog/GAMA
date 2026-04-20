import { useForm } from '@inertiajs/react';
import { useEffect } from 'react';
import { BookAdminSourceLabel } from '@/components/scripture/book-admin-source-label';
import InputError from '@/components/input-error';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import type { ScriptureRegisteredAdminField } from '@/types';

type BookDetailsFormData = {
    description: string;
};

type Props = {
    bookDescription: string | null | undefined;
    updateHref: string;
    field: ScriptureRegisteredAdminField;
};

export function BookDescriptionEditorCard({
    bookDescription,
    updateHref,
    field,
}: Props) {
    const form = useForm<BookDetailsFormData>({
        description: bookDescription ?? '',
    });

    useEffect(() => {
        form.setData({
            description: bookDescription ?? '',
        });
        form.clearErrors();
    }, [bookDescription, form]);

    return (
        <Card>
            <CardHeader className="gap-3">
                <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="outline">Editorial</Badge>
                    <Badge variant="secondary">Contextual + full</Badge>
                </div>
                <CardTitle>Public Description</CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
                <div className="grid gap-2">
                    <BookAdminSourceLabel
                        field={field}
                        htmlFor="book_full_description"
                    />
                    <Textarea
                        id="book_full_description"
                        value={form.data.description}
                        onChange={(event) =>
                            form.setData('description', event.target.value)
                        }
                        rows={8}
                        placeholder="Editorial introduction for the public book surfaces."
                    />
                    <InputError message={form.errors.description} />
                </div>

                <div className="flex items-center gap-3">
                    <Button
                        type="button"
                        onClick={() =>
                            form.patch(updateHref, {
                                preserveScroll: true,
                            })
                        }
                        disabled={form.processing}
                    >
                        Save description
                    </Button>
                    {form.recentlySuccessful && (
                        <p className="text-sm text-muted-foreground">Saved.</p>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
