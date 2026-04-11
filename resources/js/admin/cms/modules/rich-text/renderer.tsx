import { cn } from '@/lib/utils';
import type { CmsModuleRendererProps } from '../../core/module-types';
import { renderRichTextInline } from './document';
import {
    getRichTextAlign,
    getRichTextBlocks,
    getRichTextBody,
    getRichTextEyebrow,
    getRichTextHtml,
    getRichTextLead,
    getRichTextTitle,
    getRichTextWidth,
} from './types';

export function RichTextRenderer({
    value,
    mode,
}: CmsModuleRendererProps) {
    const blocks = getRichTextBlocks(value.data);
    const legacyHtml = getRichTextHtml(value.data);
    const body = getRichTextBody(value.data);

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
            {(getRichTextEyebrow(value.data) ||
                getRichTextTitle(value.data) ||
                getRichTextLead(value.data)) && (
                <div className="mb-5 space-y-3">
                    {getRichTextEyebrow(value.data) && (
                        <p className="text-sm font-semibold tracking-[0.18em] text-muted-foreground uppercase">
                            {getRichTextEyebrow(value.data)}
                        </p>
                    )}
                    {getRichTextTitle(value.data) && (
                        <h2 className="text-3xl font-semibold tracking-tight text-balance">
                            {getRichTextTitle(value.data)}
                        </h2>
                    )}
                    {getRichTextLead(value.data) && (
                        <p className="max-w-3xl text-base leading-8 text-muted-foreground">
                            {getRichTextLead(value.data)}
                        </p>
                    )}
                </div>
            )}
            {blocks.length > 0 ? (
                <div className="space-y-4 leading-7 text-foreground">
                    {blocks.map((block, index) => {
                        if (block.type === 'heading') {
                            const HeadingTag = block.level === 3 ? 'h3' : 'h2';

                            return (
                                <HeadingTag
                                    key={`rich-text-block-${index}`}
                                    className={
                                        block.level === 3
                                            ? 'text-xl font-semibold'
                                            : 'text-2xl font-semibold'
                                    }
                                >
                                    {renderRichTextInline(block.text)}
                                </HeadingTag>
                            );
                        }

                        if (block.type === 'quote') {
                            return (
                                <blockquote
                                    key={`rich-text-block-${index}`}
                                    className="border-l-2 border-border pl-4 italic text-muted-foreground"
                                >
                                    {renderRichTextInline(block.text)}
                                </blockquote>
                            );
                        }

                        if (block.type === 'list') {
                            return (
                                <ul
                                    key={`rich-text-block-${index}`}
                                    className="ml-5 list-disc space-y-2"
                                >
                                    {block.items.map((item, itemIndex) => (
                                        <li key={`rich-text-list-${index}-${itemIndex}`}>
                                            {renderRichTextInline(item)}
                                        </li>
                                    ))}
                                </ul>
                            );
                        }

                        return (
                            <p key={`rich-text-block-${index}`}>
                                {renderRichTextInline(block.text)}
                            </p>
                        );
                    })}
                </div>
            ) : legacyHtml.trim() !== '' ? (
                <div
                    className="space-y-4 leading-7 text-foreground [&_a]:text-primary [&_a]:underline [&_h1]:text-3xl [&_h1]:font-semibold [&_h2]:text-2xl [&_h2]:font-semibold [&_h3]:text-xl [&_h3]:font-semibold [&_li]:ml-5 [&_li]:list-disc [&_p+p]:mt-4"
                    dangerouslySetInnerHTML={{
                        __html: legacyHtml,
                    }}
                />
            ) : body.trim() !== '' ? (
                <p>{body}</p>
            ) : null}
        </div>
    );
}
