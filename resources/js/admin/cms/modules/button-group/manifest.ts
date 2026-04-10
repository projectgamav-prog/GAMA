import {
    defineCmsModuleManifest,
    type CmsModulePayload,
} from '../../core/module-types';
import {
    buttonGroupDefaultConfig,
    buttonGroupDefaultData,
} from './defaults';
import { ButtonGroupEditor } from './editor';
import { ButtonGroupRenderer } from './renderer';
import {
    getButtonGroupAlignment,
    getButtonGroupButtons,
    getButtonGroupLayout,
} from './types';

const validateButtonGroup = (
    value: CmsModulePayload,
): Record<string, string | undefined> => {
    const errors: Record<string, string | undefined> = {};
    const buttons = getButtonGroupButtons(value.data);

    if (buttons.length === 0) {
        errors['data_json.buttons'] = 'Add at least one button.';

        return errors;
    }

    buttons.forEach((button, index) => {
        if (button.label.trim() === '') {
            errors[`data_json.buttons.${index}.label`] = 'Button label is required.';
        }

        if (button.href.trim() === '') {
            errors[`data_json.buttons.${index}.href`] = 'Button destination is required.';
        }

        if (
            ! ['default', 'secondary', 'outline', 'ghost'].includes(
                button.variant,
            )
        ) {
            errors[`data_json.buttons.${index}.variant`] = 'Choose a valid button style.';
        }
    });

    if (
        ! ['auto', 'stack', 'inline'].includes(
            getButtonGroupLayout(value.config),
        )
    ) {
        errors['config_json.layout'] = 'Choose a valid button layout.';
    }

    if (
        ! ['start', 'center', 'end', 'stretch'].includes(
            getButtonGroupAlignment(value.config),
        )
    ) {
        errors['config_json.alignment'] = 'Choose a valid button alignment.';
    }

    return errors;
};

export const buttonGroupModuleManifest = defineCmsModuleManifest({
    key: 'button_group',
    label: 'Button Group',
    category: 'actions',
    description:
        'One or more CTA buttons that stay grouped inside the current container.',
    defaultData: buttonGroupDefaultData,
    defaultConfig: buttonGroupDefaultConfig,
    Renderer: ButtonGroupRenderer,
    Editor: ButtonGroupEditor,
    validate: validateButtonGroup,
});
