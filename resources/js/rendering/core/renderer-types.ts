import type { ComponentType } from 'react';
import type {
    UniversalSectionDescriptor,
    UniversalSectionRendererKey,
} from './descriptor-types';
import type { SurfaceRenderContext, UniversalRenderContext } from './render-context';

export type UniversalSectionRendererProps<TContent = unknown> = {
    section: UniversalSectionDescriptor<TContent>;
    renderContext: UniversalRenderContext;
    surfaceContext: SurfaceRenderContext;
};

export type UniversalSectionRenderer<TContent = unknown> = ComponentType<
    UniversalSectionRendererProps<TContent>
>;

export type UniversalSectionRendererDefinition<TContent = unknown> = {
    key: UniversalSectionRendererKey;
    Renderer: UniversalSectionRenderer<TContent>;
    description?: string;
};
