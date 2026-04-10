import type { ReactNode } from 'react';
import type {
    CmsModuleCategory,
    CmsModuleKey,
    CmsModulePayload,
} from '@/types';

export type { CmsModulePayload } from '@/types';

export type CmsModuleRendererMode = 'admin' | 'public';

export type CmsModuleRendererProps = {
    value: CmsModulePayload;
    mode: CmsModuleRendererMode;
};

export type CmsModuleEditorProps = {
    value: CmsModulePayload;
    onChange: (next: CmsModulePayload) => void;
    idPrefix: string;
    errors: Record<string, string | undefined>;
};

export type CmsModuleValidationHook = (
    value: CmsModulePayload,
) => Record<string, string | undefined>;

export type CmsModuleManifest = {
    key: CmsModuleKey;
    label: string;
    category: CmsModuleCategory;
    description: string;
    defaultData: Record<string, unknown>;
    defaultConfig: Record<string, unknown>;
    Renderer: (props: CmsModuleRendererProps) => ReactNode;
    Editor: (props: CmsModuleEditorProps) => ReactNode;
    validate?: CmsModuleValidationHook;
};

export function defineCmsModuleManifest(
    manifest: CmsModuleManifest,
): CmsModuleManifest {
    return manifest;
}
