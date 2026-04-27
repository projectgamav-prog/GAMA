import type { UniversalSectionDescriptor } from './descriptor-types';
import type { UniversalRenderContext } from './render-context';
import { UniversalSectionRenderer } from './UniversalSectionRenderer';

type Props = {
    sections: readonly UniversalSectionDescriptor[];
    renderContext: UniversalRenderContext;
};

export function UniversalSectionStack({ sections, renderContext }: Props) {
    return (
        <>
            {sections.map((section) => (
                <UniversalSectionRenderer
                    key={section.id}
                    section={section}
                    renderContext={renderContext}
                />
            ))}
        </>
    );
}
