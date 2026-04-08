import type { ReactNode } from 'react';
import { AdminModuleHost } from '@/admin/core/AdminModuleHost';
import { AdminModuleHostGroup } from '@/admin/core/AdminModuleHostGroup';
import type { AdminSurfaceContract } from '@/admin/surfaces/core/surface-contracts';
import { ScriptureEntityRegion } from '@/components/scripture/scripture-entity-region';
import { ScriptureIntroBlock } from '@/components/scripture/scripture-intro-block';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import type {
    ScriptureContentBlock,
    ScriptureEntityRegionInput,
} from '@/types/scripture';

export const SCRIPTURE_INLINE_ADMIN_PANEL_CLASS_NAME =
    'flex flex-wrap items-center gap-1.5';

type Props = {
    id?: string;
    entityMeta: ScriptureEntityRegionInput;
    title: string;
    meta?: ReactNode;
    introBlock?: ScriptureContentBlock | null;
    introLabel?: string;
    adminSurface?: AdminSurfaceContract | null;
    adminSurfaces?: Array<AdminSurfaceContract | null | undefined>;
    panelClassName?: string;
    children: ReactNode;
    className?: string;
};

export function ScriptureSectionGroupWrapper({
    id,
    entityMeta,
    title,
    meta,
    introBlock = null,
    introLabel = 'Section Introduction',
    adminSurface = null,
    adminSurfaces = [],
    panelClassName = SCRIPTURE_INLINE_ADMIN_PANEL_CLASS_NAME,
    children,
    className,
}: Props) {
    const headerSurfaces = adminSurfaces.length > 0 ? adminSurfaces : [adminSurface];

    return (
        <ScriptureEntityRegion meta={entityMeta} asChild>
            <Card id={id} className={cn('overflow-hidden', className)}>
                <CardHeader className="space-y-3">
                    <div className="space-y-2">
                        <div className="space-y-1">
                            <CardTitle>{title}</CardTitle>
                            {meta && (
                                <div className="text-sm text-muted-foreground">
                                    {meta}
                                </div>
                            )}
                        </div>
                        {adminSurfaces.length > 0 ? (
                            <AdminModuleHostGroup
                                surfaces={headerSurfaces}
                                className={panelClassName}
                            />
                        ) : (
                            adminSurface && (
                                <AdminModuleHost
                                    surface={adminSurface}
                                    className={panelClassName}
                                />
                            )
                        )}
                    </div>

                    <ScriptureIntroBlock
                        label={introLabel}
                        block={introBlock}
                        variant="header"
                    />
                </CardHeader>

                <CardContent className="space-y-4">{children}</CardContent>
            </Card>
        </ScriptureEntityRegion>
    );
}
