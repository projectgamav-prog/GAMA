import { ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { CmsModuleRendererProps } from '../../core/module-types';
import {
    getCardListColumns,
    getCardListEyebrow,
    getCardListIntro,
    getCardListItems,
    getCardListLayout,
    getCardListTitle,
    resolveCardListItemHref,
} from './types';

export function CardListRenderer({
    value,
    mode,
}: CmsModuleRendererProps) {
    const items = getCardListItems(value.data);
    const layout = getCardListLayout(value.config);
    const columns = getCardListColumns(value.config);

    return (
        <section
            className={cn(
                'space-y-5',
                mode === 'admin' &&
                    'rounded-2xl border border-border/60 bg-background/70 p-4',
            )}
        >
            {(getCardListEyebrow(value.data) ||
                getCardListTitle(value.data) ||
                getCardListIntro(value.data)) && (
                <div className="space-y-3">
                    {getCardListEyebrow(value.data) && (
                        <p className="text-sm font-semibold tracking-[0.18em] text-muted-foreground uppercase">
                            {getCardListEyebrow(value.data)}
                        </p>
                    )}
                    {getCardListTitle(value.data) && (
                        <h2 className="text-3xl font-semibold tracking-tight text-balance">
                            {getCardListTitle(value.data)}
                        </h2>
                    )}
                    {getCardListIntro(value.data) && (
                        <p className="max-w-3xl text-base leading-8 text-muted-foreground">
                            {getCardListIntro(value.data)}
                        </p>
                    )}
                </div>
            )}

            <div
                className={cn(
                    layout === 'list'
                        ? 'space-y-4'
                        : 'grid gap-4',
                    layout === 'cards' && columns === 'one' && 'grid-cols-1',
                    layout === 'cards' &&
                        columns === 'two' &&
                        'grid-cols-1 lg:grid-cols-2',
                    layout === 'cards' &&
                        columns === 'three' &&
                        'grid-cols-1 md:grid-cols-2 xl:grid-cols-3',
                )}
            >
                {items.map((item, index) => {
                    const href = resolveCardListItemHref(item);

                    return (
                        <article
                            key={`${item.title}-${index}`}
                            className={cn(
                                'rounded-[1.5rem] border border-border/70 bg-background/80 p-5 shadow-sm',
                                layout === 'list' &&
                                    'flex flex-col gap-3 md:flex-row md:items-start md:justify-between',
                            )}
                        >
                            <div className="space-y-3">
                                {item.eyebrow && (
                                    <p className="text-xs font-semibold tracking-[0.16em] text-muted-foreground uppercase">
                                        {item.eyebrow}
                                    </p>
                                )}
                                <div className="space-y-2">
                                    <h3 className="text-xl font-semibold tracking-tight text-balance">
                                        {item.title}
                                    </h3>
                                    {item.body && (
                                        <p className="text-sm leading-7 text-muted-foreground">
                                            {item.body}
                                        </p>
                                    )}
                                </div>
                            </div>

                            {href && (
                                <div className="pt-2">
                                    <a
                                        href={href}
                                        target={
                                            item.target?.behavior?.new_tab
                                                ? '_blank'
                                                : undefined
                                        }
                                        rel={
                                            item.target?.behavior?.new_tab
                                                ? 'noreferrer noopener'
                                                : undefined
                                        }
                                        className="inline-flex items-center gap-2 text-sm font-medium text-primary"
                                    >
                                        {item.cta_label || 'Learn more'}
                                        <ArrowRight className="size-4" />
                                    </a>
                                </div>
                            )}
                        </article>
                    );
                })}
            </div>
        </section>
    );
}
