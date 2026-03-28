import type { AdminModuleComponentProps } from '@/admin/core/module-types';
import { getIntroContractMetadata } from '@/admin/surfaces/core/contract-readers';
import {
    buildScriptureAdminBlockHref,
    buildScriptureAdminSectionHref,
} from '@/lib/scripture-admin-navigation';
import { RegisteredIntroBlockEditor } from './RegisteredIntroBlockEditor';

type Props = AdminModuleComponentProps & {
    title: string;
};

export function RegisteredEntityIntroEditor({
    module: _module,
    surface,
    activation,
    title,
}: Props) {
    const metadata = getIntroContractMetadata<unknown>(surface);

    if (
        metadata === null ||
        metadata.introKind !== 'registered_block' ||
        !activation.isActive
    ) {
        return null;
    }

    const fullEditHref =
        metadata.block !== null
            ? buildScriptureAdminBlockHref(
                  metadata.fullEditHref,
                  metadata.block.id,
              )
            : buildScriptureAdminSectionHref(
                  metadata.fullEditHref,
                  'content_blocks',
              );

    return (
        <RegisteredIntroBlockEditor
            title={title}
            entityLabel={metadata.entityLabel}
            block={metadata.block}
            blockTypes={metadata.blockTypes}
            updateHref={metadata.updateHref}
            storeHref={metadata.storeHref}
            fullEditHref={fullEditHref}
            defaultRegion="overview"
            onCancel={activation.deactivate}
            onSaveSuccess={activation.deactivate}
        />
    );
}
