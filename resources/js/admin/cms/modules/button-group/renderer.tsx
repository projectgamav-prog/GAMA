import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { CmsModuleRendererProps } from '../../core/module-types';
import {
    getButtonGroupAlignment,
    getButtonGroupAlignmentClass,
    getButtonGroupButtons,
    getButtonGroupLayout,
    resolveButtonHref,
} from './types';

export function ButtonGroupRenderer({
    value,
    mode,
}: CmsModuleRendererProps) {
    const buttons = getButtonGroupButtons(value.data);
    const layout = getButtonGroupLayout(value.config);
    const alignment = getButtonGroupAlignment(value.config);

    const containerClass =
        layout === 'stack'
            ? 'grid grid-cols-1 gap-3'
            : layout === 'inline'
              ? 'flex flex-wrap gap-3'
              : cn(
                    'grid gap-3',
                    buttons.length <= 1 && 'grid-cols-1',
                    buttons.length === 2 && 'sm:grid-cols-2',
                    buttons.length >= 3 && 'sm:grid-cols-2 xl:grid-cols-3',
                );

    return (
        <div
            className={cn(
                containerClass,
                getButtonGroupAlignmentClass(layout, alignment),
                mode === 'admin'
                    && 'rounded-2xl border border-border/60 bg-background/70 p-4',
            )}
        >
            {buttons.map((button, index) => (
                <a
                    key={`${button.label}-${index}`}
                    href={resolveButtonHref(button)}
                    target={button.open_in_new_tab ? '_blank' : undefined}
                    rel={
                        button.open_in_new_tab
                            ? 'noreferrer noopener'
                            : undefined
                    }
                    className={cn(
                        buttonVariants({ variant: button.variant }),
                        'h-auto min-h-11 whitespace-normal px-4 py-3 text-center leading-5',
                        layout !== 'inline' && 'w-full',
                    )}
                >
                    {button.label}
                </a>
            ))}
        </div>
    );
}
