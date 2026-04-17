import { useForm } from '@inertiajs/react';
import { Pencil, Save } from 'lucide-react';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import type { CmsAdminContainer, CmsContainerType } from '@/types';
import {
    type ContainerFormData,
    resolveLiveContainerType,
} from './cms-live-composer-helpers';

type Props = {
    container: CmsAdminContainer;
    returnTo: string;
};

export function CmsLiveContainerEditDialog({ container, returnTo }: Props) {
    const form = useForm<ContainerFormData>({
        label: container.label ?? '',
        container_type: resolveLiveContainerType(container.container_type),
        return_to: returnTo,
    });

    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button type="button" size="sm" variant="ghost">
                    <Pencil className="size-4" />
                    Edit card
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Edit container</DialogTitle>
                    <DialogDescription>
                        Update the container label or type without leaving the real page.
                    </DialogDescription>
                </DialogHeader>

                <form
                    className="space-y-5"
                    onSubmit={(event) => {
                        event.preventDefault();
                        form.patch(container.update_href, {
                            preserveScroll: true,
                        });
                    }}
                >
                    <div className="grid gap-2">
                        <Label htmlFor={`live-container-${container.id}-label`}>
                            Container label
                        </Label>
                        <Input
                            id={`live-container-${container.id}-label`}
                            value={form.data.label}
                            onChange={(event) =>
                                form.setData('label', event.target.value)
                            }
                            placeholder="Feature card"
                        />
                        <InputError message={form.errors.label} />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor={`live-container-${container.id}-type`}>
                            Container type
                        </Label>
                        <Select
                            value={form.data.container_type}
                            onValueChange={(value) =>
                                form.setData(
                                    'container_type',
                                    value as CmsContainerType,
                                )
                            }
                        >
                            <SelectTrigger id={`live-container-${container.id}-type`}>
                                <SelectValue placeholder="Choose container type" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="card">Card</SelectItem>
                                <SelectItem value="section">Section</SelectItem>
                            </SelectContent>
                        </Select>
                        <InputError message={form.errors.container_type} />
                    </div>

                    <div className="flex items-center gap-3">
                        <Button type="submit" disabled={form.processing}>
                            <Save className="size-4" />
                            {form.processing ? 'Saving...' : 'Save'}
                        </Button>
                        <span className="text-sm text-muted-foreground">
                            Keep the real page layout and update only this container.
                        </span>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
