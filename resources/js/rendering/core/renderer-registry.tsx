import type {
    UniversalSectionRenderer,
    UniversalSectionRendererDefinition,
} from './renderer-types';
import type { UniversalSectionRendererKey } from './descriptor-types';

const sectionRendererRegistry = new Map<
    UniversalSectionRendererKey,
    UniversalSectionRenderer
>();

export function registerUniversalSectionRenderer<TContent = unknown>({
    key,
    Renderer,
}: UniversalSectionRendererDefinition<TContent>): void {
    sectionRendererRegistry.set(
        key,
        Renderer as UniversalSectionRenderer<unknown>,
    );
}

export function registerUniversalSectionRenderers(
    renderers: readonly UniversalSectionRendererDefinition<any>[],
): void {
    renderers.forEach(registerUniversalSectionRenderer);
}

export function resolveUniversalSectionRenderer(
    key: UniversalSectionRendererKey,
): UniversalSectionRenderer | null {
    return sectionRendererRegistry.get(key) ?? null;
}

export function hasUniversalSectionRenderer(
    key: UniversalSectionRendererKey,
): boolean {
    return sectionRendererRegistry.has(key);
}

export function clearUniversalSectionRenderersForTests(): void {
    sectionRendererRegistry.clear();
}
