import type { UniversalSectionDescriptor } from './descriptor-types';
import type { UniversalRenderContext } from './render-context';
import { ensureCoreSectionRenderersRegistered } from './core-section-renderers';
import { resolveUniversalSectionRenderer } from './renderer-registry';

type Props = {
    section: UniversalSectionDescriptor;
    renderContext: UniversalRenderContext;
};

function MissingRendererFallback({ section }: { section: UniversalSectionDescriptor }) {
    if (import.meta.env.PROD) {
        return null;
    }

    return (
        <section
            data-universal-section-id={section.id}
            data-universal-section-renderer={section.renderer}
            className="rounded-sm border border-dashed border-destructive/40 bg-destructive/5 px-4 py-3 text-sm text-destructive"
        >
            Missing universal section renderer: {section.renderer}
        </section>
    );
}

export function UniversalSectionRenderer({
    section,
    renderContext,
}: Props) {
    ensureCoreSectionRenderersRegistered();

    const Renderer = resolveUniversalSectionRenderer(section.renderer);

    if (!Renderer) {
        return <MissingRendererFallback section={section} />;
    }

    return (
        <Renderer
            section={section}
            renderContext={renderContext}
            surfaceContext={{
                surface: section.surface ?? null,
                owner: section.surface?.owner ?? null,
            }}
        />
    );
}
