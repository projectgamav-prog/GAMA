import { cn } from '@/lib/utils';
import type { CmsModuleRendererProps } from '../../core/module-types';
import {
    getRichTextAlign,
    getRichTextHtml,
    getRichTextWidth,
} from './types';

export function RichTextRenderer({
    value,
    mode,
}: CmsModuleRendererProps) {
    return (
        <div
            className={cn(
                'w-full',
                getRichTextWidth(value.config) === 'content' && 'max-w-3xl',
                getRichTextWidth(value.config) === 'wide' && 'max-w-5xl',
                getRichTextAlign(value.config) === 'center'
                    && 'mx-auto text-center',
                getRichTextAlign(value.config) === 'right'
                    && 'ml-auto text-right',
                mode === 'admin'
                    && 'rounded-2xl border border-border/60 bg-background/70 px-5 py-4',
            )}
        >
            <div
                className="space-y-4 leading-7 text-foreground [&_a]:text-primary [&_a]:underline [&_h1]:text-3xl [&_h1]:font-semibold [&_h2]:text-2xl [&_h2]:font-semibold [&_h3]:text-xl [&_h3]:font-semibold [&_li]:ml-5 [&_li]:list-disc [&_p+p]:mt-4"
                dangerouslySetInnerHTML={{
                    __html: getRichTextHtml(value.data),
                }}
            />
        </div>
    );
}
